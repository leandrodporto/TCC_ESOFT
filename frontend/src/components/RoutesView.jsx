import api from "../services/api";
import { useState, useEffect } from "react";

export default function RoutesView() {
  const [routes, setRoutes] = useState([]);

  const fetchRoutes = async () => {
    try {
      const response = await api.get("/routes");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar rotas:", error);
      throw error;
    }
  };

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const routesData = await fetchRoutes();
        setRoutes(routesData);
      } catch (error) {
        console.error("Erro ao carregar rotas:", error);
      }
    };

    loadRoutes();
  }, []);

  return (
    <div>
      {routes.map((route) => (
        <div key={route.id}>
          <h3>Rota {route.id}</h3>
          <p>Origem: {route.origin}</p>
          <p>Destino: {route.destination}</p>
          <p>Distância: {route.distance} km</p>
        </div>
      ))}
    </div>
  );
}
