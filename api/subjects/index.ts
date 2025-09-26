import { subjects, ok, created, error, Subject } from '../_data';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'GET') {
    return ok(subjects);
  }

  if (req.method === 'POST') {
    try {
      const body = (await req.json()) as Partial<Subject>;
      if (!body.name) return error('name required', 400);
      const id = body.id || `SUB-${(subjects.length + 1).toString().padStart(3, '0')}`;
      const subj: Subject = { id, name: body.name, code: body.code };
      subjects.push(subj);
      return created(subj);
    } catch (e: any) {
      return error(e?.message || 'Invalid JSON', 400);
    }
  }

  return error('Method not allowed', 405);
}
