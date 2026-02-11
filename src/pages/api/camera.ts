import type { APIRoute } from 'astro';
import { spawn } from 'child_process';

export const POST: APIRoute = async () => {
  try {
    const scriptPath = '/home/lau/ptz-control/fix-camera.sh';
    
    return new Response(
      new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          
          const process = spawn('sudo', [scriptPath], {
            env: { ...process.env, TERM: 'xterm-256color' }
          });

          process.stdout.on('data', (data) => {
            controller.enqueue(encoder.encode(data.toString()));
          });

          process.stderr.on('data', (data) => {
            controller.enqueue(encoder.encode(data.toString()));
          });

          process.on('close', (code) => {
            controller.enqueue(encoder.encode(`\n--- Script finalizado con código: ${code} ---\n`));
            controller.close();
          });

          process.on('error', (error) => {
            controller.enqueue(encoder.encode(`Error: ${error.message}\n`));
            controller.close();
          });
        }
      }),
      {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
          'Cache-Control': 'no-cache'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Error ejecutando script' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
