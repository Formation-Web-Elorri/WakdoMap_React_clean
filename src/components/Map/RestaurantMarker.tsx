import { Marker, Popup } from "react-leaflet";
import type { Restaurant } from "../../types";
import { Button } from "../Overlay/Button";

type Props = {
  restaurant: Restaurant;
  onChoose: (r: Restaurant) => void;
};

export function RestaurantMarker({ restaurant, onChoose }: Props) {
  return (
    <Marker position={[restaurant.lat, restaurant.lon]}>
      <Popup>
        <p style={{ margin: "0 0 8px", fontSize: 12 }}>{restaurant.address}</p>
        <Button onClick={() => onChoose(restaurant)}>choisir</Button>
      </Popup>
    </Marker>
  );
}
