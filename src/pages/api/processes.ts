import type { APIRoute } from 'astro';
import { execSync } from 'child_process';

interface Process {
  pid: string;
  name: string;
  cpu: number;
  mem: number;
}

export const GET: APIRoute = async () => {
  try {
    const output = execSync(
      'ps aux --sort=-%cpu | head -6 | tail -5',
      { encoding: 'utf8', timeout: 5000 }
    );

    const processes: Process[] = output
      .trim()
      .split('\n')
      .map(line => {
        const parts = line.trim().split(/\s+/);
        return {
          pid: parts[1],
          cpu: parseFloat(parts[2]) || 0,
          mem: parseFloat(parts[3]) || 0,
          name: parts.slice(10).join(' ').split('/').pop()?.substring(0, 20) || parts[10]
        };
      });

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
