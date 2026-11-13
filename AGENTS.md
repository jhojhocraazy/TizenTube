<!--
  Seguranca: chaves de API (provedores de letras, TMDB/OMDb, servicos de video)
  NUNCA devem ser hardcoded neste projeto. Elas sao injetadas exclusivamente pelo
  usuario via localStorage, pelas configuracoes da interface visual. Nao adicione
  chaves reais a arquivos versionados.
-->

# AGENTS.md — Diretriz local de localização: TizenTube

## 1. Domínio

Modificação injetada no app YouTube de TVs Samsung com Tizen OS. O texto aparece em overlay sobre o
player, em menu de vídeo e em toasts, sempre numa tela de 10 pés, controlada por D-pad e lida a cerca
de 2,5 metros.

A restrição não é estilística, é física: o usuário não pode se aproximar para ler. Uma string
gramaticalmente perfeita que ocupa três linhas é um defeito de produto. O guia de localização aqui é,
antes de tudo, um guia de densidade.

## 2. Onde o texto vive (verificado no clone)

| Caminho | Papel |
| --- | --- |
| `mods/translations/resources/en.json` | fonte EN (~15 KB) |
| `mods/translations/resources/pt-BR.json` | pt-BR (~15 KB) — paridade obrigatória com o `en.json` |
| `mods/translations/resources/pt-PT.json` | variante europeia, registro separado |
| `mods/translations/i18nResources.js` | importa os JSON por locale e resolve em runtime |
| `mods/translations/language-names.js` | nomes de idioma exibidos |
| `mods/features/` | ad-block, SponsorBlock, velocidade, PiP |
| `mods/ui/` | injeção de overlay e menu |

Fato estrutural: o JSON é **aninhado** em oito seções (`settings`, `welcomeMsg`, `sponsorblock`,
`player`, `toasts`, `videoMenu`, `common`, `__contributors`). A seção define o registro: `toasts` é
efêmero e curto; `settings` aceita uma linha de apoio; `videoMenu` é botão.

## 3. Protocolo de inferência semântica

1. **Auditar antes de criar.** O `pt-BR.json` existente é evidência de decisões anteriores. Leia a
   chave em EN, a versão já publicada em pt-BR e o ponto de renderização; só então proponha mudança.
2. **Medir o slot real.** Vá ao `mods/ui` e veja se o texto entra em botão, linha de menu ou toast.
   O limite vem daí, não do arquivo de tradução.
3. **Classificar pelo registro:** rótulo de ação (verbo curto), estado (adjetivo), toast (resultado em
   uma linha), ajuda (duas frases no máximo).
4. **Buscar evidência de plataforma.** Como o YouTube de TV e os apps de streaming em TV no Brasil
   rotulam esse mesmo conceito? Cite a fonte.
5. **Testar de longe.** Imagine ler a 2,5 m, com o vídeo rodando atrás. Se precisar de esforço, corte.
6. **Registrar** decisão e, quando houver mudança no `pt-BR` existente, o motivo da divergência.

## 4. Invariantes técnicas

- Estrutura aninhada do JSON preservada; nenhuma chave renomeada ou movida de seção.
- A ordem das chaves espelha `en.json`: o diff fica legível e `update-translations.js` (que
  reescreve via `JSON.stringify(data, null, 4)`) permanece idempotente.
- Placeholders e marcação do userScript (`{}`, tags) intactos.
- Nenhum `\n` manual em rótulo — o layout de TV decide a quebra.
- Marcas e nomes de recurso (`YouTube`, `SponsorBlock`, `Tizen`, `Samsung`) não se traduzem.
- Sintaxe JS válida: vírgula sobrando em `i18nResources.js` derruba todas as traduções.
- `i18nResources.js` e `language-names.js` precisam ser ES5 válidos (alvo Chrome 47): sem
  atalhos de objeto, sem chaves computadas, sem template literal.

## 5. Régua de densidade por slot

O limite não é global: cada slot tem um orçamento de caracteres próprio, medido no ponto de
renderização (seção 2). A régua abaixo é a referência de aceitação.

