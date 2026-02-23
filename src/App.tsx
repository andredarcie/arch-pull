import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { StartScreen } from "./components/StartScreen";
import { RoadmapScreen } from "./components/RoadmapScreen";
import { SwipeCard } from "./components/SwipeCard";
import { ScoreScreen } from "./components/ScoreScreen";
import { getShuffledNodePairs, getNodeById } from "./data/roadmap";
import type { Card, Pair } from "./data/pairs";
import { isPair } from "./data/pairs";
import { config } from "./config";

type Screen = "start" | "roadmap" | "game" | "score";

const PASS_THRESHOLD = config.passThreshold;
const STORAGE_KEY = config.storageKey;

function loadProgress(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [cards, setCards] = useState<Card[]>([]);
  const [wrongPairs, setWrongPairs] = useState<Pair[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [completedNodes, setCompletedNodes] = useState<string[]>(loadProgress);

  const goToRoadmap = useCallback(() => setScreen("roadmap"), []);

  const selectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setCards(getShuffledNodePairs(nodeId, config.questionsPerModule));
    setScreen("game");
  }, []);

  const finishGame = useCallback(
    (score: number, wrong: Pair[]) => {
      setFinalScore(score);
      setWrongPairs(wrong);

      const pairCount = cards.filter(isPair).length;
      if (selectedNodeId && score / pairCount >= PASS_THRESHOLD) {
        setCompletedNodes((prev) => {
          if (prev.includes(selectedNodeId)) return prev;
          const updated = [...prev, selectedNodeId];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }

      setScreen("score");
    },
    [selectedNodeId, cards]
  );

  const selectedNode = selectedNodeId ? getNodeById(selectedNodeId) : null;
  const pairCount = cards.filter(isPair).length;
  const passed = pairCount > 0 && finalScore / pairCount >= PASS_THRESHOLD;

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {screen === "start" && (
          <StartScreen key="start" onStart={goToRoadmap} />
        )}
        {screen === "roadmap" && (
          <RoadmapScreen
            key="roadmap"
            completedNodes={completedNodes}
            onSelectNode={selectNode}
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
            onRestart={goToRoadmap}
            nodeTitle={selectedNode?.title}
            passed={passed}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
