import React from "react";
import { ImageBackground, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";
import { PrimaryButton } from "../../ui/PrimaryButton";

type Props = NativeStackScreenProps<AuthStackParamList, "Landing">;

export function LandingScreen({ navigation }: Props) {
  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1520975958225-62d4e9c1e9aa?auto=format&fit=crop&w=1600&q=80"
      }}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{ flex: 1, backgroundColor: "rgba(11,18,32,0.55)" }}>
        <View style={{ flex: 1, justifyContent: "flex-end", padding: 20, gap: 14 }}>
          <Text style={{ color: colors.text, fontSize: 38, fontWeight: "900" }}>ShareFare</Text>
          <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>
            Student-focused rides. Safer, cheaper, and simple.
          </Text>

          <PrimaryButton title="Login" onPress={() => navigation.navigate("Login")} />
          <PrimaryButton
            title="Create account"
            onPress={() => navigation.navigate("Register")}
            style={{ backgroundColor: colors.primary2 }}
          />

          <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 6 }}>
            Tip: set API base via EXPO_PUBLIC_API_BASE_URL for real device testing.
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

