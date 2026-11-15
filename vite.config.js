import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import groqChat from './api/chat.js';

export default defineConfig(({ mode }) => {
  // Vite keeps .env values in import.meta.env by default. The server-side
  // Groq handler reads process.env, so explicitly load only server env values.
  const env = loadEnv(mode, process.cwd(), '');
  process.env.GROQ_API_KEY = (env.GROQ_API_KEY || process.env.GROQ_API_KEY || '').trim();
  process.env.GROQ_MODEL = (env.GROQ_MODEL || process.env.GROQ_MODEL || 'openai/gpt-oss-120b').trim();

  return {
    plugins: [react(), {
      name: 'tomorrowproof-chat-api',
      configureServer(server) {
        server.middlewares.use('/api/chat', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Allow', 'POST');
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }
          let body = '';
          for await (const chunk of req) {
            body += chunk;
            if (body.length > 64 * 1024) {
              res.statusCode = 413;
              res.end(JSON.stringify({ error: 'Request too large' }));
              return;
            }
          }
          try {
            req.body = body ? JSON.parse(body) : {};
          } catch {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
            return;
          }
          const result = {
            status(code) { res.statusCode = code; return this; },
            json(data) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); }
          };
          await groqChat(req, result);
        });
      }
    }]
  };
});
