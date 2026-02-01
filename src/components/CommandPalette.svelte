<script lang="ts">
  import { onMount } from 'svelte';

  interface SearchItem {
    type: 'service' | 'container';
    name: string;
    description: string;
    url?: string;
    icon: string;
    color: string;
    state?: string;
  }

  interface Props {
    services: Array<{ name: string; url: string; icon: string; color: string; description: string }>;
  }

  let { services }: Props = $props();

  let isOpen = $state(false);
  let searchQuery = $state('');
  let containers = $state<SearchItem[]>([]);
  let selectedIndex = $state(0);
  let inputRef: HTMLInputElement;

  async function fetchContainers() {
    try {
      const res = await fetch('/api/docker');
      if (!res.ok) return;
      const data = await res.json();
      containers = data.map((c: any) => ({
        type: 'container' as const,
        name: c.name,
        description: c.image,
        icon: '🐳',
        color: c.state === 'running' ? 'green' : 'red',
        state: c.state
      }));
    } catch {}
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      isOpen = !isOpen;
      if (isOpen) {
        fetchContainers();
        setTimeout(() => inputRef?.focus(), 50);
      }
    }

    if (!isOpen) return;

    if (e.key === 'Escape') {
      isOpen = false;
      searchQuery = '';
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, filteredItems.length - 1);
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
    }

    if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      selectItem(filteredItems[selectedIndex]);
    }
  }

  function selectItem(item: SearchItem) {
    if (item.type === 'service' && item.url) {
      window.open(item.url, '_blank');
    }
    isOpen = false;
    searchQuery = '';
  }

  let serviceItems = $derived<SearchItem[]>(
    services.map(s => ({
      type: 'service' as const,
      name: s.name,
      description: s.description,
      url: s.url,
      icon: s.icon,
      color: s.color
    }))
  );

  let allItems = $derived([...serviceItems, ...containers]);

  let filteredItems = $derived(
    searchQuery.trim()
      ? allItems.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : allItems
  );

  $effect(() => {
    if (searchQuery) selectedIndex = 0;
  });

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });

  const colorClasses: Record<string, string> = {
    blue: 'bg-accent-blue',
    green: 'bg-accent-green',
    red: 'bg-accent-red',
    yellow: 'bg-accent-yellow',
    purple: 'bg-accent-purple',
    cyan: 'bg-accent-cyan',
    orange: 'bg-accent-orange'
  };
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
    onclick={() => { isOpen = false; searchQuery = ''; }}
    role="dialog"
    aria-modal="true"
  >
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

    <div
      class="relative w-full max-w-lg glass rounded-xl overflow-hidden shadow-2xl"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-center gap-3 p-4 border-b border-dark-600">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          bind:this={inputRef}
          bind:value={searchQuery}
          type="text"
          placeholder="Buscar servicios y contenedores..."
          class="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500"
        />
        <kbd class="px-2 py-1 text-xs bg-dark-600 rounded text-gray-400">ESC</kbd>
      </div>

      <div class="max-h-80 overflow-y-auto scrollbar-thin">
        {#if filteredItems.length === 0}
          <div class="p-8 text-center text-gray-500">
            No se encontraron resultados
          </div>
        {:else}
          <div class="p-2">
            {#each filteredItems as item, i (item.name + item.type)}
              <button
                onclick={() => selectItem(item)}
                class="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left {selectedIndex === i ? 'bg-dark-600' : 'hover:bg-dark-700'}"
              >
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg {colorClasses[item.color] || colorClasses.blue}">
                  {item.icon}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm flex items-center gap-2">
                    {item.name}
                    {#if item.type === 'container'}
                      <span class="px-1.5 py-0.5 text-[10px] rounded {item.state === 'running' ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-red/20 text-accent-red'}">
                        {item.state}
                      </span>
                    {/if}
                  </div>
                  <div class="text-xs text-gray-500 truncate">{item.description}</div>
                </div>
                {#if item.type === 'service'}
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <div class="flex items-center justify-between px-4 py-2 border-t border-dark-600 text-xs text-gray-500">
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1">
            <kbd class="px-1.5 py-0.5 bg-dark-600 rounded">↑↓</kbd> navegar
          </span>
          <span class="flex items-center gap-1">
            <kbd class="px-1.5 py-0.5 bg-dark-600 rounded">↵</kbd> seleccionar
          </span>
        </div>
        <span>{filteredItems.length} resultados</span>
      </div>
    </div>
  </div>
{/if}

<button
  onclick={() => { isOpen = true; fetchContainers(); setTimeout(() => inputRef?.focus(), 50); }}
  class="fixed bottom-4 left-4 z-40 px-3 py-2 glass rounded-lg flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
>
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
  <span class="hidden sm:inline">Buscar</span>
  <kbd class="px-1.5 py-0.5 text-xs bg-dark-600 rounded">Ctrl+K</kbd>
</button>
