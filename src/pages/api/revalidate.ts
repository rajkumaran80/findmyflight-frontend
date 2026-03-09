import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.REVALIDATE_SECRET;
  if (secret && req.headers['x-revalidate-secret'] !== secret) {
    return res.status(401).json({ error: 'Invalid secret' });
  }

  const { path } = req.body as { path?: string };
  if (!path) {
    return res.status(400).json({ error: 'Missing path' });
  }

  try {
    await res.revalidate(path);
    console.log(`[REVALIDATE] Revalidated: ${path}`);
    return res.json({ revalidated: true, path });
  } catch (err: any) {
    console.error(`[REVALIDATE] Failed for ${path}:`, err?.message);
    return res.status(500).json({ error: 'Revalidation failed' });
  }
}
