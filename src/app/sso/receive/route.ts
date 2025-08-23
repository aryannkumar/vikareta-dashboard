import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    if (!token) {
      console.error('SSO: No token provided');
      return NextResponse.redirect('/login?error=missing_token');
    }

    const SSO_SECRET = process.env.SSO_SECRET || process.env.JWT_SECRET || 'sso-secret';

    let payload: any;
    try {
      payload = jwt.verify(token, SSO_SECRET) as any;
      console.log('SSO: Token validated successfully for user:', payload.sub);
    } catch (error) {
      console.error('SSO: Token validation failed:', error);
      return NextResponse.redirect('/login?error=invalid_token');
    }

    // Validate audience claim
    const expectedHost = process.env.NEXT_PUBLIC_DASHBOARD_HOST || 'dashboard.vikareta.com';
    if (payload.aud && !payload.aud.includes(expectedHost)) {
      console.error('SSO: Invalid audience claim:', payload.aud, 'expected:', expectedHost);
      return NextResponse.redirect('/login?error=invalid_audience');
    }

    // Validate SSO token with backend and get fresh tokens
    const backend = process.env.NEXT_PUBLIC_API_BASE || (process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : 'https://api.vikareta.com');
    let accessToken = '';
    let refreshToken = '';
    let user: any = null;
    
    try {
      console.log('SSO: Validating token with backend...');
      const validateRes = await fetch(`${backend}/api/auth/validate-sso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      const data = await validateRes.json();
      console.log('SSO: Backend validation response:', { 
        ok: validateRes.ok, 
        status: validateRes.status,
        success: data?.success,
        userType: data?.user?.userType 
      });
      
      if (!validateRes.ok || !data?.success) {
        console.error('SSO: Backend validation failed:', data);
        return NextResponse.redirect('/login?error=validation_failed');
      }
      
      accessToken = data.accessToken || '';
      refreshToken = data.refreshToken || '';
      user = data.user;
      
      if (!accessToken || !refreshToken) {
        console.error('SSO: Backend did not return tokens');
        return NextResponse.redirect('/login?error=no_tokens');
      }
    } catch (err) {
      console.error('SSO: Backend validation call failed:', err);
      return NextResponse.redirect('/login?error=backend_error');
    }

    const html = `<!doctype html>
<html><body>
<script>
  try {
    // Store user data in localStorage for immediate access
    if (typeof Storage !== "undefined") {
      const authData = {
        user: ${JSON.stringify(user)},
        sessionId: '${payload.sub}',
        domain: 'dashboard',
        timestamp: ${Date.now()}
      };
      localStorage.setItem('vikareta_auth_state', JSON.stringify(authData));
    }
    
    // Notify parent window that SSO completed successfully
    window.parent.postMessage({ 
      sso: 'ok', 
      host: location.hostname,
      user: ${JSON.stringify(user)}
    }, '*');
    
    document.write('<p>SSO authentication successful. You may close this window.</p>');
  } catch (e) {
    console.error('SSO completion error:', e);
    window.parent.postMessage({ sso: 'error', error: e.message }, '*');
  }
</script>
</body></html>`;

    // Set consistent cookie names that match the backend expectations
    const isProduction = process.env.NODE_ENV === 'production';
    const domainPart = isProduction ? '; Domain=.vikareta.com' : '';
    const securePart = isProduction ? '; Secure' : '';
    const sameSitePart = isProduction ? '; SameSite=None' : '; SameSite=Lax';
    
    const cookies: string[] = [];
    
    if (accessToken) {
      // Set both cookie names for compatibility
      cookies.push(`vikareta_access_token=${accessToken}; Path=/; HttpOnly${sameSitePart}; Max-Age=${60 * 60}${domainPart}${securePart}`);
      cookies.push(`access_token=${accessToken}; Path=/; HttpOnly${sameSitePart}; Max-Age=${60 * 60}${domainPart}${securePart}`);
    }
    
    if (refreshToken) {
      // Set both cookie names for compatibility
      cookies.push(`vikareta_refresh_token=${refreshToken}; Path=/; HttpOnly${sameSitePart}; Max-Age=${7 * 24 * 60 * 60}${domainPart}${securePart}`);
      cookies.push(`refresh_token=${refreshToken}; Path=/; HttpOnly${sameSitePart}; Max-Age=${7 * 24 * 60 * 60}${domainPart}${securePart}`);
    }

    const hdrs = new Headers();
    hdrs.set('Content-Type', 'text/html');
    for (const c of cookies) {
      hdrs.append('Set-Cookie', c);
    }

    console.log('SSO: Successfully set cookies and returning success page');
    return new Response(html, { status: 200, headers: hdrs });
    
  } catch (error) {
    console.error('SSO: Unexpected error:', error);
    return NextResponse.redirect('/login?error=unexpected');
  }
}
