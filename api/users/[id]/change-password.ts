import { users, ok, error } from '../../_data';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return error('Method not allowed', 405);
  const url = new URL(req.url);
  // path .../api/users/[id]/change-password
  const parts = url.pathname.split('/');
  const idIndex = parts.findIndex(p => p === 'users') + 1;
  const id = parts[idIndex];
  const user = users.find(u => u.id === id);
  if (!user) return error('User not found', 404);
  try {
    const { currentPassword, newPassword } = await req.json();
    // Demo: accept any input and respond OK
    return ok({ id: user.id, changed: true });
  } catch (e: any) {
    return error(e?.message || 'Invalid JSON', 400);
  }
}
