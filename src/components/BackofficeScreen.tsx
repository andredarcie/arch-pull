import { useState, useEffect, useCallback } from "react";

interface DailyCard {
  id?: string;
  kind: "pair" | "info";
  position: number;
  conceptA?: string;
  conceptB?: string;
  match?: boolean;
  front?: string;
  back?: string;
  _localId: string;
}

interface DailyTheme {
  id: string;
  date: string;
  title: string;
  description: string | null;
  cards: (DailyCard & { id: string })[];
}

interface FormState {
  date: string;
  title: string;
  description: string;
  cards: DailyCard[];
}

interface Props {
  onBack: () => void;
}

let localIdCounter = 0;
function newLocalId() {
  return `local-${++localIdCounter}`;
}

function emptyForm(): FormState {
  const today = new Date().toISOString().slice(0, 10);
  return { date: today, title: "", description: "", cards: [] };
}

function themeToForm(t: DailyTheme): FormState {
  return {
    date: t.date,
    title: t.title,
    description: t.description ?? "",
    cards: t.cards.map((c) => ({ ...c, _localId: newLocalId() })),
  };
}

async function fetchThemes(): Promise<DailyTheme[]> {
  const res = await fetch("/api/admin/daily-themes", { credentials: "include" });
  if (!res.ok) throw new Error("Erro ao carregar temas");
  return (await res.json()) as DailyTheme[];
}

async function saveTheme(form: FormState): Promise<DailyTheme> {
  const cards = form.cards.map((c, i) => ({ ...c, position: i }));
  const res = await fetch("/api/admin/daily-themes", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...form, cards }),
  });
  if (!res.ok) throw new Error("Erro ao salvar tema");
  return (await res.json()) as DailyTheme;
}

async function deleteTheme(date: string): Promise<void> {
  const res = await fetch("/api/admin/daily-themes", {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date }),
  });
  if (!res.ok && res.status !== 204) throw new Error("Erro ao deletar tema");
}

