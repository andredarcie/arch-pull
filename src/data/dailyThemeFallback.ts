export interface FallbackCard {
  kind: "pair" | "info";
  conceptA: string | null;
  conceptB: string | null;
  match: boolean | null;
  explanation: string | null;
  front: string | null;
  back: string | null;
}

export interface ThemeContext {
  origin: string;
  motivation: string;
  relevance: string;
}

export interface LocalDailyTheme {
  title: string;
  description: string;
  context?: ThemeContext;
  cards: FallbackCard[];
}

function pair(conceptA: string, conceptB: string, match: boolean, explanation: string): FallbackCard {
  return { kind: "pair", conceptA, conceptB, match, explanation, front: null, back: null };
}

function info(front: string, back: string): FallbackCard {
  return { kind: "info", conceptA: null, conceptB: null, match: null, explanation: null, front, back };
}

export const todayTheme: LocalDailyTheme = {
  title: "Single Responsibility Principle",
  description: "O S do SOLID: cada módulo deve ter apenas uma razão para mudar.",
  context: {
    origin: "Robert C. Martin (Uncle Bob) formalizou o SRP no livro \"Agile Software Development\" em 2003, mas a ideia vem de conceitos de coesão descritos por Tom DeMarco nos anos 1970. Martin refinou a definição com a frase precisa: \"Uma classe deve ter apenas uma razão para mudar\", destacando que o critério é o ator (stakeholder), não a contagem de comportamentos.",
    motivation: "Em sistemas que crescem, classes que acumulam responsabilidades viram focos de conflito: uma mudança pedida pelo time de marketing pode quebrar a lógica financeira que nem foi tocada. O SRP força que cada parte do sistema mude por uma e apenas uma razão.",
    relevance: "SRP é o princípio mais cobrado em entrevistas sobre SOLID. Saber a definição precisa (razão para mudar, não apenas \"fazer uma coisa\") separa candidatos que decoraram a frase de quem entende o princípio de verdade. No dia a dia, classes que seguem SRP são triviais de testar, fáceis de reutilizar e raramente causam regressões inesperadas.",
  },
  cards: [
    info(
      "O que significa exatamente \"uma razão para mudar\"?",
      "A definição popular diz que SRP significa \"fazer uma coisa só\", mas a definição precisa de Uncle Bob é: uma classe deve responder a apenas um ator (stakeholder).\n\nRuim:\n```typescript\nclass Invoice {\n  calculate(): number { ... }  // time financeiro\n  printToPDF(): string { ... } // time de design\n}\n```\n\nSe o time financeiro mudar a regra de desconto, Invoice muda. Se o time de design alterar o layout, Invoice também muda. Duas razões: SRP violado.\n\nBom:\n```typescript\nclass Invoice {\n  calculate(): number { ... }\n}\n\nclass InvoicePrinter {\n  printToPDF(invoice: Invoice): string { ... }\n}\n```\n\nAgora cada classe muda por uma única razão."
    ),
    pair("Uma razão para mudar", "Definição precisa do SRP", true, "Combinam. A frase exata de Uncle Bob é: 'A module should be responsible to one, and only one, actor.' A razão para mudar é determinada pelo ator que solicita a mudança. Entender isso evita confundir SRP com 'fazer uma coisa', que não diz quando parar de dividir."),

    info(
      "Como identificar uma violação de SRP na prática?",
      "Para cada método da classe, pergunte: quem pediria a mudança aqui?\n\nRuim:\n```typescript\nclass UserService {\n  login(email: string, password: string) { ... }  // segurança\n  sendWelcomeEmail(user: User) { ... }            // marketing\n  generateActivityReport() { ... }               // gestão\n}\n```\n\nTrês atores diferentes respondem: SRP violado três vezes.\n\nSe todos os métodos fossem respondidos pelo mesmo time, a classe seria coesa mesmo com muitos métodos."
    ),
    pair("Métodos com atores diferentes na mesma classe", "Violação de SRP", true, "Combinam. O teste prático do SRP é exatamente esse: se métodos diferentes seriam alterados por stakeholders diferentes, a classe acumulou responsabilidades demais. Cada ator deveria ter sua própria classe."),

    info(
      "SRP se aplica a funções, não apenas a classes",
      "Uma função viola SRP quando mistura duas responsabilidades distintas.\n\nRuim:\n```typescript\nasync function validateAndSaveUser(data: UserDTO) {\n  if (!data.email.includes('@')) throw new Error('Email invalido');\n  return db.users.create(data);\n}\n```\n\nBom:\n```typescript\nfunction validateUser(data: UserDTO) {\n  if (!data.email.includes('@')) throw new Error('Email invalido');\n}\n\nasync function saveUser(data: UserDTO) {\n  return db.users.create(data);\n}\n```\n\nValidação muda quando as regras de negócio evoluem. Persistência muda quando o banco muda. Duas razões: funções separadas."
    ),
    pair("Função que valida entrada e persiste no banco", "Responsabilidade única", false, "Não combinam. Validar e persistir são razões de mudança diferentes: validação muda quando as regras de negócio evoluem, persistência muda quando o banco ou o ORM muda. Colocar as duas na mesma função é SRP violado no nível de função."),

    info(
      "SRP não significa 'uma classe, um método'",
      "Uma classe pode ter vários métodos e ainda seguir SRP, desde que todos mudem pela mesma razão.\n\n```typescript\nclass PaymentProcessor {\n  charge(amount: number): Receipt { ... }\n  refund(receiptId: string): void { ... }\n  getStatus(receiptId: string): PaymentStatus { ... }\n  validateCard(card: Card): boolean { ... }\n  calculateFees(amount: number): number { ... }\n}\n```\n\nTodos esses métodos seriam solicitados pelo mesmo ator: o time financeiro. Dividir em 5 classes de um método seria over-engineering sem benefício real."
    ),
    pair("Classe com vários métodos sobre o mesmo domínio", "Viola SRP", false, "Não combinam. SRP não limita o número de métodos por classe. O critério é o ator: se todos os métodos respondem ao mesmo stakeholder, a classe tem uma única razão para mudar. Coesão alta e muitos métodos relacionados são perfeitamente compatíveis com SRP."),

    info(
      "Por que SRP facilita testes unitários?",
      "Classes que seguem SRP têm menos dependências, e menos dependências significam menos mocks no teste.\n\nRuim:\n```typescript\nclass UserService {\n  constructor(\n    private db: Database,\n    private mailer: EmailService,\n    private logger: Logger,\n    private cache: CacheService\n  ) {}\n}\n// 4 dependencias para mockar\n```\n\nBom:\n```typescript\nclass UserRegistrar {\n  constructor(private db: Database) {}\n}\n// 1 dependencia para mockar\n```"
    ),
    pair("Classe com responsabilidade única", "Teste unitário mais simples", true, "Combinam. Uma classe com responsabilidade única naturalmente tem poucas dependências: ela só precisa das ferramentas do seu domínio específico. Poucas dependências significam menos mocks e um teste mais direto. SRP e testabilidade se reforçam mutuamente."),

    info(
      "Violação de SRP causa conflitos de merge",
      "Quando SRP é violado, times diferentes editam o mesmo arquivo ao mesmo tempo.\n\nCenário: UserService com login, sendEmail e generateReport.\n\n- Time de segurança muda o hash de senha em UserService.\n- Time de marketing muda o template de e-mail, também em UserService.\n\nResultado: conflito de merge. E ao resolver, alguém acidentalmente reverte a mudança de segurança.\n\nCom SRP: cada time tem sua própria classe e nunca interfere no código do outro."
    ),
    pair("Classe compartilhada por múltiplos atores", "Risco de conflito de merge", true, "Combinam. Quando vários times editam a mesma classe, conflitos de merge são inevitáveis. E quando um time resolve o conflito sem entender o código do outro, regressões aparecem. SRP não é apenas sobre design elegante: é sobre redução de risco operacional real em times que trabalham em paralelo."),
  ],
};
