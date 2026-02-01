import type { APIRoute } from 'astro';
import { execSync } from 'child_process';

interface Container {
  id: string;
  name: string;
  image: string;
  state: string;
  status: string;
}

function getContainers(): Container[] {
  try {
    const output = execSync(
      'docker ps -a --format "{{.ID}}|{{.Names}}|{{.Image}}|{{.State}}|{{.Status}}"',
      { encoding: 'utf8', timeout: 10000 }
    );

    const containers: Container[] = [];

    for (const line of output.trim().split('\n')) {
      if (!line) continue;
      const [id, name, image, state, status] = line.split('|');
      containers.push({
        id: id.substring(0, 12),
        name: name || 'unknown',
        image: image || 'unknown',
        state: state || 'unknown',
        status: status || 'unknown'
      });
    }

    // Sort: running first, then by name
    containers.sort((a, b) => {
      if (a.state === 'running' && b.state !== 'running') return -1;
      if (a.state !== 'running' && b.state === 'running') return 1;
      return a.name.localeCompare(b.name);
    });

    return containers;
  } catch (error) {
    console.error('Failed to get containers:', error);
    return [];
  }
}

export const GET: APIRoute = async () => {
  try {
    const containers = getContainers();
    return new Response(JSON.stringify(containers), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to get containers' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
