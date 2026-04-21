import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RoutingMachine from "./RoutingMachine";

// Correção para os ícones do Leaflet no React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const OrionMap = ({ data = {} }) => {
  const { points = [], routes = [] } = data;

  // Centro aproximado de Araucária
  const position = [-25.594, -49.395];

  const routeColors = [
    "#000000",
    "#1E88E5",
    "#E53935",
    "#43A047",
    "#8E24AA",
    "#FB8C00",
    "#00ACC1",
    "#6D4C41",
    "#3949AB",
    "#D81B60",
    "#00897B",
  ];

  function getRouteColor(index) {
    return routeColors[index % routeColors.length];
  }

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* Renderização dos Pontos */}
      {points.map((point) => (
        <Marker
          key={point.id}
          position={[point.lat, point.lng]}
          icon={
            point.isTransmissionPoint
              ? new L.Icon({
                  ...DefaultIcon.options,
                  iconUrl:
                    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
                })
              : DefaultIcon
          }
        >
          <Popup>
            <strong>
              {point.name} |
              {point.isTransmissionPoint
                ? "Ponto de Transmissão"
                : "Local de Votação"}
            </strong>
            <br />
            Seções: {point.sections}
            <br />
            Eleitores: {point.voters}
          </Popup>
        </Marker>
      ))}

      {/* Renderização das Rotas Reais */}
      {routes.map((route, index) => (
        <RoutingMachine
          key={`route-${index}`}
          waypoints={route}
          color={getRouteColor(index)}
        />
      ))}
    </MapContainer>
  );
};

export default OrionMap;
