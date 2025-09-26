import { users, ok, error } from '../_data';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return error('Method not allowed', 405);
  }

  try {
    const body = await req.json();
    const { username, password, role } = body || {};

    if (!username || !password) {
      return error('Username and password are required', 400);
    }

    // Demo auth: any password works for the demo admin; role optional
    const user = users.find(u => u.username === username) || users[0];
    const data = {
      id: user.id,
      username: user.username,
      role: role || user.role,
      email: user.email,
      phone: user.phone,
      status: user.status || 'active',
      lastLogin: new Date().toISOString(),
      studentId: user.studentId,
      teacherId: user.teacherId,
    };

    // Fake token
    const token = `demo.${btoa(user.username)}.${Date.now()}`;

    return new Response(
      JSON.stringify({ success: true, data, token }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    return error(e?.message || 'Invalid JSON body', 400);
  }
}
