import React from "react";
import { Text, View } from "react-native";
import { ScreenShell } from "./_shared";
import { colors } from "../../theme/colors";

export function NotificationsScreen() {
  return (
    <ScreenShell title="Notifications" subtitle="Booking status, reminders, driver updates.">
      <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>Will show backend notifications stream.</Text>
      </View>
    </ScreenShell>
  );
}

