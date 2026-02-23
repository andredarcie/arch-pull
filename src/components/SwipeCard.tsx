import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipe } from "../hooks/useSwipe";
import type { Card, Pair } from "../data/pairs";
import { isPair } from "../data/pairs";

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

  const currentCard = cards[currentIndex];
  const pairTotal = cards.filter(isPair).length;
  const pairsDone = cards.slice(0, currentIndex).filter(isPair).length;

  // Reset flip state when the card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const advance = useCallback(
    (nextScore: number, nextWrong: Pair[]) => {
      setShowCard(false);
      setTimeout(() => {
        if (currentIndex + 1 >= cards.length) {
          onFinish(nextScore, nextWrong);
        } else {
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

      setTimeout(() => advance(newScore, newWrong), 400);
    },
    [currentCard, feedback, score, wrongPairs, advance]
  );

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
          <div className="progress-display info-tag">💡 Flashcard</div>
        )}
      </div>

      <div className="card-area">
        <AnimatePresence mode="wait">
          {showCard && (
            isPair(currentCard) ? (
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
                  ✗
                </div>
                <div
                  className="swipe-indicator like"
                  style={{ opacity: offsetX > 0 ? swipeIndicatorOpacity : 0 }}
                >
                  ✓
                </div>

                <div className="card-content">
                  <div className="concept concept-a">
                    <span className="concept-icon">{"{ }"}</span>
                    <span className="concept-text">{currentCard.a}</span>
                  </div>
                  <div className="separator">+</div>
                  <div className="concept concept-b">
                    <span className="concept-icon">{"< />"}</span>
                    <span className="concept-text">{currentCard.b}</span>
                  </div>
                </div>

                {feedback && (
                  <div className={`feedback-overlay ${feedback}`}>
                    {feedback === "correct" ? "✓" : "✗"}
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
                  onClick={() => !isFlipped && setIsFlipped(true)}
                >
                  {/* Front */}
                  <div className="flashcard-face flashcard-front">
                    <span className="flashcard-label">Pergunta</span>
                    <p className="flashcard-text">{currentCard.front}</p>
                    <span className="flashcard-hint">Toque para revelar</span>
                  </div>

                  {/* Back */}
                  <div className="flashcard-face flashcard-back">
                    <span className="flashcard-label">Resposta</span>
                    <p className="flashcard-text">{currentCard.back}</p>
                    <motion.button
                      className="btn-play flashcard-btn"
                      onClick={(e) => { e.stopPropagation(); handleInfoContinue(); }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Continuar →
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
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={!!feedback}
          >
            ✗
          </motion.button>
          <motion.button
            className="btn-action btn-like"
            onClick={() => handleAnswer(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={!!feedback}
          >
            ✓
          </motion.button>
        </div>
      )}
    </div>
  );
}
