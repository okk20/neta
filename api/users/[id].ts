import { users, ok, error, User } from '../_data';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop() as string;
  const index = users.findIndex(u => u.id === id);

  if (req.method === 'GET') {
    const u = users.find(u => u.id === id);
    if (!u) return error('User not found', 404);
    return ok(u);
  }

  if (req.method === 'PUT') {
    if (index === -1) return error('User not found', 404);
    try {
      const body = (await req.json()) as Partial<User>;
      users[index] = { ...users[index], ...body, id };
      return ok(users[index]);
    } catch (e: any) {
      return error(e?.message || 'Invalid JSON', 400);
    }
  }

  if (req.method === 'DELETE') {
    if (index === -1) return error('User not found', 404);
    const removed = users.splice(index, 1)[0];
    return ok(removed);
  }

  return error('Method not allowed', 405);
}
