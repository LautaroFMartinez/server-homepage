import type { APIRoute } from 'astro';
import * as fs from 'fs';
import * as path from 'path';

const HOST_HOME = fs.existsSync('/host/home') ? '/host/home' : '/home/lau';

function resolveSafePath(relativePath: string): string | null {
  const resolved = path.resolve(HOST_HOME, relativePath.replace(/^\/+/, ''));
  if (!resolved.startsWith(HOST_HOME)) return null;
  return resolved;
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const requestedPath = url.searchParams.get('path') || '/';
    const safePath = resolveSafePath(requestedPath);

    if (!safePath) {
      return new Response(JSON.stringify({ error: 'Invalid path' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!fs.existsSync(safePath) || !fs.statSync(safePath).isDirectory()) {
      return new Response(JSON.stringify({ error: 'Directory not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const entries = fs.readdirSync(safePath, { withFileTypes: true });
    const items = entries
      .filter(e => !e.name.startsWith('.'))
      .map(entry => {
        try {
          const fullPath = path.join(safePath, entry.name);
          const stat = fs.statSync(fullPath);
          return {
            name: entry.name,
            type: entry.isDirectory() ? 'directory' as const : 'file' as const,
            size: entry.isDirectory() ? 0 : stat.size,
            modified: stat.mtime.toISOString()
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a!.type !== b!.type) return a!.type === 'directory' ? -1 : 1;
        return a!.name.localeCompare(b!.name);
      });

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to list directory' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
