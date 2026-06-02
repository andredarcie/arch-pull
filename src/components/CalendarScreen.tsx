import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Card } from "../data/pairs";
import { CalendarDays, Play, Flame, History, CheckCircle2, Zap } from "lucide-react";
import { buttonClass } from "../lib/buttonClass";
import type { DailyTheme, ThemeCategory } from "../lib/theme";
import { mapToCards } from "../lib/theme";

interface CalendarScreenProps {
  activeDays: string[];
  onStart: (cards: Card[], themeTitle: string, category?: ThemeCategory) => void;
  onArchive: () => void;
  onReviewWeaknesses: () => void;
  hasWeaknesses: boolean;
}

const WEEK_DAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function localDateISO(date = new Date()): string {
  return new Intl.DateTimeFormat('sv', { timeZone: 'America/Sao_Paulo' }).format(date);
}

// Returns the number of consecutive active days ending on today (or yesterday
// if today has not been played yet). Returns 0 if neither today nor yesterday
// is in the active set.
function calcStreak(activeDays: string[]): number {
  if (activeDays.length === 0) return 0;

  const activeSet = new Set(activeDays);

  // Helper: subtract N days from an ISO date string and return ISO string
  function subtractDay(iso: string, n = 1): string {
    const d = new Date(`${iso}T00:00:00`);
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  const today = localDateISO();
  // If today is not active, anchor from yesterday (streak can still be alive)
  const anchor = activeSet.has(today) ? today : subtractDay(today, 1);

  if (!activeSet.has(anchor)) return 0;

  let count = 0;
  let cursor = anchor;
  while (activeSet.has(cursor)) {
    count++;
    cursor = subtractDay(cursor, 1);
  }
  return count;
}


function buildWeeks(activeSet: Set<string>) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  start.setDate(start.getDate() - start.getDay());

  const weeks: { date: string; active: boolean; future: boolean }[][] = [];
  const cursor = new Date(start);

  while (cursor <= today) {
    const week: { date: string; active: boolean; future: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const iso = cursor.toISOString().slice(0, 10);
      week.push({ date: iso, active: activeSet.has(iso), future: cursor > today });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

function getMonthPositions(weeks: { date: string }[][]): { label: string; col: number }[] {
  const seen = new Set<number>();
  const positions: { label: string; col: number }[] = [];
  weeks.forEach((week, col) => {
    const month = new Date(week[0].date).getMonth();
    if (!seen.has(month)) {
      seen.add(month);
      positions.push({ label: MONTH_LABELS[month], col });
    }
  });
  return positions;
}

export function CalendarScreen({ activeDays, onStart, onArchive, onReviewWeaknesses, hasWeaknesses }: CalendarScreenProps) {
  const [theme, setTheme] = useState<DailyTheme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = localDateISO();
    fetch(`${import.meta.env.BASE_URL}themes/${today}.json`, { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setTheme((data as DailyTheme | null)))
      .catch(() => setTheme(null))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const todayIso = localDateISO(today);
  const dayName = WEEK_DAYS[today.getDay()];
  const monthName = MONTHS[today.getMonth()];
  const year = today.getFullYear();

  const activeSet = new Set(activeDays);
  const weeks = buildWeeks(activeSet);
  const monthPositions = getMonthPositions(weeks);
  const totalActive = activeDays.length;
  const streak = calcStreak(activeDays);

  // Detect whether the user has already played today
  const playedToday = activeDays.includes(todayIso);

  function handleStart() {
    if (!theme) return;
    onStart(mapToCards(theme), theme.title, theme.category);
  }

  return (
    <motion.div
      className="screen calendar-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="cal-header">
        <div className="cal-date-row">
          <CalendarDays size={14} strokeWidth={2} />
          <span className="cal-day-name">{dayName}, {monthName} {year}</span>
        </div>
        {loading ? (
          <p className="cal-theme-name cal-theme-loading">Carregando tema...</p>
        ) : theme ? (
          <>
            <h2 className="cal-theme-name">{theme.title}</h2>
            {theme.description && (
              <p className="cal-theme-desc">{theme.description}</p>
            )}
          </>
        ) : (
          <p className="cal-theme-name cal-theme-empty">Nenhum tema para hoje</p>
        )}
      </div>

      <div className="cal-wrap">
        <div
          className="cal-month-row"
          style={{ gridTemplateColumns: `repeat(${weeks.length}, 14px)`, paddingLeft: 24 }}
        >
          {monthPositions.map(({ label, col }) => (
            <span key={label} className="cal-month-label" style={{ gridColumn: col + 1 }}>
              {label}
            </span>
          ))}
        </div>

        <div className="cal-body">
          <div className="cal-day-labels">
            {["D","S","T","Q","Q","S","S"].map((d, i) => (
              <span key={i} className="cal-day-label">{i % 2 === 1 ? d : ""}</span>
            ))}
          </div>

          <div className="cal-grid" style={{ gridTemplateColumns: `repeat(${weeks.length}, 14px)` }}>
            {weeks.map((week, wi) =>
              week.map((day, di) => (
                <div
                  key={`${wi}-${di}`}
                  className={[
                    "cal-cell",
                    day.future ? "cal-cell--future" : "",
                    day.active ? "cal-cell--active" : "",
                    day.date === todayIso ? "cal-cell--today" : "",
                  ].filter(Boolean).join(" ")}
                  title={day.date}
                />
              ))
            )}
          </div>
        </div>

        <div className="cal-footer">
          <Flame size={14} strokeWidth={2} className={streak >= 1 ? "cal-flame-active" : "cal-flame-dim"} />
          <p className="cal-subtitle">
            {totalActive === 0
              ? "Nenhum exercício feito ainda este ano."
              : `${totalActive} dia${totalActive > 1 ? "s" : ""} com exercício em ${today.getFullYear()}.`}
          </p>
          {streak >= 2 && <p className="cal-streak">{streak} dias seguidos</p>}
        </div>
      </div>

      {!loading && (
        <div className="cal-action">
          {playedToday && theme && (
            <div className="cal-played-badge">
              <CheckCircle2 size={15} strokeWidth={2} />
              Exercício de hoje concluído
            </div>
          )}
          <motion.button
            className={buttonClass({ variant: "primary", size: "lg" })}
            onClick={handleStart}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Play size={18} strokeWidth={2.5} />
            {playedToday && theme ? `Jogar novamente` : `Iniciar ${theme?.title}`}
          </motion.button>
        </div>
      )}

      {hasWeaknesses && (
        <button
          className={buttonClass({ variant: "ghost", size: "sm", className: "cal-weakness-btn" })}
          onClick={onReviewWeaknesses}
        >
          <Zap size={15} strokeWidth={2} />
          Revisar fraquezas
        </button>
      )}

      <button
        className={buttonClass({ variant: "ghost", size: "sm", className: "cal-archive-btn" })}
        onClick={onArchive}
      >
        <History size={15} strokeWidth={2} />
        Ver temas anteriores
      </button>
    </motion.div>
  );
}
