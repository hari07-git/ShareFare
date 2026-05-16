import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { TextField } from "../../ui/TextField";
import { apiFetch } from "../../api/client";

export function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"RIDER" | "DRIVER">("RIDER");
  const [busy, setBusy] = useState(false);

  async function onRegister() {
    setBusy(true);
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ fullName, email, password, role })
      });
      Alert.alert("Registered", "Account created. Now login.");
    } catch (e: any) {
      Alert.alert("Registration failed", e?.message ?? "Try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: "900" }}>Create account</Text>
      <Text style={{ color: colors.muted, fontSize: 13 }}>Choose RIDER to book or DRIVER to offer rides.</Text>

      <View style={{ gap: 14, marginTop: 10 }}>
        <TextField label="Full name" value={fullName} onChangeText={setFullName} placeholder="Your name" autoCapitalize="words" />
        <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@college.com" keyboardType="email-address" />
        <TextField label="Password" value={password} onChangeText={setPassword} placeholder="Create a password" secureTextEntry />

        <View style={{ flexDirection: "row", gap: 10 }}>
          <PrimaryButton
            title="RIDER"
            onPress={() => setRole("RIDER")}
            style={{ flex: 1, backgroundColor: role === "RIDER" ? colors.primary2 : colors.card2 }}
          />
          <PrimaryButton
            title="DRIVER"
            onPress={() => setRole("DRIVER")}
            style={{ flex: 1, backgroundColor: role === "DRIVER" ? colors.primary2 : colors.card2 }}
          />
        </View>

        <PrimaryButton title={busy ? "Creating..." : "Create account"} onPress={() => void onRegister()} disabled={busy} />
      </View>
    </ScrollView>
  );
}

