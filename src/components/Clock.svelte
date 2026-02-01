<script lang="ts">
  import { onMount } from 'svelte';

  interface TimeZone {
    name: string;
    zone: string;
    flag: string;
  }

  const timeZones: TimeZone[] = [
    { name: 'Argentina', zone: 'America/Argentina/Buenos_Aires', flag: 'AR' },
    { name: 'Galapagos', zone: 'Pacific/Galapagos', flag: 'EC' },
    { name: 'Barcelona', zone: 'Europe/Madrid', flag: 'ES' }
  ];

  let times = $state<{ time: string; date: string }[]>(
    timeZones.map(() => ({ time: '--:--:--', date: '---' }))
  );

  function updateTimes() {
    times = timeZones.map(tz => {
      const now = new Date();
      const time = now.toLocaleTimeString('es', {
        timeZone: tz.zone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      const date = now.toLocaleDateString('es', {
        timeZone: tz.zone,
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
      return { time, date };
    });
  }

  onMount(() => {
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  });
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  {#each timeZones as tz, i}
    <div class="glass rounded-xl p-4 text-center transition-all duration-300 glass-hover">
      <div class="flex items-center justify-center gap-2 mb-2">
        <span class="text-2xl">{tz.flag === 'AR' ? '\u{1F1E6}\u{1F1F7}' : tz.flag === 'EC' ? '\u{1F1EA}\u{1F1E8}' : '\u{1F1EA}\u{1F1F8}'}</span>
        <span class="text-gray-400 text-sm font-medium">{tz.name}</span>
      </div>
      <div class="font-mono text-3xl font-bold text-white tracking-wider">
        {times[i].time}
      </div>
      <div class="text-gray-500 text-xs mt-1 capitalize">
        {times[i].date}
      </div>
    </div>
  {/each}
</div>
