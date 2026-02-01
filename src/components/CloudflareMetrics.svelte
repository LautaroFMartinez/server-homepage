<script lang="ts">
  import { onMount } from 'svelte';

  interface ZoneMetrics {
    zone: string;
    requests: number;
    bandwidth: number;
    threats: number;
    uniqueVisitors: number;
  }

  let metrics = $state<ZoneMetrics[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let expanded = $state(false);

  async function fetchMetrics() {
    try {
      const res = await fetch('/api/cloudflare');
      if (!res.ok) {
        if (res.status === 503) {
          error = 'Cloudflare no configurado';
          return;
        }
        throw new Error('Failed to fetch');
      }
      metrics = await res.json();
      error = null;
    } catch (e) {
      error = 'Error al cargar Cloudflare';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  });

  function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  function formatBytes(bytes: number): string {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return bytes + ' B';
  }

  let totals = $derived({
    requests: metrics.reduce((acc, m) => acc + m.requests, 0),
    bandwidth: metrics.reduce((acc, m) => acc + m.bandwidth, 0),
    threats: metrics.reduce((acc, m) => acc + m.threats, 0),
    visitors: metrics.reduce((acc, m) => acc + m.uniqueVisitors, 0)
  });
</script>

<div class="glass rounded-xl p-6">
  <button
    onclick={() => expanded = !expanded}
    class="w-full flex items-center justify-between mb-4"
  >
    <h2 class="text-lg font-semibold flex items-center gap-2">
      <svg class="w-5 h-5 text-accent-orange" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.5088 16.8447C16.5088 16.8447 16.6229 16.5635 16.6229 16.1683C16.6229 15.4918 16.3417 14.8722 15.8882 14.4188L14.8722 15.0667L14.6478 15.2343C14.8154 15.4919 14.9262 15.8019 14.9262 16.1683C14.9262 16.2823 14.9262 16.3964 14.8722 16.5104L14.7013 17.0207L15.267 16.9067C15.6054 16.8495 16.001 16.8447 16.5088 16.8447ZM11.9999 0C5.37256 0 0 5.37256 0 12C0 18.6275 5.37256 24 12 24C18.6275 24 24 18.6275 24 12C24 5.37256 18.6274 0 11.9999 0ZM12.0568 19.5882C7.91993 19.5882 4.56472 16.233 4.56472 12.0961C4.56472 10.5113 5.08201 9.04016 5.94526 7.8252L6.62176 8.10642C6.84616 8.1632 7.12738 8.10642 7.35178 8.10642L8.99337 7.48671L9.04016 7.4299C9.04016 7.37312 8.42046 6.18493 8.36367 5.73147L7.74397 5.1118L7.34497 4.99776C8.61318 4.32127 10.141 3.91773 11.7258 3.8041L13.0509 4.43061V5.05031C13.0509 5.27471 13.1649 5.44231 13.2789 5.6667C13.336 5.72349 13.4498 5.78027 13.5071 5.78027H14.8322L15.6818 6.63152V7.53671L14.5482 8.67032L14.5482 9.17943L15.2815 9.68854L16.6066 9.74533C16.8878 9.74533 17.0554 9.63129 17.2231 9.46369L17.843 8.84398L17.9001 8.44498C18.6899 9.46321 19.1524 10.7314 19.1524 12.0961C19.1524 16.233 15.7972 19.5882 12.0568 19.5882Z"/>
      </svg>
      Cloudflare
    </h2>
    <svg
      class="w-5 h-5 text-gray-400 transition-transform {expanded ? 'rotate-180' : ''}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if loading}
    <div class="flex items-center justify-center py-8">
      <div class="w-8 h-8 border-2 border-accent-orange border-t-transparent rounded-full animate-spin"></div>
    </div>
  {:else if error}
    <div class="text-gray-500 text-center py-4 text-sm">{error}</div>
  {:else}
    <!-- Summary -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
      <div class="text-center p-3 bg-dark-700/50 rounded-lg">
        <div class="text-2xl font-bold text-accent-blue">{formatNumber(totals.requests)}</div>
        <div class="text-xs text-gray-500">Requests</div>
      </div>
      <div class="text-center p-3 bg-dark-700/50 rounded-lg">
        <div class="text-2xl font-bold text-accent-green">{formatBytes(totals.bandwidth)}</div>
        <div class="text-xs text-gray-500">Bandwidth</div>
      </div>
      <div class="text-center p-3 bg-dark-700/50 rounded-lg">
        <div class="text-2xl font-bold text-accent-purple">{formatNumber(totals.visitors)}</div>
        <div class="text-xs text-gray-500">Visitors</div>
      </div>
      <div class="text-center p-3 bg-dark-700/50 rounded-lg">
        <div class="text-2xl font-bold text-accent-red">{formatNumber(totals.threats)}</div>
        <div class="text-xs text-gray-500">Threats</div>
      </div>
    </div>

    <!-- Per-zone details -->
    {#if expanded && metrics.length > 0}
      <div class="space-y-2 pt-2 border-t border-dark-600">
        {#each metrics as zone}
          <div class="flex items-center justify-between p-3 bg-dark-700/30 rounded-lg">
            <div class="font-medium text-sm">{zone.zone}</div>
            <div class="flex items-center gap-4 text-xs text-gray-400">
              <span>{formatNumber(zone.requests)} req</span>
              <span>{formatBytes(zone.bandwidth)}</span>
              <span>{formatNumber(zone.uniqueVisitors)} visitors</span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>
