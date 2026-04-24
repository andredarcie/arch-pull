import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { StartScreen } from "./components/StartScreen";
import { RoadmapScreen } from "./components/RoadmapScreen";
import { SwipeCard } from "./components/SwipeCard";
import { ScoreScreen } from "./components/ScoreScreen";
import { BackofficeScreen } from "./components/BackofficeScreen";
import { getShuffledNodePairs, getNodeById } from "./data/roadmap";
import type { Card, Pair } from "./data/pairs";
import { isPair } from "./data/pairs";
import { config } from "./config";
import type { AuthState } from "./auth";
import { unauthenticatedState } from "./auth";
import { fetchAuthState, logout } from "./lib/authApi";
import {
  fetchProgressSnapshot,
  saveProgressUpdate,
} from "./lib/progressApi";

type Screen = "start" | "roadmap" | "game" | "score" | "backoffice";

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

function getAuthErrorMessage(code: string | null): string | null {
  switch (code) {
    case "oauth_state_invalid":
      return "Nao foi possivel validar o login do GitHub. Tente novamente.";
    case "oauth_exchange_failed":
      return "Falha ao concluir a autenticacao com o GitHub.";
    case "oauth_profile_failed":
      return "Falha ao carregar os dados da sua conta GitHub.";
    case "oauth_code_missing":
    case "oauth_state_missing":
      return "O retorno do login GitHub veio incompleto.";
    case "oauth_unknown_error":
      return "O login com GitHub falhou por um erro inesperado.";
    default:
      return null;
  }
}

function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [cards, setCards] = useState<Card[]>([]);
  const [wrongPairs, setWrongPairs] = useState<Pair[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [completedNodes, setCompletedNodes] = useState<string[]>(loadProgress);
  const [authState, setAuthState] = useState<AuthState>(unauthenticatedState);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadAuthState = async () => {
      try {
        const state = await fetchAuthState();
        if (active) {
          setAuthState(state);
        }
      } catch {
        if (active) {
          setAuthState(unauthenticatedState);
        }
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
    };

    void loadAuthState();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const syncProgress = async () => {
      if (!authState.authenticated) {
        setCompletedNodes(loadProgress());
        return;
      }

      try {
        const snapshot = await fetchProgressSnapshot();
        if (active) {
          setCompletedNodes(snapshot.completedNodeIds);
        }
      } catch {
        if (active) {
          setCompletedNodes(loadProgress());
        }
      }
    };

    void syncProgress();
    return () => {
      active = false;
    };
  }, [authState]);

  const authError = useMemo(() => {
    if (typeof window === "undefined") return null;

    const params = new URLSearchParams(window.location.search);
    return getAuthErrorMessage(params.get("authError"));
  }, []);

  const goToRoadmap = useCallback(() => setScreen("roadmap"), []);
  const goToBackoffice = useCallback(() => setScreen("backoffice"), []);

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
      const completed =
        pairCount > 0 && score / pairCount >= PASS_THRESHOLD;

      if (pairCount > 0 && selectedNodeId) {
        if (authState.authenticated) {
          void saveProgressUpdate({
            nodeId: selectedNodeId,
            score,
            total: pairCount,
            completed,
          })
            .then((snapshot) => {
              setCompletedNodes(snapshot.completedNodeIds);
            })
            .catch(() => {
              if (!completed) return;
              setCompletedNodes((prev) => {
                if (prev.includes(selectedNodeId)) return prev;
                const updated = [...prev, selectedNodeId];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                return updated;
              });
            });
        } else if (completed) {
          setCompletedNodes((prev) => {
            if (prev.includes(selectedNodeId)) return prev;
            const updated = [...prev, selectedNodeId];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
          });
        }
      }

      setScreen("score");
    },
    [selectedNodeId, cards, authState]
  );

  const handleLogin = useCallback(() => {
    window.location.href = "/api/auth/github";
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setAuthState(unauthenticatedState);
  }, []);

  const selectedNode = selectedNodeId ? getNodeById(selectedNodeId) : null;
  const pairCount = cards.filter(isPair).length;
  const passed = pairCount > 0 && finalScore / pairCount >= PASS_THRESHOLD;

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {screen === "start" && (
          <StartScreen
            key="start"
            onStart={goToRoadmap}
            authLoading={authLoading}
            authError={authError}
            currentUser={authState.user}
            onLogin={handleLogin}
            onLogout={() => { void handleLogout(); }}
            onBackoffice={goToBackoffice}
          />
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
        {screen === "backoffice" && (
          <BackofficeScreen key="backoffice" onBack={() => setScreen("start")} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
