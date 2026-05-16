export type PlaceResult = { displayName: string; lat: number; lng: number };

const HYD_VIEWBOX = {
  left: 78.20,
  top: 17.60,
  right: 78.60,
  bottom: 17.20
};

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const q = query.trim();
  if (!q) return [];
  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&q=${encodeURIComponent(q)}` +
    `&countrycodes=in` +
    `&viewbox=${HYD_VIEWBOX.left},${HYD_VIEWBOX.top},${HYD_VIEWBOX.right},${HYD_VIEWBOX.bottom}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const data: any[] = await res.json();
    return (data ?? [])
      .map((d) => ({
        displayName: String(d?.display_name ?? ""),
        lat: Number(d?.lat),
        lng: Number(d?.lon)
      }))
      .filter((p) => p.displayName && Number.isFinite(p.lat) && Number.isFinite(p.lng));
  } catch {
    return [];
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lng)}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data: any = await res.json();
    return typeof data?.display_name === "string" ? data.display_name : null;
  } catch {
    return null;
  }
}

