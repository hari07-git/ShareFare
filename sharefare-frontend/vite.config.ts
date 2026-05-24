import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";

const enableSentryUpload = Boolean(
  process.env.SENTRY_AUTH_TOKEN &&
    process.env.SENTRY_ORG &&
    process.env.SENTRY_PROJECT
);

export default defineConfig({
  plugins: [
    react(),
    enableSentryUpload &&
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        release: {
          name: process.env.VITE_SENTRY_RELEASE ?? `sharefare-web@${Date.now()}`
        },
        sourcemaps: {
          assets: "./dist/assets/**"
        }
      })
  ].filter(Boolean),
  build: {
    sourcemap: true
  },
  server: {
    port: 5173
  },
  preview: {
    port: 4173
  }
});
