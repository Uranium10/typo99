import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import 'dotenv/config'
import { createClient } from '@libsql/client'

function localApiPlugin() {
  return {
    name: 'local-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/scores')) {
          return next();
        }

        const url = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;

        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };

        if (!url || !authToken) {
          return res.status(500).json({ error: 'Database configuration missing' });
        }

        const client = createClient({ url, authToken });

        if (req.method === 'GET') {
          try {
            const result = await client.execute(
              "SELECT id, player_names, score, created_at FROM typo99_scores ORDER BY score ASC, created_at ASC LIMIT 50"
            );
            return res.status(200).json({ scores: result.rows });
          } catch (error) {
            console.error('Error fetching scores:', error);
            return res.status(500).json({ error: 'Failed to fetch scores' });
          }
        } else if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const parsed = body ? JSON.parse(body) : {};
              const { player_names, score } = parsed;
              if (!player_names || typeof score !== 'number') {
                return res.status(400).json({ error: 'Invalid input' });
              }
              await client.execute({
                sql: "INSERT INTO typo99_scores (player_names, score) VALUES (?, ?)",
                args: [String(player_names).trim().slice(0, 15), Math.round(score)]
              });
              return res.status(200).json({ success: true });
            } catch (error) {
              console.error('Error inserting score:', error);
              return res.status(500).json({ error: 'Failed to insert score' });
            }
          });
          return;
        } else {
          res.setHeader('Allow', ['GET', 'POST']);
          return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApiPlugin()],
})
