import React from "react";
import { Pressable, Text, ViewStyle } from "react-native";
import { colors } from "../theme/colors";

export function PrimaryButton({
  title,
  onPress,
  disabled,
  style
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          backgroundColor: disabled ? "rgba(109,94,247,0.35)" : colors.primary,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 14
        },
        style
      ]}
    >
      <Text style={{ color: "white", fontWeight: "700", textAlign: "center" }}>{title}</Text>
    </Pressable>
  );
}

