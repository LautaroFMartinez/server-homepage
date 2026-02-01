# Lau's Server Homepage

Personal server dashboard built with Astro, Svelte 5, and TailwindCSS 4.

**Author:** Lautaro F. Martinez

## Features

- Multi-timezone clocks (Argentina, Galapagos, Madrid)
- Real-time system metrics (CPU, RAM, Disk)
- Configurable service links with quick access section
- Docker container management (start/stop/restart)
- Cloudflare analytics integration (requests, bandwidth, visitors, threats)

## Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/yourusername/homepage.git
cd homepage

# Copy and configure environment
cp .env.example .env
# Edit .env with your Cloudflare token (optional)

# Build and run
docker compose up -d --build

# Dashboard available at http://localhost:4321
```

## Configure Services

Edit `src/config/services.ts` to add your services:

```typescript
{
  name: 'My Service',
  url: 'https://service.mydomain.com',
  icon: '\u{1F4BB}',
  color: 'blue', // blue, green, red, yellow, purple, cyan, orange
  description: 'Short description'
}
```

The first 3 services appear in the "Quick Access" section.

## Rebuild Container

After modifying services, styles, or any project file:

```bash
docker compose up -d --build
```

If you only changed `.env` (e.g., Cloudflare token):

```bash
docker compose restart
```

## Cloudflare Setup (Optional)

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Create a token with permissions:
   - Zone: Read
   - Analytics: Read
3. Add to `.env`:
   ```
   CLOUDFLARE_API_TOKEN=your_token_here
   ```
4. Restart the container

## Local Development

```bash
npm install
npm run dev
# Open http://localhost:4321
```

## Project Structure

```
src/
  config/
    services.ts           # Services configuration
  components/
    Clock.svelte          # Timezone clocks
    SystemMetrics.svelte  # CPU, RAM, Disk metrics
    ServiceCard.svelte    # Service link card
    DockerContainers.svelte
    CloudflareMetrics.svelte
  pages/
    api/
      system.ts           # System metrics API
      docker.ts           # List containers API
      docker/[action].ts  # Container actions API
      cloudflare.ts       # Cloudflare API
    index.astro           # Main page
```

## Docker Requirements

The container needs access to the Docker socket to list/control containers:

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro
```

## Tech Stack

- [Astro](https://astro.build/) - Web framework
- [Svelte 5](https://svelte.dev/) - UI components
- [TailwindCSS 4](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## License

MIT
