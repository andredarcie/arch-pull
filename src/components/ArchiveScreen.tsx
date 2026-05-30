import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, BookOpen } from "lucide-react";
import type { ThemeCategory, ThemeIndex, DailyTheme } from "../lib/theme";
import { mapToCards, THEME_CATEGORY_LABELS } from "../lib/theme";
import type { Card } from "../data/pairs";
import { buttonClass } from "../lib/buttonClass";

interface ChipStyle { bg: string; border: string; text: string; glow: string; }

const CATEGORY_CHIP: Record<ThemeCategory | "all", ChipStyle> = {
  all:                   { bg: "rgba(108,99,255,0.14)",  border: "rgba(108,99,255,0.5)",  text: "#a78bfa", glow: "rgba(108,99,255,0.12)"  },
  "solid-oop":           { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.45)", text: "#fbbf24", glow: "rgba(245,158,11,0.10)"  },
  "design-patterns":     { bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.45)", text: "#38bdf8", glow: "rgba(56,189,248,0.10)"  },
  "architecture":        { bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.45)", text: "#34d399", glow: "rgba(52,211,153,0.10)"  },
  "quality-testing":     { bg: "rgba(163,230,53,0.12)",  border: "rgba(163,230,53,0.45)", text: "#a3e635", glow: "rgba(163,230,53,0.10)"  },
  "ai-engineering":      { bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.45)",text: "#c084fc", glow: "rgba(192,132,252,0.10)" },
  "distributed-systems": { bg: "rgba(251,113,133,0.12)", border: "rgba(251,113,133,0.45)",text: "#fb7185", glow: "rgba(251,113,133,0.10)" },
};

function chipVars(style: ChipStyle): React.CSSProperties {
  return {
    "--c-bg": style.bg,
    "--c-border": style.border,
    "--c-text": style.text,
    "--c-glow": style.glow,
  } as React.CSSProperties;
}

interface ArchiveScreenProps {
  onStart: (cards: Card[], themeTitle: string) => void;
  onBack: () => void;
}

const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function formatDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${parseInt(d)} ${MONTHS_SHORT[parseInt(m) - 1]}`;
}

function localDateISO(): string {
  return new Intl.DateTimeFormat("sv", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export function ArchiveScreen({ onStart, onBack }: ArchiveScreenProps) {
  const [themes, setThemes] = useState<ThemeIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ThemeCategory | null>(null);

  const today = localDateISO();

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}themes/index.json`, { cache: "no-store" })
      .then((r) => r.ok ? r.json() as Promise<ThemeIndex[]> : [])
      .then((data) => {
        const past = data.filter((t) => t.date < today).reverse();
        setThemes(past);
      })
      .catch(() => setThemes([]))
      .finally(() => setLoading(false));
  }, [today]);

  const categories = useMemo<ThemeCategory[]>(() => {
    const seen = new Set<ThemeCategory>();
    themes.forEach((t) => { if (t.category) seen.add(t.category); });
    return Array.from(seen);
  }, [themes]);

  const filtered = useMemo(
    () => activeCategory ? themes.filter((t) => t.category === activeCategory) : themes,
    [themes, activeCategory]
  );

  async function handleStart(date: string, title: string) {
    setStarting(date);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}themes/${date}.json`, { cache: "no-store" });
      if (!res.ok) return;
      const theme = await res.json() as DailyTheme;
      onStart(mapToCards(theme), title);
    } finally {
      setStarting(null);
    }
  }

  return (
    <motion.div
      className="screen archive-screen"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
    >
      <div className="archive-header">
        <button
          className={buttonClass({ variant: "ghost", size: "sm", className: "archive-back-btn" })}
          onClick={onBack}
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Voltar
        </button>
        <h2 className="archive-title">Temas anteriores</h2>
      </div>

      {!loading && categories.length > 0 && (
        <div className="archive-filters">
          <button
            className={`archive-filter-chip${activeCategory === null ? " archive-filter-chip--active" : ""}`}
            style={chipVars(CATEGORY_CHIP.all)}
            onClick={() => setActiveCategory(null)}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`archive-filter-chip${activeCategory === cat ? " archive-filter-chip--active" : ""}`}
              style={chipVars(CATEGORY_CHIP[cat])}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            >
              {THEME_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      )}

      <div className="archive-list">
        {loading && <p className="archive-empty">Carregando...</p>}
        {!loading && filtered.length === 0 && (
          <p className="archive-empty">Nenhum tema encontrado.</p>
        )}

        <AnimatePresence mode="popLayout">
          {filtered.map((theme, i) => (
            <motion.div
              key={theme.date}
              className="archive-item"
              style={theme.category ? chipVars(CATEGORY_CHIP[theme.category]) : undefined}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ delay: i * 0.04 }}
              layout
            >
              <div className="archive-item-meta">
                <span className="archive-item-date">{formatDate(theme.date)}</span>
                {theme.category && (
                  <span className="archive-item-category">
                    {THEME_CATEGORY_LABELS[theme.category]}
                  </span>
                )}
              </div>
              <h3 className="archive-item-title">{theme.title}</h3>
              {theme.description && (
                <p className="archive-item-desc">{theme.description}</p>
              )}
              <button
                className={buttonClass({ variant: "secondary", size: "sm", className: "archive-item-btn" })}
                onClick={() => void handleStart(theme.date, theme.title)}
                disabled={starting === theme.date}
              >
                {starting === theme.date
                  ? <BookOpen size={14} strokeWidth={2} />
                  : <Play size={14} strokeWidth={2.5} />
                }
                {starting === theme.date ? "Carregando..." : "Praticar"}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
