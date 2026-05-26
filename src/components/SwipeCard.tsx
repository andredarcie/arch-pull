import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipe } from "../hooks/useSwipe";
import type { Card, Pair } from "../data/pairs";
import { isPair, isContext } from "../data/pairs";
import { X, Check, Lightbulb, Eye, ArrowRight, Layers, Box, BookOpen, Target, GraduationCap, Link2, Unlink2, Brain } from "lucide-react";
import { RichText } from "./RichText";

interface SwipeCardProps {
  cards: Card[];
  onFinish: (score: number, wrongPairs: Pair[]) => void;
}

type Feedback = "correct" | "wrong" | null;

export function SwipeCard({ cards, onFinish }: SwipeCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongPairs, setWrongPairs] = useState<Pair[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [exitDirection, setExitDirection] = useState(0);
  const [showCard, setShowCard] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [pendingAdvance, setPendingAdvance] = useState<{ score: number; wrong: Pair[] } | null>(null);

  const currentCard = cards[currentIndex];
  const pairTotal = cards.filter(isPair).length;
  const pairsDone = cards.slice(0, currentIndex).filter(isPair).length;

  const advance = useCallback(
    (nextScore: number, nextWrong: Pair[]) => {
      setShowCard(false);
      setTimeout(() => {
        if (currentIndex + 1 >= cards.length) {
          onFinish(nextScore, nextWrong);
        } else {
          setIsFlipped(false);
          setCurrentIndex((i) => i + 1);
          setFeedback(null);
          setExitDirection(0);
          setShowCard(true);
        }
      }, 150);
    },
    [currentIndex, cards.length, onFinish]
  );

  const handleAnswer = useCallback(
    (userSaysMatch: boolean) => {
      if (feedback || !isPair(currentCard)) return;
      const isCorrect = userSaysMatch === currentCard.match;
      const newScore = isCorrect ? score + 1 : score;
      const newWrong = isCorrect ? wrongPairs : [...wrongPairs, currentCard];

      setFeedback(isCorrect ? "correct" : "wrong");
      setExitDirection(userSaysMatch ? 1 : -1);
      if (isCorrect) setScore(newScore);
      else setWrongPairs(newWrong);

      if (isCorrect || !currentCard.explanation) {
        setTimeout(() => advance(newScore, newWrong), 400);
      } else {
        setTimeout(() => setPendingAdvance({ score: newScore, wrong: newWrong }), 400);
      }
    },
    [currentCard, feedback, score, wrongPairs, advance]
  );

  const handleLearnedIt = useCallback(() => {
    if (!pendingAdvance) return;
    const { score: s, wrong: w } = pendingAdvance;
    setPendingAdvance(null);
    setFeedback(null);
    advance(s, w);
  }, [pendingAdvance, advance]);

  const handleInfoContinue = useCallback(() => {
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
        if (e.key === "Enter" || e.key === " ") {
          if (!isFlipped) setIsFlipped(true);
          else handleInfoContinue();
        }
        return;
      }
      if (e.key === "ArrowRight") handleSwipeRight();
      if (e.key === "ArrowLeft") handleSwipeLeft();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentCard, isFlipped, handleSwipeRight, handleSwipeLeft, handleInfoContinue]);

  const rotation = isSwiping ? offsetX * 0.1 : 0;
  const swipeIndicatorOpacity = Math.min(Math.abs(offsetX) / 100, 1);

  return (
    <div className="screen game-screen">
      <div className="game-header">
        <div className="score-display">
          Acertos: <strong>{score}</strong>
        </div>
        {isPair(currentCard) ? (
          <div className="progress-display">
            {pairsDone + 1} / {pairTotal}
          </div>
        ) : (
          <div className="progress-display info-tag">
            <Lightbulb size={14} strokeWidth={2} />
            Flashcard
          </div>
        )}
      </div>

      <div className="card-area">
        <AnimatePresence mode="wait">
          {showCard && (
            isContext(currentCard) ? (
              <motion.div
                key={currentIndex}
                className="context-card"
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
              >
                <div className="context-card-accent" />
                <div className="context-card-body">
                  <div className="context-section">
                    <div className="context-section-label">
                      <BookOpen size={14} strokeWidth={2} />
                      Como surgiu
                    </div>
                    <p className="context-section-text">{currentCard.origin}</p>
                  </div>
                  <div className="context-divider" />
                  <div className="context-section">
                    <div className="context-section-label">
                      <Target size={14} strokeWidth={2} />
                      Por que foi criado
                    </div>
                    <p className="context-section-text">{currentCard.motivation}</p>
                  </div>
                  <div className="context-divider" />
                  <div className="context-section">
                    <div className="context-section-label">
                      <GraduationCap size={14} strokeWidth={2} />
                      Por que preciso saber
                    </div>
                    <p className="context-section-text">{currentCard.relevance}</p>
                  </div>
                </div>
                <motion.button
                  className="btn-play context-card-btn"
                  onClick={handleInfoContinue}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Começar
                  <ArrowRight size={16} strokeWidth={2.5} />
                </motion.button>
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
                  x: feedback ? exitDirection * 300 : offsetX,
                  rotate: feedback ? exitDirection * 20 : rotation,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                {...handlers}
                style={{ touchAction: "pan-y" }}
              >
                <div
                  className="swipe-indicator nope"
                  style={{ opacity: offsetX < 0 ? swipeIndicatorOpacity : 0 }}
                >
                  <Unlink2 size={28} strokeWidth={2.5} />
                </div>
                <div
                  className="swipe-indicator like"
                  style={{ opacity: offsetX > 0 ? swipeIndicatorOpacity : 0 }}
                >
                  <Link2 size={28} strokeWidth={2.5} />
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
                className="flashcard-scene"
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <div
                  className={`flashcard-inner ${isFlipped ? "flipped" : ""}`}
                >
                  <div className="flashcard-face flashcard-front">
                    <span className="flashcard-label">Pergunta</span>
                    <p className="flashcard-text">
                      {currentCard.front.trimEnd().endsWith("?")
                        ? currentCard.front
                        : `${currentCard.front}?`}
                    </p>
                    <div className="flashcard-front-footer">
                      <span className="flashcard-hint">Pense um pouco sobre a resposta</span>
                      <motion.button
                        className="btn-play flashcard-reveal-btn"
                        onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Eye size={16} strokeWidth={2.5} />
                        Revelar resposta
                      </motion.button>
                    </div>
                  </div>

                  <div className="flashcard-face flashcard-back">
                    <span className="flashcard-label">Resposta</span>
                    <div className="flashcard-divider" />
                    <div className="flashcard-answer-wrap">
                      <RichText text={currentCard.back} />
                    </div>
                    <div className="flashcard-divider" />
                    <motion.button
                      className="btn-play flashcard-btn"
                      onClick={(e) => { e.stopPropagation(); handleInfoContinue(); }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Continuar
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      {isPair(currentCard) && (
        <div className="action-buttons">
          <motion.button
            className="btn-action btn-nope"
            onClick={() => handleAnswer(false)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            disabled={!!feedback}
          >
            <Unlink2 size={20} strokeWidth={2.5} />
            Não combina
          </motion.button>
          <motion.button
            className="btn-action btn-like"
            onClick={() => handleAnswer(true)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            disabled={!!feedback}
          >
            <Link2 size={20} strokeWidth={2.5} />
            Combina
          </motion.button>
        </div>
      )}

      <div className="game-progress-bar">
        <motion.div
          className="game-progress-fill"
          animate={{ width: `${(currentIndex / cards.length) * 100}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>

      <AnimatePresence>
        {pendingAdvance && isPair(currentCard) && currentCard.explanation && (
          <motion.div
            className="explanation-overlay"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <div className="explanation-card">
              <p className="explanation-title">
                {currentCard.match ? "Na verdade, combinam." : "Na verdade, não combinam."}
              </p>
              <div className="explanation-pair">
                <span className="explanation-concept">{currentCard.a}</span>
                <Unlink2 size={14} strokeWidth={2} className="explanation-unlink" />
                <span className="explanation-concept">{currentCard.b}</span>
              </div>
              <p className="explanation-text">{currentCard.explanation}</p>
              <motion.button
                className="btn-play explanation-btn"
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
