import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';

export default function MapView() {
  useEffect(() => {
    const map = new maplibregl.Map({
      container: 'map',
      style: 'https://demotiles.maplibre.org/style.json',
      center: [-49.27, -25.43],
      zoom: 12
    });

    return () => map.remove();
  }, []);

  return <div id="map" style={{ height: '400px' }} />;
}