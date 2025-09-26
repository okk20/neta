import { scores, ok, error, Score } from '../_data';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop() as string;
  const index = scores.findIndex(s => s.id === id);

  if (req.method === 'GET') {
    const s = scores.find(s => s.id === id);
    if (!s) return error('Score not found', 404);
    return ok(s);
  }

  if (req.method === 'PUT') {
    if (index === -1) return error('Score not found', 404);
    try {
      const body = (await req.json()) as Partial<Score>;
      scores[index] = { ...scores[index], ...body, id };
      return ok(scores[index]);
    } catch (e: any) {
      return error(e?.message || 'Invalid JSON', 400);
    }
  }

  if (req.method === 'DELETE') {
    if (index === -1) return error('Score not found', 404);
    const removed = scores.splice(index, 1)[0];
    return ok(removed);
  }

  return error('Method not allowed', 405);
}
