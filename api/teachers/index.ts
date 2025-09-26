import { teachers, ok, created, error, Teacher } from '../_data';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'GET') {
    return ok(teachers);
  }

  if (req.method === 'POST') {
    try {
      const body = (await req.json()) as Partial<Teacher>;
      if (!body.name) return error('name required', 400);
      const nextNumber = teachers.length + 1;
      const id = body.id || `TU-${nextNumber}`;
      const teacher: Teacher = { id, name: body.name, phone: body.phone, email: body.email };
      teachers.push(teacher);
      return created(teacher);
    } catch (e: any) {
      return error(e?.message || 'Invalid JSON', 400);
    }
  }

  return error('Method not allowed', 405);
}
