import { teachers, ok, error } from '../../_data';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return error('Method not allowed', 405);
  try {
    const { teacherId, phoneNumber } = await req.json();
    if (!teacherId) return error('teacherId required', 400);
    const match = teachers.find(t => t.id === teacherId);
    if (!match) return error('Teacher not found', 404);
    const data = { id: teacherId, username: match.name, role: 'teacher' as const, teacherId };
    const token = `teacher.${btoa(teacherId)}.${Date.now()}`;
    return new Response(JSON.stringify({ success: true, data, token }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return error(e?.message || 'Invalid JSON', 400);
  }
}
