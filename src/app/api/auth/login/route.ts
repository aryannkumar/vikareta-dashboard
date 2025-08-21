export async function POST(req: Request) {
  // Use environment-specific API base URL
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 
    process.env.NEXT_PUBLIC_API_URL_PRIMARY?.replace('/api', '') ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : 'https://api.vikareta.com');
  
  console.log('Dashboard Login Proxy: Forwarding to', `${apiBase}/api/auth/login`);
  const body = await req.text();

  const forwardHeaders: Record<string, string> = {
    'content-type': req.headers.get('content-type') || 'application/json',
  };

  const cookie = req.headers.get('cookie');
  if (cookie) forwardHeaders['cookie'] = cookie;
  const xsrf = req.headers.get('x-xsrf-token') || req.headers.get('x-csrf-token');
  if (xsrf) forwardHeaders['x-xsrf-token'] = xsrf;

  try {
    const resp = await fetch(`${apiBase}/api/auth/login`, {
      method: 'POST',
      headers: forwardHeaders,
      body,
      credentials: 'include' as RequestCredentials,
    });

    const text = await resp.text();
    console.log('Dashboard Login Proxy: Backend response', { 
      status: resp.status, 
      ok: resp.ok,
      contentLength: text.length,
      hasSetCookie: !!resp.headers.get('set-cookie')
    });
    
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
    console.error('Dashboard Login Proxy: Error occurred', error);
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
