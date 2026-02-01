import type { APIRoute } from 'astro';
import * as fs from 'fs';

const PROC_PATH = fs.existsSync('/host/proc') ? '/host/proc' : '/proc';

interface Process {
  pid: string;
  name: string;
  cpu: number;
  mem: number;
}

function getProcesses(): Process[] {
  try {
    const memTotal = getMemTotal();
    const cpuCount = getCpuCount();
    const uptime = getUptime();

    const pids = fs.readdirSync(PROC_PATH).filter(f => /^\d+$/.test(f));
    const processes: Process[] = [];

    for (const pid of pids) {
      try {
        const stat = fs.readFileSync(`${PROC_PATH}/${pid}/stat`, 'utf8');
        const statParts = stat.split(' ');

        const comm = statParts[1].replace(/[()]/g, '');
        const utime = parseInt(statParts[13]) || 0;
        const stime = parseInt(statParts[14]) || 0;
        const starttime = parseInt(statParts[21]) || 0;

        const statm = fs.readFileSync(`${PROC_PATH}/${pid}/statm`, 'utf8');
        const rss = parseInt(statm.split(' ')[1]) || 0;
        const memBytes = rss * 4096;

        const totalTime = utime + stime;
        const seconds = uptime - (starttime / 100);
        const cpuPercent = seconds > 0 ? ((totalTime / 100) / seconds) * 100 * cpuCount : 0;
        const memPercent = memTotal > 0 ? (memBytes / memTotal) * 100 : 0;

        if (comm && !['kworker', 'migration', 'rcu_', 'ksoftirqd'].some(k => comm.startsWith(k))) {
          processes.push({
            pid,
            name: comm.substring(0, 20),
            cpu: Math.min(cpuPercent, 100),
            mem: memPercent
          });
        }
      } catch {}
    }

    return processes
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, 5);
  } catch {
    return [];
  }
}

function getMemTotal(): number {
  try {
    const meminfo = fs.readFileSync(`${PROC_PATH}/meminfo`, 'utf8');
    const match = meminfo.match(/MemTotal:\s+(\d+)/);
    return match ? parseInt(match[1]) * 1024 : 0;
  } catch {
    return 0;
  }
}

function getCpuCount(): number {
  try {
    const cpuinfo = fs.readFileSync(`${PROC_PATH}/cpuinfo`, 'utf8');
    return (cpuinfo.match(/^processor/gm) || []).length || 1;
  } catch {
    return 1;
  }
}

function getUptime(): number {
  try {
    return parseFloat(fs.readFileSync(`${PROC_PATH}/uptime`, 'utf8').split(' ')[0]);
  } catch {
    return 0;
  }
}

export const GET: APIRoute = async () => {
  try {
    const processes = getProcesses();
    return new Response(JSON.stringify(processes), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to get processes' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
