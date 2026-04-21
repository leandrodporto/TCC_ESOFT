import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import searchCep from "../services/seachCep";
import getCord from "../services/getCord";

function createInitialForm() {
  return {
    zone: "",
    name: "",
    phone: "",
    streetNumber: "",
    complement: "",
    isTransmissionPoint: false,
    lng: null,
    lat: null,
    address: {
      zipCode: "",
      street: "",
      neighborhood: "",
      city: "",
      state: "",
      country: "Brasil",
    },
  };
}

function mapOfficeToForm(office) {
  return {
    zone: office.zone ?? "",
    name: office.name ?? "",
    phone: office.phone ?? "",
    streetNumber: office.streetNumber ?? "",
    complement: office.complement ?? "",
    isTransmissionPoint: office.isTransmissionPoint ?? false,
    lng: office.lng ?? null,
    lat: office.lat ?? null,
    address: {
      zipCode: office.Address?.zipCode ?? "",
      street: office.Address?.street ?? "",
      neighborhood: office.Address?.neighborhood ?? "",
      city: office.Address?.city ?? "",
      state: office.Address?.state ?? "",
      country: office.Address?.country ?? "Brasil",
    },
  };
}

export default function NotaryOffices({ onLogout, user }) {
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
      const response = await api.get("/notary-offices");
      setNotaryOffices(response.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Nao foi possível carregar os cartórios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(createInitialForm());
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function updateAddressField(field, value) {
    setForm((current) => ({
      ...current,
      address: {
        ...current.address,
        [field]: value,
      },
    }));

    await setAddressFromCep(
      field === "zipCode" ? value.replace(/\D/g, "") : form.address.zipCode,
    );
  }

  function handleEdit(office) {
    setEditingId(office.id.toString());
    setForm(mapOfficeToForm(office));
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(office) {
    const confirmed = window.confirm(
      `Deseja excluir o cartório "${office.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(office.id.toString());
      setError("");
      setSuccess("");
      await api.delete(`/notary-offices/${office.id}`);

      if (editingId === office.id.toString()) {
        resetForm();
      }

      setSuccess("Cartório excluído com sucesso.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Nao foi possível excluir o cartório.");
    } finally {
      setDeletingId(null);
    }
  }

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
        setError(
          "Nao foi possível obter coordenadas para o endereço informado.",
        );
        return;
      }

      const nextForm = {
        ...form,
        lat: coords.lat,
        lng: coords.lng,
      };

      console.log(nextForm);

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
              country: addressData.country,
              zipCode: cep,
            },
          }));
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar endereço pelo CEP:", err);
      });
  }

  async function handleSubmit(formData = form) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...formData,
        streetNumber: formData.streetNumber ? Number(formData.streetNumber) : null,
        isTransmissionPoint: formData.isTransmissionPoint,
      }; 

      if (isEditing) {
        await api.patch(`/notary-offices/${editingId}`, payload);
        setSuccess("Cartório atualizado com sucesso.");
      } else {
        await api.post("/notary-offices", payload);
        setSuccess("Cartório cadastrado com sucesso.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Nao foi possível salvar o cartório.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout
      title="Cartórios"
      subtitle="Cadastro, edição e exclusão de cartórios eleitorais."
      onLogout={onLogout}
      user={user}
    >
      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">{isEditing ? "Edição" : "Cadastro"}</p>
            <h3>{isEditing ? "Editar cartório" : "Novo cartório"}</h3>
          </div>
        </div>

        <form className="form-grid" onSubmit={addCoordinatesToForm}>
          <label>
            Zona
            <input
              required
              value={form.zone}
              onChange={(event) => updateField("zone", event.target.value)}
            />
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
            Telefone
            <input
              required
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
            />
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
            Numero
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

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.isTransmissionPoint}
              onChange={(event) =>
                updateField("isTransmissionPoint", event.target.checked)
              }
              className="transmission"
            />
            Será um Ponto de transmissão (JEConnect)?
          </label>

          <div className="form-actions">
            <button className="button primary" disabled={saving} type="submit">
              {saving
                ? "Salvando..."
                : isEditing
                  ? "Atualizar cartório"
                  : "Salvar cartório"}
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
            <h3>Cartórios cadastrados</h3>
          </div>
          <span className="badge">
            {loading ? "Carregando..." : notaryOffices.length}
          </span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Zona</th>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Cidade</th>
                <th>Ponto de Transmissão</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {notaryOffices.map((office) => (
                <tr key={office.id}>
                  <td>{office.zone}</td>
                  <td>{office.name}</td>
                  <td>{office.phone}</td>
                  <td>{office.Address?.city || "-"}</td>
                  <td>{office.isTransmissionPoint ? "✅ SIM" : "❌ NÃO"}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="button secondary"
                        onClick={() => handleEdit(office)}
                        type="button"
                      >
                        Editar
                      </button>
                      <button
                        className="button danger"
                        disabled={deletingId === office.id}
                        onClick={() => handleDelete(office)}
                        type="button"
                      >
                        {deletingId === office.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && notaryOffices.length === 0 ? (
                <tr>
                  <td colSpan="6">Nenhum cartório cadastrado.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}
