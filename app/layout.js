
// app/layout.jsx

import "./globals.css";
//
//
export const metadata = {
  title: 'I CIEPS',
  description: 'Site oficial do I CIEPS, a 1ª Edição Internacional do Congresso Internacional de Estudantes e Profissionais da Saúde.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <head>
        <title>I CIEPS</title>
        <link rel="icon" href="/icon.png" />
      </head>
      <body className="">
        {children}
      </body>

    </html>
  )
}
/*
<UserProvider>
</UserProvider>
import { UserProvider } from '@/lib/auth0-client';

*/

