import { router } from 'expo-router';
import { ExternalLink, LogOut, Table2 } from 'lucide-react-native';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { SHEET_NAME, SHEET_URL } from '@/lib/config';
import { colors, fonts, radius, sp } from '@/lib/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  return (
    <Screen>
      <View style={[styles.header, { paddingTop: insets.top + sp(4) }]}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.card}>
          <View style={styles.rowIcon}>
            <Table2 color={colors.primary} size={18} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Google Sheet</Text>
            <Text style={styles.rowSub}>Tab: {SHEET_NAME}</Text>
          </View>
          <Pressable
            onPress={() => Linking.openURL(SHEET_URL)}
            hitSlop={8}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ExternalLink color={colors.textMuted} size={18} />
          </Pressable>
        </View>

        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
        >
          <LogOut color={colors.danger} size={16} />
          <Text style={styles.signOutLabel}>Sign out</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: sp(5),
    paddingBottom: sp(4),
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 26,
    letterSpacing: -0.5,
  },
  body: {
    paddingHorizontal: sp(4),
    gap: sp(3),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(3),
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: sp(4),
  },
  rowIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDim,
    borderRadius: radius.md,
  },
  rowText: {
    flex: 1,
    gap: 1,
  },
  rowTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  rowSub: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sp(2),
    backgroundColor: colors.dangerDim,
    borderColor: 'rgba(251, 113, 133, 0.3)',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: sp(3.5),
  },
  signOutLabel: {
    color: colors.danger,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.7,
  },
});
