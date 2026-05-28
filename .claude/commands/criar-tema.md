# Criar tema diário

Crie um tema diário para o dev-match em `public/themes/$ARGUMENTS.json`.

O argumento é a data no formato `YYYY-MM-DD` e o tópico, separados por espaço.
Exemplo: `/criar-tema 2026-05-30 Clean Architecture`

Se nenhum argumento for passado, pergunte a data e o tópico antes de continuar.

---

## Regras obrigatórias

### Estrutura do arquivo

```json
{
  "date": "YYYY-MM-DD",
  "title": "Título do tema",
  "description": "Uma linha: o que o usuário vai aprender.",
  "context": {
    "relevance": "Por que esse tema importa agora, para um engenheiro de software."
  },
  "cards": [ ...exatamente 12 cards... ]
}
```

### Cards: sempre 6 pares, nunca mais

- O arquivo tem **exatamente 12 cards**: 6 info + 6 pair, alternados.
- Cada info card é seguido por 1 pair card. Nunca dois info cards seguidos, nunca dois pairs seguidos.
- Os pares devem ser **balanceados**: 3 com `match: true` e 3 com `match: false`.
- Positions: 0=info, 1=pair, 2=info, 3=pair, ... 10=info, 11=pair.

### Ordem dos grupos

O primeiro grupo (position 0 e 1) é sempre mostrado primeiro ao usuário e os outros são embaralhados. Por isso:
- **Position 0**: info card que define o conceito central e mostra como ele se parece na prática (exemplo concreto).
- **Positions 2-11**: aprofundamentos, casos de borda, armadilhas comuns.

### Conteúdo dos info cards

Cada info card tem:
- `front`: uma pergunta direta e específica sobre o tema.
- `back`: resposta com exemplo de código quando relevante. Use blocos de código com a linguagem correta (typescript, markdown, etc.).

Regras para o `back`:
- Mostre **ruim vs. bom** quando for sobre uma prática ou princípio.
- Exemplos de código devem ser concisos (máximo ~10 linhas por bloco).
- Comentários dentro de código em inglês.
- Evite afirmações absolutas: use "costuma", "pode", "em geral" quando apropriado.
- Não use em dash (—). Substitua por vírgula, dois-pontos ou parênteses.

### Conteúdo dos pair cards

Cada pair card tem:
- `conceptA`: primeiro conceito (5-7 palavras).
- `conceptB`: segundo conceito (5-7 palavras).
- `match`: true se os conceitos se complementam ou têm relação natural, false se não combinam ou são incompatíveis.
- `explanation`: 2-4 frases explicando **por que** combinam ou não. Começa com "Combinam." ou "Não combinam."

Os pares devem testar julgamento, não memorização. Evite pares óbvios demais (ex: "Bug" / "Erro" é fácil demais). Prefira pares que exijam raciocínio sobre o tema.

### Língua e estilo

- Todo o conteúdo em português com acentuação correta.
- Título em inglês (convenção do projeto: "Single Responsibility Principle", "Specification-Driven Development").
- Description e context em português.
- Tom direto, sem rodeios. Sem introduções como "Neste card veremos...".
- Evite repetir o mesmo conceito em cards diferentes do mesmo tema.

---

## Cobertura dos 6 pares

Distribua os 6 pares de forma que cada um cubra um ângulo diferente do tema:

1. **Definição central**: o que é o conceito e sua característica mais importante.
2. **Identificação**: como reconhecer o conceito (ou sua violação) no código real.
3. **Mecanismo**: como funciona ou como aplicar na prática.
4. **Armadilha comum**: um equívoco frequente ou uso incorreto do conceito.
5. **Consequência**: o que acontece quando é aplicado bem (ou mal).
6. **Nuance**: um caso de borda, exceção ou detalhe que separa quem entende de quem decorou.

---

## Exemplo de estrutura de um par bem construído

```json
{
  "kind": "info",
  "position": 4,
  "front": "SRP se aplica a funções, não apenas a classes?",
  "back": "Sim. Uma função viola SRP quando mistura duas responsabilidades.\n\nRuim:\n```typescript\nasync function validateAndSave(data: UserDTO) {\n  // validation logic\n  if (!data.email.includes('@')) throw new Error('Invalid email');\n  // persistence logic\n  return db.users.create(data);\n}\n```\n\nBom:\n```typescript\nfunction validateUser(data: UserDTO) {\n  if (!data.email.includes('@')) throw new Error('Invalid email');\n}\nasync function saveUser(data: UserDTO) {\n  return db.users.create(data);\n}\n```\n\nValidação muda quando as regras de negócio evoluem. Persistência muda quando o banco muda. Duas razões, funções separadas."
},
{
  "kind": "pair",
  "position": 5,
  "conceptA": "Função que valida e persiste no banco",
  "conceptB": "Responsabilidade única",
  "match": false,
  "explanation": "Não combinam. Validar e persistir são razões de mudança diferentes: validação muda quando as regras de negócio evoluem, persistência muda quando o banco ou ORM muda. Colocar as duas na mesma função é SRP violado no nível de função."
}
```

---

## Antes de escrever

1. Pesquise o tema para garantir precisão técnica. Priorize fontes como MDN, documentação oficial, artigos de referência e livros clássicos da área.
2. Identifique os 6 ângulos distintos que cobrem o tema sem repetição.
3. Para cada ângulo, escreva o info card antes do pair card.
4. Revise: nenhum par é óbvio demais, nenhuma afirmação é absoluta sem necessidade, acentuação está correta, nenhum em dash foi usado.
5. Confirme: exatamente 6 info cards, 6 pairs, 3 true e 3 false.
