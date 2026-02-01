import type { APIRoute } from 'astro';
import { execSync } from 'child_process';

const ALLOWED_ACTIONS = ['start', 'stop', 'restart'] as const;
type DockerAction = typeof ALLOWED_ACTIONS[number];

function isValidAction(action: string): action is DockerAction {
  return ALLOWED_ACTIONS.includes(action as DockerAction);
}

function isValidContainerId(id: string): boolean {
  // Container ID should be alphanumeric, 12 or 64 characters
  return /^[a-f0-9]{12}$|^[a-f0-9]{64}$/.test(id);
}

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { action } = params;

    if (!action || !isValidAction(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'string') {
      return new Response(JSON.stringify({ error: 'Container ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate container ID format to prevent command injection
    if (!isValidContainerId(id)) {
      return new Response(JSON.stringify({ error: 'Invalid container ID format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Execute docker command
    execSync(`docker ${action} ${id}`, {
      encoding: 'utf8',
      timeout: 30000
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Docker action failed:', error);
    return new Response(JSON.stringify({ error: 'Action failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
