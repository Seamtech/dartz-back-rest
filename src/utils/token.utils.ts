import {HttpErrors, Request} from '@loopback/rest';

export function extractTokenFromRequest(request: Request): string {
  console.log('Extracting token from request headers...');
  const cookies = request.headers.cookie;
  console.log('Request headers cookie:', cookies);

  if (!cookies) {
    console.error('Cookies are missing in the request headers.');
    throw new HttpErrors.Unauthorized('Access token is missing in cookies.');
  }

  let accessToken: string;

  try {
    const cookieObject = parseCookies(cookies);
    accessToken = cookieObject.accessToken;

    if (!accessToken) {
      console.error('Access token is missing in cookies.');
      throw new HttpErrors.Unauthorized('Access token is missing in cookies.');
    }
  } catch (error) {
    console.error('Failed to parse cookies:', error.message);
    throw new HttpErrors.BadRequest('Invalid cookie format.');
  }

  return accessToken;
}

function parseCookies(cookieHeader: string): Record<string, string> {
  try {
    return cookieHeader.split(';').reduce((cookies, cookie) => {
      const [name, value] = cookie.split('=').map(part => part.trim());
      if (name && value) {
        cookies[name] = value;
      }
      return cookies;
    }, {} as Record<string, string>);
  } catch (error) {
    console.error('Error parsing cookies:', error);
    throw error;  // Re-throwing the error to be handled in the caller function
  }
}
