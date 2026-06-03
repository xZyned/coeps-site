import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { auth0 } = await params;
  const route = Array.isArray(auth0) ? auth0[0] : auth0;
  const url = new URL(request.url);
  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto');

  url.pathname = `/auth/${route}`;

  if (host) {
    url.host = host;
  }

  if (protocol) {
    url.protocol = `${protocol}:`;
  }

  return NextResponse.redirect(url);
}
