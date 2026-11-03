<script>
  import { onMount } from 'svelte';
  import { api, apiUrl } from '$lib/api.js';

  let plantas = $state([]);
  let plantaId = $state('');
  let semana = $state('2026-10-27');
  let matrices = $state([]);
  let liquidaciones = $state([]);
  let trazas = $state([]);
  let detalle = $state(null);
  let msg = $state('');
  let err = $state('');
  let loading = $state(false);

  async function load() {
    plantas = await api('/api/plantas');
    if (!plantaId && plantas[0]) plantaId = plantas[0].id;
    await refresh();
  }

  async function refresh() {
    const q = new URLSearchParams({ plantaId, semana });
    matrices = await api(`/api/liquidaciones/matriz?${q}`);
    liquidaciones = await api(`/api/liquidaciones?${q}`);
    trazas = await api(`/api/liquidaciones/trazabilidad?${q}`);
  }

  onMount(() => load().catch((e) => (err = e.message)));

  async function calcular() {
    loading = true;
    err = '';
    msg = '';
    try {
      const r = await api('/api/liquidaciones/calcular', {
        method: 'POST',
        body: JSON.stringify({ plantaId, semana })
      });
      msg = `Calculado · config v${r.configVersion} · ${r.liquidaciones.length} operadores`;
      await refresh();
    } catch (e) {
      err = e.message;
    } finally {
      loading = false;
    }
  }

  async function validar() {
    err = '';
    try {
      await api('/api/liquidaciones/matriz/validar', {
        method: 'POST',
        body: JSON.stringify({ plantaId, semana, usuario: 'jefe_planta' })
      });
      msg = 'Matriz confirmada';
      await refresh();
    } catch (e) {
      err = e.message;
    }
  }

  function exportCsv() {
    const q = new URLSearchParams({ plantaId, semana });
    window.open(apiUrl(`/api/liquidaciones/export.csv?${q}`), '_blank');
  }

  async function verDetalle(operadorId) {
    detalle = await api(`/api/liquidaciones/detalle/${operadorId}?semana=${semana}`);
  }

  function money(n) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
  }
</script>

<section class="space-y-4">
  <div>
    <h1 class="text-xl font-semibold">Matriz semanal y liquidación</h1>
    <p class="text-sm text-stone-600">Bases 3 (semana) / 2 (sábado). Export CSV solo si está validada.</p>
  </div>

  <div class="flex flex-wrap gap-2">
    <select class="rounded-md border border-stone-300 px-3 py-2 text-sm" bind:value={plantaId}>
      {#each plantas as p}<option value={p.id}>{p.nombre}</option>{/each}
    </select>
    <input type="date" class="rounded-md border border-stone-300 px-3 py-2 text-sm" bind:value={semana} />
    <button class="rounded-md bg-stone-200 px-3 py-2 text-sm" disabled={!plantaId} onclick={refresh}>Consultar</button>
    <button
      class="rounded-md bg-[var(--brand)] px-3 py-2 text-sm text-white disabled:opacity-50"
      disabled={loading || !plantaId || !semana}
      onclick={calcular}
    >
      Calcular
    </button>
    <button class="rounded-md bg-stone-800 px-3 py-2 text-sm text-white disabled:opacity-50" disabled={!plantaId} onclick={validar}>
      Validar matriz
    </button>
    <button class="rounded-md border border-stone-300 px-3 py-2 text-sm" disabled={!plantaId} onclick={exportCsv}>
      Exportar CSV
    </button>
  </div>

  {#if msg}<p class="text-sm text-emerald-800">{msg}</p>{/if}
  {#if err}<p class="text-sm text-red-700">{err}</p>{/if}

  <div class="overflow-x-auto rounded-lg border border-stone-200 bg-white">
    <table class="min-w-full text-left text-sm">
      <thead class="bg-stone-100 text-stone-600">
        <tr>
          <th class="px-3 py-2">Operador</th>
          <th class="px-3 py-2">Viajes</th>
          <th class="px-3 py-2">Base</th>
          <th class="px-3 py-2">Adic.</th>
          <th class="px-3 py-2">Total</th>
          <th class="px-3 py-2">Estado</th>
          <th class="px-3 py-2"></th>
        </tr>
      </thead>
      <tbody>
        {#each matrices as m}
          {@const liq = liquidaciones.find((l) => l.operadorId === m.operadorId)}
          <tr class="border-t border-stone-100">
            <td class="px-3 py-2 font-medium">{m.operadorNombre}</td>
            <td class="px-3 py-2">{m.viajesLiquidables}</td>
            <td class="px-3 py-2">{m.viajesBase}</td>
            <td class="px-3 py-2">{m.viajesAdicionales}</td>
            <td class="px-3 py-2">{money(m.totalLiquidado ?? liq?.totalLiquidado)}</td>
            <td class="px-3 py-2">{m.estadoValidacion}</td>
            <td class="px-3 py-2">
              <button class="text-[var(--brand)] underline" onclick={() => verDetalle(m.operadorId)}>Detalle</button>
            </td>
          </tr>
        {:else}
          <tr><td colspan="7" class="px-3 py-6 text-center text-stone-500">Sin matriz. Calcula la semana.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if detalle}
    <div class="rounded-lg border border-stone-200 bg-white p-4 text-sm">
      <h2 class="font-semibold">Detalle de cálculo</h2>
      {#if detalle.liquidacion}
        <p class="mt-1 text-stone-600">
          Base {detalle.liquidacion.viajesBase} · Adicionales {detalle.liquidacion.viajesAdicionales} ×
          {money(detalle.liquidacion.tarifaViajeAdicional)} =
          <strong>{money(detalle.liquidacion.totalLiquidado)}</strong>
        </p>
      {/if}
      <ul class="mt-3 max-h-48 space-y-1 overflow-y-auto">
        {#each detalle.viajes || [] as v}
          <li>
            {v.fechaViaje} · viaje {v.numeroViaje} · {v.ticketNumber}
            {v.esViajeAdicional ? ' · adicional' : ' · base'}
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <details class="text-sm">
    <summary class="cursor-pointer font-medium text-stone-700">Trazabilidad ({trazas.length})</summary>
    <ul class="mt-2 space-y-1 text-stone-600">
      {#each trazas as t}
        <li>{t.operacionRealizada} → {money(t.resultadoCalculo)}</li>
      {/each}
    </ul>
  </details>
</section>
