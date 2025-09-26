import { students, ok, error } from '../../_data';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return error('Method not allowed', 405);
  try {
    const { studentId, password } = await req.json();
    if (!studentId) return error('studentId required', 400);
    const match = students.find(s => s.id === studentId);
    if (!match) return error('Student not found', 404);
    const data = { id: match.id, username: match.name, role: 'student' as const, studentId: match.id };
    const token = `student.${btoa(match.id)}.${Date.now()}`;
    return new Response(JSON.stringify({ success: true, data, token }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return error(e?.message || 'Invalid JSON', 400);
  }
}
