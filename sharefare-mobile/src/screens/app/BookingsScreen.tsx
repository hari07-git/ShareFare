import React from "react";
import { Text, View } from "react-native";
import { ScreenShell } from "./_shared";
import { colors } from "../../theme/colors";

export function BookingsScreen() {
  return (
    <ScreenShell title="My Bookings" subtitle="Upcoming/past bookings.">
      <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>Bookings list + cancel + receipt will be wired to backend.</Text>
      </View>
    </ScreenShell>
  );
}

