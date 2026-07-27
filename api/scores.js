import { createClient } from '@libsql/client';

export default async function handler(req, res) {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    return res.status(500).json({ error: 'Database configuration missing' });
  }

  const client = createClient({ url, authToken });

  const isHell = req.query?.mode === 'hell' || req.body?.mode === 'hell' || (req.url && req.url.includes('mode=hell'));
  const table = isHell ? 'typo99_hell_scores' : 'typo99_scores';

  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS ${table} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_names TEXT NOT NULL,
      score INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  } catch (dbInitErr) {
    console.error('Table init error:', dbInitErr);
  }

  if (req.method === 'GET') {
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
    try {
      const { player_names, score } = req.body || {};
      if (!player_names || typeof score !== 'number') {
        return res.status(400).json({ error: 'Invalid input' });
      }

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
      const insertRes = await client.execute({
        sql: `INSERT INTO ${table} (player_names, score) VALUES (?, ?)`,
        args: [String(player_names).trim().slice(0, 15), numScore]
      });
      const insertedId = Number(insertRes.lastInsertRowid);

      // 4. Delete any records outside the Top 20
      await client.execute(
        `DELETE FROM ${table} WHERE id NOT IN (SELECT id FROM ${table} ORDER BY score ASC, created_at ASC LIMIT 20)`
      );

      // 5. Fetch updated top 20 to find exact rank
      const newTop = await client.execute(
        `SELECT id, score FROM ${table} ORDER BY score ASC, created_at ASC LIMIT 20`
      );
      let newRank = -1;
      for (let i = 0; i < newTop.rows.length; i++) {
        if (Number(newTop.rows[i].id) === insertedId) {
          newRank = i + 1;
          break;
        }
      }

      return res.status(200).json({ success: true, inserted: true, insertedId, rank: newRank });
    } catch (error) {
      console.error('Error inserting score:', error);
      return res.status(500).json({ error: 'Failed to insert score' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
