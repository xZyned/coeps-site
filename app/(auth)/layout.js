import { UserProvider } from '@/lib/auth0-client';
import AsaasCustomerSyncRetry from '@/app/components/AsaasCustomerSyncRetry';
import ConsentUpdateGate from '@/app/components/ConsentUpdateGate';
import './portal-theme.css';
//
//
export default function Layout({ children }) {
    //
    //
    return (
        <>
            <UserProvider>
                <AsaasCustomerSyncRetry />
                <ConsentUpdateGate />
                <div className="cieps-auth-shell min-h-screen">
                    {children}
                </div>
            </UserProvider>
        </>
    )
}
