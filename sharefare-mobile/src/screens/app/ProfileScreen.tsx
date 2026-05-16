import React from "react";
import { Text, View } from "react-native";
import { ScreenShell } from "./_shared";
import { colors } from "../../theme/colors";

export function ProfileScreen() {
  return (
    <ScreenShell title="Profile" subtitle="Your profile + rating history.">
      <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>Profile + ratings + verification UI will be added.</Text>
      </View>
    </ScreenShell>
  );
}

