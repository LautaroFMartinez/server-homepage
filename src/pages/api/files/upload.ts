import type { APIRoute } from 'astro';
import * as fs from 'fs';
import * as path from 'path';

const HOST_HOME = fs.existsSync('/host/home') ? '/host/home' : '/home/lau';

function resolveSafePath(relativePath: string): string | null {
  const resolved = path.resolve(HOST_HOME, relativePath.replace(/^\/+/, ''));
  if (!resolved.startsWith(HOST_HOME)) return null;
  return resolved;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const targetPath = (formData.get('path') as string) || '/';
    const safePath = resolveSafePath(targetPath);

    if (!safePath) {
      return new Response(JSON.stringify({ error: 'Invalid path' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!fs.existsSync(safePath) || !fs.statSync(safePath).isDirectory()) {
      return new Response(JSON.stringify({ error: 'Target directory not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const uploaded: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === 'path') continue;
      if (!(value instanceof File)) continue;

      const fileName = value.name;
      const filePath = path.join(safePath, fileName);

      // Ensure the file path doesn't escape the safe directory
      if (!filePath.startsWith(HOST_HOME)) continue;

      const buffer = Buffer.from(await value.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      uploaded.push(fileName);
    }

    return new Response(JSON.stringify({ uploaded }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to upload files' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
