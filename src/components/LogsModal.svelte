<script lang="ts">
  interface Props {
    isOpen: boolean;
    containerName: string;
    containerId: string;
    onClose: () => void;
  }

  let { isOpen, containerName, containerId, onClose }: Props = $props();

  let logs = $state('');
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function fetchLogs() {
    if (!containerId) return;

    loading = true;
    error = null;

    try {
      const res = await fetch('/api/docker/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: containerId })
      });

      if (!res.ok) throw new Error('Failed to fetch logs');

      const data = await res.json();
      logs = data.logs || 'No logs available';
    } catch {
      error = 'Error al cargar logs';
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (isOpen && containerId) {
      fetchLogs();
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    onclick={onClose}
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
          <svg class="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Logs: {containerName}
        </h3>
        <div class="flex items-center gap-2">
          <button
            onclick={fetchLogs}
            class="p-2 rounded-lg hover:bg-dark-600 transition-colors"
            title="Refresh"
          >
            <svg class="w-4 h-4 {loading ? 'animate-spin' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onclick={onClose}
            class="p-2 rounded-lg hover:bg-dark-600 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div class="p-4 max-h-[60vh] overflow-auto scrollbar-thin">
        {#if loading}
          <div class="flex items-center justify-center py-8">
            <div class="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin"></div>
          </div>
        {:else if error}
          <div class="text-accent-red text-center py-4">{error}</div>
        {:else}
          <pre class="font-mono text-xs text-gray-300 whitespace-pre-wrap break-all">{logs}</pre>
        {/if}
      </div>
    </div>
  </div>
{/if}
