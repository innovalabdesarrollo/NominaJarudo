<script>
  import { api } from '$lib/api.js';
  import { setSession } from '$lib/session.js';

  let email = $state('operador@jarudo.local');
  let password = $state('op123');
  let err = $state('');
  let loading = $state(false);
  let authReady = $state(true);

  async function check() {
    try {
      const s = await api('/api/auth/status');
      authReady = s.ready;
      if (!s.ready) err = s.hint || 'Falta JWT_SECRET en .env';
    } catch (e) {
      err = e.message;
    }
  }

  check();

  async function login(e) {
    e.preventDefault();
    err = '';
    loading = true;
    try {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setSession({
        auth: true,
        token: data.token,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        operadorId: data.user.operadorId
      });
      const dest =
        data.user.role === 'operador' ? '/operador' : data.user.role === 'admin' ? '/config' : '/cargas';
      location.assign(dest);
    } catch (ex) {
      err = ex.message;
    } finally {
      loading = false;
    }
  }
</script>

<section class="mx-auto max-w-md space-y-4">
  <div>
    <h1 class="text-xl font-semibold">Iniciar sesión</h1>
    <p class="text-sm text-stone-600">Login local (sin Google ni correo). Solo requiere JWT_SECRET.</p>
  </div>

  <form class="space-y-3 rounded-lg border border-stone-200 bg-white p-4" onsubmit={login}>
    <label class="block text-sm">
      Email
      <input class="mt-1 w-full rounded-md border px-3 py-2" type="email" bind:value={email} required />
    </label>
    <label class="block text-sm">
      Contraseña
      <input class="mt-1 w-full rounded-md border px-3 py-2" type="password" bind:value={password} required />
    </label>
    <button
      class="w-full rounded-md bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      disabled={loading || !authReady}
    >
      {loading ? 'Entrando…' : 'Entrar'}
    </button>
  </form>

  {#if err}<p class="text-sm text-red-700">{err}</p>{/if}

  <p class="text-xs text-stone-500">
    Demo tras <code>pnpm seed</code>: jefe@jarudo.local / jefe123 · admin@jarudo.local / admin123 ·
    operador@jarudo.local / op123
  </p>
</section>
