import "dotenv/config";
import haversineNPM from "haversine";
import prisma from "../lib/prisma.js";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_DAILY_LIMIT = Number(process.env.GOOGLE_DAILY_LIMIT ?? 300);
const AVERAGE_SPEED_KMH = 40;

const MAX_ORIGINS_PER_BATCH = 10;
const MAX_DESTINATIONS_PER_BATCH = 10;
const DEFAULT_MAX_POINTS_PER_ROUTE = 10;

const DEFAULT_WEIGHTS = {
  sections: 0.5,
  voters: 0.3,
  time: 0.2,
};

function createRoutingContext() {
  return {
    googleCallCount: 0,
    distanceCache: new Map(),
  };
}

function countSections(sections) {
  if (!Array.isArray(sections)) {
    return 0;
  }

  return sections.reduce((total, section) => {
    return total + String(section).trim().split(/\s+/).filter(Boolean).length;
  }, 0);
}

function mapPoint(entity, prefix) {
  return {
    id: `${prefix}-${entity.id}`,
    name: entity.name,
    lat: entity.lat,
    lng: entity.lng,
    sections: countSections(entity.sections),
    voters: entity.voters ?? 0,
    isTransmissionPoint: Boolean(entity.isTransmissionPoint),
  };
}

async function loadPoints() {
  const [votingPlaces, notaryOffices] = await Promise.all([
    prisma.votingPlace.findMany(),
    prisma.notaryOffice.findMany(),
  ]);

  return [
    ...votingPlaces.map((item) => mapPoint(item, "vp")),
    ...notaryOffices.map((item) => mapPoint(item, "no")),
  ];
}

function isValidPoint(point) {
  return (
    point != null &&
    point.lat != null &&
    point.lng != null &&
    Number.isFinite(Number(point.lat)) &&
    Number.isFinite(Number(point.lng))
  );
}

function normalize(value, max) {
  return max === 0 ? 0 : value / max;
}

function chunkArray(array, size) {
  const chunks = [];

  for (let index = 0; index < array.length; index += size) {
    chunks.push(array.slice(index, index + size));
  }

  return chunks;
}

function buildCacheKey(origin, destination) {
  if (!isValidPoint(origin) || !isValidPoint(destination)) {
    return null;
  }

  return `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}`;
}

function canUseGoogle(context) {
  return (
    Boolean(GOOGLE_API_KEY) && context.googleCallCount < GOOGLE_DAILY_LIMIT
  );
}

function haversineDistanceKm(origin, destination) {
  if (!isValidPoint(origin) || !isValidPoint(destination)) {
    return null;
  }

  return haversineNPM(
    {
      latitude: origin.lat,
      longitude: origin.lng,
    },
    {
      latitude: destination.lat,
      longitude: destination.lng,
    },
    { unit: "km" },
  );
}

