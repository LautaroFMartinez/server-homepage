import type { APIRoute } from 'astro';

interface ZoneMetrics {
  zone: string;
  requests: number;
  bandwidth: number;
  threats: number;
  uniqueVisitors: number;
}

interface CloudflareZone {
  id: string;
  name: string;
}

interface CloudflareAnalytics {
  data: {
    viewer: {
      zones: Array<{
        httpRequests1dGroups: Array<{
          sum: {
            requests: number;
            bytes: number;
            threats: number;
          };
          uniq: {
            uniques: number;
          };
        }>;
      }>;
    };
  };
}

async function getZones(apiToken: string): Promise<CloudflareZone[]> {
  const response = await fetch('https://api.cloudflare.com/client/v4/zones', {
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch zones');
  }

  const data = await response.json() as { result: CloudflareZone[] };
  return data.result || [];
}

async function getAnalytics(apiToken: string, zoneId: string): Promise<{
  requests: number;
  bandwidth: number;
  threats: number;
  uniqueVisitors: number;
}> {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const query = `
    query {
      viewer {
        zones(filter: {zoneTag: "${zoneId}"}) {
          httpRequests1dGroups(
            limit: 1
            filter: { date_gt: "${yesterday.toISOString().split('T')[0]}" }
          ) {
            sum {
              requests
              bytes
              threats
            }
            uniq {
              uniques
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    return { requests: 0, bandwidth: 0, threats: 0, uniqueVisitors: 0 };
  }

  const data = await response.json() as CloudflareAnalytics;

  const zones = data.data?.viewer?.zones || [];
  if (zones.length === 0 || zones[0].httpRequests1dGroups.length === 0) {
    return { requests: 0, bandwidth: 0, threats: 0, uniqueVisitors: 0 };
  }

  const group = zones[0].httpRequests1dGroups[0];
  return {
    requests: group.sum?.requests || 0,
    bandwidth: group.sum?.bytes || 0,
    threats: group.sum?.threats || 0,
    uniqueVisitors: group.uniq?.uniques || 0
  };
}

export const GET: APIRoute = async () => {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!apiToken) {
    return new Response(JSON.stringify({ error: 'Cloudflare not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const zones = await getZones(apiToken);
    const metrics: ZoneMetrics[] = [];

    for (const zone of zones) {
      const analytics = await getAnalytics(apiToken, zone.id);
      metrics.push({
        zone: zone.name,
        ...analytics
      });
    }

    return new Response(JSON.stringify(metrics), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Cloudflare API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch Cloudflare data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
