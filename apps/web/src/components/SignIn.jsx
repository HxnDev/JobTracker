import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SignIn({ onSignIn, error, configError }) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      await onSignIn();
    } catch {
      /* error surfaced via prop */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass w-full max-w-md rounded-3xl border border-border/70 p-8 text-center shadow-2xl"
      >
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
          <Briefcase className="h-6 w-6 text-primary" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight">Job Tracker</h1>
        <p className="mt-2 text-balance text-sm text-muted-foreground">
          A modern interface for your Switzerland job-application sheet. Your Google Sheet
          stays the source of truth — this app just makes it beautiful.
        </p>

        {configError ? (
          <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left text-xs text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{configError}</span>
          </div>
        ) : (
          <>
            <Button
              size="lg"
              className="mt-7 w-full"
              onClick={handleClick}
              disabled={busy}
            >
              {busy ? <Loader2 className="animate-spin" /> : null}
              Sign in with Google
            </Button>

            {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              Read &amp; write access stays in your browser. Nothing is stored on a
              server.
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
