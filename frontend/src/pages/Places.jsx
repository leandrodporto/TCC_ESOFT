import api from '../services/api';

async function Places() {
  const getPlaces = await api.get('/voting-places').data;
console.log(getPlaces);
  return (
    <div>
      <h1>Places</h1>
    </div>
  );
}

export default Places;