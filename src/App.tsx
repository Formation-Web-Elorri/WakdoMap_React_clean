import { useState, lazy, Suspense } from "react";
import { SearchBar } from "./components/Search/SearchBar";
import { Overlay } from "./components/Overlay/Overlay";
import { searchCities, searchMcDonalds } from "./services/nominatim";
import type { City, Restaurant } from "./types";
import styles from "./App.module.css";

// Leaflet touches `window`/`document` at import time, which crashes SSR.
// Loading it lazily keeps it out of the server module graph entirely.
const Map = lazy(() => import("./components/Map/Map").then((mod) => ({ default: mod.Map })));

export default function App() {
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [city, setCity] = useState<City | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(query: string) {
    try {
      setError(null);
      setSuggestions(await searchCities(query));
    } catch (err) {
      console.error(err);
      setError("La recherche de ville a échoué. Réessayez dans un instant.");
    }
  }

  async function handleSelectCity(c: City) {
    setSuggestions([]);
    setCity(c);
    setSelected(null);
    try {
      setError(null);
      setRestaurants(await searchMcDonalds(c));
    } catch (err) {
      console.error(err);
      setRestaurants([]);
      setError("Impossible de charger les restaurants pour cette ville.");
    }
  }

  return (
    <main className={styles.app}>
      <Suspense fallback={null}>
        <Map city={city} restaurants={restaurants} onChoose={setSelected} />
      </Suspense>
      <SearchBar suggestions={suggestions} onSearch={handleSearch} onSelect={handleSelectCity} />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <Overlay restaurant={selected} onContinue={() => alert("Continuer")} />
    </main>
  );
}
