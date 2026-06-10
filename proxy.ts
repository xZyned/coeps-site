import { NextResponse } from 'next/server';
import { isAuth0Configured } from './app/lib/auth0';
import { auth0 } from './app/lib/auth0';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserId } from '@/lib/getUserId';
import { ObjectId } from 'bson';
import { IUser } from '@/lib/types/user/user.t';

const protectedRoutes = [
  '/suaInscricaoFoiConfirmada',
  '/painel',
  '/updateData',
  '/pagamentos',
];
function isProtectedRoute(pathname) {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}
export async function proxy(req) {
  const path = req.nextUrl.pathname;

  if (!isAuth0Configured) {
    if (path.startsWith('/auth') || isProtectedRoute(path)) {
      return new NextResponse('AUTH0_DOMAIN is required to use Auth0.', { status: 500 });
    }
    return NextResponse.next();
  }

  // 1. Libera Rotas do Auth0 (NUNCA INTERROMPER)
  if (path.startsWith("/auth/")) { // Ou /api/auth/ se for o padrão do Next!
    return await auth0.middleware(req);
  }

  // 2. Libera Rotas da API Interna
  if (path.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 3. Verifica se é uma rota protegida (Se NÃO FOR painel ou pagamentos, libera geral)
  // Fazemos isso ANTES de checar a sessão, para que rotas públicas sejam sempre públicas.
  const isPainel = path.startsWith("/painel");
  const isPagamentos = path.startsWith("/pagamentos");

  if (!isPainel && !isPagamentos) {
    return NextResponse.next();
  }

  // ============== DAQUI PARA BAIXO, SÓ ROTAS PROTEGIDAS ==============

  const session = await auth0.getSession(req);

  // 4. Se não tem sessão em rota protegida, força o login
  if (!session) {
    return auth0.startInteractiveLogin({ returnTo: new URL("/painel", req.nextUrl.origin).toString() });
  }

  // 5. Usuário está logado. Vamos buscar os dados.
  // ATENÇÃO: Lembre-se do aviso sobre o MongoDB no Edge Runtime!
  const { db } = await connectToDatabase();
  const userId = await getUserId(req);
  const user: IUser | null = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) });

  // 6. Verificação de Perfil Incompleto

  if (!user || !user.isPos_registration) {
    if (path === "/painel/dadosIniciais") { // Usar === evita falsos positivos
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/painel/dadosIniciais", req.nextUrl.origin));
  }

  // 7. Verificação de Pagamento Pendente
  const pago = user.pagamento.situacao === 1;
  const isCertificados = path.startsWith("/painel/certificados");

  if (!pago && !isCertificados && !isPagamentos) {
    return NextResponse.redirect(new URL("/pagamentos", req.nextUrl.origin));
  }

  // 8. Lógica da Animação de Confirmação de Inscrição
  const isAnimacaoPage = path.startsWith("/painel/suaInscricaoFoiConfirmada");

  // Regra A: Se ele PAGOU, NÃO VIU a animação, e NÃO ESTÁ na página -> manda pra lá
  if (pago && !user.pagamento.situacao_animacao && !isAnimacaoPage) {
    return NextResponse.redirect(new URL("/painel/suaInscricaoFoiConfirmada", req.nextUrl.origin));
  }

  // Regra B: Se ele JÁ VIU a animação, e TENTAR ENTRAR na página -> bloqueia e manda pro painel
  if (user.pagamento.situacao_animacao && isAnimacaoPage) {
    return NextResponse.redirect(new URL("/painel", req.nextUrl.origin));
  }

  // 9. Se sobreviveu a tudo, passa o middleware do Auth0
  return auth0.middleware(req);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
