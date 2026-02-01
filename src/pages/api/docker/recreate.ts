import type { APIRoute } from 'astro';
import { execSync } from 'child_process';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { id } = await request.json();

    if (!id || typeof id !== 'string') {
      return new Response(JSON.stringify({ error: 'Container ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!/^[a-f0-9]{12}$|^[a-f0-9]{64}$/.test(id)) {
      return new Response(JSON.stringify({ error: 'Invalid container ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const inspect = execSync(`docker inspect --format='{{.Config.Image}}' ${id}`, {
      encoding: 'utf8',
      timeout: 10000
    }).trim();

    execSync(`docker pull ${inspect}`, { encoding: 'utf8', timeout: 120000 });
    execSync(`docker stop ${id}`, { encoding: 'utf8', timeout: 30000 });
    execSync(`docker rm ${id}`, { encoding: 'utf8', timeout: 10000 });

    return new Response(JSON.stringify({
      success: true,
      message: 'Container removed. Recreate via docker-compose or Portainer.',
      image: inspect
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Recreate failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
