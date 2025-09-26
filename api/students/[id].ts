import { students, ok, error, Student } from '../_data';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop() as string;
  const index = students.findIndex(s => s.id === id);

  if (req.method === 'GET') {
    const s = students.find(s => s.id === id);
    if (!s) return error('Student not found', 404);
    return ok(s);
  }

  if (req.method === 'PUT') {
    if (index === -1) return error('Student not found', 404);
    try {
      const body = (await req.json()) as Partial<Student>;
      students[index] = { ...students[index], ...body, id };
      return ok(students[index]);
    } catch (e: any) {
      return error(e?.message || 'Invalid JSON', 400);
    }
  }

  if (req.method === 'DELETE') {
    if (index === -1) return error('Student not found', 404);
    const removed = students.splice(index, 1)[0];
    return ok(removed);
  }

  return error('Method not allowed', 405);
}
