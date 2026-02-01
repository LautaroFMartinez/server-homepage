<script lang="ts">
  interface Props {
    name: string;
    url: string;
    icon: string;
    color?: string;
    description?: string;
  }

  let { name, url, icon, color = 'blue', description = '' }: Props = $props();

  const colorClasses: Record<string, string> = {
    blue: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20 hover:bg-accent-blue/20 hover:border-accent-blue/40',
    green: 'bg-accent-green/10 text-accent-green border-accent-green/20 hover:bg-accent-green/20 hover:border-accent-green/40',
    red: 'bg-accent-red/10 text-accent-red border-accent-red/20 hover:bg-accent-red/20 hover:border-accent-red/40',
    yellow: 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20 hover:bg-accent-yellow/20 hover:border-accent-yellow/40',
    purple: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20 hover:bg-accent-purple/20 hover:border-accent-purple/40',
    cyan: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20 hover:bg-accent-cyan/20 hover:border-accent-cyan/40',
    orange: 'bg-accent-orange/10 text-accent-orange border-accent-orange/20 hover:bg-accent-orange/20 hover:border-accent-orange/40'
  };

  const iconBgClasses: Record<string, string> = {
    blue: 'bg-accent-blue',
    green: 'bg-accent-green',
    red: 'bg-accent-red',
    yellow: 'bg-accent-yellow',
    purple: 'bg-accent-purple',
    cyan: 'bg-accent-cyan',
    orange: 'bg-accent-orange'
  };
</script>

<a
  href={url}
  target="_blank"
  rel="noopener noreferrer"
  class="block p-4 rounded-xl border transition-all duration-300 group {colorClasses[color] || colorClasses.blue}"
>
  <div class="flex items-center gap-3">
    <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg {iconBgClasses[color] || iconBgClasses.blue}">
      {icon}
    </div>
    <div class="flex-1 min-w-0">
      <div class="font-medium text-white group-hover:text-inherit transition-colors truncate">
        {name}
      </div>
      {#if description}
        <div class="text-xs text-gray-500 truncate">{description}</div>
      {/if}
    </div>
    <svg class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  </div>
</a>
