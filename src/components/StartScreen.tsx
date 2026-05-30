import { motion } from "framer-motion";
import { Braces, Play } from "lucide-react";
import { buttonClass } from "../lib/buttonClass";

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <motion.div
      className="screen start-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="logo">
        <div className="logo-icon-wrap">
          <Braces size={36} strokeWidth={2} />
        </div>
        <h1>ArchPull</h1>
        <p className="tagline">
          Prepare-se para entrevistas de desenvolvedor pleno e sênior.
          Pratique arquitetura de software, mensageria, boas práticas e muito mais, um conceito por vez por dia.
        </p>
      </div>

      <motion.button
        className={buttonClass({ variant: "primary", size: "lg" })}
        onClick={onStart}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <Play size={18} strokeWidth={2.5} />
        Fazer exercício diário
      </motion.button>
    </motion.div>
  );
}
