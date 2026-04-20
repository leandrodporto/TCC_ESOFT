export default async function getCord(e) {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(e)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
  );

  const data = await res.json();
  const location = data.results?.[0]?.geometry?.location;

  if (!location) {
    return null;
  }

  return location;
}
