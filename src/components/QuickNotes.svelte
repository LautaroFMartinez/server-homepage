<script lang="ts">
  import { onMount } from 'svelte';

  interface Note {
    id: number;
    text: string;
    date: number;
  }

  let notes = $state<Note[]>([]);
  let isOpen = $state(false);
  let newNote = $state('');
  let inputRef: HTMLInputElement;

  function loadNotes() {
    try {
      const saved = localStorage.getItem('quick-notes');
      if (saved) notes = JSON.parse(saved);
    } catch {}
  }

  function saveNotes() {
    localStorage.setItem('quick-notes', JSON.stringify(notes));
  }

  function addNote() {
    if (!newNote.trim()) return;
    notes = [{ id: Date.now(), text: newNote.trim(), date: Date.now() }, ...notes];
    saveNotes();
    newNote = '';
  }

  function deleteNote(id: number) {
    notes = notes.filter(n => n.id !== id);
    saveNotes();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') addNote();
    if (e.key === 'Escape') isOpen = false;
  }

  onMount(loadNotes);
</script>

<button
  onclick={() => { isOpen = !isOpen; if (isOpen) setTimeout(() => inputRef?.focus(), 50); }}
  class="fixed top-4 right-4 z-40 p-2 glass rounded-lg text-gray-400 hover:text-white transition-colors"
  title="Notas"
>
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
  {#if notes.length > 0}
    <span class="absolute -top-1 -right-1 w-4 h-4 bg-accent-blue rounded-full text-[10px] flex items-center justify-center text-white">
      {notes.length}
    </span>
  {/if}
</button>

{#if isOpen}
  <div class="fixed top-14 right-4 z-40 w-72 glass rounded-xl overflow-hidden shadow-xl">
    <div class="p-3 border-b border-dark-600">
      <div class="flex gap-2">
        <input
          bind:this={inputRef}
          bind:value={newNote}
          onkeydown={handleKeydown}
          type="text"
          placeholder="Nueva nota..."
          class="flex-1 px-3 py-1.5 bg-dark-700 border border-dark-500 rounded-lg text-sm focus:outline-none focus:border-accent-blue"
        />
        <button
          onclick={addNote}
          class="px-3 py-1.5 bg-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/30 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>

    <div class="max-h-64 overflow-y-auto scrollbar-thin">
      {#if notes.length === 0}
        <div class="p-4 text-center text-gray-500 text-sm">
          Sin notas
        </div>
      {:else}
        {#each notes as note (note.id)}
          <div class="group flex items-start gap-2 p-3 hover:bg-dark-700/50 transition-colors border-b border-dark-600/50 last:border-0">
            <p class="flex-1 text-sm text-gray-300 break-words">{note.text}</p>
            <button
              onclick={() => deleteNote(note.id)}
              class="p-1 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-accent-red transition-all"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        {/each}
      {/if}
    </div>
  </div>
{/if}
