<script>
  import { onMount } from 'svelte';
  import { api, apiUrl } from '$lib/api.js';

  let plantas = $state([]);
  let cargas = $state([]);
  let plantaId = $state('');
  let fechaReporte = $state(new Date().toISOString().slice(0, 10));
  let files = $state(/** @type {FileList | null} */ (null));
  let dragging = $state(false);
  let msg = $state('');
  let err = $state('');
  let loading = $state(false);

  async function load() {
    plantas = await api('/api/plantas');
    if (!plantaId && plantas[0]) plantaId = plantas[0].id;
    await refresh();
  }

  async function refresh() {
    const q = new URLSearchParams();
    if (plantaId) q.set('plantaId', plantaId);
    cargas = await api(`/api/cargas?${q}`);
  }

  onMount(() => load().catch((e) => (err = e.message)));

  async function upload() {
    err = '';
    msg = '';
    if (!files?.length) {
      err = 'Selecciona o arrastra PDFs';
      return;
    }
    loading = true;
    try {
      const fd = new FormData();
      fd.set('plantaId', plantaId);
      fd.set('fechaReporte', fechaReporte);
      fd.set('cargadoPor', 'jefe_planta');
      for (const f of files) fd.append('files', f);
      const res = await fetch(apiUrl('/api/cargas'), { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      msg = `Cargados: ${data.created.length}. Rechazados: ${data.rejected.length}`;
      if (data.rejected.length) {
        msg += ' — ' + data.rejected.map((r) => `${r.nombreArchivo}: ${r.motivo}`).join('; ');
      }
      files = null;
      await refresh();
    } catch (e) {
      err = e.message;
    } finally {
      loading = false;
    }
  }

  function onDrop(e) {
    e.preventDefault();
    dragging = false;
    files = e.dataTransfer?.files || null;
  }

  const statusClass = {
    pendiente: 'bg-amber-100 text-amber-900',
    procesando: 'bg-sky-100 text-sky-900',
    procesado: 'bg-emerald-100 text-emerald-900',
    con_errores: 'bg-orange-100 text-orange-900',
    error: 'bg-red-100 text-red-900'
  };
</script>

<section class="space-y-5">
  <div>
    <h1 class="text-xl font-semibold">Cargas PDF SAP</h1>
    <p class="text-sm text-stone-600">Arrastra uno o varios PDF. Se evita duplicar planta+fecha+nombre.</p>
  </div>

  <div class="grid gap-3 sm:grid-cols-2">
    <label class="text-sm">
      <span class="text-stone-600">Planta</span>
      <select class="mt-1 w-full rounded-md border border-stone-300 px-3 py-2" bind:value={plantaId} onchange={refresh}>
        {#each plantas as p}
          <option value={p.id}>{p.nombre} ({p.codigo})</option>
        {/each}
      </select>
    </label>
    <label class="text-sm">
      <span class="text-stone-600">Fecha del reporte</span>
      <input type="date" class="mt-1 w-full rounded-md border border-stone-300 px-3 py-2" bind:value={fechaReporte} />
    </label>
  </div>

  <div
    class="rounded-lg border-2 border-dashed px-4 py-10 text-center transition
      {dragging ? 'border-[var(--brand)] bg-[var(--brand-soft)]' : 'border-stone-300 bg-white'}"
    ondragover={(e) => {
      e.preventDefault();
      dragging = true;
    }}
    ondragleave={() => (dragging = false)}
    ondrop={onDrop}
  >
    <p class="text-sm text-stone-700">Suelta PDFs aquí o elige archivos</p>
    <input
      class="mt-3 block w-full text-sm"
      type="file"
      accept="application/pdf,.pdf"
      multiple
      onchange={(e) => (files = e.currentTarget.files)}
    />
    {#if files?.length}
      <ul class="mt-3 space-y-1 text-left text-sm text-stone-600">
        {#each Array.from(files) as f}
          <li>{f.name} · {(f.size / 1024).toFixed(1)} KB</li>
        {/each}
      </ul>
    {/if}
  </div>

  <button
    class="rounded-md bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
    disabled={loading}
    onclick={upload}
  >
    {loading ? 'Procesando…' : 'Cargar y procesar'}
  </button>

  {#if msg}<p class="text-sm text-emerald-800">{msg}</p>{/if}
  {#if err}<p class="text-sm text-red-700">{err}</p>{/if}

  <div class="overflow-x-auto rounded-lg border border-stone-200 bg-white">
    <table class="min-w-full text-left text-sm">
      <thead class="bg-stone-100 text-stone-600">
        <tr>
          <th class="px-3 py-2">Archivo</th>
          <th class="px-3 py-2">Fecha</th>
          <th class="px-3 py-2">Estado</th>
          <th class="px-3 py-2">Registros</th>
          <th class="px-3 py-2">Detalle</th>
        </tr>
      </thead>
      <tbody>
        {#each cargas as c}
          <tr class="border-t border-stone-100">
            <td class="px-3 py-2 font-medium">{c.nombreArchivo}</td>
            <td class="px-3 py-2">{c.fechaReporte}</td>
            <td class="px-3 py-2">
              <span class="rounded-full px-2 py-0.5 text-xs {statusClass[c.estadoProcesamiento] || 'bg-stone-100'}">
                {c.estadoProcesamiento}
              </span>
            </td>
            <td class="px-3 py-2">{c.recordsCount ?? '—'}</td>
            <td class="px-3 py-2 text-stone-500">{c.mensajeError || `${c.validCount ?? 0} válidos / ${c.excludedCount ?? 0} excl.`}</td>
          </tr>
        {:else}
          <tr><td colspan="5" class="px-3 py-6 text-center text-stone-500">Sin cargas</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
