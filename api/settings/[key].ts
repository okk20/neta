import { settings, ok, error } from '../_data';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  const key = parts[parts.length - 1];

  if (!key) return error('Key required', 400);

  if (req.method === 'GET') {
    const value = settings[key];
    if (typeof value === 'undefined') return ok(null);
    return ok(value);
  }

  if (req.method === 'PUT') {
    try {
      const body = await req.json();
      // Expect { value: any }
      if (!('value' in body)) return error('value field required', 400);
      settings[key] = body.value;
      return ok(settings[key]);
    } catch (e: any) {
      return error(e?.message || 'Invalid JSON', 400);
    }
  }

  return error('Method not allowed', 405);
}
