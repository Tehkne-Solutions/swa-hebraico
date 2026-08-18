# SWA Hebraico — ALEPH 119

Aplicativo educacional da SimpleWay Academy para estudo de hebraico bíblico, alfabeto hebraico e Salmo 119, com coleção de cards, treino, progresso e revisão espaçada.

## Coleção

- 22 Master Letter Cards
- 176 Verse Cards do Salmo 119
- 198 cards no total
- organização acróstica completa de Aleph a Tav

## Runtime implementado

- coleção por letra
- fluxo de estudo Master + 8 versos
- XP e níveis
- streak diária
- desbloqueio progressivo das 22 letras
- revisão espaçada com Errei / Difícil / Bom / Fácil
- treino de escrita em canvas com mouse e toque
- quiz de reconhecimento das letras
- cards vistos e dominados
- dashboard de progresso persistente via `localStorage`
- layout responsivo

## Regra de desbloqueio

A próxima letra é liberada quando pelo menos 5 dos 9 itens da letra anterior (1 Master Letter Card + 8 Verse Cards) forem marcados como dominados.

## Catálogo

`data/cards.json` contém o contrato canônico das 22 letras e dos 176 caminhos dos Verse Cards. O catálogo deve sempre satisfazer:

- 22 letras;
- 8 versos por letra;
- Salmo 119:1–176 sem lacunas;
- 22 caminhos de Master Cards;
- 176 caminhos de Verse Cards.

## Assets

O runtime já referencia a estrutura final:

```text
assets/
  card_back.png
  master_letters/
    L-001_ALEPH.png
    ...
    L-022_TAV.png
  verse_cards/
    P119_..._VERSE_001.png
    ...
    P119_..._VERSE_176.png
```

Os binários premium da coleção são mantidos como lote de assets e entram em uma passagem dedicada de ingestão, separada da fundação textual do app.

## Execução local

```bash
python -m http.server 8080
```

Abra `http://localhost:8080`.

## Validação

```bash
node tools/validate_catalog.mjs
```

Assinatura oficial: **Tehkné Solutions**
