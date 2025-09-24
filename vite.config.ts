import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore
import * as fs from "fs";

const hexLoader = {
  name: 'hex-loader',
  // @ts-ignore
  transform(code: any, id: string) {
    const [path, query] = id.split('?');
    if (query != 'raw-txt')
      return null;

    const data = fs.readFileSync(path,'utf-8');
    return `export default \`${data}\`;`;
  }
};


// https://vite.dev/config/
export default defineConfig({
  assetsInclude: ["**/*.glb"], // tell Vite to treat .glb as assets
  plugins: [hexLoader, react()],
  server: {
    host: true,        // listen on all network interfaces
    port: 5173,        // optional: specify port
  },
  base: "./", // <-- makes the app relative to the current path`
})
