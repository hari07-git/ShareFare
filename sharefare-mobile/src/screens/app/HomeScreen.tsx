import React from "react";
import { Text, View } from "react-native";
import { ScreenShell } from "./_shared";
import { colors } from "../../theme/colors";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { useAuth } from "../../state/auth";

export function HomeScreen() {
  const { logout } = useAuth();
  return (
    <ScreenShell title="Home" subtitle="Quick actions and your activity.">
      <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
        <Text style={{ color: colors.text, fontWeight: "800" }}>Welcome to ShareFare Mobile</Text>
        <Text style={{ color: colors.muted, fontSize: 12 }}>
          Next: Find Ride / Offer Ride with map pins + live location suggestions.
        </Text>
        <PrimaryButton title="Logout" onPress={() => void logout()} style={{ backgroundColor: colors.danger }} />
      </View>
    </ScreenShell>
  );
}

