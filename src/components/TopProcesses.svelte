<script lang="ts">
  import { onMount } from 'svelte';

  interface Process {
    pid: string;
    name: string;
    cpu: number;
    mem: number;
  }

  let processes = $state<Process[]>([]);
  let loading = $state(true);
  let expanded = $state(false);

  async function fetchProcesses() {
    try {
      const res = await fetch('/api/processes');
      if (res.ok) processes = await res.json();
    } catch {}
    loading = false;
  }

  onMount(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 5000);
    return () => clearInterval(interval);
  });

  function getBarWidth(value: number): number {
    return Math.min(value, 100);
  }
</script>

<div class="glass rounded-xl p-6">
  <button
    onclick={() => expanded = !expanded}
    class="w-full flex items-center justify-between mb-4"
  >
    <h2 class="text-lg font-semibold flex items-center gap-2">
      <svg class="w-5 h-5 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      Procesos
    </h2>
    <svg
      class="w-4 h-4 text-gray-400 transition-transform {expanded ? 'rotate-180' : ''}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if loading}
    <div class="flex items-center justify-center py-4">
      <div class="w-6 h-6 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin"></div>
    </div>
  {:else if expanded}
    <div class="space-y-3">
      {#each processes as proc (proc.pid)}
        <div class="p-2 bg-dark-700/50 rounded-lg">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-sm font-medium truncate max-w-[140px]" title={proc.name}>{proc.name}</span>
            <span class="text-xs text-gray-500">PID {proc.pid}</span>
          </div>
          <div class="flex gap-4">
            <div class="flex-1">
              <div class="flex justify-between text-[10px] text-gray-500 mb-0.5">
                <span>CPU</span>
                <span>{proc.cpu.toFixed(1)}%</span>
              </div>
              <div class="h-1 bg-dark-600 rounded-full overflow-hidden">
                <div
                  class="h-full bg-accent-blue rounded-full transition-all"
                  style="width: {getBarWidth(proc.cpu)}%"
                ></div>
              </div>
            </div>
            <div class="flex-1">
              <div class="flex justify-between text-[10px] text-gray-500 mb-0.5">
                <span>RAM</span>
                <span>{proc.mem.toFixed(1)}%</span>
              </div>
              <div class="h-1 bg-dark-600 rounded-full overflow-hidden">
                <div
                  class="h-full bg-accent-purple rounded-full transition-all"
                  style="width: {getBarWidth(proc.mem)}%"
                ></div>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="flex items-center justify-between text-sm text-gray-400">
      <span>Top 5 por CPU</span>
      <span class="font-mono">{processes[0]?.name || '-'} ({processes[0]?.cpu.toFixed(1) || 0}%)</span>
    </div>
  {/if}
</div>
