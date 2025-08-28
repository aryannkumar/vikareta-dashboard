import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      console.error('SSO: No code provided');
      return NextResponse.redirect('/login?error=missing_code');
    }

    const backend = process.env.NEXT_PUBLIC_API_BASE || (process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : 'https://api.vikareta.com');
  const accessToken = '';
  const refreshToken = '';
    let user: any = null;

    try {
      console.log('SSO: Exchanging code with backend...');
      const tokenRes = await fetch(`${backend}/api/auth/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grant_type: 'authorization_code', code, redirect_uri: `https://${process.env.NEXT_PUBLIC_DASHBOARD_HOST || 'dashboard.vikareta.com'}/sso/receive`, client_id: process.env.NEXT_PUBLIC_DASHBOARD_CLIENT_ID || 'dashboard' })
      });

      const data = await tokenRes.json();
      console.log('SSO: Backend token exchange response:', { ok: tokenRes.ok, status: tokenRes.status, success: data?.success });

      if (!tokenRes.ok || !data?.success) {
        console.error('SSO: Token exchange failed:', data);
        return NextResponse.redirect('/login?error=exchange_failed');
      }

      // The backend sets cookies via the token endpoint; but some responses may include user info
      user = data.user;

    } catch (err) {
      console.error('SSO: Token exchange call failed:', err);
      return NextResponse.redirect('/login?error=backend_error');
    }

    const html = `<!doctype html>
<html><body>
<script>
  try {
    // Notify opener (popup) or parent (iframe) that SSO completed successfully with user info
    const msg = { type: 'SSO_USER', host: location.hostname, user: ${JSON.stringify(user)}, state: ${JSON.stringify(state)} };
    try { if (window.opener && !window.opener.closed) window.opener.postMessage(msg, '*'); } catch(e){}
    try { window.parent.postMessage(msg, '*'); } catch(e){}

    document.write('<p>SSO authentication successful. You may close this window.</p>');
  } catch (e) {
    console.error('SSO completion error:', e);
    try { if (window.opener && !window.opener.closed) window.opener.postMessage({ type: 'SSO_ERROR', error: e.message }, '*'); } catch(e){}
    try { window.parent.postMessage({ type: 'SSO_ERROR', error: e.message }, '*'); } catch(e){}
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
