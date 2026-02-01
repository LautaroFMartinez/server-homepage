import type { APIRoute } from 'astro';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';

// Use /host/proc when running in Docker, /proc otherwise
const PROC_PATH = fs.existsSync('/host/proc') ? '/host/proc' : '/proc';

function getCpuUsage(): number {
  try {
    const stat = fs.readFileSync(`${PROC_PATH}/stat`, 'utf8');
    const lines = stat.split('\n');
    const cpuLine = lines.find(line => line.startsWith('cpu '));
    if (!cpuLine) return 0;

    const values = cpuLine.split(/\s+/).slice(1).map(Number);
    const idle = values[3] + values[4];
    const total = values.reduce((a, b) => a + b, 0);

    // Get previous values from a simple cache mechanism
    const cacheFile = '/tmp/cpu_stat_cache.json';
    let prevIdle = 0;
    let prevTotal = 0;

    try {
      const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      prevIdle = cache.idle || 0;
      prevTotal = cache.total || 0;
    } catch {
      // No cache yet
    }

    fs.writeFileSync(cacheFile, JSON.stringify({ idle, total }));

    if (prevTotal === 0) {
      // First read, estimate based on current values
      return (1 - idle / total) * 100;
    }

    const idleDiff = idle - prevIdle;
    const totalDiff = total - prevTotal;

    if (totalDiff === 0) return 0;
    return ((1 - idleDiff / totalDiff) * 100);
  } catch {
    // Fallback using os module
    const cpus = os.cpus();
    const avgIdle = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      return acc + (cpu.times.idle / total);
    }, 0) / cpus.length;
    return (1 - avgIdle) * 100;
  }
}

function getMemoryInfo() {
  try {
    const meminfo = fs.readFileSync(`${PROC_PATH}/meminfo`, 'utf8');
    const lines = meminfo.split('\n');
    const values: Record<string, number> = {};

    for (const line of lines) {
      const match = line.match(/^(\w+):\s+(\d+)/);
      if (match) {
        values[match[1]] = parseInt(match[2]) * 1024; // Convert to bytes
      }
    }

    const total = values['MemTotal'] || 0;
    const available = values['MemAvailable'] || values['MemFree'] || 0;
    const used = total - available;
    const percent = total > 0 ? (used / total) * 100 : 0;

    return { used, total, percent };
  } catch {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    return { used, total, percent: (used / total) * 100 };
  }
}

function getDiskInfo() {
  try {
    // Get root filesystem info (works with LVM, regular partitions, etc.)
    const output = execSync('df -B1 /', {
      encoding: 'utf8',
      timeout: 5000
    });

    const lines = output.trim().split('\n');
    if (lines.length < 2) {
      return { used: 0, total: 0, percent: 0 };
    }

    const parts = lines[1].split(/\s+/);
    const total = parseInt(parts[1]) || 0;
    const used = parseInt(parts[2]) || 0;
    const percent = total > 0 ? (used / total) * 100 : 0;

    return { used, total, percent };
  } catch {
    return { used: 0, total: 0, percent: 0 };
  }
}

export const GET: APIRoute = async () => {
  try {
    const cpu = getCpuUsage();
    const memory = getMemoryInfo();
    const disk = getDiskInfo();

    return new Response(JSON.stringify({ cpu, memory, disk }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to get system metrics' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
