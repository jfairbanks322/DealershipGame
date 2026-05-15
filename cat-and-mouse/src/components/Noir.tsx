import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme/theme";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "quiet";
  disabled?: boolean;
};

export function NoirButton({ label, onPress, variant = "primary", disabled }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.secondaryButton,
        variant === "quiet" && styles.quietButton,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed
      ]}
    >
      <Text style={[styles.buttonText, variant === "quiet" && styles.quietButtonText]}>{label}</Text>
    </Pressable>
  );
}

export function FolderCard({ children, title, eyebrow }: { children: React.ReactNode; title?: string; eyebrow?: string }) {
  return (
    <View style={styles.folder}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      {title ? <Text style={styles.folderTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function Meter({ label, value, tone = "red" }: { label: string; value: number; tone?: "red" | "amber" | "blue" }) {
  const fillColor = tone === "amber" ? colors.amber : tone === "blue" ? colors.blue : colors.red;
  return (
    <View style={styles.meterWrap}>
      <View style={styles.meterHeader}>
        <Text style={styles.meterLabel}>{label}</Text>
        <Text style={styles.meterValue}>{Math.round(value)}%</Text>
      </View>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${Math.max(4, Math.min(100, value))}%`, backgroundColor: fillColor }]} />
      </View>
    </View>
  );
}

export function Tag({ label }: { label: string }) {
  return <Text style={styles.tag}>{label}</Text>;
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: colors.red,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.lineStrong
  },
  secondaryButton: {
    backgroundColor: colors.folderLight,
    borderColor: colors.line
  },
  quietButton: {
    backgroundColor: "transparent",
    borderColor: colors.line
  },
  disabled: {
    opacity: 0.45
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.88
  },
  buttonText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase"
  },
  quietButtonText: {
    color: colors.inkMuted
  },
  folder: {
    backgroundColor: colors.folder,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 }
  },
  eyebrow: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
    textTransform: "uppercase"
  },
  folderTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: "900",
    marginBottom: spacing.sm
  },
  meterWrap: {
    gap: spacing.xs
  },
  meterHeader: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  meterLabel: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: "700"
  },
  meterValue: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800"
  },
  meterTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.board,
    overflow: "hidden",
    borderColor: colors.line,
    borderWidth: 1
  },
  meterFill: {
    height: "100%",
    borderRadius: 5
  },
  tag: {
    color: colors.ink,
    backgroundColor: colors.boardSoft,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    overflow: "hidden"
  }
});
