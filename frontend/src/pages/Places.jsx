import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import getCord from "../services/getCord";
import searchCep from "../services/seachCep";

function createInitialForm() {
  return {
    code: "",
    name: "",
    streetNumber: "",
    complement: "",
    sections: "",
    voters: "",
    municipalityId: "",
    notaryOfficeId: "",
    lng: null,
    lat: null,
    transmitToVotingPlaceId: null,
    transmitToNotaryOfficeId: null,
    isTransmissionPoint: false,
    transmissionOperator: "",
    transmissionPointKit: "",
    transmissionPointKitPassword: "",
    address: {
      city: "",
      street: "",
      state: "",
      zipCode: "",
      neighborhood: "",
      country: "Brasil",
    },
  };
}

function mapPlaceToForm(place) {
  return {
    code: place.code ?? "",
    name: place.name ?? "",
    streetNumber: place.streetNumber ?? "",
    complement: place.complement ?? "",
    sections: Array.isArray(place.sections) ? place.sections.join(", ") : "",
    voters: place.voters ?? "",
    municipalityId: place.municipalityId ?? "",
    notaryOfficeId: place.notaryOfficeId ?? "",
    lat: place.lat ?? null,
    lng: place.lng ?? null,
    address: {
      city: place.Address?.city ?? "",
      street: place.Address?.street ?? "",
      state: place.Address?.state ?? "",
      zipCode: place.Address?.zipCode ?? "",
      neighborhood: place.Address?.neighborhood ?? "",
      country: place.Address?.country ?? "Brasil",
    },
    transmitToVotingPlaceId: place.transmitToVotingPlaceId ?? null,
    transmitToNotaryOfficeId: place.transmitToNotaryOfficeId ?? null,
    isTransmissionPoint: place.isTransmissionPoint ?? false,
    transmissionOperator: place.transmissionOperator ?? "",
    transmissionPointKit: place.transmissionPointKit ?? "",
    transmissionPointKitPassword: place.transmissionPointKitPassword ?? "",
  };
}

