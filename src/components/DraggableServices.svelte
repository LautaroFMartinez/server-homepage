<script lang="ts">
  import { onMount } from 'svelte';
  import ServiceCard from './ServiceCard.svelte';

  interface Service {
    name: string;
    url: string;
    icon: string;
    color: string;
    description: string;
  }

  interface Props {
    services: Service[];
    storageKey: string;
  }

  let { services, storageKey }: Props = $props();

  let orderedServices = $state<Service[]>([]);
  let draggedIndex = $state<number | null>(null);
  let dragOverIndex = $state<number | null>(null);

  function loadOrder() {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const order = JSON.parse(saved) as string[];
        const serviceMap = new Map(services.map(s => [s.name, s]));
        const ordered = order
          .map(name => serviceMap.get(name))
          .filter((s): s is Service => s !== undefined);

        const remaining = services.filter(s => !order.includes(s.name));
        orderedServices = [...ordered, ...remaining];
      } else {
        orderedServices = [...services];
      }
    } catch {
      orderedServices = [...services];
    }
  }

  function saveOrder() {
    const order = orderedServices.map(s => s.name);
    localStorage.setItem(storageKey, JSON.stringify(order));
  }

  function handleDragStart(index: number) {
    draggedIndex = index;
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      dragOverIndex = index;
    }
  }

  function handleDragLeave() {
    dragOverIndex = null;
  }

  function handleDrop(index: number) {
    if (draggedIndex === null || draggedIndex === index) {
      draggedIndex = null;
      dragOverIndex = null;
      return;
    }

    const newOrder = [...orderedServices];
    const [dragged] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, dragged);

    orderedServices = newOrder;
    saveOrder();

    draggedIndex = null;
    dragOverIndex = null;
  }

  function handleDragEnd() {
    draggedIndex = null;
    dragOverIndex = null;
  }

  onMount(() => {
    loadOrder();
  });
</script>

<div class="space-y-3">
  {#each orderedServices as service, i (service.name)}
    <div
      draggable="true"
      ondragstart={() => handleDragStart(i)}
      ondragover={(e) => handleDragOver(e, i)}
      ondragleave={handleDragLeave}
      ondrop={() => handleDrop(i)}
      ondragend={handleDragEnd}
      class="transition-all duration-200 {draggedIndex === i ? 'opacity-50 scale-95' : ''} {dragOverIndex === i ? 'translate-y-2' : ''}"
    >
      <ServiceCard
        name={service.name}
        url={service.url}
        icon={service.icon}
        color={service.color}
        description={service.description}
      />
    </div>
  {/each}
</div>
