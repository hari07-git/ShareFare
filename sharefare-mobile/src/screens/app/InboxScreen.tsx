import React from "react";
import { Text, View } from "react-native";
import { ScreenShell } from "./_shared";
import { colors } from "../../theme/colors";

export function InboxScreen() {
  return (
    <ScreenShell title="Inbox" subtitle="Driver messages + ride updates.">
      <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>Driver Inbox + cancel ride actions will be wired next.</Text>
      </View>
    </ScreenShell>
  );
}

