import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

function createInitialForm() {
  return {
    name: "",
    code: "",
    notaryOfficeId: "",
  };
}

function mapMunicipalityToForm(municipality) {
  return {
    name: municipality.name ?? "",
    code: municipality.code ?? "",
    notaryOfficeId: municipality.notaryOfficeId ?? "",
  };
}

export default function Municipalities({ onLogout, user }) {
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
      const [municipalitiesRes, notaryOfficesRes] = await Promise.all([
        api.get("/municipalities"),
        api.get("/notary-offices"),
      ]);

      setMunicipalities(municipalitiesRes.data);
      setNotaryOffices(notaryOfficesRes.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Nao foi possível carregar os municípios.");
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

  function handleEdit(municipality) {
    setEditingId(municipality.id);
    setForm(mapMunicipalityToForm(municipality));
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(municipality) {
    const confirmed = window.confirm(
      `Deseja excluir o município "${municipality.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(municipality.id);
      setError("");
      setSuccess("");
      await api.delete(`/municipalities/${municipality.id}`);

      if (editingId === municipality.id) {
        resetForm();
      }

      setSuccess("Município excluído com sucesso.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Nao foi possível excluir o município.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (isEditing) {
        await api.put(`/municipalities/${editingId}`, form);
        setSuccess("Município atualizado com sucesso.");
      } else {
        await api.post("/municipalities", form);
        setSuccess("Município cadastrado com sucesso.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Nao foi possível salvar o município.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout
      title="Municípios"
      subtitle="Cadastro, edição e vinculação de municípios a cartórios eleitorais."
      onLogout={onLogout}
      user={user}
    >
      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">{isEditing ? "Edicao" : "Cadastro"}</p>
            <h3>{isEditing ? "Editar município" : "Novo município"}</h3>
          </div>
        </div>

        <form className="form-grid compact" onSubmit={handleSubmit}>
          <label>
            Nome
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </label>
          <label>
            Codigo
            <input
              required
              value={form.code}
              onChange={(event) =>
                setForm((current) => ({ ...current, code: event.target.value }))
              }
            />
          </label>
          <label>
            Cartorio
            <select
              required
              value={form.notaryOfficeId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  notaryOfficeId: event.target.value,
                }))
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

          <div className="form-actions">
            <button className="button primary" disabled={saving} type="submit">
              {saving
                ? "Salvando..."
                : isEditing
                  ? "Atualizar município"
                  : "Salvar município"}
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
            <h3>Municípios cadastrados</h3>
          </div>
          <span className="badge">
            {loading ? "Carregando..." : municipalities.length}
          </span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Nome</th>
                <th>Cartorio</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {municipalities.map((municipality) => {
                const office = notaryOffices.find(
                  (item) => item.id === municipality.notaryOfficeId
                );

                return (
                  <tr key={municipality.id}>
                    <td>{municipality.code}</td>
                    <td>{municipality.name}</td>
                    <td>{office ? `${office.zone} - ${office.name}` : "-"}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="button secondary"
                          onClick={() => handleEdit(municipality)}
                          type="button"
                        >
                          Editar
                        </button>
                        <button
                          className="button danger"
                          disabled={deletingId === municipality.id}
                          onClick={() => handleDelete(municipality)}
                          type="button"
                        >
                          {deletingId === municipality.id
                            ? "Excluindo..."
                            : "Excluir"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && municipalities.length === 0 ? (
                <tr>
                  <td colSpan="4">Nenhum município cadastrado.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}
