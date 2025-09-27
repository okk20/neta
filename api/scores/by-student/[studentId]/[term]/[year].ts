import { scores, ok, error } from '../../../_data';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  const year = decodeURIComponent(parts.pop() || '');
  const term = decodeURIComponent(parts.pop() || '');
  const studentId = decodeURIComponent(parts.pop() || '');

  if (req.method !== 'GET') return error('Method not allowed', 405);

  const filtered = scores.filter(s => s.studentId === studentId && s.term === term && s.year === year);
  return ok(filtered);
}
