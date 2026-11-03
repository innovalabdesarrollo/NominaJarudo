<script>
  import { onMount } from 'svelte';
  import { api } from '$lib/api.js';
  import { getSession } from '$lib/session.js';

  let session = $state(getSession());
  let operadorId = $state(session.operadorId || '');
  let semana = $state('2026-10-27');
  let detalle = $state(null);
  let err = $state('');
  let opNombre = $state(session.name || '');

  const locked = Boolean(session.auth && session.role === 'operador' && session.operadorId);

  onMount(async () => {
    if (!locked) {
      err = 'Inicia sesión como operador para ver tu liquidación.';
      return;
    }
    operadorId = session.operadorId;
    try {
      const ops = await api('/api/operadores');
      const me = ops.find((o) => o.id === operadorId);
      if (me) opNombre = me.nombreCompleto;
    } catch {
      /* nombre del token basta */
    }
  });

  async function consultar() {
    err = '';
    if (!operadorId) {
      err = 'Sesión de operador incompleta';
      return;
    }
    try {
      detalle = await api(`/api/liquidaciones/detalle/${operadorId}?semana=${semana}`);
    } catch (e) {
      err = e.message;
    }
  }

  function money(n) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
  }
</script>

<section class="space-y-4">
  <div>
    <h1 class="text-xl font-semibold">Mi liquidación</h1>
    <p class="text-sm text-stone-600">
      {#if locked}
        {opNombre} — solo tu producción auditada.
      {:else}
        Requiere login de operador. <a class="underline text-[var(--brand)]" href="/login">Entrar</a>
      {/if}
    </p>
  </div>

  {#if locked}
    <div class="flex flex-wrap gap-2">
      <input type="date" class="rounded-md border px-3 py-2 text-sm" bind:value={semana} />
      <button class="rounded-md bg-[var(--brand)] px-3 py-2 text-sm text-white" onclick={consultar}>
        Consultar
      </button>
    </div>
  {/if}

  {#if err}<p class="text-sm text-red-700">{err}</p>{/if}

  {#if detalle?.liquidacion}
    <div class="grid gap-3 sm:grid-cols-2">
      <div class="rounded-lg border bg-white p-4">
        <p class="text-xs text-stone-500">Periodo</p>
        <p class="font-medium">{detalle.liquidacion.semanaInicio} → {detalle.liquidacion.semanaFin}</p>
        <p class="mt-2 text-sm">Estado: {detalle.liquidacion.estado}</p>
      </div>
      <div class="rounded-lg border bg-white p-4 text-sm">
        <p>Reportados / auditados: {(detalle.tiquetes || []).length}</p>
        <p>Excluidos: {(detalle.exclusiones || []).length}</p>
        <p>Base: {detalle.liquidacion.viajesBase}</p>
        <p>Adicionales: {detalle.liquidacion.viajesAdicionales}</p>
        <p class="mt-1 font-semibold">Total: {money(detalle.liquidacion.totalLiquidado)}</p>
      </div>
    </div>

    <h2 class="font-medium">Detalle de tiquetes</h2>
    <ul class="space-y-1 text-sm">
      {#each detalle.tiquetes || [] as t}
        {@const ex = (detalle.exclusiones || []).filter((e) => e.tiqueteId === t.id)}
        <li class="rounded border border-stone-100 bg-white px-3 py-2">
          {t.fechaTiquete} · {t.numeroTiquete} · {t.volumenMetrosCubicos} m³ ·
          {t.liquidable ? 'incluido' : 'excluido'}
          {#if ex.length}
            <span class="text-stone-500">({ex.map((e) => e.motivo).join('; ')})</span>
          {/if}
        </li>
      {/each}
    </ul>
  {:else if detalle}
    <p class="text-sm text-stone-500">Sin liquidación calculada para esa semana.</p>
  {/if}
</section>
