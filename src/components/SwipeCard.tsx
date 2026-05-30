import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipe } from "../hooks/useSwipe";
import type { Card, Pair, SourceCategory } from "../data/pairs";
import { isPair, isContext } from "../data/pairs";
import { buttonClass } from "../lib/buttonClass";
import { X, Check, ArrowRight, Layers, Box, GraduationCap, Brain, Zap, Heart, BookOpen, ExternalLink } from "lucide-react";
import { RichText } from "./RichText";

interface SwipeCardProps {
  cards: Card[];
  onFinish: (score: number, wrongPairs: Pair[], maxCombo: number) => void;
}

type Feedback = "correct" | "wrong" | null;

const PARTICLE_COLORS = ["#6c63ff", "#a78bfa", "#c4b5fd", "#22c55e", "#eaeaf0", "#f43f5e"];

const SOURCE_CATEGORY_ORDER: Array<SourceCategory | undefined> = ["paper", "docs", "article", undefined];
const SOURCE_CATEGORY_LABELS: Record<SourceCategory, string> = {
  paper: "Pesquisa científica",
  docs: "Documentação oficial",
  article: "Artigo de referência",
};

const MOTIV_MESSAGES = [
  "Merge aprovado!",
  "Build passou!",
  "Zero warnings!",
  "LGTM!",
  "Sem side effects!",
  "PR aceito!",
  "Passou no CI!",
  "Clean code!",
  "Commit certeiro!",
  "O linter aprovou!",
  "Deploy no ar!",
  "Sem bugs!",
];

