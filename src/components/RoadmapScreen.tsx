import { useEffect, useRef, Fragment } from "react";
import { motion } from "framer-motion";
import { roadmapNodes, type RoadmapNode } from "../data/roadmap";

interface Props {
  completedNodes: string[];
  onSelectNode: (nodeId: string) => void;
}

type NodeStatus = "completed" | "unlocked";

function getNodeStatus(node: RoadmapNode, completed: string[]): NodeStatus {
  if (completed.includes(node.id)) return "completed";
  return "unlocked";
}

// Pre-compute levels dynamically
const maxLevel = Math.max(...roadmapNodes.map((n) => n.level));
const levels: RoadmapNode[][] = [];
for (let i = 0; i <= maxLevel; i++) {
  levels.push(roadmapNodes.filter((n) => n.level === i));
}

/* ── SVG connector between levels ── */
function Connector({ type }: { type: "split" | "merge" }) {
  return (
    <svg
      className="roadmap-connector"
      viewBox="0 0 300 50"
      preserveAspectRatio="xMidYMid meet"
    >
      {type === "split" ? (
        <>
          <path d="M 150,0 C 150,30 84,20 84,50" />
          <path d="M 150,0 C 150,30 216,20 216,50" />
        </>
      ) : (
        <>
          <path d="M 84,0 C 84,30 150,20 150,50" />
          <path d="M 216,0 C 216,30 150,20 150,50" />
        </>
      )}
    </svg>
  );
}

/* ── Single connector (center → center) ── */
function StraightConnector() {
  return (
    <svg
      className="roadmap-connector"
      viewBox="0 0 300 50"
      preserveAspectRatio="xMidYMid meet"
    >
      <path d="M 150,0 L 150,50" />
    </svg>
  );
}

function getConnectorType(
  prevLevel: RoadmapNode[],
  currentLevel: RoadmapNode[]
): "split" | "merge" | "straight" {
  if (prevLevel.length === 1 && currentLevel.length > 1) return "split";
  if (prevLevel.length > 1 && currentLevel.length === 1) return "merge";
  return "straight";
}

export function RoadmapScreen({ completedNodes, onSelectNode }: Props) {
  const firstUnlockedRef = useRef<HTMLButtonElement>(null);
  let firstUnlockedFound = false;

  const progress = completedNodes.length;
  const total = roadmapNodes.length;

  useEffect(() => {
    const timer = setTimeout(() => {
      firstUnlockedRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="screen roadmap-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="roadmap-header">
        <h2>Arquiteto de Software</h2>
        <p className="roadmap-subtitle">Trilha do basico ao avancado</p>
        <div className="roadmap-progress-bar">
          <div
            className="roadmap-progress-fill"
            style={{ width: `${(progress / total) * 100}%` }}
          />
        </div>
        <p className="roadmap-progress-text">
          {progress} de {total} completos
        </p>
      </div>

      <div className="roadmap-tree">
        {levels.map((levelNodes, levelIndex) => {
          const isBranch = levelNodes.length > 1;

          return (
            <Fragment key={levelIndex}>
              {/* Connector from previous level */}
              {levelIndex > 0 && (() => {
                const type = getConnectorType(levels[levelIndex - 1], levelNodes);
                if (type === "straight") return <StraightConnector />;
                return <Connector type={type} />;
              })()}

              {/* Level row */}
              <div className={`roadmap-level ${isBranch ? "branch" : ""}`}>
                {levelNodes.map((node, nodeIndex) => {
                  const status = getNodeStatus(node, completedNodes);
                  const isFirstUnlocked =
                    status === "unlocked" && !firstUnlockedFound;
                  if (isFirstUnlocked) firstUnlockedFound = true;

                  return (
                    <motion.button
                      key={node.id}
                      ref={isFirstUnlocked ? firstUnlockedRef : undefined}
                      className={`roadmap-node ${status}`}
                      onClick={() => onSelectNode(node.id)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: levelIndex * 0.08 + nodeIndex * 0.04,
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.92 }}
                    >
                      <div className="node-circle">
                        <span className="node-icon">{node.icon}</span>
                        {status === "completed" && (
                          <span className="node-badge check">{"\u2713"}</span>
                        )}
                      </div>
                      <span className="node-title">{node.title}</span>
                    </motion.button>
                  );
                })}
              </div>
            </Fragment>
          );
        })}
      </div>
    </motion.div>
  );
}
