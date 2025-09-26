import { users, ok, created, error, User } from '../_data';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'GET') {
    return ok(users);
  }

  if (req.method === 'POST') {
    try {
      const body = (await req.json()) as Partial<User>;
      if (!body.username || !body.role) return error('username and role required', 400);
      const id = body.id || `USER_${users.length + 1}`;
      const newUser: User = {
        id,
        username: body.username!,
        role: body.role as any,
        email: body.email,
        phone: body.phone,
        status: body.status || 'active',
        lastLogin: new Date().toISOString(),
        studentId: body.studentId,
        teacherId: body.teacherId,
      };
      users.push(newUser);
      return created(newUser);
    } catch (e: any) {
      return error(e?.message || 'Invalid JSON', 400);
    }
  }

  return error('Method not allowed', 405);
}
