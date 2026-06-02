import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { StartScreen } from "./components/StartScreen";
import { CalendarScreen } from "./components/CalendarScreen";
import { ArchiveScreen } from "./components/ArchiveScreen";
import { SwipeCard } from "./components/SwipeCard";
import { ScoreScreen } from "./components/ScoreScreen";
import type { Card, Pair } from "./data/pairs";
import { isPair } from "./data/pairs";
import { config } from "./config";
import type { ThemeCategory } from "./lib/theme";
import { recordWrongPairs, hasWeaknesses, buildWeaknessSession, WEAKNESS_SESSION_TITLE } from "./lib/weaknesses";

type Screen = "start" | "calendar" | "archive" | "game" | "score";

const PASS_THRESHOLD = config.passThreshold;
const ACTIVITY_KEY = "archpull-activity";

function loadActivity(): string[] {
  try {
    const saved = localStorage.getItem(ACTIVITY_KEY);
    return saved ? (JSON.parse(saved) as string[]) : [];
  } catch {
    return [];
  }
}

function recordToday(current: string[]): string[] {
  const today = new Date().toISOString().slice(0, 10);
  if (current.includes(today)) return current;
  const updated = [...current, today];
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));
  return updated;
}

function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [cards, setCards] = useState<Card[]>([]);
  const [wrongPairs, setWrongPairs] = useState<Pair[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [finalMaxCombo, setFinalMaxCombo] = useState(0);
  const [finalElapsed, setFinalElapsed] = useState(0);
  const [themeTitle, setThemeTitle] = useState("");
  const [themeCategory, setThemeCategory] = useState<ThemeCategory | undefined>(undefined);
  const [isWeaknessSession, setIsWeaknessSession] = useState(false);
  const [gameStartedAt, setGameStartedAt] = useState<number | null>(null);
  const [activeDays, setActiveDays] = useState<string[]>(loadActivity);
  const [weaknessExists, setWeaknessExists] = useState(() => hasWeaknesses());

  const goToCalendar = useCallback(() => setScreen("calendar"), []);
  const goToArchive = useCallback(() => setScreen("archive"), []);

  const startWeaknessReview = useCallback(() => {
    const cards = buildWeaknessSession();
    if (cards.length === 0) return;
    setCards(cards);
    setThemeTitle(WEAKNESS_SESSION_TITLE);
    setThemeCategory(undefined);
    setIsWeaknessSession(true);
    setGameStartedAt(Date.now());
    setScreen("game");
  }, []);

  const startTheme = useCallback((themeCards: Card[], title: string, category?: ThemeCategory) => {
    setCards(themeCards);
    setThemeTitle(title);
    setThemeCategory(category);
    setIsWeaknessSession(false);
    setGameStartedAt(Date.now());
    setScreen("game");
  }, []);

  const finishGame = useCallback(
    (score: number, wrong: Pair[], maxCombo: number) => {
      setFinalScore(score);
      setWrongPairs(wrong);
      setFinalMaxCombo(maxCombo);
      setFinalElapsed(gameStartedAt ? Math.round((Date.now() - gameStartedAt) / 1000) : 0);
      if (!isWeaknessSession) {
        setActiveDays((prev) => recordToday(prev));
        recordWrongPairs(wrong, themeTitle);
        if (wrong.length > 0) setWeaknessExists(true);
      }
      setScreen("score");
    },
    [gameStartedAt, isWeaknessSession, themeTitle]
  );

  const pairCount = cards.filter(isPair).length;
  const passed = pairCount > 0 && finalScore / pairCount >= PASS_THRESHOLD;

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {screen === "start" && (
          <StartScreen key="start" onStart={goToCalendar} />
        )}
        {screen === "calendar" && (
          <CalendarScreen
            key="calendar"
            activeDays={activeDays}
            onStart={startTheme}
            onArchive={goToArchive}
            onReviewWeaknesses={startWeaknessReview}
            hasWeaknesses={weaknessExists}
          />
        )}
        {screen === "archive" && (
          <ArchiveScreen
            key="archive"
            onStart={startTheme}
            onBack={goToCalendar}
          />
        )}
        {screen === "game" && (
          <SwipeCard key="game" cards={cards} onFinish={finishGame} />
        )}
        {screen === "score" && (
          <ScoreScreen
            key="score"
            score={finalScore}
            total={pairCount}
            wrongPairs={wrongPairs}
            onRestart={goToCalendar}
            nodeTitle={themeTitle}
            category={themeCategory}
            passed={passed}
            maxCombo={finalMaxCombo}
            elapsedSeconds={finalElapsed}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
