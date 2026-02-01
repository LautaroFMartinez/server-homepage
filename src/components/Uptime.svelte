<script lang="ts">
  import { onMount } from 'svelte';

  let uptime = $state<{ days: number; hours: number; minutes: number } | null>(null);

  async function fetchUptime() {
    try {
      const res = await fetch('/api/uptime');
      if (res.ok) uptime = await res.json();
    } catch {}
  }

  onMount(() => {
    fetchUptime();
    const interval = setInterval(fetchUptime, 60000);
    return () => clearInterval(interval);
  });
</script>

{#if uptime}
  <div class="flex items-center gap-1.5 text-xs text-gray-500">
    <div class="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-slow"></div>
    <span>
      {#if uptime.days > 0}
        {uptime.days}d {uptime.hours}h
      {:else}
        {uptime.hours}h {uptime.minutes}m
      {/if}
    </span>
  </div>
{/if}
