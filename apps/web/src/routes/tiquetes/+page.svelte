<script>
  import { onMount } from 'svelte';
  import { api } from '$lib/api.js';

  let plantas = $state([]);
  let items = $state([]);
  let plantaId = $state('');
  let q = $state('');
  let filtro = $state('todos');
  let err = $state('');

  async function load() {
    plantas = await api('/api/plantas');
    if (!plantaId && plantas[0]) plantaId = plantas[0].id;
    await refresh();
  }

  async function refresh() {
    const params = new URLSearchParams();
    if (plantaId) params.set('plantaId', plantaId);
    if (q) params.set('q', q);
    if (filtro === 'excluidos') params.set('excluidos', '1');
    if (filtro === 'liquidables') params.set('liquidables', '1');
    items = await api(`/api/tiquetes?${params}`);
  }

  onMount(() => load().catch((e) => (err = e.message)));
</script>

<section class="space-y-4">
  <div>
    <h1 class="text-xl font-semibold">Tiquetes extraídos</h1>
    <p class="text-sm text-stone-600">Incluye motivo de exclusión cuando aplica.</p>
  </div>

  <div class="flex flex-wrap gap-2">
    <select class="rounded-md border border-stone-300 px-3 py-2 text-sm" bind:value={plantaId} onchange={refresh}>
      {#each plantas as p}<option value={p.id}>{p.codigo}</option>{/each}
    </select>
    <input
      class="min-w-[10rem] flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm"
      placeholder="Buscar tiquete / operador / vehículo"
      bind:value={q}
      onkeydown={(e) => e.key === 'Enter' && refresh()}
    />
    <select class="rounded-md border border-stone-300 px-3 py-2 text-sm" bind:value={filtro} onchange={refresh}>
      <option value="todos">Todos</option>
      <option value="liquidables">Liquidables</option>
      <option value="excluidos">Excluidos</option>
    </select>
    <button class="rounded-md bg-stone-800 px-3 py-2 text-sm text-white" onclick={refresh}>Filtrar</button>
  </div>

  {#if err}<p class="text-sm text-red-700">{err}</p>{/if}

  <div class="overflow-x-auto rounded-lg border border-stone-200 bg-white">
    <table class="min-w-full text-left text-sm">
      <thead class="bg-stone-100 text-stone-600">
        <tr>
          <th class="px-3 py-2">Fecha</th>
          <th class="px-3 py-2">Tiquete</th>
          <th class="px-3 py-2">Operador</th>
          <th class="px-3 py-2">Vehículo</th>
          <th class="px-3 py-2">m³</th>
          <th class="px-3 py-2">Estado</th>
          <th class="px-3 py-2">Origen</th>
          <th class="px-3 py-2">Exclusión</th>
        </tr>
      </thead>
      <tbody>
        {#each items as t}
          <tr class="border-t border-stone-100 {t.liquidable ? '' : 'bg-stone-50'}">
            <td class="px-3 py-2 whitespace-nowrap">{t.fechaTiquete}</td>
            <td class="px-3 py-2 font-medium">{t.numeroTiquete}</td>
            <td class="px-3 py-2">{t.operadorNombre || '—'}</td>
            <td class="px-3 py-2">{t.vehiculo || '—'}</td>
            <td class="px-3 py-2">{t.volumenMetrosCubicos ?? '—'}</td>
            <td class="px-3 py-2">{t.estadoAuditoria}</td>
            <td class="px-3 py-2 text-xs text-stone-500">{t.archivoOrigen}</td>
            <td class="px-3 py-2 text-xs text-stone-600">
              {#each t.exclusiones || [] as ex}
                <div>{ex.tipoExclusion}: {ex.motivo}</div>
              {:else}—{/each}
            </td>
          </tr>
        {:else}
          <tr><td colspan="8" class="px-3 py-6 text-center text-stone-500">Sin tiquetes</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
