# 📸 Guia de Screenshots - SmartStock

## 🎯 Objetivo

Este guia ajuda você a capturar screenshots profissionais do SmartStock para o README.

## 📋 Screenshots Necessários

### 1. Dashboard Principal
**Onde capturar:** Página inicial após login  
**O que mostrar:**
- Cards com métricas (Total de Produtos, Valor do Estoque, Estoque Crítico)
- Gráficos interativos (barras e pizza)
- Rankings (Mais Vendido, Mais Lucrativo, Menos Vendido)

**Dica:** Use dados reais para mostrar o sistema funcionando

### 2. Gestão de Produtos
**Onde capturar:** Página `/products`  
**O que mostrar:**
- Lista de produtos com filtros
- Badges de status (Estoque baixo, Parado)
- Métricas calculadas (Margem de lucro)

### 3. Sistema de Alertas
**Onde capturar:** Página `/alerts`  
**O que mostrar:**
- Lista de alertas não lidos
- Diferentes tipos de alertas (Estoque baixo, Produto parado, Oportunidade)
- Contador de alertas

### 4. Gráficos e Análises
**Onde capturar:** Dashboard com dados  
**O que mostrar:**
- Gráfico de barras por categoria
- Gráfico de pizza de distribuição
- Visualizações interativas

## 🎨 Dicas de Captura

1. **Resolução:** Use 1920x1080 ou superior
2. **Dados Realistas:** Popule o sistema com dados de exemplo
3. **Navegador:** Use Chrome ou Firefox em modo claro
4. **Ferramentas:**
   - Windows: `Win + Shift + S` (Snipping Tool)
   - Mac: `Cmd + Shift + 4`
   - Ou use extensões do navegador

## 📝 Como Adicionar ao README

1. Crie uma pasta `docs/screenshots/` no projeto
2. Salve as imagens com nomes descritivos:
   - `dashboard.png`
   - `products.png`
   - `alerts.png`
   - `charts.png`

3. No README, substitua os placeholders:
```markdown
![Dashboard](docs/screenshots/dashboard.png)
```

## 🎬 Vídeo/GIF (Opcional mas Recomendado)

Crie um GIF de 30 segundos mostrando:
1. Login
2. Navegação pelo dashboard
3. Visualização de produtos
4. Sistema de alertas

**Ferramentas:**
- [ScreenToGif](https://www.screentogif.com/) (Windows)
- [Kap](https://getkap.co/) (Mac)
- [Peek](https://github.com/phw/peek) (Linux)

## 🚀 Deploy para Demo

Para ter um link de demo:
1. Deploy do Frontend: [Vercel](https://vercel.com)
2. Deploy do Backend: [Render](https://render.com) ou [Railway](https://railway.app)
3. Adicione o link no topo do README:

```markdown
[🌐 Demo Online](https://smartstock.vercel.app)
```

