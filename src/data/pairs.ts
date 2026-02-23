import { config } from "../config";

export interface Pair {
  a: string;
  b: string;
  match: boolean;
}

export interface InfoCard {
  kind: "info";
  front: string;
  back: string;
}

export type Card = Pair | InfoCard;

export function isPair(card: Card): card is Pair {
  return (card as InfoCard).kind !== "info";
}

export const allPairs: Pair[] = [
  // Combinam (match: true)
  { a: "E-commerce grande", b: "Cache distribuído", match: true },
  { a: "MVP / Protótipo", b: "Monolito", match: true },
  { a: "Sistema bancário", b: "Testes unitários", match: true },
  { a: "App com muitos usuários", b: "Load Balancer", match: true },
  { a: "API pública", b: "Rate Limiting", match: true },
  { a: "Chat em tempo real", b: "WebSockets", match: true },
  { a: "Dashboard com gráficos", b: "REST API", match: true },
  { a: "Sistema de pagamentos", b: "Idempotência", match: true },
  { a: "App offline-first", b: "Service Worker", match: true },
  { a: "Busca textual avançada", b: "Elasticsearch", match: true },
  { a: "Deploy contínuo", b: "CI/CD Pipeline", match: true },
  { a: "Dados sensíveis", b: "Criptografia", match: true },
  { a: "Aplicação multi-tenant", b: "Isolamento de dados", match: true },
  { a: "Feed de notícias", b: "Paginação por cursor", match: true },
  { a: "Sistema de notificações", b: "Fila de mensagens", match: true },
  { a: "Streaming de vídeo", b: "CDN", match: true },
  { a: "Autenticação de usuários", b: "JWT / OAuth", match: true },
  { a: "Logs de produção", b: "Observabilidade", match: true },
  // Não combinam (match: false)
  { a: "App TODO simples", b: "Microserviços", match: false },
  { a: "CRUD simples", b: "Event Sourcing", match: false },
  { a: "Landing page estática", b: "Kubernetes", match: false },
  { a: "Blog pessoal", b: "GraphQL Federation", match: false },
  { a: "Script de automação", b: "Docker Swarm", match: false },
  { a: "Calculadora simples", b: "Redis Cluster", match: false },
  { a: "Formulário de contato", b: "Apache Kafka", match: false },
  { a: "Site institucional", b: "CQRS", match: false },
  { a: "App de notas local", b: "Sharding de banco", match: false },
  { a: "Prova de conceito", b: "Clean Architecture", match: false },
  { a: "Página de login", b: "Machine Learning", match: false },
  { a: "Timer / Cronômetro", b: "API Gateway", match: false },
  { a: "Portfolio pessoal", b: "Service Mesh", match: false },
  { a: "Jogo da velha", b: "Terraform", match: false },
  { a: "Lista de compras", b: "gRPC", match: false },
  { a: "Relógio digital", b: "Saga Pattern", match: false },
];

export function getShuffledPairs(count = config.questionsPerModule): Pair[] {
  const shuffled = [...allPairs].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
