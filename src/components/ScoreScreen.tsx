import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Pair } from "../data/pairs";
import { CheckCircle2, XCircle, RotateCcw, Share2, ClipboardCheck, Check, X } from "lucide-react";
import { buttonClass } from "../lib/buttonClass";
import type { ThemeCategory } from "../lib/theme";

interface ScoreScreenProps {
  score: number;
  total: number;
  wrongPairs: Pair[];
  onRestart: () => void;
  nodeTitle?: string;
  category?: ThemeCategory;
  passed?: boolean;
  maxCombo?: number;
  elapsedSeconds?: number;
}

// Provocative call to action tied to each theme, to bait whoever receives the share.
const SHARE_TAUNTS: Record<ThemeCategory, string> = {
  "ai-engineering": "Estou virando especialista em Engenharia de IA. E você, vai ficar para trás?",
  "solid-oop": "Já domino os princípios SOLID. Seu código ainda é uma bola de lama?",
  "design-patterns": "Aprendi os Design Patterns que todo mundo finge conhecer na entrevista. E você?",
  "architecture": "Estou pensando como arquiteto de software. Você ainda empilha gambiarra?",
  "quality-testing": "Escrevo testes que pegam bug de verdade. Os seus existem?",
  "distributed-systems": "Entendo sistemas distribuídos. Você ainda acha que a rede é confiável?",
};

const DEFAULT_TAUNT = "Estou treinando fundamentos de software todo dia. E você, parou?";

function getMessage(percentage: number): string {
  if (percentage === 100) return "Perfeito! Você é um arquiteto nato!";
  if (percentage >= 80) return "Excelente! Você manja muito!";
  if (percentage >= 60) return "Bom trabalho! Está no caminho certo!";
  if (percentage >= 40) return "Pode melhorar! Continue estudando!";
  return "Hora de revisar os fundamentos!";
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}min` : `${m}min ${s}s`;
}

export function ScoreScreen({
  score,
  total,
  wrongPairs,
  onRestart,
  nodeTitle,
  category,
  passed,
  maxCombo = 0,
  elapsedSeconds = 0,
}: ScoreScreenProps) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const message =
    total > 0 ? getMessage(percentage) : "Nenhuma pergunta avaliável nesta rodada.";
  const [copied, setCopied] = useState(false);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    if (wrongPairs.length === 0) return;
    const t = setTimeout(() => setShowList(true), 750);
    return () => clearTimeout(t);
  }, [wrongPairs.length]);

  const handleShare = async () => {
    const aiLine =
      percentage === 100 ? "Gabarito perfeito. Zero ajuda de IA." :
      percentage >= 80   ? "Consegui sem ajuda de IA." :
      percentage >= 60   ? "Quase tudo na memória, sem IA." :
                           "Sem IA, sem cola.";
    const comboLine = maxCombo >= 2 ? `\nCombo máximo: ${maxCombo}x` : "";
    const timeLine = elapsedSeconds > 0 ? `\nTempo: ${formatElapsed(elapsedSeconds)}` : "";
    const taunt = category ? SHARE_TAUNTS[category] : DEFAULT_TAUNT;
    const text = `Completei "${nodeTitle ?? "Arch Pull"}" no Arch Pull!\nAcertei ${score}/${total} (${percentage}%)${comboLine}${timeLine}\n${aiLine}\n\n${taunt}\nAceita o desafio? https://andredarcie.github.io/arch-pull/`;
    if (navigator.share) {
      await navigator.share({ text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      className="screen score-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <motion.div className="score-summary" layout="position">
        {nodeTitle && (
          <motion.p
            className="node-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {nodeTitle}
          </motion.p>
        )}

        <motion.div
          className="score-circle"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.1 }}
        >
          <span className="score-number">{score}</span>
          <span className="score-of">de {total}</span>
          <span className="score-percent">{percentage}%</span>
        </motion.div>

        {passed !== undefined && (
          <motion.div
            className={passed ? "passed-banner" : "failed-banner"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {passed
              ? <><CheckCircle2 size={16} strokeWidth={2.5} /> Fase completa!</>
              : <><XCircle size={16} strokeWidth={2.5} /> Precisa de 70% para passar</>
            }
          </motion.div>
        )}

        <motion.p
          className="score-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          {message}
        </motion.p>
      </motion.div>

      <AnimatePresence>
        {showList && wrongPairs.length > 0 && (
          <motion.div
            className="pairs-review"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <h3>Erros desta rodada</h3>
            {wrongPairs.map((pair, i) => (
              <motion.div
                key={i}
                className="pair-review"
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="pair-concepts">
                  <span>{pair.a}</span>
                  <span className="pair-plus">+</span>
                  <span>{pair.b}</span>
                </div>
                <span className="pair-badge pair-badge--answer">
                  {pair.match
                    ? <><Check size={11} strokeWidth={2.5} /> Combinam</>
                    : <><X size={11} strokeWidth={2.5} /> Não combinam</>
                  }
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="score-actions"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          className={buttonClass({ variant: "primary", size: "md" })}
          onClick={() => void handleShare()}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {copied
            ? <><ClipboardCheck size={16} strokeWidth={2.5} /> Copiado!</>
            : <><Share2 size={16} strokeWidth={2.5} /> Compartilhar resultado</>
          }
        </motion.button>
        <motion.button
          className={buttonClass({ variant: "ghost", size: "md" })}
          onClick={onRestart}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <RotateCcw size={15} strokeWidth={2.5} />
          Voltar ao início
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
