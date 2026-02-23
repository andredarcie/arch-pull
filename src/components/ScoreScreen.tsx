import { motion } from "framer-motion";
import type { Pair } from "../data/pairs";

interface ScoreScreenProps {
  score: number;
  total: number;
  wrongPairs: Pair[];
  onRestart: () => void;
  nodeTitle?: string;
  passed?: boolean;
}

function getMessage(percentage: number): string {
  if (percentage === 100) return "Perfeito! Voce e um arquiteto nato!";
  if (percentage >= 80) return "Excelente! Voce manja muito!";
  if (percentage >= 60) return "Bom trabalho! Esta no caminho certo!";
  if (percentage >= 40) return "Pode melhorar! Continue estudando!";
  return "Hora de revisar os fundamentos!";
}

export function ScoreScreen({
  score,
  total,
  wrongPairs,
  onRestart,
  nodeTitle,
  passed,
}: ScoreScreenProps) {
  const percentage = Math.round((score / total) * 100);

  return (
    <motion.div
      className="screen score-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {nodeTitle && <p className="node-phase">Fase: {nodeTitle}</p>}

      <h2 className="score-title">Resultado</h2>

      <motion.div
        className="score-circle"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
      >
        <span className="score-number">{score}</span>
        <span className="score-of">de {total}</span>
        <span className="score-percent">{percentage}%</span>
      </motion.div>

      {passed !== undefined && (
        <motion.div
          className={passed ? "passed-banner" : "failed-banner"}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          {passed ? "Fase completa!" : "Precisa de 70% para passar"}
        </motion.div>
      )}

      <p className="score-message">{getMessage(percentage)}</p>

      {wrongPairs.length > 0 && (
        <div className="pairs-review">
          <h3>Erros</h3>
          {wrongPairs.map((pair, i) => (
            <motion.div
              key={i}
              className="pair-review no-match"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <div className="pair-concepts">
                <span>{pair.a}</span>
                <span className="pair-plus">+</span>
                <span>{pair.b}</span>
              </div>
              <span className="pair-badge no-match">
                {pair.match ? "Combinam" : "Nao combinam"}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      <motion.button
        className="btn-play"
        onClick={onRestart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Voltar ao Mapa
      </motion.button>
    </motion.div>
  );
}
