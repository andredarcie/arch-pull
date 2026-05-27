import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { StartScreen } from "./components/StartScreen";
import { CalendarScreen } from "./components/CalendarScreen";
import { SwipeCard } from "./components/SwipeCard";
import { ScoreScreen } from "./components/ScoreScreen";
import type { Card, Pair } from "./data/pairs";
import { isPair } from "./data/pairs";
import { config } from "./config";

type Screen = "start" | "calendar" | "game" | "score";

const PASS_THRESHOLD = config.passThreshold;
const ACTIVITY_KEY = "archpull-activity";

function loadActivity(): string[] {
  try {
    const saved = localStorage.getItem(ACTIVITY_KEY);
    return saved ? JSON.parse(saved) : [];
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
  const [gameStartedAt, setGameStartedAt] = useState<number | null>(null);
  const [activeDays, setActiveDays] = useState<string[]>(loadActivity);

  useEffect(() => {
    setActiveDays(loadActivity());
  }, []);

  const goToCalendar = useCallback(() => setScreen("calendar"), []);

  const startTheme = useCallback((themeCards: Card[], title: string) => {
    setCards(themeCards);
    setThemeTitle(title);
    setGameStartedAt(Date.now());
    setScreen("game");
  }, []);

  const finishGame = useCallback(
    (score: number, wrong: Pair[], maxCombo: number) => {
      setFinalScore(score);
      setWrongPairs(wrong);
      setFinalMaxCombo(maxCombo);
      setFinalElapsed(gameStartedAt ? Math.round((Date.now() - gameStartedAt) / 1000) : 0);
      setActiveDays((prev) => recordToday(prev));
      setScreen("score");
    },
    [gameStartedAt]
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
