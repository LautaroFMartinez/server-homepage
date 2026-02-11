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
    const requestedPath = url.searchParams.get('path');
    if (!requestedPath) {
      return new Response(JSON.stringify({ error: 'Path required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const safePath = resolveSafePath(requestedPath);
    if (!safePath) {
      return new Response(JSON.stringify({ error: 'Invalid path' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!fs.existsSync(safePath)) {
      return new Response(JSON.stringify({ error: 'File not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const stat = fs.statSync(safePath);
    if (stat.isDirectory()) {
      return new Response(JSON.stringify({ error: 'Cannot download a directory' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const fileName = path.basename(safePath);
    const fileBuffer = fs.readFileSync(safePath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': stat.size.toString()
      }
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to download file' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
