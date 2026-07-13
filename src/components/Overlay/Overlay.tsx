import type { Restaurant } from "../../types";
import { Button } from "./Button";
import styles from "./Overlay.module.css";

type Props = {
  restaurant: Restaurant | null;
  onContinue: () => void;
};

export function Overlay({ restaurant, onContinue }: Props) {
  return (
    <div className={styles.overlay} role="region" aria-label="Restaurant sélectionné">
      {restaurant ? (
        <>
          <h2 className={styles.title}>Restaurant sélectionné</h2>
          <p className={styles.address}>{restaurant.address}</p>
          <Button onClick={onContinue}>Continuer</Button>
        </>
      ) : (
        <h2 className={styles.title}>Aucun restaurant sélectionné</h2>
      )}
    </div>
  );
}
