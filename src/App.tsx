import { useState, lazy, Suspense } from "react";
import { SearchBar } from "./components/Search/SearchBar";
import { Overlay } from "./components/Overlay/Overlay";
import { searchCities, searchMcDonalds } from "./services/nominatim";
import type { City, Restaurant } from "./types";
import styles from "./App.module.css";

const Map = lazy(() => import("./components/Map/Map").then((mod) => ({ default: mod.Map })));

export default function App() {
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [city, setCity] = useState<City | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selected, setSelected] = useState<Restaurant | null>(null);

  async function handleSearch(query: string) {
    setSuggestions(await searchCities(query));
  }

  async function handleSelectCity(c: City) {
    setSuggestions([]);
    setCity(c);
    setSelected(null);
    setRestaurants(await searchMcDonalds(c));
  }

  return (
    <main className={styles.app}>
      <Suspense fallback={null}>
        <Map city={city} restaurants={restaurants} onChoose={setSelected} />
      </Suspense>{" "}
      <SearchBar suggestions={suggestions} onSearch={handleSearch} onSelect={handleSelectCity} />
      <Overlay restaurant={selected} onContinue={() => alert("Continuer")} />
    </main>
  );
}
