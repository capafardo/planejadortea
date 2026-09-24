#!/usr/bin/env bash
# ==============================================================================
# Script: gerar-release.sh
# Descrição: Compila e gera automaticamente o pacote instalador Linux (.deb)
#            do PlanejadorTEA.
# ==============================================================================

set -e

# Identifica diretórios
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "======================================================"
echo "  🧩 PlanejadorTEA - Geração de Release (.deb)"
echo "======================================================"
echo "Diretório do projeto: $PROJECT_ROOT"
cd "$PROJECT_ROOT"

# 1. Verificar Node.js e npm
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Erro: Node.js não foi encontrado no sistema."
    echo "Execute o script ./instalar-prerequisitos.sh para instalar as dependências."
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "❌ Erro: npm não foi encontrado no sistema."
    echo "Execute o script ./instalar-prerequisitos.sh para instalar as dependências."
    exit 1
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo "✔ Node.js: $NODE_VERSION | npm: $NPM_VERSION"

# 2. Verificar dependências do node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Diretório node_modules não encontrado. Instalando dependências..."
    npm install
else
    echo "✔ Dependências do projeto (node_modules) já instaladas."
fi

# 3. Limpeza prévia de builds antigos temporários
echo "🧹 Limpando artefatos temporários anteriores..."
rm -rf "$PROJECT_ROOT/dist" "$PROJECT_ROOT/dist-electron"

# 4. Compilação do Vite + Electron (frontend e backend local)
echo "🔨 Compilando aplicação (Vite + TypeScript + Electron)..."
npm run build

# 5. Empacotamento do arquivo .deb com electron-builder
echo "📦 Gerando pacote .deb com electron-builder..."
npx electron-builder --linux deb

# 6. Verificação do pacote gerado
DEB_FILE="$PROJECT_ROOT/release/planejadortea.deb"

if [ -f "$DEB_FILE" ]; then
    TAMANHO=$(ls -lh "$DEB_FILE" | awk '{print $5}')
    echo ""
    echo "======================================================"
    echo "  🎉 SUCESSO! Pacote .deb gerado com sucesso!"
    echo "======================================================"
    echo "Localização: $DEB_FILE"
    echo "Tamanho:     $TAMANHO"
    echo ""
    echo "Para testar/instalar no sistema local:"
    echo "  sudo apt install ./release/planejadortea.deb"
    echo "  # ou"
    echo "  sudo dpkg -i ./release/planejadortea.deb"
    echo "======================================================"
else
    echo "❌ Falha: O arquivo $DEB_FILE não foi encontrado após o build."
    exit 1
fi
