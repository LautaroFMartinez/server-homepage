import type { APIRoute } from 'astro';
import * as fs from 'fs';

const PROC_PATH = fs.existsSync('/host/proc') ? '/host/proc' : '/proc';

export const GET: APIRoute = async () => {
  try {
    const uptime = parseFloat(fs.readFileSync(`${PROC_PATH}/uptime`, 'utf8').split(' ')[0]);

    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    return new Response(JSON.stringify({ days, hours, minutes, total: uptime }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to get uptime' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
