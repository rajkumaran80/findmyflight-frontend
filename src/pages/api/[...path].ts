import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return res.status(503).json({ error: 'BACKEND_URL not configured' });
  }

  const pathSegments = (req.query.path as string[]).join('/');
  const queryString = req.url?.split('?')[1];
  const targetUrl = `${backendUrl}/api/${pathSegments}${queryString ? `?${queryString}` : ''}`;

  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (req.headers['authorization']) headers['authorization'] = req.headers['authorization'] as string;
  if (req.headers['x-api-secret']) headers['x-api-secret'] = req.headers['x-api-secret'] as string;

  const init: RequestInit = { method: req.method, headers };
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    init.body = JSON.stringify(req.body);
  }

  const response = await fetch(targetUrl, init);
  const contentType = response.headers.get('content-type') ?? '';

  res.status(response.status);
  if (contentType.includes('application/json')) {
    res.json(await response.json());
  } else {
    res.send(await response.text());
  }
}

export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};
