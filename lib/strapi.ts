export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function fetchStrapi<T>(path: string) {
  const url = `${STRAPI_URL}${path}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Strapi error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function mediaUrl(path?: string | null) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${STRAPI_URL}${path}`;
}
