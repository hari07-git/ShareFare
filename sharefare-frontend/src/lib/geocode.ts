export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  // OpenStreetMap Nominatim (public) — best effort only.
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lng)}`;
  try {
    const res = await fetch(url, {
      headers: {
        // Nominatim requires a valid UA in general; browsers don't allow setting User-Agent.
        // We still set Referer-friendly headers where possible.
        Accept: "application/json"
      }
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    return typeof data?.display_name === "string" ? data.display_name : null;
  } catch {
    return null;
  }
}

export type PlaceResult = { displayName: string; lat: number; lng: number };

const HYDERABAD_PLACES: PlaceResult[] = [
  { displayName: "Gachibowli, Hyderabad, Telangana", lat: 17.4401, lng: 78.3489 },
  { displayName: "HITEC City, Madhapur, Hyderabad, Telangana", lat: 17.4456, lng: 78.3772 },
  { displayName: "JNTU College, Kukatpally, Hyderabad, Telangana", lat: 17.4936, lng: 78.3912 },
  { displayName: "Kukatpally Metro Station, Hyderabad, Telangana", lat: 17.494, lng: 78.399 },
  { displayName: "Secunderabad Railway Station, Hyderabad, Telangana", lat: 17.4399, lng: 78.4983 },
  { displayName: "Ameerpet Metro Station, Hyderabad, Telangana", lat: 17.4375, lng: 78.4483 },
  { displayName: "Miyapur Metro Station, Hyderabad, Telangana", lat: 17.4965, lng: 78.3576 },
  { displayName: "LB Nagar Metro Station, Hyderabad, Telangana", lat: 17.3457, lng: 78.5522 },
  { displayName: "Dilsukhnagar, Hyderabad, Telangana", lat: 17.3684, lng: 78.5247 },
  { displayName: "Uppal Metro Station, Hyderabad, Telangana", lat: 17.4065, lng: 78.5591 },
  { displayName: "Habsiguda Metro Station, Hyderabad, Telangana", lat: 17.4088, lng: 78.5457 },
  { displayName: "Financial District, Nanakramguda, Hyderabad, Telangana", lat: 17.4148, lng: 78.3418 },
  { displayName: "Kondapur, Hyderabad, Telangana", lat: 17.463, lng: 78.3628 },
  { displayName: "Madhapur, Hyderabad, Telangana", lat: 17.4483, lng: 78.3915 },
  { displayName: "Mehdipatnam, Hyderabad, Telangana", lat: 17.3953, lng: 78.44 },
  { displayName: "Golconda Fort, Hyderabad, Telangana", lat: 17.3833, lng: 78.4011 },
  { displayName: "University of Hyderabad, Gachibowli, Hyderabad, Telangana", lat: 17.4584, lng: 78.3301 },
  { displayName: "IIIT Hyderabad, Gachibowli, Hyderabad, Telangana", lat: 17.4453, lng: 78.3498 },
  { displayName: "Marri Laxman Reddy Institute of Technology, Dundigal, Hyderabad, Telangana", lat: 17.5942, lng: 78.4422 },
  { displayName: "Osmania University, Hyderabad, Telangana", lat: 17.4146, lng: 78.5285 },
  { displayName: "BITS Pilani Hyderabad Campus, Shameerpet, Telangana", lat: 17.5449, lng: 78.5718 },
  { displayName: "Waverock SEZ, Financial District, Hyderabad, Telangana", lat: 17.419, lng: 78.3435 },
  { displayName: "Raheja Mindspace, HITEC City, Hyderabad, Telangana", lat: 17.4416, lng: 78.3818 },
  { displayName: "DLF Cyber City, Gachibowli, Hyderabad, Telangana", lat: 17.4477, lng: 78.3537 }
];

const HYD_VIEWBOX = {
  left: 78.20,
  top: 17.60,
  right: 78.60,
  bottom: 17.20
};

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const q = query.trim();
  if (!q) return [];
  const normalized = q.toLowerCase();
  const localMatches = HYDERABAD_PLACES.filter((place) =>
    place.displayName.toLowerCase().includes(normalized)
  ).slice(0, 6);

  if (localMatches.length >= 4 || q.length < 3) {
    return localMatches;
  }
  // Nominatim search:
  // - `viewbox` biases results toward Hyderabad area, but DOES NOT restrict (no `bounded=1`),
  //   so colleges/areas just outside the viewbox can still appear.
  // - `countrycodes=in` keeps results in India for better quality and speed.
  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&q=${encodeURIComponent(q)}` +
    `&countrycodes=in` +
    `&viewbox=${HYD_VIEWBOX.left},${HYD_VIEWBOX.top},${HYD_VIEWBOX.right},${HYD_VIEWBOX.bottom}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const data: any[] = await res.json();
    const remoteMatches = (data ?? [])
      .map((d) => ({
        displayName: String(d?.display_name ?? ""),
        lat: Number(d?.lat),
        lng: Number(d?.lon)
      }))
      .filter((p) => p.displayName && Number.isFinite(p.lat) && Number.isFinite(p.lng));
    const seen = new Set<string>();
    return [...localMatches, ...remoteMatches]
      .filter((place) => {
        const key = `${place.lat.toFixed(5)}:${place.lng.toFixed(5)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 6);
  } catch {
    return localMatches;
  }
}
