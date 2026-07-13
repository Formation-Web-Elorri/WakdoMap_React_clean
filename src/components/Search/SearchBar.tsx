import { useState } from "react";
import type { City } from "../../types";
import { SuggestionList } from "./SuggestionList";
import styles from "./SearchBar.module.css";

type Props = {
  suggestions: City[];
  onSearch: (query: string) => void;
  onSelect: (city: City) => void;
};

export function SearchBar({ suggestions, onSearch, onSelect }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(value);
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit} role="search">
        <label htmlFor="city-search" className={styles.label}>
          Rechercher un restaurant
        </label>
        <input
          id="city-search"
          className={styles.input}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Saint Etienne"
          autoComplete="off"
        />
        <button type="submit" className={styles.searchBtn} aria-label="Rechercher">
          🔍
        </button>
      </form>
      {suggestions.length > 0 && (
        <SuggestionList
          items={suggestions}
          onSelect={(city) => {
            setValue(city.name);
            onSelect(city);
          }}
        />
      )}
    </div>
  );
}
