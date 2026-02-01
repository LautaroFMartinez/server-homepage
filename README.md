# Lau's Server Homepage

Personal server dashboard built with Astro, Svelte 5, and TailwindCSS 4.

**Author:** Lautaro F. Martinez

## Features

- **Multi-timezone clocks** - Argentina, Galapagos, Madrid
- **Real-time system metrics** - CPU, RAM, Disk, Temperature, Network I/O
- **Metrics history** - Visual graph of CPU/RAM over time
- **Docker container management** - Start/stop/restart with live logs viewer
- **Speedtest** - On-demand internet speed test (Ookla)
- **Cloudflare analytics** - Requests, bandwidth, visitors, threats
- **Configurable services** - Drag & drop reordering with localStorage persistence
- **Global search** - Quick access with `Ctrl+K` keyboard shortcut
- **Toast notifications** - Visual feedback for actions

## Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/LautaroFMartinez/server-homepage.git
cd server-homepage

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

The first 3 services appear in the "Quick Access" section. Both sections support drag & drop reordering.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open global search |
| `↑` `↓` | Navigate search results |
| `Enter` | Select item |
| `Esc` | Close modal/search |

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
    services.ts              # Services configuration
  components/
    Clock.svelte             # Timezone clocks
    SystemMetrics.svelte     # CPU, RAM, Disk, Temp, Network
    ServiceCard.svelte       # Service link card
    DraggableServices.svelte # Drag & drop service list
    DockerContainers.svelte  # Container list with actions
    LogsModal.svelte         # Container logs viewer
    CloudflareMetrics.svelte # Cloudflare stats
    Speedtest.svelte         # Internet speed test
    CommandPalette.svelte    # Global search (Ctrl+K)
    Toast.svelte             # Notification system
  pages/
    api/
      system.ts              # System metrics API
      docker.ts              # List containers API
      docker/[action].ts     # Container actions API
      docker/logs.ts         # Container logs API
      cloudflare.ts          # Cloudflare API
      speedtest.ts           # Speedtest API
    index.astro              # Main page
```

## Docker Requirements

The container needs access to:

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro  # Docker control
  - /proc:/host/proc:ro                            # System metrics
  - /sys:/host/sys:ro                              # CPU temperature
```

## Tech Stack

- [Astro](https://astro.build/) - Web framework
- [Svelte 5](https://svelte.dev/) - UI components with runes
- [TailwindCSS 4](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Ookla Speedtest](https://www.speedtest.net/apps/cli) - Speed testing

## License

MIT
