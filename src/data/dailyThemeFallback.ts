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
  return { kind: "info", conceptA: null, conceptB: null, match: null, front, back };
}

export const todayTheme: LocalDailyTheme = {
  title: "Object Calisthenics",
  description: "9 regras para escrever código orientado a objetos de alta qualidade.",
  context: {
    origin: "Jeff Bay publicou as 9 regras no livro \"The ThoughtWorks Anthology\" em 2008. Ele as criou como exercícios práticos (inspirados na calistenia física) para times que queriam melhorar a qualidade do código sem depender de métricas abstratas.",
    motivation: "Combater problemas crônicos em projetos reais: classes gigantes que fazem tudo, acoplamento excessivo e código impossível de testar. As regras são propositalmente rígidas para forçar o desenvolvedor a abandonar hábitos arraigados.",
    relevance: "Em entrevistas de nível pleno e sênior, dominar esses princípios demonstra maturidade em design de software. No dia a dia, aplicar mesmo 4 ou 5 dessas regras reduz o custo de manutenção e torna o código muito mais fácil de testar.",
  },
  cards: [
    info(
      "O que fazer quando um método tem um IF dentro de um FOR?",
      "Se um método tem um IF dentro de um FOR, já tem dois níveis, sinal de que ele faz mais de uma coisa.\n\nRuim:\n```typescript\nfor (const order of orders) {\n  if (order.isPaid()) {\n    processPayment(order);\n  }\n}\n```\n\nBom:\n```typescript\nfor (const order of orders) {\n  processPaidOrder(order);\n}\n\nfunction processPaidOrder(order: Order) {\n  processPayment(order);\n}\n```\n\nExtrair o corpo interno em um método privado com nome descritivo deixa o método original como uma narrativa de alto nível."
    ),
    pair("Um nível de identação por método", "Extrair método menor", true, "Eles combinam. A única forma de reduzir o nível de identação sem perder a lógica é extrair o bloco interno em um método separado. A regra e a técnica são inseparáveis: se você tem dois níveis, você extrai. Sempre."),

    info(
      "Como simplificar um método com vários ramos IF/ELSE?",
      "O ELSE aumenta a carga cognitiva: você precisa guardar o contexto do IF na cabeça enquanto lê o ELSE.\n\nRuim:\n```typescript\nfunction getDiscount(user: User): number {\n  if (user.isPremium()) {\n    return 0.2;\n  } else {\n    return 0;\n  }\n}\n```\n\nBom (early return / guard clause):\n```typescript\nfunction getDiscount(user: User): number {\n  if (user.isPremium()) return 0.2;\n  return 0;\n}\n```\n\nO código fica linear, lido de cima para baixo sem rastrear ramos."
    ),
    pair("Sem palavra-chave ELSE", "Guard clause / retorno antecipado", true, "Eles combinam. Sem ELSE, como você lida com o caso especial? Retornando cedo. Isso é um guard clause: trate a exceção no topo do método com um return ou throw, e o resto do código segue sem ramos. São duas formas de descrever a mesma técnica."),

    info(
      "O que fazer quando um string ou number representa um conceito de negócio?",
      "Um string ou number solto não carrega regras de negócio. O compilador aceita qualquer string como CPF.\n\nRuim:\n```typescript\nfunction createUser(cpf: string) {\n  // qualquer string passa aqui\n}\n```\n\nBom (Value Object):\n```typescript\nclass CPF {\n  readonly value: string;\n\n  constructor(raw: string) {\n    if (!CPF.isValid(raw)) throw new Error('CPF inválido');\n    this.value = raw.replace(/\\D/g, '');\n  }\n\n  private static isValid(raw: string): boolean {\n    return /^\\d{11}$/.test(raw.replace(/\\D/g, ''));\n  }\n\n  formatted(): string {\n    return this.value.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/, '$1.$2.$3-$4');\n  }\n}\n```\n\nAgora é impossível criar um CPF inválido. Validação e formatação ficam encapsuladas."
    ),
    pair("Envolver primitivos em objetos", "Value Object", true, "Eles combinam. Value Object é o nome do padrão que descreve exatamente isso: uma classe criada para representar um valor primitivo com significado de negócio. Ao criar a classe CPF em vez de usar string, você está criando um Value Object. São o mesmo conceito com nomes diferentes."),

    info(
      "Como evitar lógica de coleção espalhada pelo código?",
      "Toda coleção deve ser encapsulada em sua própria classe, sendo a única variável de instância dela.\n\nRuim (lógica espalhada):\n```typescript\nconst paid = orders.filter(o => o.isPaid());\nconst sorted = paid.sort((a, b) => a.date - b.date);\n```\n\nBom (First Class Collection):\n```typescript\nclass OrderCollection {\n  constructor(private readonly orders: Order[]) {}\n\n  paid(): OrderCollection {\n    return new OrderCollection(this.orders.filter(o => o.isPaid()));\n  }\n\n  sortedByDate(): Order[] {\n    return [...this.orders].sort((a, b) => a.date - b.date);\n  }\n}\n```\n\nA lógica de iteração fica em um único lugar, testável de forma isolada."
    ),
    pair("First Class Collection", "Array primitivo com lógica espalhada", false, "Não combinam. São opostos: o array espalhado é o problema, a First Class Collection é a solução. Quando você encapsula a coleção em uma classe dedicada, você elimina exatamente aquela lógica solta. Associá-los seria como combinar 'incêndio' com 'extintor'."),

    info(
      "O que está errado em `order.getCustomer().getAddress().getCity()`?",
      "Encadeamentos violam a Lei de Demeter: um objeto só deve falar com seus vizinhos diretos.\n\nRuim:\n```typescript\nconst city = order.getCustomer().getAddress().getCity();\n```\n\nSe Address mudar, Order quebra, mesmo sem ter nada a ver com Address.\n\nBom (delegar):\n```typescript\nclass Order {\n  getCustomerCity(): string {\n    return this.customer.getCity();\n  }\n}\n\nclass Customer {\n  getCity(): string {\n    return this.address.getCity();\n  }\n}\n```\n\nCada classe conhece apenas seus vizinhos diretos. Nenhuma expõe seus internos.\n\nExceção: fluent interfaces e method chaining sobre o mesmo objeto são aceitáveis."
    ),
    pair("Um ponto por linha", "Lei de Demeter", true, "Eles combinam. A Lei de Demeter diz: fale apenas com quem você conhece diretamente. Um ponto por linha é a forma de garantir isso no código. Cada ponto extra é uma conversa com um estranho. A regra é a implementação prática da lei."),

    info(
      "Por que `calcOrdTtl` é um nome de função ruim?",
      "Abreviações parecem economizar tempo, mas custam caro na leitura.\n\nRuim:\n```typescript\nfunction calcOrdTtl(ord: Ord[]): number {\n  return ord.reduce((acc, o) => acc + o.val, 0);\n}\n```\n\nBom:\n```typescript\nfunction calculateOrderTotal(orders: Order[]): number {\n  return orders.reduce((total, order) => total + order.value, 0);\n}\n```\n\nO código é escrito uma vez e lido dezenas de vezes. Nomes completos são auto-documentados.\n\nRegra prática: se você precisaria de um comentário para explicar o que uma variável significa, o nome dela está errado.\n\nExceções aceitáveis: i em for loops, siglas do domínio (CPF, HTTP, URL) e id."
    ),
    pair("Variáveis com nomes curtos", "Legibilidade alta", false, "Não combinam. Nomes curtos prejudicam a leitura, não ajudam. `calcOrdTtl` economiza segundos na digitação e custa tempo toda vez que alguém lê. Código é escrito uma vez e lido dezenas. Nomes completos são a base da legibilidade."),

    info(
      "Qual o limite de linhas que uma classe deveria ter?",
      "Dois limites concretos:\n- Classes: no máximo 50 linhas\n- Pacotes/módulos: no máximo 10 arquivos\n\nClasses grandes invariavelmente acumulam responsabilidades.\n\nRuim:\n```typescript\nclass UserService {\n  // autenticação, perfil, preferências,\n  // histórico, notificações... 400 linhas\n}\n```\n\nBom:\n```typescript\nclass UserAuthService    { /* ~40 linhas */ }\nclass UserProfileService { /* ~35 linhas */ }\nclass UserNotifier       { /* ~30 linhas */ }\n```\n\nPacotes com muitos arquivos viram 'gavetas de utilidades' sem identidade clara."
    ),
    pair("Entidades pequenas (máx. 50 linhas)", "Single Responsibility", true, "Eles combinam. Uma classe de 50 linhas fisicamente não tem espaço para fazer duas coisas. O limite de tamanho é uma forma concreta de garantir responsabilidade única. Toda vez que uma classe cresce além disso, quase sempre é porque assumiu uma segunda responsabilidade."),

    info(
      "Por que limitar o número de atributos de uma classe força coesão?",
      "Esta é a regra mais radical. Limitar a 2 atributos por classe força coesão extrema.\n\nRuim:\n```typescript\nclass User {\n  name: string;\n  email: string;\n  street: string;\n  city: string;\n  role: string;\n}\n```\n\nBom (dividir em conceitos próprios):\n```typescript\nclass Name {\n  constructor(\n    readonly first: string,\n    readonly last: string\n  ) {}\n}\n\nclass Address {\n  constructor(\n    readonly street: string,\n    readonly city: string\n  ) {}\n}\n\nclass User {\n  constructor(\n    readonly name: Name,\n    readonly address: Address\n  ) {}\n}\n```\n\nClasses com poucos atributos são triviais de testar e de entender."
    ),
    pair("No máximo 2 variáveis de instância", "Alta coesão da classe", true, "Eles combinam. Coesão significa que tudo na classe existe para o mesmo propósito. Com apenas 2 atributos, a classe não consegue representar dois conceitos ao mesmo tempo. O limite força você a separar responsabilidades em classes menores, o que é exatamente o que coesão alta significa."),

    info(
      "O que há de errado em ler o estado de um objeto para tomar uma decisão fora dele?",
      "Getters e setters públicos transformam objetos em estruturas passivas: qualquer código pode ler e alterar o estado interno.\n\nAnti-padrão (Ask, Then Act):\n```typescript\nif (order.getStatus() === 'pending') {\n  order.setStatus('paid');\n  order.setPaidAt(new Date());\n}\n```\n\nBom (Tell, Don't Ask):\n```typescript\nclass Order {\n  markAsPaid(): void {\n    if (this.status !== 'pending') {\n      throw new Error('Apenas pedidos pendentes podem ser pagos');\n    }\n    this.status = 'paid';\n    this.paidAt = new Date();\n  }\n}\n\n// uso:\norder.markAsPaid();\n```\n\nO objeto encapsula a transição de estado, valida pré-condições e garante invariantes."
    ),
    pair("Getter público para lógica externa", "Encapsulamento forte", false, "Não combinam. Getter público expõe o estado interno, e qualquer código externo passa a tomar decisões baseadas nele. Isso é encapsulamento fraco. Encapsulamento forte exige o oposto: o objeto decide sozinho o que fazer com seu estado, sem expô-lo para ninguém."),
  ],
};
