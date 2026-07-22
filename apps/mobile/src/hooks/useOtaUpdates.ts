// Checks for an OTA update once on cold start and applies it immediately.
// No-op in dev mode / the dev client, and silently ignores network failures
// so an offline launch is unaffected.

import * as Updates from 'expo-updates';
import { useEffect } from 'react';

export function useOtaUpdates() {
  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;

    (async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch {
        // Offline or update server unreachable — keep the installed bundle.
      }
    })();
  }, []);
}
