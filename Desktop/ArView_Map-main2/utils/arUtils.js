// DİKKAT: Import yolu güncellendi
import { EARTH_RADIUS } from '../constants';

export const latLonToMercator = (latDeg, lonDeg) => {
  const lonRad = (lonDeg * Math.PI) / 180;
  const latRad = (latDeg * Math.PI) / 180;
  const x = EARTH_RADIUS * lonRad;
  const z = EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  return { x, z };
};
