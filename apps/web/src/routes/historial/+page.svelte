<script>
  import { onMount } from 'svelte';
  import { api } from '$lib/api.js';

  let plantas = $state([]);
  let plantaId = $state('');
  let estado = $state('');
  let desde = $state('');
  let hasta = $state('');
  let archivo = $state('');
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
    if (estado) q.set('estado', estado);
    if (desde) q.set('desde', desde);
    if (hasta) q.set('hasta', hasta);
    if (archivo) q.set('archivo', archivo);
    items = await api(`/api/cargas?${q}`);
  }

  onMount(() => load().catch((e) => (err = e.message)));
</script>

<section class="space-y-4">
  <div>
    <h1 class="text-xl font-semibold">Historial de cargas</h1>
    <p class="text-sm text-stone-600">Filtro por fecha, estado y archivo.</p>
  </div>

  <div class="flex flex-wrap gap-2">
    <select class="rounded-md border px-3 py-2 text-sm" bind:value={plantaId}>
      {#each plantas as p}<option value={p.id}>{p.codigo}</option>{/each}
    </select>
    <select class="rounded-md border px-3 py-2 text-sm" bind:value={estado}>
      <option value="">Todos los estados</option>
      <option value="pendiente">pendiente</option>
      <option value="procesando">procesando</option>
      <option value="procesado">procesado</option>
      <option value="con_errores">con_errores</option>
      <option value="error">error</option>
    </select>
    <input type="date" class="rounded-md border px-3 py-2 text-sm" bind:value={desde} />
    <input type="date" class="rounded-md border px-3 py-2 text-sm" bind:value={hasta} />
    <input class="rounded-md border px-3 py-2 text-sm" placeholder="Archivo" bind:value={archivo} />
    <button class="rounded-md bg-stone-800 px-3 py-2 text-sm text-white" onclick={refresh}>Filtrar</button>
  </div>

  {#if err}<p class="text-sm text-red-700">{err}</p>{/if}

  <div class="overflow-x-auto rounded-lg border bg-white">
    <table class="min-w-full text-left text-sm">
      <thead class="bg-stone-100 text-stone-600">
        <tr>
          <th class="px-3 py-2">Carga</th>
          <th class="px-3 py-2">Archivo</th>
          <th class="px-3 py-2">Fecha reporte</th>
          <th class="px-3 py-2">Quién</th>
          <th class="px-3 py-2">Estado</th>
          <th class="px-3 py-2">Resultado</th>
        </tr>
      </thead>
      <tbody>
        {#each items as c}
          <tr class="border-t">
            <td class="px-3 py-2 text-xs text-stone-500">{c.fechaCarga}</td>
            <td class="px-3 py-2">{c.nombreArchivo}</td>
            <td class="px-3 py-2">{c.fechaReporte}</td>
            <td class="px-3 py-2">{c.cargadoPor}</td>
            <td class="px-3 py-2">{c.estadoProcesamiento}</td>
            <td class="px-3 py-2 text-xs">
              {c.recordsCount || 0} extraídos · {c.validCount || 0} vál · {c.excludedCount || 0} excl ·
              {c.inconsistencyCount || 0} incons.
            </td>
          </tr>
        {:else}
          <tr><td colspan="6" class="px-3 py-6 text-center text-stone-500">Sin historial</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
