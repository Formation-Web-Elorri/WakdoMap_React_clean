import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchCities, searchMcDonalds } from "../services/nominatim";

function mockFetch(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => data,
  });
}

const cityRow = {
  place_id: 1,
  display_name: "Saint-Étienne, Loire, France",
  lat: "45.43",
  lon: "4.38",
  boundingbox: ["45.3", "45.5", "4.2", "4.5"],
  address: { city: "Saint-Étienne" },
};

describe("nominatim", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("searchCities renvoie [] pour une chaîne vide", async () => {
    expect(await searchCities("   ")).toEqual([]);
  });

  it("searchCities appelle /search?city=… et mappe le résultat", async () => {
    const fetchMock = mockFetch([cityRow]);
    vi.stubGlobal("fetch", fetchMock);

    const cities = await searchCities("Saint");

    expect(fetchMock).toHaveBeenCalledOnce();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("/search?city=Saint");
    expect(url).toContain("format=json");
    expect(cities[0]).toMatchObject({ id: 1, name: "Saint-Étienne", lat: 45.43, lon: 4.38 });
  });

  it("searchMcDonalds utilise la bbox de la ville", async () => {
    const fetchMock = mockFetch([]);
    vi.stubGlobal("fetch", fetchMock);

    await searchMcDonalds({
      id: 1,
      name: "Saint-Étienne",
      displayName: "",
      lat: 45.43,
      lon: 4.38,
      bbox: [45.3, 45.5, 4.2, 4.5],
    });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("q=McDonald");
    expect(url).toContain("viewbox=4.2,45.5,4.5,45.3");
    expect(url).toContain("bounded=1");
  });
});
