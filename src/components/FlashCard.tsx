import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye } from "lucide-react";
import { RichText } from "./RichText";

interface FlashCardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
  onContinue: () => void;
  showCard: boolean;
  cardKey: number;
}

export function FlashCard({ front, back, isFlipped, onFlip, onContinue, showCard, cardKey }: FlashCardProps) {
  const touchStartX = useRef(0);

  const question = front.trimEnd().endsWith("?") ? front : `${front}?`;

  return (
    <motion.div
      key={cardKey}
      className="flashcard-scene"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.06, ease: "linear" }}
      onClick={() => { if (!isFlipped) onFlip(); }}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 60) {
          if (!isFlipped) onFlip();
          else onContinue();
        }
      }}
      style={{ cursor: isFlipped ? "default" : "pointer" }}
    >
      <div className="flashcard-perspective">
        <div
          className={`flashcard-inner ${isFlipped ? "flipped" : ""}`}
          style={showCard ? undefined : { transition: "none", opacity: 0 }}
        >
          <div className="flashcard-face flashcard-front">
            <span className="flashcard-label">Pergunta</span>
            <p className="flashcard-text">{question}</p>
            <div className="flashcard-front-footer">
              <span className="flashcard-hint">Toque ou deslize para revelar</span>
            </div>
          </div>

          <div className="flashcard-face flashcard-back">
            <span className="flashcard-label">Resposta</span>
            <div className="flashcard-divider" />
            <div className="flashcard-answer-wrap">
              <RichText text={back} />
            </div>
            <div className="flashcard-divider" />
            <motion.button
              className="btn-play flashcard-btn"
              onClick={(e) => { e.stopPropagation(); onContinue(); }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Continuar
              <ArrowRight size={16} strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
