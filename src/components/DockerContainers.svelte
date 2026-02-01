<script lang="ts">
  import { onMount } from 'svelte';

  interface Container {
    id: string;
    name: string;
    image: string;
    state: string;
    status: string;
  }

  let containers = $state<Container[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let actionLoading = $state<string | null>(null);
  let filter = $state<'all' | 'running' | 'stopped'>('all');
  let searchQuery = $state('');

  async function fetchContainers() {
    try {
      const res = await fetch('/api/docker');
      if (!res.ok) throw new Error('Failed to fetch');
      containers = await res.json();
      error = null;
    } catch (e) {
      error = 'Error al cargar contenedores';
    } finally {
      loading = false;
    }
  }

  async function containerAction(id: string, action: 'start' | 'stop' | 'restart') {
    actionLoading = id;
    try {
      const res = await fetch(`/api/docker/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error('Action failed');
      await fetchContainers();
    } catch (e) {
      error = `Error al ${action} contenedor`;
    } finally {
      actionLoading = null;
    }
  }

  onMount(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 10000);
    return () => clearInterval(interval);
  });

  let filteredContainers = $derived(
    containers.filter(c => {
      const matchesFilter = filter === 'all' ||
        (filter === 'running' && c.state === 'running') ||
        (filter === 'stopped' && c.state !== 'running');
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.image.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
  );

  let stats = $derived({
    total: containers.length,
    running: containers.filter(c => c.state === 'running').length,
    stopped: containers.filter(c => c.state !== 'running').length
  });
</script>

<div class="glass rounded-xl p-6">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
    <h2 class="text-lg font-semibold flex items-center gap-2">
      <svg class="w-5 h-5 text-accent-cyan" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185zm-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.186.185.186zm0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186zm-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186zm-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.186.186.186zm5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185zm-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185zm-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H5.136a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185zm-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185zm8.845 2.714h2.118a.186.186 0 00.186-.185v-1.888a.185.185 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185zm-2.93 0h2.12a.185.185 0 00.184-.185v-1.888a.185.185 0 00-.184-.185h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185zm-2.964 0h2.119a.185.185 0 00.185-.185v-1.888a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185zm-2.92 0h2.12a.185.185 0 00.184-.185v-1.888a.186.186 0 00-.184-.185h-2.12a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185zM23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288z"/>
      </svg>
      Docker
    </h2>
    <div class="flex items-center gap-2 text-xs">
      <span class="px-2 py-1 rounded-full bg-accent-green/20 text-accent-green">{stats.running} running</span>
      <span class="px-2 py-1 rounded-full bg-accent-red/20 text-accent-red">{stats.stopped} stopped</span>
    </div>
  </div>

  <!-- Search and Filter -->
  <div class="flex flex-col sm:flex-row gap-3 mb-4">
    <div class="relative flex-1">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Buscar contenedor..."
        class="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-500 rounded-lg text-sm focus:outline-none focus:border-accent-blue transition-colors"
      />
    </div>
    <div class="flex gap-1 p-1 bg-dark-700 rounded-lg">
      <button
        onclick={() => filter = 'all'}
        class="px-3 py-1 text-xs rounded-md transition-colors {filter === 'all' ? 'bg-accent-blue text-white' : 'text-gray-400 hover:text-white'}"
      >
        Todos
      </button>
      <button
        onclick={() => filter = 'running'}
        class="px-3 py-1 text-xs rounded-md transition-colors {filter === 'running' ? 'bg-accent-green text-white' : 'text-gray-400 hover:text-white'}"
      >
        Running
      </button>
      <button
        onclick={() => filter = 'stopped'}
        class="px-3 py-1 text-xs rounded-md transition-colors {filter === 'stopped' ? 'bg-accent-red text-white' : 'text-gray-400 hover:text-white'}"
      >
        Stopped
      </button>
    </div>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin"></div>
    </div>
  {:else if error}
    <div class="text-accent-red text-center py-8">{error}</div>
  {:else}
    <div class="space-y-2 max-h-96 overflow-y-auto scrollbar-thin pr-1">
      {#each filteredContainers as container (container.id)}
        <div class="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg group hover:bg-dark-600/50 transition-colors">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div class="w-2 h-2 rounded-full flex-shrink-0 {container.state === 'running' ? 'bg-accent-green animate-pulse-slow' : 'bg-accent-red'}"></div>
            <div class="min-w-0 flex-1">
              <div class="font-medium text-sm truncate">{container.name}</div>
              <div class="text-xs text-gray-500 truncate">{container.image}</div>
            </div>
          </div>
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {#if container.state === 'running'}
              <button
                onclick={() => containerAction(container.id, 'restart')}
                disabled={actionLoading === container.id}
                class="p-1.5 rounded-md bg-accent-yellow/20 text-accent-yellow hover:bg-accent-yellow/30 transition-colors disabled:opacity-50"
                title="Restart"
              >
                {#if actionLoading === container.id}
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                {:else}
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                {/if}
              </button>
              <button
                onclick={() => containerAction(container.id, 'stop')}
                disabled={actionLoading === container.id}
                class="p-1.5 rounded-md bg-accent-red/20 text-accent-red hover:bg-accent-red/30 transition-colors disabled:opacity-50"
                title="Stop"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </button>
            {:else}
              <button
                onclick={() => containerAction(container.id, 'start')}
                disabled={actionLoading === container.id}
                class="p-1.5 rounded-md bg-accent-green/20 text-accent-green hover:bg-accent-green/30 transition-colors disabled:opacity-50"
                title="Start"
              >
                {#if actionLoading === container.id}
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                {:else}
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                {/if}
              </button>
            {/if}
          </div>
        </div>
      {/each}
      {#if filteredContainers.length === 0}
        <div class="text-center py-8 text-gray-500">
          No se encontraron contenedores
        </div>
      {/if}
    </div>
  {/if}
</div>
