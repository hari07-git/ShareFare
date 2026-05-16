import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { colors } from "../theme/colors";
import { PlaceResult, searchPlaces } from "../lib/geocode";

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function LocationAutocomplete({
  label,
  value,
  onValue,
  placeholder,
  disabled,
  onSelect
}: {
  label: string;
  value: string;
  onValue: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onSelect: (place: PlaceResult) => void;
}) {
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const debounced = useDebouncedValue(value, 250);
  const inputRef = useRef<TextInput | null>(null);

  const canSearch = useMemo(() => debounced.trim().length >= 2, [debounced]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!canSearch || disabled) {
        setResults([]);
        setBusy(false);
        return;
      }
      setBusy(true);
      const res = await searchPlaces(debounced);
      if (cancelled) return;
      setResults(res);
      setBusy(false);
      setOpen(true);
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [debounced, canSearch, disabled]);

  function select(place: PlaceResult) {
    onSelect(place);
    onValue(place.displayName);
    setOpen(false);
    setResults([]);
    inputRef.current?.blur();
  }

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "700" }}>{label}</Text>
      <View style={{ position: "relative" }}>
        <TextInput
          ref={(r) => {
            inputRef.current = r;
          }}
          value={value}
          onChangeText={onValue}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.35)"
          editable={!disabled}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          onBlur={() => {
            // small delay so click selection registers
            setTimeout(() => setOpen(false), 120);
          }}
          style={{
            color: colors.text,
            backgroundColor: colors.card2,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 12,
            paddingVertical: 12,
            borderRadius: 14
          }}
        />
        {busy ? (
          <Text style={{ position: "absolute", right: 12, top: 13, fontSize: 11, color: colors.muted }}>
            Searching…
          </Text>
        ) : null}
      </View>

      {open && results.length > 0 ? (
        <View
          style={{
            maxHeight: 220,
            borderRadius: 16,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card
          }}
        >
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={results}
            keyExtractor={(item, idx) => `${item.lat}-${item.lng}-${idx}`}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => select(item)}
                style={({ pressed }) => ({
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor: pressed ? "rgba(255,255,255,0.06)" : "transparent",
                  borderBottomWidth: 1,
                  borderBottomColor: "rgba(255,255,255,0.06)"
                })}
              >
                <Text style={{ color: colors.text, fontSize: 12 }} numberOfLines={2}>
                  {item.displayName}
                </Text>
              </Pressable>
            )}
          />
        </View>
      ) : null}
    </View>
  );
}

