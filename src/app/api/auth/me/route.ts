export async function GET(req: Request) {
  // Use environment-specific API base URL
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 
    process.env.NEXT_PUBLIC_API_URL_PRIMARY?.replace('/api', '') ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : 'https://api.vikareta.com');

  const forwardHeaders: Record<string, string> = {};
  const cookie = req.headers.get('cookie');
  if (cookie) forwardHeaders['cookie'] = cookie;

  try {
    const resp = await fetch(`${apiBase}/api/v1/auth/me`, {
      method: 'GET',
      headers: forwardHeaders,
      credentials: 'include' as RequestCredentials,
    });

    const text = await resp.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return new Response(JSON.stringify({ 
        success: false, 
        error: { 
          code: 'PARSE_ERROR', 
          message: 'Invalid response from authentication service' 
        } 
      }), { 
        status: 500, 
        headers: { 'content-type': 'application/json' } 
      });
    }

    // Validate dashboard access for business users
    if (resp.ok && data.success && data.data) {
      const { user, subscription } = data.data;

      // Check if user is a business (seller)
      if (user.userType !== 'seller') {
        return new Response(JSON.stringify({ 
          success: false, 
          error: { 
            code: 'ACCESS_DENIED', 
            message: 'Access denied: Only business users can access the dashboard' 
          } 
        }), { 
          status: 403, 
          headers: { 'content-type': 'application/json' } 
        });
      }

      // Check if user has an active subscription
      if (!subscription || subscription.status !== 'active') {
        return new Response(JSON.stringify({ 
          success: false, 
          error: { 
            code: 'SUBSCRIPTION_REQUIRED', 
            message: 'Access denied: Active subscription required to access dashboard' 
          } 
        }), { 
          status: 403, 
          headers: { 'content-type': 'application/json' } 
        });
      }
    }

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
