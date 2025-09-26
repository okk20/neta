import { ok, error } from '../../_data';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return error('Method not allowed', 405);
  try {
    const { email, teacherId } = await req.json();
    if (!email) return error('email required', 400);
    // Demo: just echo back a fake invite token
    const inviteToken = `invite_${Date.now()}`;
    return ok({ email, teacherId, inviteToken });
  } catch (e: any) {
    return error(e?.message || 'Invalid JSON', 400);
  }
}
