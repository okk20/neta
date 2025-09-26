import { teachers, ok, error, Teacher } from '../_data';

export const config = { runtime: 'edge' };

export default async function handler(req: Request, ctx: any) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop() as string;
  const index = teachers.findIndex(t => t.id === id);

  if (req.method === 'GET') {
    const t = teachers.find(t => t.id === id);
    if (!t) return error('Teacher not found', 404);
    return ok(t);
  }

  if (req.method === 'PUT') {
    if (index === -1) return error('Teacher not found', 404);
    try {
      const body = (await req.json()) as Partial<Teacher>;
      teachers[index] = { ...teachers[index], ...body, id };
      return ok(teachers[index]);
    } catch (e: any) {
      return error(e?.message || 'Invalid JSON', 400);
    }
  }

  if (req.method === 'DELETE') {
    if (index === -1) return error('Teacher not found', 404);
    const removed = teachers.splice(index, 1)[0];
    return ok(removed);
  }

  return error('Method not allowed', 405);
}
