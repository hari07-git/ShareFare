import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { TextField } from "../../ui/TextField";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../state/auth";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { setToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onLogin() {
    setBusy(true);
    try {
      const data: any = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      const token = String(data?.token ?? "");
      if (!token) throw new Error("Login failed");
      await setToken(token);
    } catch (e: any) {
      Alert.alert("Login failed", e?.message ?? "Try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: "900" }}>Welcome back</Text>
      <Text style={{ color: colors.muted, fontSize: 13 }}>Login to find and book rides.</Text>

      <View style={{ gap: 14, marginTop: 10 }}>
        <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@college.com" keyboardType="email-address" />
        <TextField label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
        <PrimaryButton title={busy ? "Signing in..." : "Sign in"} onPress={() => void onLogin()} disabled={busy} />

        <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
          No account?{" "}
          <Text style={{ color: colors.primary2, fontWeight: "800" }} onPress={() => navigation.navigate("Register")}>
            Register
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}

