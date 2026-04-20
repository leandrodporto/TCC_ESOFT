import { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";

const RoutingMachine = ({ waypoints, color }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !waypoints) return;

    const routingControl = L.Routing.control({
      waypoints: waypoints.map((w) => L.latLng(w.lat, w.lng)),
      lineOptions: {
        styles: [{ color: color, weight: 5, opacity: 0.7 }],
      },
      show: false, // Esconde o painel de instruções de texto
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,
      createMarker: () => null, // Não cria marcadores duplicados
    }).addTo(map);

    const container =
      routingControl.getContainer?.() ?? routingControl._container;
    if (container) {
      container.style.display = "none";
    }

    return () => map.removeControl(routingControl);
  }, [map, waypoints, color]);

  return null;
};

export default RoutingMachine;
