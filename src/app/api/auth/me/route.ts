export async function GET(req: Request) {
  // Use environment-specific API base URL
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 
    process.env.NEXT_PUBLIC_API_URL_PRIMARY?.replace('/api', '') ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : 'https://api.vikareta.com');

  const forwardHeaders: Record<string, string> = {};
  const cookie = req.headers.get('cookie');
  if (cookie) forwardHeaders['cookie'] = cookie;

  try {
    const resp = await fetch(`${apiBase}/api/auth/me`, {
      method: 'GET',
      headers: forwardHeaders,
      credentials: 'include' as RequestCredentials,
    });

    const text = await resp.text();
    const headers = new Headers();
    const ct = resp.headers.get('content-type');
    if (ct) headers.set('content-type', ct);
    
    // Forward all set-cookie headers properly
    const setCookieHeaders = resp.headers.getSetCookie?.() || [];
    if (setCookieHeaders.length > 0) {
      setCookieHeaders.forEach(cookie => {
        headers.append('set-cookie', cookie);
      });
    } else {
      // Fallback for older fetch implementations
      const setCookie = resp.headers.get('set-cookie');
      if (setCookie) headers.append('set-cookie', setCookie);
    }

    return new Response(text, { status: resp.status, headers });
  } catch (error) {
    console.error('Auth me proxy error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: { 
        code: 'PROXY_ERROR', 
        message: 'Authentication service unavailable' 
      } 
    }), { 
      status: 503, 
      headers: { 'content-type': 'application/json' } 
    });
  }
}
