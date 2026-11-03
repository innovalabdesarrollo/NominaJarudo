<script>
  import { onMount } from 'svelte';
  import { api } from '$lib/api.js';

  let configs = $state([]);
  let historial = $state([]);
  let plantas = $state([]);
  let form = $state({
    nombre: 'Nueva configuración',
    viajesBaseSemana: 3,
    viajesBaseSabado: 2,
    tarifaViajeAdicional: 180,
    volumenConsumoInterno: 0.5,
    excluirCancelados: true,
    excluirConsumoInterno: true,
    vigenciaDesde: '2026-01-01',
    vigenciaHasta: '',
    motivo: ''
  });
  let sim = $state(null);
  let plantaId = $state('');
  let semana = $state('2026-10-27');
  let msg = $state('');
  let err = $state('');

  async function load() {
    configs = await api('/api/config');
    historial = await api('/api/config/historial');
    plantas = await api('/api/plantas');
    if (!plantaId && plantas[0]) plantaId = plantas[0].id;
  }

  onMount(() => load().catch((e) => (err = e.message)));

  async function crear() {
    err = '';
    try {
      await api('/api/config', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          vigenciaHasta: form.vigenciaHasta || null,
          usuario: 'admin'
        })
      });
      msg = 'Configuración creada (pendiente de publicar)';
      form.motivo = '';
      await load();
    } catch (e) {
      err = e.message;
    }
  }

  async function publicar(id) {
    err = '';
    try {
      await api(`/api/config/${id}/publicar`, {
        method: 'POST',
        body: JSON.stringify({ usuario: 'admin', motivo: 'Publicación' })
      });
      msg = 'Publicada';
      await load();
    } catch (e) {
      err = e.message;
    }
  }

  async function simular() {
    err = '';
    try {
      const pending = configs.find((c) => c.estado === 'pendiente') || configs[0];
      sim = await api('/api/config/simular', {
        method: 'POST',
        body: JSON.stringify({ plantaId, semana, configId: pending?.id })
      });
    } catch (e) {
      err = e.message;
    }
  }

  function money(n) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
  }
</script>

<section class="space-y-6">
  <div>
    <h1 class="text-xl font-semibold">Tarifas y reglas</h1>
    <p class="text-sm text-stone-600">Bases, tarifa adicional, depuración y vigencia. Publicar solo si es válida.</p>
  </div>

  {#if msg}<p class="text-sm text-emerald-800">{msg}</p>{/if}
  {#if err}<p class="text-sm text-red-700">{err}</p>{/if}

  <div class="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 sm:grid-cols-2">
    <label class="text-sm">Nombre<input class="mt-1 w-full rounded-md border px-3 py-2" bind:value={form.nombre} /></label>
    <label class="text-sm">Tarifa adicional ($)<input type="number" class="mt-1 w-full rounded-md border px-3 py-2" bind:value={form.tarifaViajeAdicional} /></label>
    <label class="text-sm">Base semana<input type="number" class="mt-1 w-full rounded-md border px-3 py-2" bind:value={form.viajesBaseSemana} /></label>
    <label class="text-sm">Base sábado<input type="number" class="mt-1 w-full rounded-md border px-3 py-2" bind:value={form.viajesBaseSabado} /></label>
    <label class="text-sm">Volumen consumo interno<input type="number" step="0.1" class="mt-1 w-full rounded-md border px-3 py-2" bind:value={form.volumenConsumoInterno} /></label>
    <label class="text-sm">Vigencia desde<input type="date" class="mt-1 w-full rounded-md border px-3 py-2" bind:value={form.vigenciaDesde} /></label>
    <label class="text-sm">Vigencia hasta (opcional)<input type="date" class="mt-1 w-full rounded-md border px-3 py-2" bind:value={form.vigenciaHasta} /></label>
    <label class="text-sm">Motivo<input class="mt-1 w-full rounded-md border px-3 py-2" bind:value={form.motivo} /></label>
    <label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={form.excluirCancelados} /> Excluir cancelados</label>
    <label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={form.excluirConsumoInterno} /> Excluir consumo interno</label>
    <button class="rounded-md bg-[var(--brand)] px-4 py-2 text-sm text-white sm:col-span-2" onclick={crear}>Crear (pendiente)</button>
  </div>

  <div class="overflow-x-auto rounded-lg border border-stone-200 bg-white">
    <table class="min-w-full text-left text-sm">
      <thead class="bg-stone-100 text-stone-600">
        <tr>
          <th class="px-3 py-2">Ver</th>
          <th class="px-3 py-2">Estado</th>
          <th class="px-3 py-2">Bases</th>
          <th class="px-3 py-2">Tarifa</th>
          <th class="px-3 py-2">Vigencia</th>
          <th class="px-3 py-2"></th>
        </tr>
      </thead>
      <tbody>
        {#each configs as c}
          <tr class="border-t">
            <td class="px-3 py-2">v{c.version}</td>
            <td class="px-3 py-2">{c.estado}</td>
            <td class="px-3 py-2">{c.viajesBaseSemana}/{c.viajesBaseSabado}</td>
            <td class="px-3 py-2">{money(c.tarifaViajeAdicional)}</td>
            <td class="px-3 py-2">{c.vigenciaDesde} → {c.vigenciaHasta || 'abierta'}</td>
            <td class="px-3 py-2">
              {#if c.estado === 'pendiente'}
                <button class="text-[var(--brand)] underline" onclick={() => publicar(c.id)}>Publicar</button>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="rounded-lg border border-stone-200 bg-white p-4">
    <h2 class="font-semibold">Simular impacto</h2>
    <div class="mt-2 flex flex-wrap gap-2">
      <select class="rounded-md border px-3 py-2 text-sm" bind:value={plantaId}>
        {#each plantas as p}<option value={p.id}>{p.nombre}</option>{/each}
      </select>
      <input type="date" class="rounded-md border px-3 py-2 text-sm" bind:value={semana} />
      <button class="rounded-md bg-stone-800 px-3 py-2 text-sm text-white" onclick={simular}>Simular</button>
    </div>
    {#if sim}
      <p class="mt-3 text-sm">
        Excluidos est. {sim.tiquetesExcluidosEstimados} · Total {money(sim.totalPagar)} (no persiste)
      </p>
      <ul class="mt-2 text-sm text-stone-600">
        {#each sim.liquidaciones as l}
          <li>Op {l.operadorId.slice(0, 8)}… base {l.viajesBase} adic {l.viajesAdicionales} → {money(l.totalLiquidado)}</li>
        {/each}
      </ul>
    {/if}
  </div>

  <details>
    <summary class="cursor-pointer text-sm font-medium">Historial de cambios</summary>
    <ul class="mt-2 space-y-2 text-sm text-stone-600">
      {#each historial as h}
        <li class="rounded border border-stone-100 bg-white px-3 py-2">
          {h.fecha} · {h.usuario} · {h.tipo} · {h.motivo || ''}
        </li>
      {/each}
    </ul>
  </details>
</section>