export function SwipeCard({ cards, onFinish }: SwipeCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongPairs, setWrongPairs] = useState<Pair[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [exitDirection, setExitDirection] = useState(0);
  const [showCard, setShowCard] = useState(true);
  const [pendingAdvance, setPendingAdvance] = useState<{ score: number; wrong: Pair[] } | null>(null);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [barPulse, setBarPulse] = useState(false);
  const [milestone, setMilestone] = useState<{ text: string; key: number } | null>(null);
  const [motiv, setMotiv] = useState<{ text: string; key: number } | null>(null);
  const [comboSplash, setComboSplash] = useState<{ count: number; key: number } | null>(null);
  const [particles, setParticles] = useState<{ id: number; angle: number; distance: number; color: string; size: number }[]>([]);
  const [showSources, setShowSources] = useState(false);

  const currentCard = cards[currentIndex];

  const advance = useCallback(
    (nextScore: number, nextWrong: Pair[]) => {
      setShowCard(false);
      setBarPulse(true);
      setTimeout(() => setBarPulse(false), 320);

      const nextIndex = currentIndex + 1;
      const prevVisual = Math.pow(currentIndex / cards.length, 0.65);
      const nextVisual = Math.pow(nextIndex / cards.length, 0.65);
      if (prevVisual < 0.5 && nextVisual >= 0.5) {
        setMilestone((m) => ({ text: "Chegou na metade!", key: (m?.key ?? 0) + 1 }));
      } else if (prevVisual < 0.8 && nextVisual >= 0.8) {
        setMilestone((m) => ({ text: "Quase lá!", key: (m?.key ?? 0) + 1 }));
      }

      setTimeout(() => {
        if (nextIndex >= cards.length) {
          onFinish(nextScore, nextWrong, maxCombo);
        } else {
          setCurrentIndex((i) => i + 1);
          setFeedback(null);
          setExitDirection(0);
          setShowCard(true);
        }
      }, 80);
    },
    [currentIndex, cards.length, onFinish, maxCombo]
  );

  const handleAnswer = useCallback(
    (userSaysMatch: boolean) => {
      if (feedback || !isPair(currentCard)) return;
      const isCorrect = userSaysMatch === currentCard.match;
      const newScore = isCorrect ? score + 1 : score;
      const newWrong = isCorrect ? wrongPairs : [...wrongPairs, currentCard];
      const newCombo = isCorrect ? combo + 1 : 0;
      const newLives = isCorrect ? lives : lives - 1;

      setFeedback(isCorrect ? "correct" : "wrong");
      setExitDirection(userSaysMatch ? 1 : -1);
      setCombo(newCombo);
      setMaxCombo((prev) => Math.max(prev, newCombo));
      setLives(newLives);

      if (isCorrect) {
        setScore(newScore);
        const burst = Array.from({ length: 10 }, (_, i) => ({
          id: Date.now() + i,
          angle: i * 36 + (Math.random() * 20 - 10),
          distance: 65 + Math.random() * 55,
          color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
          size: 5 + Math.random() * 4,
        }));
        setParticles(burst);
        setTimeout(() => setParticles([]), 700);
        if (newCombo >= 2) {
          setComboSplash((s) => ({ count: newCombo, key: (s?.key ?? 0) + 1 }));
        } else {
          const text = MOTIV_MESSAGES[Math.floor(Math.random() * MOTIV_MESSAGES.length)];
          setMotiv((m) => ({ text, key: (m?.key ?? 0) + 1 }));
        }
      } else {
        setWrongPairs(newWrong);
      }

      if (newLives === 0) {
        setTimeout(() => onFinish(newScore, newWrong, Math.max(maxCombo, newCombo)), 900);
      } else if (isCorrect || !currentCard.explanation) {
        setTimeout(() => advance(newScore, newWrong), 220);
      } else {
        setTimeout(() => setPendingAdvance({ score: newScore, wrong: newWrong }), 220);
      }
    },
    [currentCard, feedback, score, wrongPairs, advance, combo, lives, onFinish, maxCombo]
  );

  const handleLearnedIt = useCallback(() => {
    if (!pendingAdvance) return;
    const { score: s, wrong: w } = pendingAdvance;
    setPendingAdvance(null);
    setFeedback(null);
    advance(s, w);
  }, [pendingAdvance, advance]);

  const handleInfoContinue = useCallback(() => {
    setShowSources(false);
    advance(score, wrongPairs);
  }, [score, wrongPairs, advance]);

  const handleSwipeRight = useCallback(() => handleAnswer(true), [handleAnswer]);
  const handleSwipeLeft = useCallback(() => handleAnswer(false), [handleAnswer]);

  const { offsetX, isSwiping, handlers } = useSwipe({
    threshold: 100,
    onSwipeRight: handleSwipeRight,
    onSwipeLeft: handleSwipeLeft,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPair(currentCard)) {
        if (e.key === "Enter" || e.key === " ") handleInfoContinue();
        return;
      }
      if (e.key === "ArrowRight") handleSwipeRight();
      if (e.key === "ArrowLeft") handleSwipeLeft();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentCard, handleSwipeRight, handleSwipeLeft, handleInfoContinue]);

  const rotation = isSwiping ? offsetX * 0.1 : 0;
  const swipeIndicatorOpacity = Math.min(Math.abs(offsetX) / 100, 1);

  return (
    <div className="screen game-screen">
      <AnimatePresence>
        {feedback && (
          <motion.div
            key={feedback + currentIndex}
            initial={{ opacity: feedback === "correct" ? 0.13 : 0.1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
              background: feedback === "correct" ? "rgb(34,197,94)" : "rgb(239,68,68)",
            }}
          />
        )}
      </AnimatePresence>

      <div className="game-header">
        <div className="header-left">
          <div className="lives-display">
            {[0, 1, 2].map((i) => (
              <AnimatePresence key={i} mode="wait">
                {i < lives ? (
                  <motion.div
                    key="full"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 2, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  >
                    <Heart size={17} fill="#f43f5e" color="#f43f5e" strokeWidth={1.5} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.22 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Heart size={17} fill="transparent" color="currentColor" strokeWidth={1.5} />
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>

          <div className="score-display">
            Acertos:{" "}
            <motion.strong
              key={score}
              initial={{ scale: 1.7, color: "#a78bfa" }}
              animate={{ scale: 1, color: "var(--text-primary)" }}
              transition={{ type: "spring", stiffness: 600, damping: 20 }}
            >
              {score}
            </motion.strong>
          </div>
        </div>

        <div className="combo-slot">
          {combo >= 2 && (
            <motion.div
              key={combo}
              className={`combo-badge${combo >= 5 ? " combo-badge--hot" : ""}`}
              initial={{ scale: 0.5, opacity: 0, y: 6, rotate: 0 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: [0, -14, 14, -8, 8, 0] }}
              transition={{
                scale: { type: "spring", stiffness: 600, damping: 20 },
                opacity: { duration: 0.15 },
                y: { type: "spring", stiffness: 600, damping: 20 },
                rotate: { duration: 0.35, ease: "easeOut" },
              }}
            >
              <Zap size={13} strokeWidth={2.5} />
              {combo}x
            </motion.div>
          )}
        </div>
      </div>

      <div className="card-area">
        <AnimatePresence>
          {comboSplash && (
            <motion.div
              key={comboSplash.key}
              className={`combo-splash${comboSplash.count >= 5 ? " combo-splash--hot" : ""}`}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: [0, 1.35, 1.05, 1.0, 1.0, 1.7], opacity: [1, 1, 1, 1, 1, 0] }}
              transition={{ duration: 0.95, times: [0, 0.15, 0.28, 0.36, 0.72, 1], ease: "easeOut" }}
              onAnimationComplete={() => setComboSplash(null)}
            >
              <motion.div
                className="combo-splash-ring"
                initial={{ scale: 0.6, opacity: 0.7 }}
                animate={{ scale: 2.6, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <span className="combo-splash-number">{comboSplash.count}x</span>
              <span className="combo-splash-label">em seguida</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {motiv && (
            <motion.div
              key={motiv.key}
              className="motiv-message"
              initial={{ opacity: 1, y: 0, scale: 0.6 }}
              animate={{ opacity: 0, y: -80, scale: 1.15 }}
              transition={{ duration: 0.65, ease: [0.2, 0, 0.4, 1] }}
              onAnimationComplete={() => setMotiv(null)}
            >
              {motiv.text}
            </motion.div>
          )}
        </AnimatePresence>

        {particles.map((p) => (
          <motion.div
            key={p.id}
            style={{
              position: "absolute", top: "50%", left: "50%",
              width: p.size, height: p.size, borderRadius: "50%",
              background: p.color, pointerEvents: "none", zIndex: 15,
              marginLeft: -p.size / 2, marginTop: -p.size / 2,
            }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{
              x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
              y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
              opacity: 0,
            }}
            transition={{ duration: 0.65, ease: [0.15, 0, 0.8, 1] }}
          />
        ))}

        <AnimatePresence mode="wait">
          {showCard && (
            isContext(currentCard) ? (
              <motion.div
                key={currentIndex}
                className="context-card"
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <div className="context-card-accent" />
                <div className="context-card-body">
                  <div className="context-section">
                    <div className="context-section-label">
                      <GraduationCap size={14} strokeWidth={2} />
                      Por que preciso saber
                    </div>
                    <p className="context-section-text">{currentCard.relevance}</p>
                  </div>
                </div>
                {currentCard.sources && currentCard.sources.length > 0 && (
                  <button className={buttonClass({ variant: "subtle", size: "sm", fullWidth: true, className: "btn-sources" })} onClick={() => setShowSources(true)}>
                    <BookOpen size={13} strokeWidth={2} />
                    Embasamento científico
                  </button>
                )}
                <motion.button
                  className={buttonClass({ variant: "primary", size: "lg", className: "context-card-btn" })}
                  onClick={handleInfoContinue}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Começar
                  <ArrowRight size={16} strokeWidth={2.5} />
                </motion.button>

                <AnimatePresence>
                  {showSources && currentCard.sources && (
                    <motion.div
                      className="sources-overlay"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    >
                      <div className="sources-modal-header">
                        <BookOpen size={13} strokeWidth={2} />
                        <span className="sources-modal-title">Embasamento científico</span>
                        <button className={buttonClass({ variant: "icon", className: "sources-modal-close" })} onClick={() => setShowSources(false)}>
                          <X size={16} strokeWidth={2} />
                        </button>
                      </div>
                      <div className="sources-list">
                        {SOURCE_CATEGORY_ORDER
                          .map(cat => ({
                            category: cat,
                            items: currentCard.sources!.filter(s => s.category === cat),
                          }))
                          .filter(g => g.items.length > 0)
                          .map(({ category, items }) => (
                            <div key={category ?? "other"} className="sources-group">
                              {category && (
                                <span className="sources-category-label">
                                  {SOURCE_CATEGORY_LABELS[category]}
                                </span>
                              )}
                              <ul className="sources-group-list">
                                {items.map((source) => (
                                  <li key={source.url} className="source-item">
                                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink size={12} className="source-item-icon" strokeWidth={2} />
                                      {source.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))
                        }
                      </div>
                      <button className={buttonClass({ variant: "subtle", size: "md", fullWidth: true, className: "sources-back-btn" })} onClick={() => setShowSources(false)}>
                        Voltar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : isPair(currentCard) ? (
              <motion.div
                key={currentIndex}
                className={`swipe-card ${feedback ?? ""}`}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  x: feedback === "wrong"
                    ? [0, -14, 14, -10, 10, -5, 5, 0]
                    : feedback === "correct"
                      ? exitDirection * 340
                      : offsetX,
                  rotate: feedback === "wrong"
                    ? [0, -3, 3, -2, 2, -1, 1, 0]
                    : feedback === "correct"
                      ? exitDirection * 28
                      : rotation,
                }}
                exit={{ opacity: 0, scale: 0.75 }}
                transition={
                  feedback === "wrong"
                    ? { duration: 0.22, ease: "easeOut" }
                    : { type: "spring", stiffness: 420, damping: 30 }
                }
                {...handlers}
                style={{ touchAction: "pan-y" }}
              >
                <div
                  className="swipe-indicator nope"
                  style={{ opacity: offsetX < 0 ? swipeIndicatorOpacity : 0 }}
                >
                  <X size={28} strokeWidth={2.5} />
                </div>
                <div
                  className="swipe-indicator like"
                  style={{ opacity: offsetX > 0 ? swipeIndicatorOpacity : 0 }}
                >
                  <Check size={28} strokeWidth={2.5} />
                </div>

                <div className="card-content">
                  <div className="concept concept-a">
                    <span className="concept-icon">
                      <Layers size={18} strokeWidth={1.8} />
                    </span>
                    <span className="concept-text">{currentCard.a}</span>
                  </div>
                  <div className="separator-wrap">
                    <span className="separator-line" />
                    <span className="separator-label">combina com?</span>
                    <span className="separator-line" />
                  </div>
                  <div className="concept concept-b">
                    <span className="concept-icon">
                      <Box size={18} strokeWidth={1.8} />
                    </span>
                    <span className="concept-text">{currentCard.b}</span>
                  </div>
                </div>

                {feedback && (
                  <div className={`feedback-overlay ${feedback}`}>
                    {feedback === "correct"
                      ? <Check size={48} strokeWidth={3} />
                      : <X size={48} strokeWidth={3} />
                    }
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={currentIndex}
                className="info-card"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              >
                <div className="info-card-header">
                  <BookOpen size={14} strokeWidth={2} className="info-card-icon" />
                  <span className="info-card-label">Conceito</span>
                </div>
                <h2 className="info-card-title">
                  {currentCard.front.trimEnd().endsWith("?")
                    ? currentCard.front
                    : `${currentCard.front}?`}
                </h2>
                <div className="info-card-divider" />
                <div className="info-card-body">
                  <RichText text={currentCard.back} />
                </div>
                <motion.button
                  className={buttonClass({ variant: "primary", size: "lg", className: "info-card-btn" })}
                  onClick={handleInfoContinue}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Continuar
                  <ArrowRight size={16} strokeWidth={2.5} />
                </motion.button>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      {isPair(currentCard) && (
        <div className="action-buttons">
          <motion.button
            className={buttonClass({ variant: "secondary", className: "btn-action" })}
            onClick={() => handleAnswer(false)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            disabled={!!feedback}
          >
            <X size={20} strokeWidth={2.5} />
            Não combina
          </motion.button>
          <motion.button
            className={buttonClass({ variant: "secondary", className: "btn-action" })}
            onClick={() => handleAnswer(true)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            disabled={!!feedback}
          >
            <Check size={20} strokeWidth={2.5} />
            Combina
          </motion.button>
        </div>
      )}

      <div className={`game-progress-bar${barPulse ? " bar-pulsing" : ""}`}>
        <motion.div
          className="game-progress-fill"
          animate={{ width: `${Math.pow(currentIndex / cards.length, 0.65) * 100}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
        <AnimatePresence>
          {milestone && (
            <motion.span
              key={milestone.key}
              className="progress-milestone"
              initial={{ opacity: 0, y: 6, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 1.05 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onAnimationComplete={() => {
                setTimeout(() => setMilestone(null), 3000);
              }}
            >
              {milestone.text}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {pendingAdvance && isPair(currentCard) && currentCard.explanation && (
          <motion.div
            className="explanation-overlay"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          >
            <div className="explanation-card">
              <p className="explanation-title">
                {currentCard.match ? "Na verdade, combinam." : "Na verdade, não combinam."}
              </p>
              <div className="explanation-pair">
                <span className="explanation-concept">{currentCard.a}</span>
                <X size={14} strokeWidth={2} className="explanation-unlink" />
                <span className="explanation-concept">{currentCard.b}</span>
              </div>
              <p className="explanation-text">{currentCard.explanation}</p>
              <motion.button
                className={buttonClass({ variant: "primary", size: "lg", className: "explanation-btn" })}
                onClick={handleLearnedIt}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Brain size={16} strokeWidth={2.5} />
                Agora aprendi
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
