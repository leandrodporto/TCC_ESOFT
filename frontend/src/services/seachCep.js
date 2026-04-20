export default async function searchCep(cep) {

  const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  const data = await res.json(); 
  console.log(data);

  if (!data.erro) {
    return {
      street : data.logradouro,
      neighborhood : data.bairro,
      city: data.localidade,
      state: data.uf,
      zipCode: data.cep,
      country: "Brasil"
    };
  } else {
    const fallback = await fetch(`https://cep.awesomeapi.com.br/json/${cep}`);
    const fallbackData = await fallback.json();
    console.log(fallbackData);
    if (!fallbackData.erro) {
      return {
        street: fallbackData.address,
        neighborhood: fallbackData.district,
        city: fallbackData.city,
        state: fallbackData.state,
        zipCode: fallbackData.cep,
        country: "Brasil" 
      };
    }else {
      const fallbackTwo = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
      const fallbackData = await fallbackTwo.json();

      console.log(fallbackData);
      if (!fallbackData.erro) {
        return {
          street: fallbackData.street,
          neighborhood: fallbackData.neighborhood,
          city: fallbackData.city,
          state: fallbackData.state,
          zipCode: fallbackData.cep,
          country: "Brasil"
        };
      }

      return null;
    }
  }
};