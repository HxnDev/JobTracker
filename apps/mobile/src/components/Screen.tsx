// Themed screen wrapper: near-black base with two soft color glows, echoing
// the web app's aurora background without WebGL or animation cost.

import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/lib/theme';

export function Screen({ children }: PropsWithChildren) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(45, 212, 191, 0.14)', 'rgba(45, 212, 191, 0)']}
        style={[styles.glow, styles.glowTeal]}
      />
      <LinearGradient
        colors={['rgba(167, 139, 250, 0.10)', 'rgba(167, 139, 250, 0)']}
        style={[styles.glow, styles.glowViolet]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  glow: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
  },
  glowTeal: {
    top: -160,
    left: -120,
  },
  glowViolet: {
    top: 120,
    right: -180,
  },
});
