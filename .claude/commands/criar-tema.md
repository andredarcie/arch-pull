# Criar tema diário

Crie um tema diário para o dev-match em `public/themes/$ARGUMENTS.json`.

O argumento é a data no formato `YYYY-MM-DD` e o tópico, separados por espaço.
Exemplo: `/criar-tema 2026-05-30 Clean Architecture`

Se nenhum argumento for passado, pergunte a data e o tópico antes de continuar.

---

## REGRAS CRÍTICAS (leia antes de escrever qualquer conteúdo)

Estas regras são verificadas primeiro e último. Violá-las invalida o tema.

### 1. Acentuação obrigatória

Todo o conteúdo em português deve ter acentuação correta.

Errado:
```
"nao combinam. o agente nao tem memoria entre sessoes"
```

Correto:
```
"Não combinam. O agente não tem memória entre sessões."
```

Isso inclui: description, context, front, back, conceptA, conceptB, explanation. Sem exceção.

### 2. Sem em dash (—)

O caractere — é proibido em qualquer parte do arquivo. Substitua por vírgula, dois-pontos ou parênteses conforme o contexto.

Errado: `"aberto para extensão — fechado para modificação"`
Correto: `"aberto para extensão, fechado para modificação"`

### 3. Contagem exata de cards

- Exatamente 12 cards: 6 info + 6 pair, alternados
- Posições: 0=info, 1=pair, 2=info, 3=pair ... 10=info, 11=pair
- Exatamente 3 pares com `match: true` e 3 com `match: false`

---

## Estrutura do arquivo

```json
{
  "date": "YYYY-MM-DD",
  "title": "Título do tema em inglês",
  "description": "Uma linha em português: o que o usuário vai aprender.",
  "context": {
    "relevance": "Por que esse tema importa agora, para um engenheiro de software."
  },
  "sources": [
    { "title": "Título (Autor/Publicação, Ano)", "url": "https://...", "category": "paper" },
    { "title": "Título (Publicação, Ano)", "url": "https://...", "category": "docs" },
    { "title": "Título (Publicação, Ano)", "url": "https://...", "category": "article" }
  ],
  "cards": [ ...exatamente 12 cards... ]
}
```

O campo `sources` é **obrigatório**. Liste apenas fontes reais consultadas. O campo `category` é opcional mas recomendado — controla o agrupamento visual no modal:
- `"paper"` — artigo peer-reviewed ou preprint (arXiv, TACL, NeurIPS...)
- `"docs"` — documentação oficial (Anthropic, MDN, especificações)
- `"article"` — post técnico de referência (blogs de engenharia, pesquisa publicada por empresas)

Nunca invente URLs.

O título segue a convenção do projeto em inglês: "Single Responsibility Principle", "Context Engineering".

---

## Info cards

Cada info card tem `front` (pergunta direta) e `back` (resposta).

Regras para o `back`:
- Mostre **ruim vs. bom** quando for sobre uma prática ou princípio
- Exemplos de código concisos (máximo ~10 linhas por bloco), com a linguagem correta (`typescript`, `markdown`, etc.)
- Comentários dentro de código em inglês
- Use "costuma", "pode", "em geral" para evitar afirmações absolutas desnecessárias

**Position 0** é sempre o primeiro exibido ao usuário. Deve definir o conceito central com um exemplo concreto de como ele se parece na prática.

**Positions 2 a 10** aprofundam, exploram casos de borda e armadilhas comuns.

---

## Pair cards

Cada pair card tem:
- `conceptA` e `conceptB`: 5 a 7 palavras cada
- `match`: true se complementam ou têm relação natural, false se não combinam
- `explanation`: 2 a 4 frases. Começa obrigatoriamente com "Combinam." ou "Não combinam."

### Pares devem testar raciocínio, não recall

O maior erro é criar um par que repete o que o info card acabou de dizer. Se o usuário consegue acertar apenas lembrando o card anterior, o par está fraco.

**Fraco (evitar):**
- Info card diz "spec evita retrabalho" → par: `"Spec revisada"` / `"Menos retrabalho"` — o usuário leu isso há 2 segundos.

**Forte (fazer):**
- `"Agente implementa spec ambígua sem questionar"` / `"Implementação alinhada com a intenção"` — agente silencioso não é sinal de boa spec. Requer raciocínio sobre um caso não coberto explicitamente.

Bons pares testam consequências não óbvias, casos em que a intuição erra, ou aplicam o princípio a um contexto diferente do que o info card usou.

---

## Cobertura dos 6 pares

Cada par deve cobrir um ângulo diferente do tema:

1. **Definição central**: o que é o conceito e sua característica mais importante
2. **Identificação**: como reconhecer o conceito (ou sua violação) na prática
3. **Mecanismo**: como funciona ou como aplicar
4. **Armadilha comum**: um equívoco frequente ou uso incorreto
5. **Consequência**: o que acontece quando é aplicado bem (ou mal)
6. **Nuance**: caso de borda ou detalhe que separa quem entende de quem decorou

---

## Exemplo de par bem construído

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
  "explanation": "Não combinam. Validar e persistir são razões de mudança diferentes: validação muda quando as regras de negócio evoluem, persistência muda quando o banco ou ORM muda. Colocar as duas na mesma função viola SRP no nível de função."
}
```

---

## CHECKLIST FINAL (verifique antes de salvar)

Execute estes passos nesta ordem após terminar todos os cards:

- [ ] **Acentuação**: abra cada campo de texto e confirme que palavras como "não", "é", "são", "também", "histórico", "código" estão acentuadas. Leia em voz alta mentalmente.
- [ ] **Sem em dash**: busque o caractere — no arquivo. Se encontrar, substitua.
- [ ] **Contagem**: exatamente 6 info cards (positions 0,2,4,6,8,10) e 6 pair cards (positions 1,3,5,7,9,11).
- [ ] **Balance**: conte os `match: true`. Deve ser exatamente 3.
- [ ] **Pares não triviais**: para cada par, pergunte: "o usuário consegue acertar isso apenas lembrando o card anterior?" Se sim, reescreva o par.
- [ ] **Sem repetição**: nenhum conceito central aparece em dois cards diferentes do mesmo tema.
- [ ] **Precisão técnica**: pesquise o tema antes de escrever para garantir que as afirmações são corretas.
- [ ] **Fontes**: o campo `sources` está preenchido com as URLs reais consultadas durante a pesquisa. Mínimo 3 fontes.
