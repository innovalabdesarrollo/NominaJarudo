<script>
  import '../app.css';
  import { page } from '$app/stores';
  import { clearSession, getSession, setSession, ROLES } from '$lib/session.js';

  let { children } = $props();
  let session = $state(getSession());

  const nav = [
    { href: '/', label: 'Inicio', roles: ['jefe', 'admin', 'operador'] },
    { href: '/cargas', label: 'Cargas', roles: ['jefe'] },
    { href: '/tiquetes', label: 'Tiquetes', roles: ['jefe'] },
    { href: '/inconsistencias', label: 'Inconsistencias', roles: ['jefe'] },
    { href: '/matriz', label: 'Matriz / Nómina', roles: ['jefe'] },
    { href: '/historial', label: 'Historial', roles: ['jefe'] },
    { href: '/config', label: 'Configuración', roles: ['admin'] },
    { href: '/operador', label: 'Mi liquidación', roles: ['operador'] }
  ];

  function changeRole(e) {
    if (session.auth) return; // sesión real fija el rol
    const role = e.target.value;
    const label = ROLES.find((r) => r.id === role)?.label || role;
    session = { ...session, role, name: label };
    setSession(session);
  }

  function logout() {
    clearSession();
    location.assign('/login');
  }
</script>

<div class="min-h-dvh flex flex-col">
  <header class="border-b border-stone-200 bg-[var(--brand)] text-white">
    <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div>
        <p class="text-lg font-semibold tracking-tight">Nómina Jarudo</p>
        <p class="text-xs text-emerald-100/90">Auditoría y liquidación semanal</p>
      </div>
      <div class="flex flex-wrap items-center gap-2 text-sm">
        {#if session.auth}
          <span class="rounded-md bg-white/15 px-2 py-1.5 ring-1 ring-white/30">
            {session.name}
            <span class="opacity-70">· {session.role}</span>
          </span>
          <button class="rounded-md bg-white/15 px-2 py-1.5 ring-1 ring-white/30" onclick={logout}>
            Salir
          </button>
        {:else}
          <label class="flex items-center gap-2">
            <span class="opacity-80">Rol</span>
            <select
              class="rounded-md border-0 bg-white/15 px-2 py-1.5 text-white outline-none ring-1 ring-white/30"
              value={session.role}
              onchange={changeRole}
            >
              {#each ROLES as r}
                <option value={r.id} class="text-stone-900">{r.label}</option>
              {/each}
            </select>
          </label>
          <a href="/login" class="rounded-md bg-white px-2 py-1.5 font-medium text-[var(--brand)]">Entrar</a>
        {/if}
      </div>
    </div>
    <nav class="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 pb-2">
      {#each nav.filter((n) => n.roles.includes(session.role)) as item}
        <a
          href={item.href}
          class="whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition
            {$page.url.pathname === item.href
            ? 'bg-white text-[var(--brand)]'
            : 'text-emerald-50 hover:bg-white/10'}"
        >
          {item.label}
        </a>
      {/each}
    </nav>
  </header>

  <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-5">
    {@render children()}
  </main>
</div>