export default function Places({ onLogout, user }) {
  const [places, setPlaces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [notaryOffices, setNotaryOffices] = useState([]);
  const [form, setForm] = useState(() => createInitialForm());
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isEditing = editingId !== null;

  async function loadData() {
    try {
      setLoading(true);
      const [placesRes, municipalitiesRes, notaryOfficesRes] =
        await Promise.all([
          api.get("/voting-places"),
          api.get("/municipalities"),
          api.get("/notary-offices"),
        ]);

      setPlaces(placesRes.data);
      setMunicipalities(municipalitiesRes.data);
      setNotaryOffices(notaryOfficesRes.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Nao foi possível carregar os locais de votação.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addCoordinatesToForm(event) {
    event.preventDefault();
    setError("");

    try {
      const fullAddress = [
        form.address.street,
        form.streetNumber,
        form.address.neighborhood,
        form.address.city,
        form.address.state,
        form.address.country,
      ]
        .filter(Boolean)
        .join(", ");

      const coords = await getCord(fullAddress);

      if (!coords) {
        setError("Nao foi possível obter coordenadas para o endereço informado.");
        return;
      }

      const nextForm = {
        ...form,
        lat: coords.lat,
        lng: coords.lng,
      };

      setForm(nextForm);
      await handleSubmit(nextForm);
    } catch (err) {
      console.error("Erro ao obter coordenadas:", err);
      setError("Nao foi possível obter coordenadas para o endereço informado.");
    }
  }

 async function setAddressFromCep(cep) {
    if (cep < 8) {
      return;
    }
   await searchCep(cep)
      .then((addressData) => {
        if (addressData) {
          setForm((current) => ({
            ...current,
            address: {
              street: addressData.street,
              neighborhood: addressData.neighborhood,
              city: addressData.city,
              state: addressData.state,
              zipCode: addressData.zipCode,
              country: addressData.country,
            },
          }));
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar endereço pelo CEP:", err);
      });
  }

  function resetForm() {
    setEditingId(null);
    setForm(createInitialForm());
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateAddressField(field, value) {
    setForm((current) => ({
      ...current,
      address: {
        ...current.address,
        [field]: value,
      },
    }));

    if (field === "zipCode" && value.replace(/\D/g, "").length === 8) {
      setAddressFromCep(value.replace(/\D/g, ""));
    }
  }

  function handleEdit(place) {
    setEditingId(place.id);
    setForm(mapPlaceToForm(place));
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(place) {
    const confirmed = window.confirm(`Deseja excluir o local "${place.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(place.id);
      setError("");
      setSuccess("");
      await api.delete(`/voting-places/${place.id}`);

      if (editingId === place.id) {
        resetForm();
      }

      setSuccess("Local de votação excluído com sucesso.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Nao foi possível excluir o local de votação.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSubmit(formData = form) {
    setSaving(true);
    setError("");
    setSuccess("");
  console.log(formData.address);
    try {
      const payload = {
        ...formData,
        code: Number(formData.code),
        streetNumber: formData.streetNumber ? Number(formData.streetNumber) : null,
        voters: Number(formData.voters),
        sections: formData.sections
          .split(",")
          .map((section) => section.trim())
          .filter(Boolean),
      };

      if (isEditing) {
        await api.put(`/voting-places/${editingId}`, payload);
        setSuccess("Local de votação atualizado com sucesso.");
      } else {
        await api.post("/voting-places", payload);
        setSuccess("Local de votação cadastrado com sucesso.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Nao foi possível salvar o local de votação.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout
      title="Locais de Votação"
      subtitle="Cadastro, edição e exclusão de locais com vínculo a municípios e cartórios."
      onLogout={onLogout}
      user={user}
    >
      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">{isEditing ? "Edição" : "Cadastro"}</p>
            <h3>{isEditing ? "Editar local" : "Novo local"}</h3>
          </div>
        </div>

        <form className="form-grid" onSubmit={addCoordinatesToForm}>
          <label>
            Código
            <input
              required
              type="number"
              value={form.code}
              onChange={(event) => updateField("code", event.target.value)}
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.isTransmissionPoint}
              onChange={(event) =>
                updateField("isTransmissionPoint", event.target.checked)
              }
            />
            Será um Ponto de Transmissão (JE Connect)?
          </label>

          <label>
            Nome
            <input
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
            />
          </label>
          <label>
            Quantidade de Eleitores
            <input
              placeholder="1524"
              required
              type="number"
              value={form.voters}
              onChange={(event) => updateField("voters", event.target.value)}
            />
          </label>
          <label>
            Seções
            <input
              required
              value={form.sections}
              onChange={(event) => updateField("sections", event.target.value)}
              placeholder="101, 102, 103"
            />
          </label>
          <label>
            Cartório
            <select
              required
              value={form.notaryOfficeId}
              onChange={(event) =>
                updateField("notaryOfficeId", event.target.value)
              }
            >
              <option value="">Selecione</option>
              {notaryOffices.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.zone} - {office.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Município
            <select
              required
              value={form.municipalityId}
              onChange={(event) =>
                updateField("municipalityId", event.target.value)
              }
            >
              <option value="">Selecione</option>
              {municipalities.map((municipality) => (
                <option key={municipality.id} value={municipality.id}>
                  {municipality.code} - {municipality.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            CEP
            <input
              required
              value={form.address.zipCode}
              onChange={(event) =>
                updateAddressField("zipCode", event.target.value)
              }
            />
          </label>

          <label>
            Rua
            <input
              required
              value={form.address.street}
              onChange={(event) =>
                updateAddressField("street", event.target.value)
              }
            />
          </label>

          <label>
            Número
            <input
              type="number"
              value={form.streetNumber}
              onChange={(event) =>
                updateField("streetNumber", event.target.value)
              }
            />
          </label>
          <label>
            Complemento
            <input
              value={form.complement}
              onChange={(event) =>
                updateField("complement", event.target.value)
              }
            />
          </label>

          <label>
            Bairro
            <input
              required
              value={form.address.neighborhood}
              onChange={(event) =>
                updateAddressField("neighborhood", event.target.value)
              }
            />
          </label>
          <label>
            Cidade
            <input
              required
              value={form.address.city}
              onChange={(event) =>
                updateAddressField("city", event.target.value)
              }
            />
          </label>
          <label>
            Estado
            <input
              required
              value={form.address.state}
              onChange={(event) =>
                updateAddressField("state", event.target.value)
              }
            />
          </label>
          <label>
            Pais
            <input
              required
              value={form.address.country}
              onChange={(event) =>
                updateAddressField("country", event.target.value)
              }
            />
          </label>

          <label>
            Operador(a) de transmissão
            <input
              value={form.transmissionOperator}
              onChange={(event) =>
                updateField("transmissionOperator", event.target.value)
              }
              disabled={!form.isTransmissionPoint}
            />
          </label>
          <label>
            ID Kit de transmissão
            <input
              type="text"
              value={form.transmissionPointKit}
              onChange={(event) =>
                updateField("transmissionPointKit", event.target.value)
              }
              disabled={!form.isTransmissionPoint}
            />
          </label>
          <label>
            Senha do kit de transmissão
            <input
              type="text"
              value={form.transmissionPointKitPassword}
              onChange={(event) =>
                updateField("transmissionPointKitPassword", event.target.value)
              }
              disabled={!form.isTransmissionPoint}
            />
          </label>

          <div className="form-actions">
            <button className="button primary" disabled={saving} type="submit">
              {saving
                ? "Salvando..."
                : isEditing
                  ? "Atualizar local"
                  : "Salvar local"}
            </button>
            {isEditing ? (
              <button
                className="button secondary"
                onClick={resetForm}
                type="button"
              >
                Cancelar edição
              </button>
            ) : null}
          </div>
        </form>

        {error ? <div className="alert error">{error}</div> : null}
        {success ? <div className="alert success">{success}</div> : null}
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Lista</p>
            <h3>Locais cadastrados</h3>
          </div>
          <span className="badge">
            {loading ? "Carregando..." : places.length}
          </span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Eleitores</th>
                <th>Seções</th>
                <th>Ponto de Transmissão</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {places.map((place) => (
                <tr key={place.id}>
                  <td>{place.code}</td>
                  <td>{place.name}</td>
                  <td>{place.voters}</td>
                  <td>{place.sections ? place.sections.join(", ") : "-"}</td>
                  <td>{place.isTransmissionPoint ? "✅ Sim" : "❌ Não"}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="button secondary"
                        onClick={() => handleEdit(place)}
                        type="button"
                      >
                        Editar
                      </button>
                      <button
                        className="button danger"
                        disabled={deletingId === place.id}
                        onClick={() => handleDelete(place)}
                        type="button"
                      >
                        {deletingId === place.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && places.length === 0 ? (
                <tr>
                  <td colSpan="6">Nenhum local cadastrado.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}
