import { useState } from "react";
import type { City } from "../../types";
import styles from "./SuggestionList.module.css";

type Props = {
  items: City[];
  onSelect: (city: City) => void;
};

export function SuggestionList({ items, onSelect }: Props) {
  const [active, setActive] = useState(0);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      onSelect(items[active]);
    }
  }

  return (
    <ul className={styles.list} role="listbox" onKeyDown={handleKey} tabIndex={0}>
      {items.map((city, i) => (
        <li
          key={city.id}
          role="option"
          aria-selected={i === active}
          className={i === active ? styles.active : styles.item}
          onClick={() => onSelect(city)}
          onMouseEnter={() => setActive(i)}
        >
          {city.displayName}
        </li>
      ))}
    </ul>
  );
}
