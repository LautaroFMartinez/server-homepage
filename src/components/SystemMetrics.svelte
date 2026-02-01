<script lang="ts">
  import { onMount } from 'svelte';

  interface Metrics {
    cpu: number;
    memory: { used: number; total: number; percent: number };
    disk: { used: number; total: number; percent: number };
  }

  let metrics = $state<Metrics | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  async function fetchMetrics() {
    try {
      const res = await fetch('/api/system');
      if (!res.ok) throw new Error('Failed to fetch');
      metrics = await res.json();
      error = null;
    } catch (e) {
      error = 'Error al cargar metricas';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  });

  function formatBytes(bytes: number): string {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(1) + ' GB';
  }

  function getColorClass(percent: number): string {
    if (percent >= 90) return 'bg-accent-red';
    if (percent >= 70) return 'bg-accent-yellow';
    return 'bg-accent-green';
  }

  function getGlowClass(percent: number): string {
    if (percent >= 90) return 'shadow-red-500/30';
    if (percent >= 70) return 'shadow-yellow-500/30';
    return 'shadow-green-500/30';
  }
</script>

<div class="glass rounded-xl p-6">
  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
    <svg class="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
    Sistema
  </h2>

  {#if loading}
    <div class="flex items-center justify-center py-8">
      <div class="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
    </div>
  {:else if error}
    <div class="text-accent-red text-center py-4">{error}</div>
  {:else if metrics}
    <div class="space-y-5">
      <!-- CPU -->
      <div>
        <div class="flex justify-between text-sm mb-2">
          <span class="text-gray-400">CPU</span>
          <span class="font-mono font-medium">{metrics.cpu.toFixed(1)}%</span>
        </div>
        <div class="h-2 bg-dark-700 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500 shadow-lg {getColorClass(metrics.cpu)} {getGlowClass(metrics.cpu)}"
            style="width: {Math.min(metrics.cpu, 100)}%"
          ></div>
        </div>
      </div>

      <!-- RAM -->
      <div>
        <div class="flex justify-between text-sm mb-2">
          <span class="text-gray-400">RAM</span>
          <span class="font-mono font-medium">
            {formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}
          </span>
        </div>
        <div class="h-2 bg-dark-700 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500 shadow-lg {getColorClass(metrics.memory.percent)} {getGlowClass(metrics.memory.percent)}"
            style="width: {metrics.memory.percent}%"
          ></div>
        </div>
      </div>

      <!-- Disk -->
      <div>
        <div class="flex justify-between text-sm mb-2">
          <span class="text-gray-400">Disco (sda)</span>
          <span class="font-mono font-medium">
            {formatBytes(metrics.disk.used)} / {formatBytes(metrics.disk.total)}
          </span>
        </div>
        <div class="h-2 bg-dark-700 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500 shadow-lg {getColorClass(metrics.disk.percent)} {getGlowClass(metrics.disk.percent)}"
            style="width: {metrics.disk.percent}%"
          ></div>
        </div>
      </div>
    </div>
  {/if}
</div>
