import { defineConfig } from "astro/config";

// Site static. Vercel îl detectează automat și rulează `npm run build`.
export default defineConfig({
  output: "static",
});
