export async function GET(req: Request) {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || (
      process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5001' 
        : 'https://api.vikareta.com'
    );

    // Call backend logout to clear HttpOnly cookies on this domain
    await fetch(`${apiBase}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.get('Cookie') || '',
        'X-XSRF-TOKEN': req.headers.get('X-XSRF-TOKEN') || req.headers.get('x-csrf-token') || '',
      },
      credentials: 'include',
    }).catch(() => {}); // Ignore errors

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Logout Complete</title>
  <meta charset="utf-8" />
</head>
<body>
  <script>
    try { ['vikareta_auth_state','csrf_token'].forEach(k=>localStorage.removeItem(k)); } catch(e){}
    if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'LOGOUT_COMPLETE', domain: location.hostname }, '*');
    document.write('<div style="font-family: system-ui; padding: 20px; text-align: center;">Logout complete</div>');
  </script>
</body>
</html>`;

    const response = new Response(html, { 
      status: 200, 
      headers: { 
        'Content-Type': 'text/html',
      } 
    });

    // Clear all auth-related cookies on this domain
    const names = ['vikareta_access_token','vikareta_refresh_token','vikareta_session_id','XSRF-TOKEN'];
    names.forEach(n => { response.headers.append('Set-Cookie', `${n}=; Path=/; Max-Age=0`); response.headers.append('Set-Cookie', `${n}=; Path=/; HttpOnly; Max-Age=0`); });
    if (process.env.NODE_ENV === 'production') names.forEach(n => { response.headers.append('Set-Cookie', `${n}=; Path=/; Max-Age=0; Domain=.vikareta.com; Secure; SameSite=None`); response.headers.append('Set-Cookie', `${n}=; Path=/; HttpOnly; Max-Age=0; Domain=.vikareta.com; Secure; SameSite=None`); });

    return response;
  } catch (error) {
    console.error('Dashboard logout-all error:', error);
    
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><title>Logout Complete</title></head>
<body><script>try{['vikareta_auth_state','csrf_token'].forEach(k=>localStorage.removeItem(k))}catch(e){}; if(window.parent&&window.parent!==window)window.parent.postMessage({type:'LOGOUT_COMPLETE',domain:location.hostname},'*'); document.write('<div style="font-family: system-ui; padding: 20px; text-align: center;'>Logout complete</div>');</script></body></html>`;

    const response = new Response(html, { 
      status: 200, 
      headers: { 
        'Content-Type': 'text/html',
      } 
    });

    // Clear cookies even on error
    const names = [
      'access_token', 'refresh_token', 'session_id', 'XSRF-TOKEN',
      'vikareta_access_token', 'vikareta_refresh_token', 'vikareta_session_id'
    ];

    names.forEach((name) => {
      response.headers.append('Set-Cookie', `${name}=; Path=/; Max-Age=0`);
      response.headers.append('Set-Cookie', `${name}=; Path=/; HttpOnly; Max-Age=0`);
    });

    if (process.env.NODE_ENV === 'production') {
      names.forEach((name) => {
        response.headers.append('Set-Cookie', `${name}=; Path=/; Max-Age=0; Domain=.vikareta.com; Secure; SameSite=None`);
        response.headers.append('Set-Cookie', `${name}=; Path=/; HttpOnly; Max-Age=0; Domain=.vikareta.com; Secure; SameSite=None`);
      });
    }

    return response;
  }
}

export async function POST(req: Request) {
  return GET(req); // Both GET and POST work the same way
}