export function BackofficeScreen({ onBack }: Props) {
  const [themes, setThemes] = useState<DailyTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setThemes(await fetchThemes());
    } catch {
      setError("Nao foi possivel carregar os temas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function startNew() {
    setEditingDate(null);
    setForm(emptyForm());
    setError(null);
  }

  function startEdit(theme: DailyTheme) {
    setEditingDate(theme.date);
    setForm(themeToForm(theme));
    setError(null);
  }

  async function handleDelete(date: string) {
    if (!confirm(`Deletar tema de ${date}?`)) return;
    try {
      await deleteTheme(date);
      await load();
      if (editingDate === date) startNew();
    } catch {
      setError("Erro ao deletar.");
    }
  }

  async function handleSave() {
    if (!form.title.trim() || !form.date) {
      setError("Data e titulo sao obrigatorios.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveTheme(form);
      await load();
      setEditingDate(form.date);
    } catch {
      setError("Erro ao salvar tema.");
    } finally {
      setSaving(false);
    }
  }

  function addPair() {
    setForm((f) => ({
      ...f,
      cards: [
        ...f.cards,
        { kind: "pair", position: f.cards.length, conceptA: "", conceptB: "", match: true, _localId: newLocalId() },
      ],
    }));
  }

  function addInfo() {
    setForm((f) => ({
      ...f,
      cards: [
        ...f.cards,
        { kind: "info", position: f.cards.length, front: "", back: "", _localId: newLocalId() },
      ],
    }));
  }

  function removeCard(localId: string) {
    setForm((f) => ({ ...f, cards: f.cards.filter((c) => c._localId !== localId) }));
  }

  function updateCard(localId: string, patch: Partial<DailyCard>) {
    setForm((f) => ({
      ...f,
      cards: f.cards.map((c) => (c._localId === localId ? { ...c, ...patch } : c)),
    }));
  }

  function moveCard(localId: string, dir: -1 | 1) {
    setForm((f) => {
      const idx = f.cards.findIndex((c) => c._localId === localId);
      if (idx === -1) return f;
      const next = idx + dir;
      if (next < 0 || next >= f.cards.length) return f;
      const cards = [...f.cards];
      [cards[idx], cards[next]] = [cards[next], cards[idx]];
      return { ...f, cards };
    });
  }

  return (
    <div className="backoffice">
      <header className="bo-header">
        <button className="bo-back" onClick={onBack}>← Voltar</button>
        <h1 className="bo-title">Backoffice — Tema do Dia</h1>
      </header>

      <div className="bo-layout">
        {/* ── Sidebar: list of days ── */}
        <aside className="bo-sidebar">
          <button className="bo-btn-new" onClick={startNew}>+ Novo dia</button>

          {loading ? (
            <p className="bo-hint">Carregando...</p>
          ) : themes.length === 0 ? (
            <p className="bo-hint">Nenhum tema cadastrado.</p>
          ) : (
            <ul className="bo-list">
              {themes.map((t) => (
                <li
                  key={t.date}
                  className={`bo-list-item ${editingDate === t.date ? "active" : ""}`}
                >
                  <button className="bo-list-btn" onClick={() => startEdit(t)}>
                    <span className="bo-list-date">{t.date}</span>
                    <span className="bo-list-name">{t.title}</span>
                    <span className="bo-list-count">{t.cards.length} cards</span>
                  </button>
                  <button
                    className="bo-list-delete"
                    onClick={() => void handleDelete(t.date)}
                    title="Deletar"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* ── Main: form editor ── */}
        <main className="bo-form">
          <div className="bo-section">
            <label className="bo-label">Data</label>
            <input
              className="bo-input"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          <div className="bo-section">
            <label className="bo-label">Titulo</label>
            <input
              className="bo-input"
              type="text"
              placeholder="Ex: SOLID Principles"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="bo-section">
            <label className="bo-label">Descricao (opcional)</label>
            <textarea
              className="bo-input bo-textarea"
              placeholder="Contexto ou objetivo do dia..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* ── Cards ── */}
          <div className="bo-section">
            <div className="bo-cards-header">
              <label className="bo-label">Cards ({form.cards.length})</label>
              <div className="bo-card-actions">
                <button className="bo-btn-add" onClick={addPair}>+ Par</button>
                <button className="bo-btn-add" onClick={addInfo}>+ Flashcard</button>
              </div>
            </div>

            {form.cards.length === 0 && (
              <p className="bo-hint">Nenhum card ainda. Adicione pares ou flashcards.</p>
            )}

            <div className="bo-cards-list">
              {form.cards.map((card, idx) => (
                <div key={card._localId} className={`bo-card bo-card-${card.kind}`}>
                  <div className="bo-card-top">
                    <span className="bo-card-badge">{card.kind === "pair" ? "Par" : "Flashcard"}</span>
                    <div className="bo-card-order">
                      <button disabled={idx === 0} onClick={() => moveCard(card._localId, -1)}>↑</button>
                      <button disabled={idx === form.cards.length - 1} onClick={() => moveCard(card._localId, 1)}>↓</button>
                    </div>
                    <button className="bo-card-remove" onClick={() => removeCard(card._localId)}>✕</button>
                  </div>

                  {card.kind === "pair" ? (
                    <div className="bo-card-fields">
                      <input
                        className="bo-input"
                        placeholder="Conceito A"
                        value={card.conceptA ?? ""}
                        onChange={(e) => updateCard(card._localId, { conceptA: e.target.value })}
                      />
                      <input
                        className="bo-input"
                        placeholder="Conceito B"
                        value={card.conceptB ?? ""}
                        onChange={(e) => updateCard(card._localId, { conceptB: e.target.value })}
                      />
                      <label className="bo-match-label">
                        <input
                          type="checkbox"
                          checked={card.match ?? true}
                          onChange={(e) => updateCard(card._localId, { match: e.target.checked })}
                        />
                        Combinam
                      </label>
                    </div>
                  ) : (
                    <div className="bo-card-fields">
                      <textarea
                        className="bo-input bo-textarea"
                        placeholder="Frente (pergunta)"
                        value={card.front ?? ""}
                        onChange={(e) => updateCard(card._localId, { front: e.target.value })}
                      />
                      <textarea
                        className="bo-input bo-textarea"
                        placeholder="Verso (resposta)"
                        value={card.back ?? ""}
                        onChange={(e) => updateCard(card._localId, { back: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && <p className="bo-error">{error}</p>}

          <button className="bo-btn-save" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Salvando..." : "Salvar tema"}
          </button>
        </main>
      </div>
    </div>
  );
}
