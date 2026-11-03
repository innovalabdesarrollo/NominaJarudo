<script>
  import { onMount } from 'svelte';
  import { api } from '$lib/api.js';

  let plantas = $state([]);
  let plantaId = $state('');
  let items = $state([]);
  let err = $state('');

  async function load() {
    plantas = await api('/api/plantas');
    if (!plantaId && plantas[0]) plantaId = plantas[0].id;
    await refresh();
  }

  async function refresh() {
    const q = new URLSearchParams();
    if (plantaId) q.set('plantaId', plantaId);
    items = await api(`/api/tiquetes/inconsistencias?${q}`);
  }

  onMount(() => load().catch((e) => (err = e.message)));
</script>

<section class="space-y-4">
  <div>
    <h1 class="text-xl font-semibold">Inconsistencias</h1>
    <p class="text-sm text-stone-600">Campos faltantes, duplicados y anomalías de procesamiento.</p>
  </div>

  <select class="rounded-md border border-stone-300 px-3 py-2 text-sm" bind:value={plantaId} onchange={refresh}>
    {#each plantas as p}<option value={p.id}>{p.nombre}</option>{/each}
  </select>

  {#if err}<p class="text-sm text-red-700">{err}</p>{/if}

  <ul class="space-y-2">
    {#each items as i}
      <li class="rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm">
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded bg-stone-100 px-2 py-0.5 text-xs">{i.tipoInconsistencia}</span>
          <span class="rounded px-2 py-0.5 text-xs {i.severidad === 'critica' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'}">
            {i.severidad}
          </span>
          <span class="text-xs text-stone-500">{i.estado}</span>
        </div>
        <p class="mt-1 text-stone-800">{i.descripcion}</p>
        <p class="mt-1 text-xs text-stone-500">Tiquete: {i.tiqueteId || '—'} · {i.fechaDeteccion}</p>
      </li>
    {:else}
      <li class="text-sm text-stone-500">Sin inconsistencias registradas.</li>
    {/each}
  </ul>
</section>
