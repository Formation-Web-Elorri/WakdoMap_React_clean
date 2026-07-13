export type City = {
  id: number;
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  bbox: [number, number, number, number];
};

export type Restaurant = {
  id: number;
  name: string;
  address: string;
  lat: number;
  lon: number;
};
