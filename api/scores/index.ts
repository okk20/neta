import { scores, ok, created, error, Score } from '../_data';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'GET') {
    return ok(scores);
  }

  if (req.method === 'POST') {
    try {
      const body = (await req.json()) as Partial<Score>;
      if (!body.studentId || !body.subjectId || !body.term || !body.year) {
        return error('studentId, subjectId, term, year required', 400);
      }
      const id = body.id || `SC-${scores.length + 1}`;
      const newScore: Score = {
        id,
        studentId: body.studentId,
        subjectId: body.subjectId,
        term: body.term,
        year: body.year,
        classScore: body.classScore ?? 0,
        examScore: body.examScore ?? 0,
      };
      scores.push(newScore);
      return created(newScore);
    } catch (e: any) {
      return error(e?.message || 'Invalid JSON', 400);
    }
  }

  return error('Method not allowed', 405);
}
