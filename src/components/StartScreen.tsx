import { motion } from "framer-motion";
import type { AuthUser } from "../auth";

interface StartScreenProps {
  onStart: () => void;
  authLoading: boolean;
  authError: string | null;
  currentUser: AuthUser | null;
  onLogin: () => void;
  onLogout: () => void;
  onBackoffice: () => void;
}

export function StartScreen({
  onStart,
  authLoading,
  authError,
  currentUser,
  onLogin,
  onLogout,
  onBackoffice,
}: StartScreenProps) {
  return (
    <motion.div
      className="screen start-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="logo">
        <span className="logo-icon">{"</>"}</span>
        <h1>ArchPull</h1>
      </div>

      <div className="auth-panel">
        {authLoading ? (
          <p className="auth-status">Verificando sessao...</p>
        ) : currentUser ? (
          <div className="auth-user-card">
            {currentUser.avatarUrl && (
              <img
                className="auth-avatar"
                src={currentUser.avatarUrl}
                alt={`Avatar de ${currentUser.login}`}
              />
            )}
            <div className="auth-user-copy">
              <span className="auth-user-label">Conectado com GitHub</span>
              <strong>{currentUser.name ?? currentUser.login}</strong>
            </div>
            <button className="btn-auth-secondary" onClick={onLogout}>
              Sair
            </button>
          </div>
        ) : (
          <div className="auth-actions">
            <p className="auth-status">Salve seu progresso com sua conta GitHub.</p>
            <button className="btn-auth-primary" onClick={onLogin}>
              Entrar com GitHub
            </button>
          </div>
        )}

        {authError && <p className="auth-error">{authError}</p>}
      </div>

      <p className="tagline">Sera que esses conceitos combinam?</p>

      <div className="instructions">
        <div className="instruction">
          <span className="swipe-arrow left">{"\u2190"}</span>
          <span>Nao combinam</span>
        </div>
        <div className="instruction">
          <span>Combinam</span>
          <span className="swipe-arrow right">{"\u2192"}</span>
        </div>
      </div>

      <motion.button
        className="btn-play"
        onClick={onStart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Jogar
      </motion.button>

      {currentUser?.isAdmin && (
        <button className="btn-backoffice" onClick={onBackoffice}>
          Backoffice
        </button>
      )}
    </motion.div>
  );
}
