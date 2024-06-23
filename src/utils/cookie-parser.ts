// src/utils/cookie-parser.ts
export function parseCookies(cookieHeader: string): Record<string, string> {
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.split('=').map(part => part.trim());
    cookies[name] = decodeURIComponent(value);
    return cookies;
  }, {} as Record<string, string>);
}
