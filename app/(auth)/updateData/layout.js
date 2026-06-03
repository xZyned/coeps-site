import { UserProvider } from '@/lib/auth0-client';

//
//
export default function Layout({ children }) {
    //
    //
    return (
        <>
            <UserProvider>
                <div className="min-h-screen">
                    {children}
                </div>
            </UserProvider>
        </>
    )
}
