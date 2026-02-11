<script lang="ts">
  import { onMount } from 'svelte';

  interface FileEntry {
    name: string;
    type: 'file' | 'directory';
    size: number;
    modified: string;
  }

  let currentPath = $state('/');
  let entries = $state<FileEntry[]>([]);
  let loading = $state(true);
  let error = $state('');
  let uploading = $state(false);
  let fileInput: HTMLInputElement;

  const breadcrumbs = $derived(() => {
    const parts = currentPath.split('/').filter(Boolean);
    const crumbs = [{ name: '~', path: '/' }];
    let accumulated = '';
    for (const part of parts) {
      accumulated += '/' + part;
      crumbs.push({ name: part, path: accumulated });
    }
    return crumbs;
  });

  async function fetchEntries(dirPath: string) {
    loading = true;
    error = '';
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(dirPath)}`);
      if (!res.ok) {
        const data = await res.json();
        error = data.error || 'Failed to load';
        entries = [];
      } else {
        entries = await res.json();
      }
    } catch {
      error = 'Failed to connect';
      entries = [];
    }
    loading = false;
  }

  function navigate(dirPath: string) {
    currentPath = dirPath;
    fetchEntries(dirPath);
  }

  function handleClick(entry: FileEntry) {
    if (entry.type === 'directory') {
      const newPath = currentPath === '/' ? '/' + entry.name : currentPath + '/' + entry.name;
      navigate(newPath);
    } else {
      const filePath = currentPath === '/' ? '/' + entry.name : currentPath + '/' + entry.name;
      window.open(`/api/files/download?path=${encodeURIComponent(filePath)}`, '_blank');
    }
  }

  async function handleUpload() {
    if (!fileInput?.files?.length) return;
    uploading = true;
    try {
      const formData = new FormData();
      formData.append('path', currentPath);
      for (const file of fileInput.files) {
        formData.append('files', file);
      }
      const res = await fetch('/api/files/upload', { method: 'POST', body: formData });
      if (res.ok) {
        fileInput.value = '';
        fetchEntries(currentPath);
      }
    } catch {}
    uploading = false;
  }

  function formatSize(bytes: number): string {
    if (bytes === 0) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function getFileIcon(entry: FileEntry): string {
    if (entry.type === 'directory') return 'folder';
    const ext = entry.name.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) return 'image';
    if (['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext)) return 'video';
    if (['mp3', 'flac', 'wav', 'ogg', 'aac'].includes(ext)) return 'audio';
    if (['zip', 'tar', 'gz', 'rar', '7z', 'bz2'].includes(ext)) return 'archive';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx', 'txt', 'md', 'rtf'].includes(ext)) return 'document';
    if (['js', 'ts', 'py', 'sh', 'json', 'yaml', 'yml', 'toml', 'xml', 'html', 'css', 'svelte', 'astro'].includes(ext)) return 'code';
    return 'file';
  }

  onMount(() => {
    fetchEntries(currentPath);
    const interval = setInterval(() => fetchEntries(currentPath), 30000);
    return () => clearInterval(interval);
  });
</script>

<div class="glass rounded-xl p-6">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold flex items-center gap-2">
      <svg class="w-5 h-5 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
      Archivos
    </h2>
    <div class="flex items-center gap-2">
      <label class="cursor-pointer px-3 py-1.5 rounded-lg bg-accent-cyan/20 text-accent-cyan text-xs font-medium hover:bg-accent-cyan/30 transition-colors flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {uploading ? 'Subiendo...' : 'Subir'}
        <input
          type="file"
          multiple
          class="hidden"
          bind:this={fileInput}
          onchange={handleUpload}
          disabled={uploading}
        />
      </label>
      <button
        onclick={() => fetchEntries(currentPath)}
        class="p-1.5 rounded-lg hover:bg-dark-600/50 text-gray-400 hover:text-gray-200 transition-colors"
        title="Refrescar"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Breadcrumb -->
  <div class="flex items-center gap-1 text-sm mb-4 overflow-x-auto pb-1 scrollbar-thin">
    {#each breadcrumbs() as crumb, i}
      {#if i > 0}
        <span class="text-gray-600 flex-shrink-0">/</span>
      {/if}
      <button
        onclick={() => navigate(crumb.path)}
        class="hover:text-accent-cyan transition-colors truncate flex-shrink-0 {i === breadcrumbs().length - 1 ? 'text-accent-cyan font-medium' : 'text-gray-400'}"
      >
        {crumb.name}
      </button>
    {/each}
  </div>

  <!-- Content -->
  {#if loading}
    <div class="flex items-center justify-center py-8">
      <div class="w-6 h-6 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin"></div>
    </div>
  {:else if error}
    <div class="text-center py-8 text-red-400 text-sm">{error}</div>
  {:else if entries.length === 0}
    <div class="text-center py-8 text-gray-500 text-sm">Carpeta vacia</div>
  {:else}
    <div class="space-y-1 max-h-[400px] overflow-y-auto scrollbar-thin">
      {#each entries as entry (entry.name)}
        <button
          onclick={() => handleClick(entry)}
          class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-dark-600/50 transition-colors text-left group"
        >
          <!-- Icon -->
          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
            {entry.type === 'directory' ? 'bg-accent-yellow/20 text-accent-yellow' : 'bg-dark-600/80 text-gray-400'}">
            {#if entry.type === 'directory'}
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
              </svg>
            {:else if getFileIcon(entry) === 'image'}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            {:else if getFileIcon(entry) === 'video'}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            {:else if getFileIcon(entry) === 'audio'}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            {:else if getFileIcon(entry) === 'archive'}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            {:else if getFileIcon(entry) === 'code'}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            {:else}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            {/if}
          </div>

          <!-- Name -->
          <span class="flex-1 text-sm truncate group-hover:text-white transition-colors {entry.type === 'directory' ? 'text-gray-200' : 'text-gray-400'}">
            {entry.name}
          </span>

          <!-- Size -->
          <span class="text-xs text-gray-600 flex-shrink-0 w-20 text-right">
            {formatSize(entry.size)}
          </span>

          <!-- Date -->
          <span class="text-xs text-gray-600 flex-shrink-0 w-24 text-right hidden sm:block">
            {formatDate(entry.modified)}
          </span>

          <!-- Download indicator for files -->
          {#if entry.type === 'file'}
            <svg class="w-3.5 h-3.5 text-gray-600 group-hover:text-accent-cyan transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          {:else}
            <svg class="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .scrollbar-thin::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
</style>
