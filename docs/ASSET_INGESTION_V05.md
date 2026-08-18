# ALEPH 119 — Premium Card Asset Ingestion v0.5

Assinatura: **Tehkné Solutions**

## Objetivo

Instalar os 198 PNGs premium da coleção ALEPH 119 no catálogo runtime sem renomeação manual e sem aceitar arquivos fora do contrato visual.

## Contrato

- 22 Master Letter Cards
- 176 Verse Cards do Salmo 119
- 198 cards primários
- PNG
- 1400 × 2000 px
- `assets/card_back.png` como verso oficial
- caminhos canônicos definidos em `data/cards.json`

## Instalação

A partir de uma cópia local da coleção completa:

```bash
node tools/card-assets-v05.mjs --install --source=/caminho/ALEPH119_COMPLETE_COLLECTION_198_v1.0
```

O instalador procura os arquivos pelo basename canônico, valida assinatura PNG e dimensões e copia para os caminhos definidos pelo catálogo.

## Auditoria

Modo informativo, usado no CI enquanto a ingestão binária ainda está em rollout:

```bash
node tools/card-assets-v05.mjs
```

Gate final, a ser ativado quando os assets estiverem presentes:

```bash
node tools/card-assets-v05.mjs --strict
```

O modo `--strict` falha se qualquer um dos 198 cards ou o verso oficial estiver ausente.

## Regra de release

Os fallbacks visuais da v0.3 somente podem ser considerados mecanismo de contingência. A coleção de produção deve passar no gate `--strict` antes de ser marcada como asset-complete.
