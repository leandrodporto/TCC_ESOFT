import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import OrionMap from "../components/OrionMap";
import api from "../services/api";
import { Loading } from "../components/Loading";

function normalizeRouteData(routerData) {
  if (!Array.isArray(routerData)) {
    return [];
  }

  const normalized = [];

  for (const point of routerData) {
    if (!point?.id) {
      continue;
    }

    const lastPoint = normalized[normalized.length - 1];
    if (lastPoint?.id === point.id) {
      continue;
    }

    normalized.push(point);
  }

  if (normalized.length > 1) {
    const firstPoint = normalized[0];
    const lastPoint = normalized[normalized.length - 1];

    if (firstPoint.id === lastPoint.id) {
      normalized.pop();
    }
  }

  return normalized;
}

function buildMapData(routes) {
  const pointsById = new Map();

  for (const route of routes) {
    for (const point of route.routerData ?? []) {
      if (point?.id && !pointsById.has(point.id)) {
        pointsById.set(point.id, point);
      }
    }
  }

  return {
    points: Array.from(pointsById.values()),
    routes: routes.map((route) => route.routerData ?? []),
  };
}

export default function Routers({ onLogout, user }) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingRoute, setLoadingRoute] = useState(false);


  const calculateRoute = async (route) => {
    try {
      const response = await api.post("/routers", route);
      setLoadingRoute(true);
     if (response.status === 201) {
        setError("");
        const fetchResponse = await api.get("/routers");
        setLoadingRoute(true);
        const nextRoutes = Array.isArray(fetchResponse.data)
          ? fetchResponse.data.map((route) => ({
              ...route,
              routerData: normalizeRouteData(route.routerData),
            }))
          : [];

          setLoadingRoute(false);
        setRoutes(nextRoutes);
      } else {
        setError("Nao foi possível calcular a rota.");
      }
    } catch (fetchError) {
      console.error("Error calculating route:", fetchError);
      setError("Nao foi possível calcular a rota.");
    }
  };

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await api.get("/routers");
        const nextRoutes = Array.isArray(response.data)
          ? response.data.map((route) => ({
              ...route,
              routerData: normalizeRouteData(route.routerData),
            }))
          : [];

        setRoutes(nextRoutes);
        setError("");
      } catch (fetchError) {
        console.error("Error fetching routes:", fetchError);
        setError("Nao foi possível carregar as rotas.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const totalWaypoints = routes.reduce(
    (total, route) => total + (route.routerData?.length ?? 0),
    0,
  );

  const transmissionPoints = routes.reduce((total, route) => {
    return (
      total +
      new Set(
        (route.routerData ?? [])
          .filter((point) => point?.isTransmissionPoint)
          .map((point) => point.id),
      ).size
    );
  }, 0);

  const mapData = buildMapData(routes);

  return (
    <Layout
      title="Rotas"
      subtitle="Geração e visualização de rotas para os veículos."
      onLogout={onLogout}
      user={user}
      loading={loadingRoute}
    >
      <section className="hero-card">
        <div className="hero-copy">
          <h2>Resumo das rotas calculadas</h2>
        </div>
        <div className="hero-figure">
          <button className="button primary" onClick={() => calculateRoute()}>
            Recalcular rotas
          </button>
        </div>
      </section>     

      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-label">Rotas salvas</p>
          <strong>{routes.length}</strong>
        </article>
        <article className="stat-card">
          <p className="stat-label">Pontos exibidos</p>
          <strong>{totalWaypoints}</strong>
        </article>
        <article className="stat-card">
          <p className="stat-label">Pontos de transmissão</p>
          <strong>{transmissionPoints}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="section-header">
          <h3>Mapa das rotas</h3>
          <span className="badge">{mapData.routes.length} trajetos</span>
        </div>

        <div
          style={{
            height: "70vh",
            minHeight: "520px",
            borderRadius: "22px",
            overflow: "hidden",
          }}
        >
          <OrionMap data={mapData} />
        </div>
      </section>

      {error ? <section className="alert error">{error}</section> : null}

      {!loading && !error && routes.length === 0 ? (
        <section className="panel">Nenhuma rota encontrada.</section>
      ) : null}

    </Layout>
  );
}
