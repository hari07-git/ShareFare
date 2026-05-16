import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import { ScreenShell } from "./_shared";
import { colors } from "../../theme/colors";
import { TextField } from "../../ui/TextField";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../state/auth";

export function AdminScreen() {
  const { setToken } = useAuth();
  const [email, setEmail] = useState("admin@sharefare.com");
  const [password, setPassword] = useState("Admin@12345");
  const [busy, setBusy] = useState(false);

  async function adminLogin() {
    setBusy(true);
    try {
      const data: any = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      const token = String(data?.token ?? "");
      if (!token) throw new Error("Login failed");
      await setToken(token);
      Alert.alert("Admin login", "You are logged in. (Admin endpoints UI wiring next.)");
    } catch (e: any) {
      Alert.alert("Admin login failed", e?.message ?? "Try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScreenShell title="Admin" subtitle="Admin login and dashboard.">
      <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>
          Default admin (dev): admin@sharefare.com / Admin@12345
        </Text>
        <TextField label="Admin email" value={email} onChangeText={setEmail} placeholder="admin@sharefare.com" keyboardType="email-address" />
        <TextField label="Admin password" value={password} onChangeText={setPassword} placeholder="Admin password" secureTextEntry />
        <PrimaryButton title={busy ? "Signing in..." : "Admin login"} onPress={() => void adminLogin()} disabled={busy} />
      </View>
    </ScreenShell>
  );
}

