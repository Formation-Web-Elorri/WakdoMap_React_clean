import { useMap } from "react-leaflet";
import styles from "./ZoomControl.module.css";

export function ZoomControl() {
  const map = useMap();
  return (
    <div className={styles.zoom}>
      <button
        type="button"
        className={styles.btn}
        aria-label="Zoom avant"
        onClick={() => map.zoomIn()}
      >
        +
      </button>
      <button
        type="button"
        className={styles.btn}
        aria-label="Zoom arrière"
        onClick={() => map.zoomOut()}
      >
        −
      </button>
    </div>
  );
}
