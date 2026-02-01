<script lang="ts">
  interface SpeedtestResult {
    download: number;
    upload: number;
    ping: number;
    server: string;
  }

  let result = $state<SpeedtestResult | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function runSpeedtest() {
    loading = true;
    error = null;
    result = null;

    try {
      const res = await fetch('/api/speedtest');
      if (!res.ok) throw new Error('Speedtest failed');
      result = await res.json();
      (window as any).toast?.success('Speedtest completado');
    } catch {
      error = 'Error al ejecutar speedtest';
      (window as any).toast?.error('Speedtest falló');
    } finally {
      loading = false;
    }
  }
</script>

<div class="glass rounded-xl p-6">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold flex items-center gap-2">
      <svg class="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      Speedtest
    </h2>
    <button
      onclick={runSpeedtest}
      disabled={loading}
      class="px-3 py-1.5 text-xs rounded-lg bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30 transition-colors disabled:opacity-50 flex items-center gap-2"
    >
      {#if loading}
        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        Testing...
      {:else}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Run Test
      {/if}
    </button>
  </div>

  {#if loading}
    <div class="text-center py-6">
      <div class="inline-flex items-center gap-2 text-gray-400 text-sm">
        <div class="w-2 h-2 bg-accent-purple rounded-full animate-pulse"></div>
        Ejecutando speedtest...
      </div>
      <p class="text-xs text-gray-500 mt-2">Esto puede tomar hasta 2 minutos</p>
    </div>
  {:else if error}
    <div class="text-center py-4">
      <p class="text-accent-red text-sm">{error}</p>
      <p class="text-xs text-gray-500 mt-1">Verifica que speedtest-cli esté instalado</p>
    </div>
  {:else if result}
    <div class="grid grid-cols-3 gap-4">
      <div class="text-center p-3 bg-dark-700/50 rounded-lg">
        <div class="text-2xl font-bold text-accent-green">{result.download}</div>
        <div class="text-xs text-gray-500">Download Mbps</div>
      </div>
      <div class="text-center p-3 bg-dark-700/50 rounded-lg">
        <div class="text-2xl font-bold text-accent-blue">{result.upload}</div>
        <div class="text-xs text-gray-500">Upload Mbps</div>
      </div>
      <div class="text-center p-3 bg-dark-700/50 rounded-lg">
        <div class="text-2xl font-bold text-accent-yellow">{result.ping}</div>
        <div class="text-xs text-gray-500">Ping ms</div>
      </div>
    </div>
    <div class="text-center text-xs text-gray-500 mt-3">
      Server: {result.server}
    </div>
  {:else}
    <div class="text-center py-6 text-gray-500 text-sm">
      Click "Run Test" para medir velocidad
    </div>
  {/if}
</div>