async function fetchDistanceMatrixBatch(origins, destinations, context) {
  if (
    !canUseGoogle(context) ||
    origins.length === 0 ||
    destinations.length === 0
  ) {
    return;
  }

  const originsStr = origins
    .map((point) => `${point.lat},${point.lng}`)
    .join("|");
  const destinationsStr = destinations
    .map((point) => `${point.lat},${point.lng}`)
    .join("|");

  const url =
    "https://maps.googleapis.com/maps/api/distancematrix/json" +
    `?origins=${originsStr}&destinations=${destinationsStr}&key=${GOOGLE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  console.log(data);

  context.googleCallCount += 1;

  for (let originIndex = 0; originIndex < origins.length; originIndex += 1) {
    for (
      let destinationIndex = 0;
      destinationIndex < destinations.length;
      destinationIndex += 1
    ) {
      const duration =
        data.rows?.[originIndex]?.elements?.[destinationIndex]?.duration?.value;
      const key = buildCacheKey(
        origins[originIndex],
        destinations[destinationIndex],
      );

      if (duration && key) {
        context.distanceCache.set(key, duration);
      }
    }
  }
}

async function preloadDistanceMatrix(points, context) {
  const validPoints = points.filter(isValidPoint);
  const originChunks = chunkArray(validPoints, MAX_ORIGINS_PER_BATCH);
  const destinationChunks = chunkArray(validPoints, MAX_DESTINATIONS_PER_BATCH);

  for (const origins of originChunks) {
    for (const destinations of destinationChunks) {
      if (!canUseGoogle(context)) {
        return;
      }

      await fetchDistanceMatrixBatch(origins, destinations, context);
    }
  }
}

async function getOsrmDuration(origin, destination) {
  if (!isValidPoint(origin) || !isValidPoint(destination)) {
    return null;
  }

  const url =
    "https://router.project-osrm.org/route/v1/driving/" +
    `${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`;

  const response = await fetch(url);
  const data = await response.json();

  return data.routes?.[0]?.duration ?? null;
}

async function getTravelTime(origin, destination, context) {
  const key = buildCacheKey(origin, destination);

  if (key && context.distanceCache.has(key)) {
    return context.distanceCache.get(key);
  }

  try {
    const osrmDuration = await getOsrmDuration(origin, destination);
    if (osrmDuration != null) {
      return osrmDuration;
    }
  } catch {
    // Falls back to haversine when OSRM is unavailable.
  }

  const distanceKm = haversineDistanceKm(origin, destination);
  if (distanceKm == null) {
    return Number.POSITIVE_INFINITY;
  }

  return (distanceKm / AVERAGE_SPEED_KMH) * 3600;
}

// =====================
// CLUSTERING (Com Balanceamento de Carga)
// =====================
function clusterByFixedCenters(points) {
  const centroids = points.filter((p) => p.isTransmissionPoint);
  const regularPoints = points.filter((p) => !p.isTransmissionPoint);
  if (centroids.length === 0) return []; // Retorno de segurança
  const clusters = centroids.map((c) => ({
    centroid: c,
    points: [],
  }));
  // 1. Define o limite dinâmico de capacidade.
  // Ex: Média + 30% de margem de tolerância.
  const idealAverage = regularPoints.length / centroids.length;
  const maxCapacityPerCluster = Math.ceil(idealAverage * 1.3);
  for (const point of regularPoints) {
    // 2. Calcula a distância deste ponto para todos os clusters possíveis
    const distances = clusters.map((cluster) => {
      return {
        cluster: cluster,
        distance: haversineDistanceKm(point, cluster.centroid),
      };
    });
    // 3. Ordena os clusters do mais perto para o mais longe
    distances.sort((a, b) => a.distance - b.distance);
    // 4. Tenta alocar no cluster mais próximo que AINDA NÃO estourou a capacidade
    let selectedClusterInfo = distances.find(
      (c) => c.cluster.points.length < maxCapacityPerCluster,
    );
    // 5. Fallback: Se todos estouraram a margem (raro, mas possível dependendo da geografia),
    // aloca forçadamente no cluster absolutamente mais próximo para não ignorar o ponto.
    if (!selectedClusterInfo) {
      selectedClusterInfo = distances[0];
    }

    selectedClusterInfo.cluster.points.push(point);
  }

  return clusters;
}

function splitClusterIntoRoutes(
  cluster,
  maxPointsPerRoute = DEFAULT_MAX_POINTS_PER_ROUTE,
) {
  const routes = [];

  for (
    let index = 0;
    index < cluster.points.length;
    index += maxPointsPerRoute
  ) {
    routes.push({
      centroid: cluster.centroid,
      points: cluster.points.slice(index, index + maxPointsPerRoute),
    });
  }

  return routes;
}

function getLimits(points) {
  if (points.length === 0) {
    return {
      maxSections: 0,
      maxVoters: 0,
      maxTime: 7200,
    };
  }

  return {
    maxSections: Math.max(...points.map((point) => point.sections ?? 0)),
    maxVoters: Math.max(...points.map((point) => point.voters ?? 0)),
    maxTime: 7200,
  };
}

// =====================
// SCORE (Otimizado para Seções e Transmissão)
// =====================
async function calculateScore(
  candidate,
  current,
  centroid,
  limits,
  weights,
  context,
) {
  // <-- Adicionado 'context' aqui
  // 1. Tempo de viagem do ponto atual até o próximo local
  const travelTime = await getTravelTime(current, candidate, context); // <-- Repassando 'context'

  // 2. NOVO: Tempo do próximo local até o ponto de transmissão final
  const timeToTransmission = await getTravelTime(candidate, centroid, context); // <-- Repassando 'context'

  const normalizedTime = normalize(travelTime, limits.maxTime);
  const normalizedReturnTime = normalize(timeToTransmission, limits.maxTime);
  const normalizedSections = normalize(candidate.sections, limits.maxSections);
  const normalizedVoters = normalize(candidate.voters, limits.maxVoters);

  // A fórmula recompensa locais com muitas seções (+)
  // e penaliza caminhos demorados (-) e que se afastam do polo de transmissão (-)
  return (
    weights.sections * normalizedSections +
    weights.voters * normalizedVoters -
    weights.time * normalizedTime -
    weights.returnTime * normalizedReturnTime
  );
}

// =====================
// ROUTE BUILD
// =====================
async function buildRoute(cluster, context) {
  // <-- Adicionado 'context' aqui
  const { centroid, points } = cluster;

  // NOVO BALANCEAMENTO DE PESOS:
  // 45% Importância para quantidade de seções
  // 35% Importância para o tempo de deslocamento imediato
  // 15% Importância para se aproximar do ponto de transmissão
  // 05% Importância para quantidade de eleitores
  const weights = {
    sections: 0.45,
    time: 0.35,
    returnTime: 0.15,
    voters: 0.05,
  };

  const limits = {
    maxSections: Math.max(...points.map((p) => p.sections)),
    maxVoters: Math.max(...points.map((p) => p.voters)),
    maxTime: 7200, // 2 horas de limite máximo considerado tolerável
  };

  const unvisited = [...points];
  const route = [centroid];

  let current = centroid;

  while (unvisited.length) {
    let best = null;
    let bestScore = -Infinity;

    for (const candidate of unvisited) {
      // Repassando o context para a função de cálculo
      const score = await calculateScore(
        candidate,
        current,
        centroid,
        limits,
        weights,
        context,
      ); // <-- Repassando 'context' aqui

      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }

    route.push(best);
    current = best;

    unvisited.splice(unvisited.indexOf(best), 1);
  }

  // O veículo retorna ao centro de transmissão para entregar as mídias
  route.push(centroid);
  return route;
}

async function generateRoutes(points) {
  const context = createRoutingContext();
  const clusters = await clusterByFixedCenters(points);
  const allRoutes = [];

  for (const cluster of clusters) {
    const subRoutes = splitClusterIntoRoutes(cluster);

    for (const subRoute of subRoutes) {
      const matrixPoints = [subRoute.centroid, ...subRoute.points];
      await preloadDistanceMatrix(matrixPoints, context);

      const route = await buildRoute(subRoute, context);
      allRoutes.push(route);
    }
  }

  return allRoutes;
}

export default async function calculateRouterService() {
  const points = await loadPoints();
  return await generateRoutes(points);
}
