import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { City, Restaurant } from "../../types";
import { RestaurantMarker } from "./RestaurantMarker";
import { ZoomControl } from "./ZoomControl";
import styles from "./Map.module.css";

// Correction des icônes Leaflet avec Vite
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

function Recenter({ city }: { city: City | null }) {
  const map = useMap();
  useEffect(() => {
    if (city) map.setView([city.lat, city.lon], 13);
  }, [city, map]);
  return null;
}

type Props = {
  city: City | null;
  restaurants: Restaurant[];
  onChoose: (r: Restaurant) => void;
};

export function Map({ city, restaurants, onChoose }: Props) {
  return (
    <MapContainer
      className={styles.map}
      center={[45.4397, 4.3872]}
      zoom={13}
      zoomControl={false}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl />
      <Recenter city={city} />
      {restaurants.map((r) => (
        <RestaurantMarker key={r.id} restaurant={r} onChoose={onChoose} />
      ))}
    </MapContainer>
  );
}
