import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import searchCep from "../services/seachCep";

const userTypes = [
  "ROOT",
  "ADMIN",
  "NOTARYBOSS",
  "TECHNICAL",
  "LOGISTICS",
  "DRIVER",
  "TRAINEE",
];

function createInitialForm() {
  return {
    name: "",
    email: "",
    phone: "",
    userType: "ADMIN",
    streetNumber: "",
    complement: "",
    notaryOfficeId: "",
    address: {
      zipCode: "",
      street: "",
      neighborhood: "",
      city: "",
      state: "",
      country: "Brasil",
    },
    auth: {
      password: "",
    },
  };
}

function mapUserToForm(item) {
  return {
    name: item.name ?? "",
    email: item.email ?? "",
    phone: item.phone ?? "",
    userType: item.userType ?? "ADMIN",
    streetNumber: item.streetNumber ?? "",
    complement: item.complement ?? "",
    notaryOfficeId: item.notaryOfficeId ?? "",
    address: {
      zipCode: item.Address?.zipCode ?? "",
      street: item.Address?.street ?? "",
      neighborhood: item.Address?.neighborhood ?? "",
      city: item.Address?.city ?? "",
      state: item.Address?.state ?? "",
      country: item.Address?.country ?? "Brasil",
    },
    auth: {
      password: "",
    },
  };
}

export default function Users({ onLogout, user }) {
  const [users, setUsers] = useState([]);
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
      const [usersRes, officesRes] = await Promise.all([
        api.get("/users"),
        api.get("/notary-offices"),
      ]);

      setUsers(usersRes.data);
      setNotaryOffices(officesRes.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Nao foi possivel carregar os usuarios.");
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

    function setAddressFromCep(cep) {
      if (cep < 8) {
        return;
      }
      searchCep(cep)
        .then((addressData) => {
          if (addressData) {
            setForm((current) => ({
              ...current,
              address: {
                street: addressData.street,
                neighborhood: addressData.neighborhood,
                city: addressData.city,
                state: addressData.state,
              },
            }));
          }
        })
        .catch((err) => {
          console.error("Erro ao buscar endereço pelo CEP:", err);
        });
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

  function handleEdit(item) {
    setEditingId(item.id);
    setForm(mapUserToForm(item));
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Deseja excluir o usuário "${item.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(item.id);
      setError("");
      setSuccess("");
      await api.delete(`/users/${item.id}`);

      if (editingId === item.id) {
        resetForm();
      }

      setSuccess("Usuário excluído com sucesso.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Nao foi possível excluir o usuario.",
      );
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
      const payload = {
        ...form,
        streetNumber: form.streetNumber ? Number(form.streetNumber) : null,
      };

      if (payload.userType === "ROOT") {
        delete payload.notaryOfficeId;
      }

      if (isEditing) {
        delete payload.auth;
        await api.patch(`/users/${editingId}`, payload);
        setSuccess("Usuário atualizado com sucesso.");
      } else {
        await api.post("/users", payload);
        setSuccess("Usuário cadastrado com sucesso.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.error ||
          "Nao foi possível salvar o usuario.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout
      title="Usuários"
      subtitle="Cadastro, edição e exclusão de usuários para operação do sistema."
      onLogout={onLogout}
      user={user}
    >
      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">{isEditing ? "Edição" : "Cadastro"}</p>
            <h3>{isEditing ? "Editar usuario" : "Novo usuario"}</h3>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Nome
            <input
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
            />
          </label>
          <label>
            E-mail
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </label>
          <label>
            Telefone
            <input
              required
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="11999999999"
            />
          </label>
          <label>
            Tipo
            <select
              value={form.userType}
              onChange={(event) => updateField("userType", event.target.value)}
            >
              {userTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          {!isEditing ? (
            <label>
              Senha
              <input
                required
                type="password"
                value={form.auth.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    auth: { password: event.target.value },
                  }))
                }
              />
            </label>
          ) : (
            <div className="form-note">
              A senha nao e alterada por esta tela durante a edição do usuario.
            </div>
          )}
          <label>
            Cartorio
            <select
              disabled={form.userType === "ROOT"}
              value={form.notaryOfficeId}
              onChange={(event) =>
                updateField("notaryOfficeId", event.target.value)
              }
            >
              <option value="">
                {form.userType === "ROOT" ? "Nao se aplica" : "Selecione"}
              </option>
              {notaryOffices.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.zone} - {office.name}
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

          <div className="form-actions">
            <button className="button primary" disabled={saving} type="submit">
              {saving
                ? "Salvando..."
                : isEditing
                  ? "Atualizar usuario"
                  : "Salvar usuario"}
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
            <h3>Usuarios cadastrados</h3>
          </div>
          <span className="badge">
            {loading ? "Carregando..." : users.length}
          </span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Tipo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.phone}</td>
                  <td>{item.userType}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="button secondary"
                        onClick={() => handleEdit(item)}
                        type="button"
                      >
                        Editar
                      </button>
                      <button
                        className="button danger"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item)}
                        type="button"
                      >
                        {deletingId === item.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 ? (
                <tr>
                  <td colSpan="5">Nenhum usuário cadastrado.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}
