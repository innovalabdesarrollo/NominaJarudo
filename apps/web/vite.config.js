import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../..', '');
  const webPort = Number(env.WEB_PORT) || 5288;

  return {
    plugins: [tailwindcss(), sveltekit()],
    envDir: '../../',
    server: {
      port: webPort,
      strictPort: true,
      // polling evita EMFILE/inotify cuando hay muchas apps Innovalab abiertas
      watch: {
        usePolling: true,
        interval: 1000,
        ignored: ['**/node_modules/**', '**/uploads/**', '**/.git/**']
      }
    },
    preview: {
      port: webPort,
      strictPort: true
    }
  };
});
