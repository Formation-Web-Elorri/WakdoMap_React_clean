import type { City, Restaurant } from "../types";

const BASE = "https://nominatim.openstreetmap.org";

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string];
  name?: string;
  address?: Record<string, string>;
};

async function get(path: string): Promise<NominatimResult[]> {
  const res = await fetch(`${BASE}${path}&format=json&addressdetails=1`, {
    headers: { "Accept-Language": "fr" },
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  return res.json();
}

export async function searchCities(query: string): Promise<City[]> {
  const q = query.trim();
  if (!q) return [];
  const data = await get(`/search?city=${encodeURIComponent(q)}&limit=5`);
  return data.map((r) => ({
    id: r.place_id,
    name: r.address?.city ?? r.address?.town ?? r.address?.village ?? r.display_name.split(",")[0],
    displayName: r.display_name,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    bbox: [
      parseFloat(r.boundingbox[0]),
      parseFloat(r.boundingbox[1]),
      parseFloat(r.boundingbox[2]),
      parseFloat(r.boundingbox[3]),
    ],
  }));
}

export async function searchMcDonalds(city: City): Promise<Restaurant[]> {
  const [south, north, west, east] = city.bbox;
  const viewbox = `${west},${north},${east},${south}`;
  const data = await get(
    `/search?q=${encodeURIComponent(`McDonald's ${city.name}`)}&viewbox=${viewbox}&bounded=1&limit=30`,
  );
  return data.map((r) => ({
    id: r.place_id,
    name: r.name || "McDonald's",
    address: r.display_name,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
  }));
}
