import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    // vite config
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    plugins: [react()],
    resolve: {
      alias: {
        'src': '/src',
        '@typess': '/src/types/*',
        '@services': '/src/service',
        '@rdx': '/src/redux',
        '@constants': '/src/constants',
        '@components': '/src/components',
        '@pages': '/src/pages',
      },
    },
    preview: {
      port: 8080,
      strictPort: true,
    },
    server: {
      port: 8080,
      strictPort: true,
      host: true,
      origin: 'http://0.0.0.0:8080',
    },
  };
});
