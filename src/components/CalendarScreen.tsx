import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Card } from "../data/pairs";
import type { LocalDailyTheme } from "../data/dailyThemeFallback";
import { CalendarDays, Play, Flame } from "lucide-react";

type DailyTheme = LocalDailyTheme & { description: string | null };

interface CalendarScreenProps {
  activeDays: string[];
  onStart: (cards: Card[], themeTitle: string) => void;
}

const WEEK_DAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mapToCards(theme: LocalDailyTheme): Card[] {
  const result: Card[] = [];

  if (theme.context) {
    result.push({
      kind: "context",
      origin: theme.context.origin,
      motivation: theme.context.motivation,
      relevance: theme.context.relevance,
    });
  }

  const groups: LocalDailyTheme["cards"][] = [];
  let current: LocalDailyTheme["cards"] = [];

  for (const c of theme.cards) {
    if (c.kind === "info" && current.length > 0) {
      groups.push(current);
      current = [];
    }
    current.push(c);
  }
  if (current.length > 0) groups.push(current);

  const [intro, ...rest] = groups;
  const shuffled = [intro, ...shuffle(rest)];

  for (const group of shuffled) {
    const [infoCard, ...pairs] = group;
    result.push({ kind: "info" as const, front: infoCard.front ?? "", back: infoCard.back ?? "" });
    for (const c of shuffle(pairs)) {
      result.push({ a: c.conceptA ?? "", b: c.conceptB ?? "", match: c.match ?? false, explanation: c.explanation ?? undefined });
    }
  }
  return result;
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

export function CalendarScreen({ activeDays, onStart }: CalendarScreenProps) {
  const [theme, setTheme] = useState<DailyTheme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/theme", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setTheme((data as DailyTheme | null)))
      .catch(() => setTheme(null))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const dayName = WEEK_DAYS[today.getDay()];
  const monthName = MONTHS[today.getMonth()];
  const year = today.getFullYear();

  const activeSet = new Set(activeDays);
  const weeks = buildWeeks(activeSet);
  const monthPositions = getMonthPositions(weeks);
  const totalActive = activeDays.length;

  function handleStart() {
    if (!theme) return;
    onStart(mapToCards(theme), theme.title);
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
          <Flame size={14} strokeWidth={2} className={totalActive > 0 ? "cal-flame-active" : "cal-flame-dim"} />
          <p className="cal-subtitle">
            {totalActive === 0
              ? "Nenhum exercício feito ainda este ano."
              : `${totalActive} dia${totalActive > 1 ? "s" : ""} com exercício em ${today.getFullYear()}.`}
          </p>
        </div>
      </div>

      {!loading && (
        <motion.button
          className="btn-play"
          onClick={handleStart}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Play size={18} strokeWidth={2.5} />
          Iniciar {theme?.title}
        </motion.button>
      )}
    </motion.div>
  );
}
