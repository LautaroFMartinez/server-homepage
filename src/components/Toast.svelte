<script lang="ts">
  import { onMount } from 'svelte';

  interface ToastMessage {
    id: number;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }

  let toasts = $state<ToastMessage[]>([]);
  let nextId = 0;

  function addToast(type: ToastMessage['type'], message: string, duration = 4000) {
    const id = nextId++;
    toasts = [...toasts, { id, type, message }];

    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, duration);
  }

  onMount(() => {
    (window as any).toast = {
      success: (msg: string) => addToast('success', msg),
      error: (msg: string) => addToast('error', msg),
      info: (msg: string) => addToast('info', msg),
      warning: (msg: string) => addToast('warning', msg)
    };
  });

  const colors: Record<string, string> = {
    success: 'bg-accent-green/90 border-accent-green',
    error: 'bg-accent-red/90 border-accent-red',
    info: 'bg-accent-blue/90 border-accent-blue',
    warning: 'bg-accent-yellow/90 border-accent-yellow'
  };

  const icons: Record<string, string> = {
    success: 'M5 13l4 4L19 7',
    error: 'M6 18L18 6M6 6l12 12',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
  };
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
  {#each toasts as toast (toast.id)}
    <div
      class="flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg animate-slide-in {colors[toast.type]}"
    >
      <svg class="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={icons[toast.type]} />
      </svg>
      <span class="text-white text-sm font-medium">{toast.message}</span>
    </div>
  {/each}
</div>

<style>
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
</style>
