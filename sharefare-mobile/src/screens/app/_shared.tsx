import React from "react";
import { ScrollView, Text, View } from "react-native";
import { colors } from "../../theme/colors";

export function ScreenShell({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={{ gap: 6 }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: "900" }}>{title}</Text>
        {subtitle ? <Text style={{ color: colors.muted, fontSize: 12 }}>{subtitle}</Text> : null}
      </View>
      {children}
    </ScrollView>
  );
}

