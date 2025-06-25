import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api/inventory": {
        target: "https://donohoo.easytree.io",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/inventory/, "/inventory"),
        secure: true,
        followRedirects: true,
        timeout: 30000,
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.log("Proxy error:", err);
            if (!res.headersSent) {
              res.writeHead(500, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              });
              res.end(
                JSON.stringify({ error: "Proxy error", message: err.message }),
              );
            }
          });
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
            proxyReq.setHeader("Accept", "application/json");
            proxyReq.setHeader("User-Agent", "Vite-Dev-Server");
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            console.log(
              "Received Response from the Target:",
              proxyRes.statusCode,
              req.url,
            );
            // Ensure CORS headers are set
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader(
              "Access-Control-Allow-Methods",
              "GET, POST, PUT, DELETE, OPTIONS",
            );
            res.setHeader(
              "Access-Control-Allow-Headers",
              "Content-Type, Authorization",
            );
          });
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
