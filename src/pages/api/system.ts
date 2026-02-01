import type { APIRoute } from 'astro';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';

const PROC_PATH = fs.existsSync('/host/proc') ? '/host/proc' : '/proc';
const SYS_PATH = fs.existsSync('/host/sys') ? '/host/sys' : '/sys';

function getCpuUsage(): number {
  try {
    const stat = fs.readFileSync(`${PROC_PATH}/stat`, 'utf8');
    const cpuLine = stat.split('\n').find(line => line.startsWith('cpu '));
    if (!cpuLine) return 0;

    const values = cpuLine.split(/\s+/).slice(1).map(Number);
    const idle = values[3] + values[4];
    const total = values.reduce((a, b) => a + b, 0);

    const cacheFile = '/tmp/cpu_stat_cache.json';
    let prevIdle = 0;
    let prevTotal = 0;

    try {
      const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      prevIdle = cache.idle || 0;
      prevTotal = cache.total || 0;
    } catch {}

    fs.writeFileSync(cacheFile, JSON.stringify({ idle, total }));

    if (prevTotal === 0) {
      return (1 - idle / total) * 100;
    }

    const idleDiff = idle - prevIdle;
    const totalDiff = total - prevTotal;

    if (totalDiff === 0) return 0;
    return (1 - idleDiff / totalDiff) * 100;
  } catch {
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
    const values: Record<string, number> = {};

    for (const line of meminfo.split('\n')) {
      const match = line.match(/^(\w+):\s+(\d+)/);
      if (match) {
        values[match[1]] = parseInt(match[2]) * 1024;
      }
    }

    const total = values['MemTotal'] || 0;
    const available = values['MemAvailable'] || values['MemFree'] || 0;
    const used = total - available;

    return { used, total, percent: total > 0 ? (used / total) * 100 : 0 };
  } catch {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    return { used, total, percent: (used / total) * 100 };
  }
}

function getDiskInfo() {
  try {
    const output = execSync('df -B1 /', { encoding: 'utf8', timeout: 5000 });
    const lines = output.trim().split('\n');
    if (lines.length < 2) return { used: 0, total: 0, percent: 0 };

    const parts = lines[1].split(/\s+/);
    const total = parseInt(parts[1]) || 0;
    const used = parseInt(parts[2]) || 0;

    return { used, total, percent: total > 0 ? (used / total) * 100 : 0 };
  } catch {
    return { used: 0, total: 0, percent: 0 };
  }
}

function getCpuTemperature(): number | null {
  const thermalPaths = [
    `${SYS_PATH}/class/thermal/thermal_zone0/temp`,
    `${SYS_PATH}/class/hwmon/hwmon0/temp1_input`,
    `${SYS_PATH}/class/hwmon/hwmon1/temp1_input`,
    `${SYS_PATH}/class/hwmon/hwmon2/temp1_input`
  ];

  for (const path of thermalPaths) {
    try {
      const temp = parseInt(fs.readFileSync(path, 'utf8').trim());
      return temp / 1000;
    } catch {}
  }
  return null;
}

function getNetworkStats() {
  try {
    const netDev = fs.readFileSync(`${PROC_PATH}/net/dev`, 'utf8');
    const lines = netDev.split('\n').slice(2);

    let totalRx = 0;
    let totalTx = 0;

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 10) continue;

      const iface = parts[0].replace(':', '');
      if (iface === 'lo') continue;

      totalRx += parseInt(parts[1]) || 0;
      totalTx += parseInt(parts[9]) || 0;
    }

    const cacheFile = '/tmp/net_stat_cache.json';
    const now = Date.now();
    let rxSpeed = 0;
    let txSpeed = 0;

    try {
      const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      const timeDiff = (now - cache.timestamp) / 1000;

      if (timeDiff > 0 && timeDiff < 10) {
        rxSpeed = (totalRx - cache.rx) / timeDiff;
        txSpeed = (totalTx - cache.tx) / timeDiff;
      }
    } catch {}

    fs.writeFileSync(cacheFile, JSON.stringify({ rx: totalRx, tx: totalTx, timestamp: now }));

    return {
      rx: Math.max(0, rxSpeed),
      tx: Math.max(0, txSpeed)
    };
  } catch {
    return { rx: 0, tx: 0 };
  }
}

export const GET: APIRoute = async () => {
  try {
    const cpu = getCpuUsage();
    const memory = getMemoryInfo();
    const disk = getDiskInfo();
    const temperature = getCpuTemperature();
    const network = getNetworkStats();

    return new Response(JSON.stringify({ cpu, memory, disk, temperature, network }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to get system metrics' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
