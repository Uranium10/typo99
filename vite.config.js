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

        const isHell = req.url && req.url.includes('mode=hell');
        const getTable = (modeFlag) => (isHell || modeFlag === 'hell') ? 'typo99_hell_scores' : 'typo99_scores';

        const initTable = async (tbl) => {
          try {
            await client.execute(`CREATE TABLE IF NOT EXISTS ${tbl} (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              player_names TEXT NOT NULL,
              score INTEGER NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);
          } catch (err) {
            console.error('Table init error:', err);
          }
        };

        if (req.method === 'GET') {
          const table = getTable();
          await initTable(table);
          try {
            const result = await client.execute(
              `SELECT id, player_names, score, created_at FROM ${table} ORDER BY score ASC, created_at ASC LIMIT 20`
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
              const { player_names, score, mode } = parsed;
              if (!player_names || typeof score !== 'number') {
                return res.status(400).json({ error: 'Invalid input' });
              }

              const table = getTable(mode);
              await initTable(table);
              const numScore = Math.round(score);

              // 1. Check current Top 20 scores
              const currentTop = await client.execute(
                `SELECT id, score FROM ${table} ORDER BY score ASC, created_at ASC LIMIT 20`
              );

              // 2. If already 20 scores and new score is worse than or equal to 20th place, do not insert
              if (currentTop.rows.length >= 20 && numScore >= currentTop.rows[19].score) {
                return res.status(200).json({ success: true, inserted: false, message: 'Top 20 순위에 진입하지 못했습니다.' });
              }

              // 3. Insert new qualifying score
              await client.execute({
                sql: `INSERT INTO ${table} (player_names, score) VALUES (?, ?)`,
                args: [String(player_names).trim().slice(0, 15), numScore]
              });

              // 4. Delete any records outside the Top 20
              await client.execute(
                `DELETE FROM ${table} WHERE id NOT IN (SELECT id FROM ${table} ORDER BY score ASC, created_at ASC LIMIT 20)`
              );

              return res.status(200).json({ success: true, inserted: true });
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
