<script lang="ts">
  let isOpen = $state(false);
  let logs = $state('');
  let loading = $state(false);

  async function runFixScript() {
    isOpen = true;
    loading = true;
    logs = '';

    try {
      const res = await fetch('/api/camera', {
        method: 'POST'
      });

      if (!res.ok) throw new Error('Failed to execute script');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          logs += decoder.decode(value, { stream: true });
        }
      }
    } catch (e) {
      logs += '\n❌ Error al ejecutar el script';
    } finally {
      loading = false;
    }
  }

  function closeModal() {
    isOpen = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') closeModal();
  }

  // Limpiar códigos ANSI para mostrar texto limpio
  function cleanAnsi(text: string): string {
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="glass rounded-xl p-6">
  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
    <svg class="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
    Cámara PTZ
  </h2>
  
  <button
    onclick={runFixScript}
    disabled={loading}
    class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent-purple/20 hover:bg-accent-purple/30 text-accent-purple transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {#if loading}
      <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span>Ejecutando...</span>
    {:else}
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span>Reparar Cámara</span>
    {/if}
  </button>
  
  <p class="text-xs text-gray-500 mt-2 text-center">
    Ejecuta fix-camera.sh para reconectar
  </p>
</div>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    onclick={closeModal}
    role="dialog"
    aria-modal="true"
  >
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

    <div
      class="relative w-full max-w-3xl max-h-[80vh] glass rounded-xl overflow-hidden"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-center justify-between p-4 border-b border-dark-600">
        <h3 class="font-semibold flex items-center gap-2">
          <svg class="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Fix Cámara PTZ - Log
        </h3>
        <div class="flex items-center gap-2">
          {#if loading}
            <span class="text-xs text-accent-yellow flex items-center gap-1">
              <span class="w-2 h-2 bg-accent-yellow rounded-full animate-pulse"></span>
              Ejecutando...
            </span>
          {/if}
          <button
            onclick={closeModal}
            class="p-2 rounded-lg hover:bg-dark-600 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div class="p-4 max-h-[60vh] overflow-auto scrollbar-thin">
        {#if logs}
          <pre class="font-mono text-xs leading-relaxed whitespace-pre-wrap text-gray-300">{cleanAnsi(logs)}</pre>
        {:else if loading}
          <div class="flex items-center justify-center py-8">
            <div class="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        {:else}
          <p class="text-gray-500 text-center py-4">No hay logs disponibles</p>
        {/if}
      </div>
    </div>
  </div>
{/if}
