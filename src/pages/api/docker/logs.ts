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

    const logs = execSync(`docker logs --tail 30 ${id} 2>&1`, {
      encoding: 'utf8',
      timeout: 10000
    });

    return new Response(JSON.stringify({ logs }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch logs' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
