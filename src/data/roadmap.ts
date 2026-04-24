import type { Card, Pair } from "./pairs";
import { isPair } from "./pairs";
import { config } from "../config";

export interface RoadmapNode {
  id: string;
  title: string;
  icon: string;
  level: number;
  prerequisites: string[];
  pairs: Card[];
}

export const roadmapNodes: RoadmapNode[] = [
  // ===== Level 0 — Fundamentos =====
  {
    id: "fundamentos",
    title: "Fundamentos",
    icon: "\u{1F3D7}\uFE0F",
    level: 0,
    prerequisites: [],
    pairs: [
      {
        kind: "info",
        front: "Como os conceitos s\u00e3o avaliados neste jogo?",
        back: "Cada card mostra dois conceitos. Deslize \u2192 se eles combinam, \u2190 se n\u00e3o combinam. Voc\u00ea precisa de 70% de acertos para passar de fase.",
      },
      {
        kind: "info",
        front: "Quando usar banco de dados relacional?",
        back: "Quando os dados t\u00eam relacionamentos bem definidos, precisam de integridade transacional (ACID) ou a aplica\u00e7\u00e3o faz consultas complexas com JOINs.",
      },
      {
        kind: "info",
        front: "Qual a diferen\u00e7a entre processamento s\u00edncrono e ass\u00edncrono?",
        back: "S\u00edncrono: o chamador espera a resposta antes de continuar. Ass\u00edncrono: envia a tarefa e segue em frente, recebendo o resultado depois via callback, fila ou evento.",
      },
      { a: "CRUD b\u00E1sico", b: "Banco relacional", match: true },
      { a: "Processamento pesado", b: "Execu\u00E7\u00E3o ass\u00EDncrona", match: true },
      { a: "Dados tempor\u00E1rios", b: "Cache em mem\u00F3ria", match: true },
      { a: "API p\u00FAblica", b: "Documenta\u00E7\u00E3o OpenAPI", match: true },
      { a: "L\u00F3gica de apresenta\u00E7\u00E3o", b: "Frontend", match: true },
      { a: "Regras de neg\u00F3cio", b: "Camada de dom\u00EDnio", match: true },
      { a: "App TODO simples", b: "Arquitetura hexagonal", match: false },
      { a: "Hello World", b: "Load Balancer", match: false },
      { a: "Script \u00FAnico", b: "Docker Swarm", match: false },
      { a: "P\u00E1gina est\u00E1tica", b: "WebSocket", match: false },
      { a: "Blog pessoal", b: "Event Sourcing", match: false },
      { a: "C\u00E1lculo simples", b: "Fila de mensagens", match: false },
    ],
  },

  // ===== Level 1 — Design Patterns (left) =====
  {
    id: "design-patterns",
    title: "Design Patterns",
    icon: "\u{1F4D0}",
    level: 1,
    prerequisites: ["fundamentos"],
    pairs: [
      {
        kind: "info",
        front: "O que \u00e9 um Design Pattern?",
        back: "Uma solu\u00e7\u00e3o reutiliz\u00e1vel para um problema recorrente de design. N\u00e3o \u00e9 c\u00f3digo pronto, mas um template. Dividem-se em Criacionais, Estruturais e Comportamentais.",
      },
      {
        kind: "info",
        front: "Qual a diferen\u00e7a entre Singleton e uma classe est\u00e1tica?",
        back: "Singleton garante uma \u00fanica inst\u00e2ncia com estado e suporta heran\u00e7a e interfaces. Classe est\u00e1tica \u00e9 apenas um container de m\u00e9todos sem inst\u00e2ncia. Use Singleton quando precisar de inje\u00e7\u00e3o de depend\u00eancia.",
      },
      {
        kind: "info",
        front: "Quando usar Observer vs Pub/Sub?",
        back: "Observer: o subject conhece os observers (acoplamento direto). Pub/Sub: publishers e subscribers n\u00e3o se conhecem, comunicam via broker (desacoplado). Use Pub/Sub para sistemas distribu\u00eddos.",
      },
      { a: "Cria\u00E7\u00E3o complexa de objetos", b: "Factory Method", match: true },
      { a: "Inst\u00E2ncia \u00FAnica global", b: "Singleton", match: true },
      { a: "Notificar m\u00FAltiplos ouvintes", b: "Observer", match: true },
      { a: "Adicionar comportamento em runtime", b: "Decorator", match: true },
      { a: "Interface incompat\u00EDvel", b: "Adapter", match: true },
      { a: "Algoritmo intercambi\u00E1vel", b: "Strategy", match: true },
      { a: "Classe com um campo", b: "Abstract Factory", match: false },
      { a: "Lista simples", b: "Chain of Responsibility", match: false },
      { a: "Vari\u00E1vel local", b: "Flyweight", match: false },
      { a: "Getter/Setter b\u00E1sico", b: "Mediator", match: false },
      { a: "Soma de dois n\u00FAmeros", b: "Visitor", match: false },
      { a: "Print no console", b: "Command", match: false },
    ],
  },

  // ===== Level 1 — SOLID & Clean Code (right) =====
  {
    id: "solid",
    title: "SOLID & Clean Code",
    icon: "\u{1F4CF}",
    level: 1,
    prerequisites: ["fundamentos"],
    pairs: [
      {
        kind: "info",
        front: "Por que o SRP (Single Responsibility) \u00e9 importante?",
        back: "Uma classe com uma \u00fanica responsabilidade tem apenas um motivo para mudar. Isso torna o c\u00f3digo mais f\u00e1cil de testar, manter e entender sem efeitos colaterais inesperados.",
      },
      {
        kind: "info",
        front: "O que significa 'depender de abstra\u00e7\u00f5es' no DIP?",
        back: "M\u00f3dulos de alto n\u00edvel n\u00e3o devem depender de m\u00f3dulos de baixo n\u00edvel diretamente. Ambos devem depender de interfaces. Isso facilita troca de implementa\u00e7\u00f5es e testes com mocks.",
      },
      {
        kind: "info",
        front: "Como o Open/Closed Principle se aplica na pr\u00e1tica?",
        back: "Adicione comportamento via extens\u00e3o (heran\u00e7a, composi\u00e7\u00e3o, plugins), sem modificar c\u00f3digo existente. Exemplo: Strategy Pattern permite trocar algoritmos sem alterar a classe que os usa.",
      },
      { a: "Classe faz s\u00F3 uma coisa", b: "Single Responsibility", match: true },
      { a: "Extens\u00EDvel sem modificar", b: "Open/Closed", match: true },
      { a: "Subtipo substitui tipo base", b: "Liskov Substitution", match: true },
      { a: "Interfaces espec\u00EDficas e coesas", b: "Interface Segregation", match: true },
      { a: "Depender de abstra\u00E7\u00F5es", b: "Dependency Inversion", match: true },
      { a: "Nomes descritivos e claros", b: "Clean Code", match: true },
      { a: "Classe com 20 responsabilidades", b: "Single Responsibility", match: false },
      { a: "God Class (faz tudo)", b: "Clean Code", match: false },
      { a: "Heran\u00E7a com 5+ n\u00EDveis", b: "Liskov Substitution", match: false },
      { a: "Interface com 30 m\u00E9todos", b: "Interface Segregation", match: false },
      { a: "Depend\u00EAncia concreta direta", b: "Dependency Inversion", match: false },
      { a: "Vari\u00E1vel chamada 'x'", b: "C\u00F3digo limpo", match: false },
    ],
  },

  // ===== Level 1 — Object Calisthenics (center) =====
  {
    id: "object-calisthenics",
    title: "Object Calisthenics",
    icon: "\u{1F3CB}\uFE0F",
    level: 1,
    prerequisites: ["fundamentos"],
    pairs: [
      {
        kind: "info",
        front: "O que \u00e9 Object Calisthenics?",
        back: "S\u00e3o 9 regras pr\u00e1ticas propostas por Jeff Bay para escrever c\u00f3digo orientado a objetos melhor. N\u00e3o s\u00e3o leis universais, mas exerc\u00edcios que for\u00e7am boas pr\u00e1ticas de design.",
      },
      {
        kind: "info",
        front: "Por que 'apenas um n\u00edvel de indenta\u00e7\u00e3o por m\u00e9todo'?",
        back: "M\u00e9todos com v\u00e1rios n\u00edveis de indenta\u00e7\u00e3o indicam l\u00f3gica aninhada complexa. Extrair loops internos ou condicionais em m\u00e9todos separados melhora legibilidade e testabilidade.",
      },
      {
        kind: "info",
        front: "O que significa 'n\u00e3o usar else'?",
        back: "Usar early return (guard clauses) ao inv\u00e9s de if/else encadeados. Reduz o aninhamento, torna o fluxo principal mais claro e elimina ramos alternativos que aumentam a complexidade cognitiva.",
      },
      { a: "Um n\u00edvel de indenta\u00E7\u00E3o por m\u00E9todo", b: "M\u00E9todo com l\u00F3gica simples e focada", match: true },
      { a: "N\u00E3o usar else", b: "Early return / guard clauses", match: true },
      { a: "Primitivos e strings", b: "Encapsular em Value Objects", match: true },
      { a: "Cole\u00E7\u00F5es", b: "Encapsular em classe pr\u00F3pria", match: true },
      { a: "Uma opera\u00E7\u00E3o de acesso por linha", b: "Lei de Demeter", match: true },
      { a: "Sem abrevia\u00E7\u00F5es em nomes", b: "Nomes descritivos e intencionais", match: true },
      { a: "Entidades pequenas (50 linhas)", b: "Alta coес\u00E3o e baixo acoplamento", match: true },
      { a: "M\u00E1ximo 2 vari\u00E1veis de inst\u00E2ncia por classe", b: "Responsabilidade bem delimitada", match: true },
      { a: "Sem getters e setters p\u00FAblicos", b: "Comportamento dentro do objeto", match: true },
      { a: "Classe com 500 linhas", b: "Entidades pequenas", match: false },
      { a: "M\u00E9todo com 4 n\u00EDveis de indenta\u00E7\u00E3o", b: "Um n\u00EDvel de indenta\u00E7\u00E3o", match: false },
      { a: "String solta 'CPF'", b: "Encapsular primitivos", match: false },
      { a: "Getter p\u00FAblico para tudo", b: "Sem getters e setters", match: false },
      { a: "Nome de vari\u00E1vel 'dt'", b: "Sem abrevia\u00E7\u00F5es", match: false },
      { a: "if/else com 5 branches", b: "N\u00E3o usar else", match: false },
    ],
  },

  // ===== Level 2 — Estilos Arquiteturais =====
  {
    id: "arquiteturas",
    title: "Estilos Arquiteturais",
    icon: "\u{1F3DB}\uFE0F",
    level: 2,
    prerequisites: ["design-patterns", "solid", "object-calisthenics"],
    pairs: [
      {
        kind: "info",
        front: "Quando usar Event-Driven Architecture?",
        back: "Quando os componentes precisam ser desacoplados, h\u00e1 processamento ass\u00edncrono, m\u00faltiplos consumidores do mesmo evento, ou quando a ordem dos eventos importa para o estado do sistema.",
      },
      {
        kind: "info",
        front: "O que \u00e9 CQRS e qual seu benef\u00edcio?",
        back: "Separa opera\u00e7\u00f5es de leitura (Query) das de escrita (Command). Permite otimizar cada lado independentemente: escrita com consist\u00eancia forte, leitura com modelos desnormalizados e r\u00e1pidos.",
      },
      {
        kind: "info",
        front: "Qual a diferen\u00e7a entre DDD e arquitetura em camadas?",
        back: "Camadas organiza por fun\u00e7\u00e3o t\u00e9cnica (UI, Service, Repository). DDD organiza por dom\u00ednio de neg\u00f3cio (Bounded Contexts, Aggregates, Entities), priorizando a linguagem ub\u00edqua.",
      },
      { a: "App corporativo tradicional", b: "Arquitetura em camadas", match: true },
      { a: "App web com formul\u00E1rios", b: "MVC", match: true },
      { a: "Dom\u00EDnio com regras complexas", b: "Domain-Driven Design", match: true },
      { a: "Separar leitura e escrita", b: "CQRS", match: true },
      { a: "Sistema orientado a eventos", b: "Event-Driven Architecture", match: true },
      { a: "Aplica\u00E7\u00E3o com plugins", b: "Arquitetura de plugins", match: true },
      { a: "Landing page simples", b: "DDD", match: false },
      { a: "Script de automa\u00E7\u00E3o", b: "MVC", match: false },
      { a: "Arquivo de configura\u00E7\u00E3o", b: "CQRS", match: false },
      { a: "P\u00E1gina est\u00E1tica", b: "Arquitetura hexagonal", match: false },
      { a: "Planilha Excel", b: "Event-Driven Architecture", match: false },
      { a: "Formul\u00E1rio simples", b: "Arquitetura de plugins", match: false },
    ],
  },

  // ===== Level 3 — Microsservi\u00E7os (left) =====
  {
    id: "microsservicos",
    title: "Microsservi\u00E7os",
    icon: "\u{1F537}",
    level: 3,
    prerequisites: ["arquiteturas"],
    pairs: [
      {
        kind: "info",
        front: "O que \u00e9 um Bounded Context em microsservi\u00e7os?",
        back: "Limite l\u00f3gico dentro do qual um modelo de dom\u00ednio \u00e9 consistente. Cada microsservi\u00e7o deve ter seu pr\u00f3prio Bounded Context, com banco de dados pr\u00f3prio e linguagem ub\u00edqua.",
      },
      {
        kind: "info",
        front: "O que \u00e9 Circuit Breaker e quando us\u00e1-lo?",
        back: "Detecta falhas em um servi\u00e7o dependente e para de cham\u00e1-lo temporariamente, retornando um fallback. Evita falha em cascata. Estados: Closed (normal), Open (bloqueado), Half-Open (testando recupera\u00e7\u00e3o).",
      },
      {
        kind: "info",
        front: "Qual a diferen\u00e7a entre orquestra\u00e7\u00e3o e coreografia?",
        back: "Orquestra\u00e7\u00e3o: um servi\u00e7o central coordena os passos (mais f\u00e1cil de rastrear). Coreografia: cada servi\u00e7o reage a eventos autonomamente (mais desacoplado, mais dif\u00edcil de depurar).",
      },
      { a: "Times independentes", b: "Microsservi\u00E7os", match: true },
      { a: "Deploy independente", b: "Bounded Context", match: true },
      { a: "Roteamento de servi\u00E7os", b: "API Gateway", match: true },
      { a: "Evitar falha em cascata", b: "Circuit Breaker", match: true },
      { a: "Descoberta de servi\u00E7os", b: "Service Registry", match: true },
      { a: "Configura\u00E7\u00E3o centralizada", b: "Config Server", match: true },
      { a: "App com 2 telas", b: "Microsservi\u00E7os", match: false },
      { a: "Projeto solo de 1 dev", b: "Service Mesh", match: false },
      { a: "MVP de startup", b: "Kubernetes + Istio", match: false },
      { a: "Prot\u00F3tipo r\u00E1pido", b: "API Gateway complexo", match: false },
      { a: "Equipe de 3 pessoas", b: "15 microsservi\u00E7os", match: false },
      { a: "Monolito funcionando bem", b: "Reescrever tudo em micro", match: false },
    ],
  },

  // ===== Level 3 — Sistemas Distribu\u00EDdos (right) =====
  {
    id: "distribuidos",
    title: "Sist. Distribu\u00EDdos",
    icon: "\u{1F310}",
    level: 3,
    prerequisites: ["arquiteturas"],
    pairs: [
      {
        kind: "info",
        front: "O que diz o Teorema CAP?",
        back: "Em um sistema distribu\u00eddo, voc\u00ea s\u00f3 pode garantir 2 de 3: Consist\u00eancia (todos v\u00eaem os mesmos dados), Disponibilidade (sempre responde) e Toler\u00e2ncia a Parti\u00e7\u00f5es. Na pr\u00e1tica, P \u00e9 obrigat\u00f3rio, ent\u00e3o escolhe-se C ou A.",
      },
      {
        kind: "info",
        front: "O que \u00e9 consist\u00eancia eventual?",
        back: "Garante que, sem novas atualiza\u00e7\u00f5es, todos os n\u00f3s convergem para o mesmo valor. Aceita leituras desatualizadas temporariamente em troca de maior disponibilidade e performance.",
      },
      {
        kind: "info",
        front: "O que \u00e9 o algoritmo Raft?",
        back: "Algoritmo de consenso distribu\u00eddo que elege um leader para gerenciar o log replicado. O leader recebe escritas e as replica para followers. Se o leader cai, uma nova elei\u00e7\u00e3o ocorre. Mais leg\u00edvel que Paxos.",
      },
      { a: "Toler\u00E2ncia a falhas", b: "Replica\u00E7\u00E3o", match: true },
      { a: "Dados em m\u00FAltiplas regi\u00F5es", b: "Consist\u00EAncia eventual", match: true },
      { a: "Alta disponibilidade", b: "Cluster ativo-ativo", match: true },
      { a: "Streaming de eventos", b: "Apache Kafka", match: true },
      { a: "Coordena\u00E7\u00E3o distribu\u00EDda", b: "Consenso (Raft/Paxos)", match: true },
      { a: "Cache distribu\u00EDdo", b: "Redis Cluster", match: true },
      { a: "App local single-user", b: "Consenso distribu\u00EDdo", match: false },
      { a: "SQLite local", b: "Sharding", match: false },
      { a: "Dados n\u00E3o cr\u00EDticos", b: "Transa\u00E7\u00E3o distribu\u00EDda 2PC", match: false },
      { a: "Monolito pequeno", b: "Service Mesh", match: false },
      { a: "Arquivo local", b: "Replica\u00E7\u00E3o multi-regi\u00E3o", match: false },
      { a: "Planilha Excel", b: "Apache Kafka", match: false },
    ],
  },

  // ===== Level 4 — Apache Kafka =====
  {
    id: "kafka",
    title: "Apache Kafka",
    icon: "\u{1F4E8}",
    level: 4,
    prerequisites: ["microsservicos", "distribuidos"],
    pairs: [
      {
        kind: "info",
        front: "O que \u00e9 Apache Kafka e para que ele serve?",
        back: "Kafka \u00e9 uma plataforma de streaming distribu\u00eddo. Mensagens s\u00e3o publicadas em t\u00f3picos, divididos em parti\u00e7\u00f5es, e consumidos por consumer groups. O offset marca a posi\u00e7\u00e3o de leitura de cada consumer.",
      },
      {
        kind: "info",
        front: "O que \u00e9 um Consumer Group no Kafka?",
        back: "Conjunto de consumers que cooperam para consumir um t\u00f3pico. Cada parti\u00e7\u00e3o \u00e9 atribu\u00edda a exatamente um consumer do grupo. Mais consumers = mais throughput, at\u00e9 o limite de parti\u00e7\u00f5es.",
      },
      {
        kind: "info",
        front: "Qual a diferen\u00e7a entre acks=0, acks=1 e acks=all no Kafka?",
        back: "acks=0: producer n\u00e3o espera confirma\u00e7\u00e3o (r\u00e1pido, pode perder dados). acks=1: aguarda confirma\u00e7\u00e3o do leader. acks=all: aguarda todas as r\u00e9plicas in-sync (mais seguro, mais lento).",
      },
      { a: "Servidor que armazena e serve mensagens no Kafka", b: "Broker", match: true },
      { a: "Garante que reprocessar uma mensagem n\u00E3o causa efeito duplo", b: "Idempot\u00EAncia", match: true },
      { a: "Divis\u00E3o de um topic que permite paralelismo de consumo", b: "Parti\u00E7\u00E3o", match: true },
      { a: "Conjunto de brokers Kafka que operam juntos", b: "Cluster", match: true },
      { a: "API para processar e transformar streams dentro do pr\u00F3prio Kafka", b: "Kafka Streams", match: true },
      { a: "C\u00F3pia de uma parti\u00E7\u00E3o em outro broker para toler\u00E2ncia a falhas", b: "R\u00E9plica (Replica)", match: true },
      { a: "Quantas parti\u00E7\u00F5es um t\u00F3pico tem define o limite de paralelismo do", b: "Consumer Group", match: true },
      { a: "Broker eleito respons\u00E1vel por uma parti\u00E7\u00E3o espec\u00EDfica", b: "Leader", match: true },
      { a: "Dois consumers do mesmo grupo lendo a mesma parti\u00E7\u00E3o", b: "Causa processamento duplicado", match: true },
      { a: "Producer com acks=all garante que a mensagem foi confirmada por", b: "Todas as r\u00E9plicas in-sync (ISR)", match: true },
      { a: "Um broker cai e o Kafka continua funcionando normalmente", b: "Requer fator de replica\u00E7\u00E3o \u2265 2", match: true },
      { a: "Kafka Streams vs consumidor simples: a principal diferen\u00E7a \u00E9", b: "Kafka Streams processa e republica no pr\u00F3prio Kafka", match: true },
      { a: "Offset \u00E9 um n\u00FAmero que identifica", b: "A posi\u00E7\u00E3o de uma mensagem dentro de uma parti\u00E7\u00E3o", match: true },
      { a: "Para garantir ordem global das mensagens em um topic", b: "Use apenas 1 parti\u00E7\u00E3o", match: true },
      { a: "Um consumer group com 3 consumers lendo um topic de 2 parti\u00E7\u00F5es", b: "1 consumer ficar\u00E1 ocioso", match: true },
      { a: "Broker que n\u00E3o \u00E9 l\u00EDder de nenhuma parti\u00E7\u00E3o serve para", b: "Manter r\u00E9plicas e assumir lideran\u00E7a se necess\u00E1rio", match: true },
      { a: "Aumentar parti\u00E7\u00F5es de um topic j\u00E1 existente", b: "N\u00E3o redistribui mensagens antigas, apenas novas", match: true },
      { a: "Idempot\u00EAncia no producer Kafka \u00E9 ativada com", b: "enable.idempotence=true", match: true },
      { a: "Cada broker em um cluster Kafka \u00E9 identificado por um", b: "Broker ID \u00FAnico", match: true },
      { a: "Kafka retém mensagens mesmo ap\u00F3s consumo porque", b: "O log \u00E9 imut\u00E1vel e controlado por retention policy", match: true },
      { a: "Kafka Streams \u00E9 melhor que um consumer simples quando voc\u00EA precisa", b: "Join, agrega\u00E7\u00E3o ou janelas de tempo nos dados", match: true },
      { a: "Um topic com replication-factor=3 e min.insync.replicas=2 aceita perda de", b: "At\u00E9 1 broker sem parar de aceitar escritas", match: true },
      { a: "Adicionar mais brokers ao cluster Kafka automaticamente", b: "N\u00E3o rebalanceia parti\u00E7\u00F5es existentes (precisa de reassign)", match: true },
      { a: "Consumer que commitou offset antes de processar e caiu", b: "Perde a mensagem (at-most-once)", match: true },
    ],
  },

  // ===== Level 5 — Cloud & DevOps =====
  {
    id: "cloud-devops",
    title: "Cloud & DevOps",
    icon: "\u2601\uFE0F",
    level: 5,
    prerequisites: ["kafka"],
    pairs: [
      {
        kind: "info",
        front: "O que \u00e9 Infrastructure as Code (IaC)?",
        back: "Gerenciar e provisionar infraestrutura via arquivos de configura\u00e7\u00e3o versionados (Terraform, Pulumi). Permite reprodutibilidade, revis\u00e3o em PR, hist\u00f3rico de mudan\u00e7as e rollback.",
      },
      {
        kind: "info",
        front: "O que \u00e9 Blue-Green Deployment?",
        back: "Dois ambientes id\u00eanticos: Blue (produ\u00e7\u00e3o atual) e Green (nova vers\u00e3o). O tr\u00e1fego \u00e9 alternado para Green ap\u00f3s valida\u00e7\u00e3o. Permite rollback instant\u00e2neo revertendo o roteamento.",
      },
      {
        kind: "info",
        front: "Qual a diferen\u00e7a entre Container e VM?",
        back: "VM virtualiza hardware completo com SO pr\u00f3prio (pesado, segundos para iniciar). Container compartilha o kernel do host, isolando apenas o processo (leve, milissegundos). Docker \u00e9 o runtime mais popular.",
      },
      { a: "Infraestrutura reproduz\u00EDvel", b: "Infrastructure as Code", match: true },
      { a: "Deploy sem downtime", b: "Blue-Green Deployment", match: true },
      { a: "Integra\u00E7\u00E3o cont\u00EDnua", b: "Pipeline CI/CD", match: true },
      { a: "Ambiente isolado", b: "Container Docker", match: true },
      { a: "Orquestra\u00E7\u00E3o de containers", b: "Kubernetes", match: true },
      { a: "C\u00F3digo serverless", b: "AWS Lambda / Functions", match: true },
      { a: "Projeto pessoal simples", b: "Kubernetes em produ\u00E7\u00E3o", match: false },
      { a: "Ambiente de dev local", b: "Multi-cloud", match: false },
      { a: "Site est\u00E1tico", b: "Container orquestrado", match: false },
      { a: "Script bash \u00FAnico", b: "Terraform Enterprise", match: false },
      { a: "App desktop nativo", b: "Serverless", match: false },
      { a: "POC interna", b: "Multi-regi\u00E3o ativo-ativo", match: false },
    ],
  },

  // ===== Level 6 — Observabilidade (center) =====
  {
    id: "observabilidade",
    title: "Observabilidade",
    icon: "\u{1F4CA}",
    level: 6,
    prerequisites: ["cloud-devops"],
    pairs: [
      {
        kind: "info",
        front: "Quais s\u00e3o os 3 pilares da Observabilidade?",
        back: "Logs: eventos discretos do sistema.\nM\u00e9tricas: n\u00fameros ao longo do tempo (lat\u00eancia, erros, throughput).\nTraces: rastreamento de uma requisi\u00e7\u00e3o de ponta a ponta entre servi\u00e7os.",
      },
      {
        kind: "info",
        front: "O que \u00e9 SLO e como ele se relaciona com Error Budget?",
        back: "SLO (Service Level Objective) \u00e9 a meta de confiabilidade (ex: 99,9% de uptime). Error Budget \u00e9 quanto voc\u00ea pode errar sem violar o SLO. Se o budget acabar, pausam-se deploys e prioriza-se estabilidade.",
      },
      {
        kind: "info",
        front: "O que \u00e9 OpenTelemetry?",
        back: "Framework open-source que padroniza a coleta de logs, m\u00e9tricas e traces. Funciona com m\u00faltiplos backends (Jaeger, Prometheus, Datadog) via OTLP, sem vendor lock-in.",
      },
      { a: "Rastrear uma requisi\u00E7\u00E3o entre v\u00E1rios servi\u00E7os", b: "Distributed Tracing", match: true },
      { a: "M\u00E9tricas de lat\u00EAncia e throughput", b: "Prometheus + Grafana", match: true },
      { a: "Logs estruturados e centraliz\u00E1veis", b: "ELK Stack", match: true },
      { a: "Defini\u00E7\u00E3o de n\u00EDvel de servi\u00E7o aceit\u00E1vel", b: "SLO (Service Level Objective)", match: true },
      { a: "Instrumenta\u00E7\u00E3o padronizada multi-vendor", b: "OpenTelemetry", match: true },
      { a: "Alerta quando m\u00E9trica ultrapassa limiar", b: "Alertmanager", match: true },
      { a: "Propagac\u00E3o de contexto entre servi\u00E7os", b: "Trace ID / Span ID", match: true },
      { a: "Taxa de erros acima do SLO consome", b: "Error Budget", match: true },
      { a: "Diferenc\u0327a entre logs, m\u00E9tricas e traces", b: "Os tr\u00EAs pilares da observabilidade", match: true },
      { a: "Dashboards de sa\u00FAde em tempo real", b: "Grafana", match: true },
      { a: "App com 10 usuarios internos", b: "Distributed Tracing completo", match: false },
      { a: "Log de debug no console local", b: "ELK Stack em produ\u00E7\u00E3o", match: false },
      { a: "Script bash pontual", b: "SLO e Error Budget", match: false },
      { a: "Servi\u00E7o monol\u00EDtico simples", b: "Jaeger com 50 servi\u00E7os", match: false },
      { a: "Alta disponibilidade", b: "Desativar alertas", match: false },
      { a: "SLA de 99.9%", b: "N\u00E3o monitorar latencia", match: false },
    ],
  },

  // ===== Level 6 — Escalabilidade (left) =====
  {
    id: "escalabilidade",
    title: "Escalabilidade",
    icon: "\u{1F4C8}",
    level: 6,
    prerequisites: ["cloud-devops"],
    pairs: [
      {
        kind: "info",
        front: "Qual a diferen\u00e7a entre escala vertical e horizontal?",
        back: "Vertical (Scale Up): mais CPU/RAM na mesma m\u00e1quina. Tem limite f\u00edsico e \u00e9 mais caro. Horizontal (Scale Out): mais m\u00e1quinas. Mais flex\u00edvel e resiliente, mas exige que a aplica\u00e7\u00e3o seja stateless.",
      },
      {
        kind: "info",
        front: "Quais s\u00e3o as armadilhas do cache?",
        back: "Cache invalidation (quando invalidar?), thundering herd (muitas requisi\u00e7\u00f5es simult\u00e2neas ap\u00f3s expirar) e stale data (dados desatualizados). Use TTL curto para dados vol\u00e1teis.",
      },
      {
        kind: "info",
        front: "O que \u00e9 sharding e quando aplicar?",
        back: "Particionamento horizontal de um banco de dados, distribuindo dados entre m\u00faltiplos n\u00f3s por uma shard key. Aplique quando um \u00fanico n\u00f3 n\u00e3o aguenta o volume de dados ou throughput de escrita.",
      },
      { a: "Picos de tr\u00E1fego", b: "Auto-scaling", match: true },
      { a: "Leitura frequente dos mesmos dados", b: "Cache em mem\u00F3ria", match: true },
      { a: "Banco sobrecarregado", b: "Read replicas", match: true },
      { a: "Dados massivos", b: "Sharding horizontal", match: true },
      { a: "Assets est\u00E1ticos globais", b: "CDN", match: true },
      { a: "Requisi\u00E7\u00F5es lentas", b: "Fila ass\u00EDncrona", match: true },
      { a: "10 usu\u00E1rios internos", b: "Auto-scaling", match: false },
      { a: "App interna corporativa", b: "CDN global", match: false },
      { a: "Dados pequenos (100 rows)", b: "Sharding", match: false },
      { a: "Tr\u00E1fego constante e baixo", b: "Load balancer complexo", match: false },
      { a: "Blog pessoal", b: "Read replicas", match: false },
      { a: "API com 5 req/min", b: "Rate limiting avan\u00E7ado", match: false },
    ],
  },

  // ===== Level 6 — Seguran\u00E7a (right) =====
  {
    id: "seguranca",
    title: "Seguran\u00E7a",
    icon: "\u{1F6E1}\uFE0F",
    level: 6,
    prerequisites: ["cloud-devops"],
    pairs: [
      {
        kind: "info",
        front: "O que \u00e9 OAuth 2.0 e para que serve?",
        back: "Protocolo de autoriza\u00e7\u00e3o que permite uma aplica\u00e7\u00e3o acessar recursos em nome de um usu\u00e1rio sem expor credenciais. Fluxos: Authorization Code (web), PKCE (mobile/SPA), Client Credentials (server-to-server).",
      },
      {
        kind: "info",
        front: "O que \u00e9 mTLS e quando usar?",
        back: "Mutual TLS: ambos cliente e servidor apresentam certificados para autentica\u00e7\u00e3o m\u00fatua. Use para comunica\u00e7\u00e3o segura entre microsservi\u00e7os, garantindo que ambos os lados s\u00e3o leg\u00edtimos.",
      },
      {
        kind: "info",
        front: "Como Prepared Statements previnem SQL Injection?",
        back: "Separam o c\u00f3digo SQL dos dados do usu\u00e1rio. O banco compila a query primeiro, depois insere os par\u00e2metros como dados puros. Isso impede que input malicioso altere a estrutura da query.",
      },
      { a: "Autentica\u00E7\u00E3o de API", b: "OAuth 2.0 / JWT", match: true },
      { a: "Dados sens\u00EDveis em disco", b: "Criptografia em repouso", match: true },
      { a: "Comunica\u00E7\u00E3o entre servi\u00E7os", b: "mTLS", match: true },
      { a: "Risco de SQL Injection", b: "Prepared Statements", match: true },
      { a: "Input do usu\u00E1rio", b: "Valida\u00E7\u00E3o e sanitiza\u00E7\u00E3o", match: true },
      { a: "Segredos da aplica\u00E7\u00E3o", b: "Vault / Secret Manager", match: true },
      { a: "Dados 100% p\u00FAblicos", b: "Criptografia AES-256", match: false },
      { a: "API interna isolada", b: "OAuth 2.0 com PKCE", match: false },
      { a: "Conte\u00FAdo est\u00E1tico p\u00FAblico", b: "Autentica\u00E7\u00E3o MFA", match: false },
      { a: "Log de debug local", b: "Auditoria SOC2", match: false },
      { a: "Vari\u00E1vel de ambiente local", b: "HSM dedicado", match: false },
      { a: "Site institucional", b: "WAF + DDoS Shield", match: false },
    ],
  },

  // ===== Level 7 — Lideran\u00E7a T\u00E9cnica =====
  {
    id: "lideranca",
    title: "Lideran\u00E7a T\u00E9cnica",
    icon: "\u{1F451}",
    level: 7,
    prerequisites: ["escalabilidade", "observabilidade", "seguranca"],
    pairs: [
      {
        kind: "info",
        front: "O que \u00e9 um ADR (Architecture Decision Record)?",
        back: "Documento que registra uma decis\u00e3o arquitetural: contexto, op\u00e7\u00f5es consideradas, decis\u00e3o tomada e consequ\u00eancias. Cria um hist\u00f3rico do 'porqu\u00ea' das decis\u00f5es, essencial para onboarding e revis\u00e3o futura.",
      },
      {
        kind: "info",
        front: "O que s\u00e3o Fitness Functions em arquitetura evolutiva?",
        back: "Mecanismos automatizados que verificam se a arquitetura continua atendendo seus objetivos ao longo do tempo (acoplamento, performance, seguran\u00e7a em CI). Garantem que a evolu\u00e7\u00e3o n\u00e3o degrade propriedades importantes.",
      },
      {
        kind: "info",
        front: "Como gerenciar d\u00e9bito t\u00e9cnico de forma estrat\u00e9gica?",
        back: "Classifique por impacto e urg\u00eancia. Crie um roadmap de refatora\u00e7\u00e3o e aloque % do sprint para pagamento do d\u00e9bito. Use m\u00e9tricas como complexidade ciclom\u00e1tica para priorizar. D\u00e9bito ignorado acumula juros.",
      },
      { a: "Decis\u00E3o arquitetural importante", b: "ADR documentado", match: true },
      { a: "D\u00E9bito t\u00E9cnico crescente", b: "Roadmap de refatora\u00E7\u00E3o", match: true },
      { a: "Onboarding de novos devs", b: "Documenta\u00E7\u00E3o arquitetural", match: true },
      { a: "Escolha de tecnologia", b: "An\u00E1lise de trade-offs", match: true },
      { a: "Comunica\u00E7\u00E3o entre times", b: "Contratos de API", match: true },
      { a: "Evolu\u00E7\u00E3o do sistema", b: "Fitness Functions", match: true },
      { a: "Todo c\u00F3digo legado", b: "Reescrever do zero", match: false },
      { a: "Tecnologia nova hyped", b: "Adotar imediatamente", match: false },
      { a: "Dev junior travado", b: "Resolver por ele", match: false },
      { a: "Requisito ainda incerto", b: "Projetar solu\u00E7\u00E3o completa", match: false },
      { a: "Prazo apertado", b: "Pular todos os testes", match: false },
      { a: "Performance aceit\u00E1vel", b: "Otimizar prematuramente", match: false },
    ],
  },
  {
    id: "object-calisthenics",
    title: "Object Calisthenics",
    icon: "\u{1F9D8}",
    level: 8,
    prerequisites: ["lideranca"],
    pairs: [
      {
        kind: "info",
        front: "O que e Object Calisthenics?",
        back: "E um conjunto de regras de design e escrita de codigo, popularizado por Jeff Bay, para incentivar codigo mais coeso, legivel, testavel e orientado a objetos.",
      },
      {
        kind: "info",
        front: "Qual a ideia por tras de 'Don't use else'?",
        back: "Reduzir bifurcacoes desnecessarias e deixar o fluxo principal mais claro usando early return, guard clauses e composicao de comportamento.",
      },
      {
        kind: "info",
        front: "Por que 'Wrap all primitives and strings' e util?",
        back: "Porque move regras de validacao e comportamento para tipos explicitos do dominio, evitando logica espalhada e deixando o codigo mais semantico.",
      },
      { a: "Metodo com muitos niveis de identacao", b: "Extract Method", match: true },
      { a: "Fluxo condicional simples", b: "Early Return", match: true },
      { a: "CPF com validacao", b: "Value Object", match: true },
      { a: "Classe dedicada para manipular uma lista", b: "First Class Collection", match: true },
      { a: "Nomes claros e sem abreviacao", b: "Codigo mais legivel", match: true },
      { a: "Encadeamento excessivo de chamadas", b: "Violacao da regra One Dot Per Line", match: true },
      { a: "Classe com comportamento proprio", b: "Evitar getter/setter indiscriminado", match: true },
      { a: "Metodo pequeno e focado", b: "Mais facilidade de teste", match: true },
      { a: "Objeto com muitos campos sem relacao", b: "Baixa coesao", match: true },
      { a: "Classe pequena e especializada", b: "Single Responsibility", match: true },
      { a: "Abreviar tudo para escrever mais rapido", b: "Boa pratica de legibilidade", match: false },
      { a: "Getter/setter em toda propriedade", b: "Encapsulamento forte por padrao", match: false },
      { a: "Classe gigante com 800 linhas", b: "Keep All Entities Small", match: false },
      { a: "Longa cadeia pedido.Cliente.Endereco.Cidade.Estado", b: "One Dot Per Line", match: false },
      { a: "String solta para representar dinheiro", b: "Wrap All Primitives And Strings", match: false },
      { a: "Usar else em toda decisao", b: "Fluxo mais simples de manter", match: false },
      { a: "Classe com cinco listas e varias flags", b: "Alta coesao", match: false },
      { a: "Metodo com tres loops aninhados", b: "Only One Level Of Indentation Per Method", match: false },
      { a: "Nome de variavel 'xptoTmp'", b: "Meaningful Names", match: false },
      { a: "Objeto expondo estado para outra classe decidir tudo", b: "Encapsulamento orientado a comportamento", match: false },
      { a: "Object Calisthenics", b: "Conjunto de heuristicas para melhorar design OO", match: true },
    ],
  },
];

export function getNodeById(id: string): RoadmapNode | undefined {
  return roadmapNodes.find((n) => n.id === id);
}

export function getShuffledNodePairs(nodeId: string, count = config.questionsPerModule): Card[] {
  const node = getNodeById(nodeId);
  if (!node) return [];

  const infos = node.pairs.filter((c) => !isPair(c));
  const pairs = (node.pairs.filter(isPair) as Pair[])
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  // Interleave: insert 1 info card after every 3 pairs
  const result: Card[] = [];
  for (let i = 0; i < pairs.length; i++) {
    result.push(pairs[i]);
    if ((i + 1) % 3 === 0 && infos.length > 0) {
      result.push(infos[Math.floor((i + 1) / 3) - 1] ?? infos[infos.length - 1]);
    }
  }
  return result;
}
