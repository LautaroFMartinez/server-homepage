import type { APIRoute } from 'astro';
import { execSync } from 'child_process';

interface SpeedtestResult {
  download: number;
  upload: number;
  ping: number;
  server: string;
}

export const GET: APIRoute = async () => {
  try {
    const output = execSync('speedtest --accept-license --accept-gdpr -f json', {
      encoding: 'utf8',
      timeout: 120000
    });

    const data = JSON.parse(output);

    const result: SpeedtestResult = {
      download: Math.round((data.download.bandwidth * 8) / 1000000),
      upload: Math.round((data.upload.bandwidth * 8) / 1000000),
      ping: Math.round(data.ping.latency),
      server: data.server?.name || 'Unknown'
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Speedtest failed or not installed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
