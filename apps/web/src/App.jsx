import { Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';
import AuroraBackground from '@/components/AuroraBackground';
import { SignIn } from '@/components/SignIn';
import { AppShell } from '@/AppShell';
import { useAuth } from '@/hooks/useAuth';

export default function App() {
  const { status, error, signIn, signOut } = useAuth();

  return (
    <>
      <AuroraBackground />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: 'group rounded-xl border border-border bg-card text-card-foreground',
          },
        }}
      />

      {status === 'loading' && (
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {(status === 'signed_out' || status === 'error') && (
        <SignIn
          onSignIn={signIn}
          error={status === 'error' ? null : error}
          configError={status === 'error' ? error : null}
        />
      )}

      {status === 'signed_in' && <AppShell onSignOut={signOut} />}
    </>
  );
}
