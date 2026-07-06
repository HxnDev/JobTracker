import { router } from 'expo-router';
import { BriefcaseBusiness, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { colors, fonts, radius, sp } from '@/lib/theme';

export default function SignIn() {
  const { signIn, error } = useAuth();
  const [busy, setBusy] = useState(false);

  const handlePress = async () => {
    setBusy(true);
    try {
      await signIn();
      router.replace('/(tabs)');
    } catch {
      /* error surfaced via hook state */
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={styles.center}>
        <Animated.View entering={FadeInDown.duration(420)} style={styles.card}>
          <View style={styles.logo}>
            <BriefcaseBusiness color={colors.primary} size={26} />
          </View>

          <Text style={styles.title}>Job Tracker</Text>
          <Text style={styles.subtitle}>
            Your Switzerland job-application sheet, in your pocket. The Google
            Sheet stays the source of truth.
          </Text>

          <Pressable
            onPress={handlePress}
            disabled={busy}
            style={({ pressed }) => [
              styles.button,
              (pressed || busy) && styles.buttonPressed,
            ]}
          >
            {busy ? (
              <ActivityIndicator color={colors.onPrimary} size="small" />
            ) : (
              <Text style={styles.buttonLabel}>Sign in with Google</Text>
            )}
          </Pressable>

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.note}>
            <ShieldCheck color={colors.primary} size={14} />
            <Text style={styles.noteText}>
              Tokens stay on this device. Nothing is stored on a server.
            </Text>
          </View>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: sp(6),
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.xl,
    padding: sp(8),
  },
  logo: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDim,
    borderColor: colors.primaryBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    marginBottom: sp(5),
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 24,
    letterSpacing: -0.4,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: sp(2),
  },
  button: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: sp(3.5),
    marginTop: sp(7),
    minHeight: 48,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    color: colors.onPrimary,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.regular,
    fontSize: 12,
    textAlign: 'center',
    marginTop: sp(3),
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(1.5),
    marginTop: sp(5),
  },
  noteText: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
});
