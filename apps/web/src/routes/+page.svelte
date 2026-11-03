<script>
  import { onMount } from 'svelte';
  import { api } from '$lib/api.js';
  import { getSession } from '$lib/session.js';

  let health = $state(null);
  let plantas = $state([]);
  let session = getSession();
  let err = $state('');

  onMount(async () => {
    try {
      health = await api('/api/health');
      plantas = await api('/api/plantas');
    } catch (e) {
      err = e.message;
    }
  });
</script>

<section class="space-y-6">
  <div>
    <h1 class="text-2xl font-semibold text-stone-900">Panel</h1>
    <p class="mt-1 text-stone-600">
      Bienvenido, {session.name}. Flujo: cargar PDF → revisar tiquetes → calcular matriz → validar → exportar.
    </p>
  </div>

  {#if err}
    <p class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{err}</p>
  {/if}

  <div class="grid gap-3 sm:grid-cols-3">
    <div class="rounded-lg border border-stone-200 bg-white p-4">
      <p class="text-xs uppercase tracking-wide text-stone-500">API</p>
      <p class="mt-1 text-lg font-medium">{health?.ok ? 'OK' : '…'}</p>
      <p class="text-xs text-stone-500">Node {health?.node || '—'} · puerto {health?.port || '—'}</p>
    </div>
    <div class="rounded-lg border border-stone-200 bg-white p-4">
      <p class="text-xs uppercase tracking-wide text-stone-500">MongoDB</p>
      <p class="mt-1 text-lg font-medium">{health?.db?.dbName || '—'}</p>
      <p class="text-xs text-stone-500">{health?.db?.atlas ? 'Atlas' : ''}</p>
    </div>
    <div class="rounded-lg border border-stone-200 bg-white p-4">
      <p class="text-xs uppercase tracking-wide text-stone-500">Plantas</p>
      <p class="mt-1 text-lg font-medium">{plantas.length}</p>
      <p class="text-xs text-stone-500">{plantas[0]?.nombre || 'Ejecuta pnpm seed'}</p>
    </div>
  </div>

  <ol class="list-decimal space-y-2 pl-5 text-sm text-stone-700">
    <li>Rol <strong>Jefe</strong>: Cargas (PDF), Tiquetes, Matriz.</li>
    <li>Rol <strong>Admin</strong>: tarifas, bases 3/2, depuración, simulación y publicación.</li>
    <li>Rol <strong>Operador</strong>: resumen y detalle de su semana.</li>
  </ol>
</section>