| Slot | Chaves | Máx. | Por que |
| --- | --- | --- | --- |
| Botão de transporte | `player.previous`, `player.next`, `player.miniPlayer`, `player.playbackSpeed.button`, `player.share.button`, `common.back` | **14** | rótulo sob ícone na barra de transporte; passar disso empurra os botões vizinhos e quebra o alvo de D-pad |
| Item de menu de vídeo | `videoMenu.*` | **24** | linha única do painel de overflow do vídeo |
| Linha de configuração | `settings.**` (`name`, `title`, `subtitle`) | **40** | linha de lista a 2,5 m: até 40 o olho varre sem mover a cabeça; acima disso o rótulo compete com o ícone e o valor à direita |
| Toast | `toasts.*`, `sponsorblock.toasts.*`, `welcomeMsg.subtitle` | **60** | uma linha, ~3 s de leitura com o vídeo rodando atrás |
| Título de overlay | `welcomeMsg.title`, `player.chapters.title` | **28** | cabeçalho de painel sobre o player |
| Nome de segmento | `sponsorblock.segments.*` | **24** | substantivo nu inserido em `{{segment}}`; o texto final é o template que precisa caber |

### 5.1 Estilo

- Caixa de frase (sentence case), inclusive no primeiro termo de config: "Ativar SponsorBlock",
  não "Ativar Sponsorblock".
- Ação no infinitivo ou no imperativo de controle remoto: "Selecione", "Pressione", "Navegue",
  "Escolha", "Abra", "Pular", "Ativar".
- Vocabulário de D-pad; nunca verbo de toque ou mouse: "clique", "toque", "toque longo",
  "arraste", "deslize".
- Zero subordinada com "que" em rótulo; nenhum parêntese explicativo fora de sigla consagrada
  (`PiP`, `AFR`, `QR`).
- Sem ponto final em botão, item de menu ou toggle. Toast pode ter ponto.

### 5.2 Exceções registradas (medidas, não licença para relaxar)

| chave | tamanho | motivo |
| --- | --- | --- |
| `player.pictureInPicture` | 18 (slot 14) | "Picture-in-Picture" é termo consagrado exigido; abreviar para "PiP" só onde o próprio EN já abrevia (`swapMPWithPIP`) |
| `settings.options.updater.updateAvailable.subtitle` | 58 (slot 40) | linha de modal com dois placeholders (36 caracteres só de `{{…}}`); a forma gramatical mínima ainda passa do orçamento de linha de lista |
| `settings.supportTT.content.5` | 74 (slot 40) | linha de URL de doação; URL não se quebra nem se traduz |
| `settings.supportTT.content.6` | 53 (slot 40) | idem |

### 5.3 Duas armadilhas de português

- **Gênero em `{{segment}}`**: `sponsorblock.segments.*` são substantivos nus e ora masculinos
  ("patrocínio"), ora femininos ("introdução"). Toast com particípio ("foi pulado") quebra a
  concordância em metade dos casos. Prefira construção invariável: "Não vou pular {{segment}}
  (já pulei {{count}}x)".
- **Plural sem chave**: `sponsorblock.toasts.notSkipping` não tem variante plural no i18next.
  Escrever "{{count}} vezes" produz "1 vezes". Use `{{count}}x`.

## 6. Proibições

- Frase longa em overlay, mesmo que o EN seja longo — se o EN estourar, registre o conflito.
- Traduzir nome de recurso do produto ou de marca.
- Prescrever termo por dicionário sem olhar o slot e o registro da seção.
- Editar `mods/features/` para "acomodar" texto.
- Tratar `pt-PT.json` como fonte para pt-BR.

## 7. Verificação

```bash
node --check mods/translations/i18nResources.js
npm run build     # após npm install
```

Checklist: paridade de chaves com o `en.json`, limites por seção, nenhum `\n` manual, sintaxe válida,
marcas intactas.

## 8. Handoff

| seção | chave | EN | pt-BR escolhido | limites (slot) | evidência | mudou o existente? por quê |
| --- | --- | --- | --- | --- | --- | --- |

Toda alteração em chave já traduzida exige justificativa explícita na última coluna.
