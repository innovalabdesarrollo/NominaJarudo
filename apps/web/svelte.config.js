import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // Node 24 local OK; en Vercel usamos runtime soportado explícito
    adapter: adapter({
      runtime: 'nodejs22.x'
    })
  }
};

export default config;
