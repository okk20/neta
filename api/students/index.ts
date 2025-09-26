import { students, ok, created, error, Student } from '../_data';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'GET') {
    return ok(students);
  }

  if (req.method === 'POST') {
    try {
      const body = (await req.json()) as Partial<Student>;
      if (!body.name) return error('name required', 400);
      const nextNumber = students.length + 1;
      const id = body.id || `SU-${nextNumber}`;
      const newStudent: Student = {
        id,
        name: body.name,
        class: body.class,
        gender: body.gender,
        photo: body.photo,
      };
      students.push(newStudent);
      return created(newStudent);
    } catch (e: any) {
      return error(e?.message || 'Invalid JSON', 400);
    }
  }

  return error('Method not allowed', 405);
}
