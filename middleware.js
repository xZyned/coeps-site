import { NextResponse } from 'next/server';
import { getAuth0Client, isAuth0Configured } from './app/lib/auth0';
import { checkAndRefreshToken, checkAll, checkRoutes } from './app/utils/authUtils';

const protectedRoutes = [
  '/suaInscricaoFoiConfirmada',
  '/painel',
  '/updateData',
  '/pagamentos',
];

function isProtectedRoute(pathname) {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

function normalizeRedirectUrl(req, target) {
  const url = new URL(target);
  const host = req.headers.get('host');
  const protocol = req.headers.get('x-forwarded-proto');

  if (host) {
    url.host = host;
  }

  if (protocol) {
    url.protocol = `${protocol}:`;
  }

  return url;
}

export async function middleware(req) {
  if (!isAuth0Configured) {
    if (req.nextUrl.pathname.startsWith('/auth') || isProtectedRoute(req.nextUrl.pathname)) {
      return new NextResponse('AUTH0_DOMAIN is required to use Auth0 authentication routes.', {
        status: 500,
      });
    }

    return NextResponse.next();
  }

  const auth0 = getAuth0Client();
  const authRes = await auth0.middleware(req);

  if (req.nextUrl.pathname.startsWith('/auth')) {
    return authRes;
  }

  if (!isProtectedRoute(req.nextUrl.pathname)) {
    return authRes;
  }

  const session = await auth0.getSession(req);

  if (!session) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('returnTo', `${req.nextUrl.pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(normalizeRedirectUrl(req, loginUrl));
  }

  let check = await checkAndRefreshToken(req, authRes);
  if (check) {
    return NextResponse.redirect(normalizeRedirectUrl(req, check));
  }

  check = await checkAll(req, authRes);
  if (check) {
    return NextResponse.redirect(normalizeRedirectUrl(req, check));
  }

  if (!req.nextUrl.pathname.startsWith('/pagamentos')) {
    check = await checkRoutes(req, authRes);
    if (check) {
      return NextResponse.redirect(normalizeRedirectUrl(req, check));
    }
  }

  return authRes;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
