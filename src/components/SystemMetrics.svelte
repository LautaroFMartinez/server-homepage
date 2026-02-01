<script lang="ts">
  import { onMount } from 'svelte';

  interface Metrics {
    cpu: number;
    memory: { used: number; total: number; percent: number };
    disk: { used: number; total: number; percent: number };
    temperature: number | null;
    network: { rx: number; tx: number };
  }

  interface HistoryPoint {
    cpu: number;
    memory: number;
    timestamp: number;
  }

  let metrics = $state<Metrics | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let history = $state<HistoryPoint[]>([]);
  let showHistory = $state(false);

  const MAX_HISTORY = 60;

  async function fetchMetrics() {
    try {
      const res = await fetch('/api/system');
      if (!res.ok) throw new Error('Failed to fetch');
      metrics = await res.json();
      error = null;

      if (metrics) {
        history = [...history, {
          cpu: metrics.cpu,
          memory: metrics.memory.percent,
          timestamp: Date.now()
        }].slice(-MAX_HISTORY);
      }
    } catch {
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

  function formatSpeed(bytes: number): string {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB/s';
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB/s';
    return bytes.toFixed(0) + ' B/s';
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

  function getTempColor(temp: number): string {
    if (temp >= 80) return 'text-accent-red';
    if (temp >= 60) return 'text-accent-yellow';
    return 'text-accent-green';
  }

  function getHistoryPath(data: number[], height: number): string {
    if (data.length < 2) return '';
    const width = 100;
    const step = width / (data.length - 1);

    return data.map((val, i) => {
      const x = i * step;
      const y = height - (val / 100) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }

  let cpuHistory = $derived(history.map(h => h.cpu));
  let memHistory = $derived(history.map(h => h.memory));
</script>

<div class="glass rounded-xl p-6">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold flex items-center gap-2">
      <svg class="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
      Sistema
    </h2>
    <button
      onclick={() => showHistory = !showHistory}
      class="p-1.5 rounded-lg hover:bg-dark-600 transition-colors text-gray-400 hover:text-white"
      title="Toggle history"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </button>
  </div>

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
          <span class="text-gray-400">Disco</span>
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

      <!-- Temperature & Network -->
      <div class="grid grid-cols-2 gap-4 pt-2 border-t border-dark-600">
        {#if metrics.temperature !== null}
          <div class="text-center p-3 bg-dark-700/50 rounded-lg">
            <div class="text-2xl font-bold {getTempColor(metrics.temperature)}">{metrics.temperature.toFixed(0)}°C</div>
            <div class="text-xs text-gray-500">CPU Temp</div>
          </div>
        {/if}
        <div class="text-center p-3 bg-dark-700/50 rounded-lg {metrics.temperature === null ? 'col-span-2' : ''}">
          <div class="flex items-center justify-center gap-3">
            <div>
              <span class="text-accent-green text-sm font-medium">↓</span>
              <span class="font-mono text-sm">{formatSpeed(metrics.network.rx)}</span>
            </div>
            <div>
              <span class="text-accent-blue text-sm font-medium">↑</span>
              <span class="font-mono text-sm">{formatSpeed(metrics.network.tx)}</span>
            </div>
          </div>
          <div class="text-xs text-gray-500 mt-1">Network</div>
        </div>
      </div>

      <!-- History Chart -->
      {#if showHistory && history.length > 1}
        <div class="pt-2 border-t border-dark-600">
          <div class="text-xs text-gray-500 mb-2">Historial (últimos 3 min)</div>
          <div class="relative h-16 bg-dark-700/50 rounded-lg overflow-hidden">
            <svg class="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path
                d={getHistoryPath(cpuHistory, 40)}
                fill="none"
                stroke="rgba(59, 130, 246, 0.8)"
                stroke-width="1.5"
                vector-effect="non-scaling-stroke"
              />
              <path
                d={getHistoryPath(memHistory, 40)}
                fill="none"
                stroke="rgba(139, 92, 246, 0.8)"
                stroke-width="1.5"
                vector-effect="non-scaling-stroke"
              />
            </svg>
            <div class="absolute bottom-1 right-2 flex gap-3 text-[10px]">
              <span class="text-accent-blue">● CPU</span>
              <span class="text-accent-purple">● RAM</span>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
