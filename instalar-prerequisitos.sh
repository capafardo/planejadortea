#!/usr/bin/env bash
# ==============================================================================
# Script: instalar-prerequisitos.sh
# Descrição: Instala todos os pré-requisitos de sistema e bibliotecas
#            necessárias para desenvolvimento, execução e geração de pacotes
#            (.deb) do PlanejadorTEA.
# ==============================================================================

set -e

# Identifica o diretório do projeto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "======================================================"
echo "  🧩 PlanejadorTEA - Instalação de Pré-requisitos"
echo "======================================================"
echo "Diretório do projeto: $PROJECT_ROOT"
echo ""

# 1. Verificar se o sistema usa APT (Debian, Ubuntu, Linux Mint, Pop!_OS, etc.)
if ! command -v apt-get >/dev/null 2>&1; then
    echo "⚠️ Aviso: O gerenciador 'apt-get' não foi detectado."
    echo "Se você estiver usando Fedora, Arch ou outro Linux, instale manualmente:"
    echo "  - Node.js (>= 20) e npm"
    echo "  - Compilador C/C++ (build-essential / base-devel)"
    echo "  - Python 3"
    echo "  - git e git-lfs"
    echo ""
else
    echo "📦 Atualizando índices de pacotes (APT)..."
    if [ "$EUID" -ne 0 ]; then
        SUDO_CMD="sudo"
    else
        SUDO_CMD=""
    fi

    $SUDO_CMD apt-get update -y

    echo "📦 Instalando ferramentas de compilação, Git LFS e dependências do sistema..."
    # Pacotes básicos de build e git
    $SUDO_CMD apt-get install -y \
        build-essential \
        python3 \
        curl \
        wget \
        git \
        git-lfs \
        fakeroot \
        dpkg

    # Dependências do runtime Electron (tratando variações de libasound no Ubuntu 24.04+ vs anteriores)
    echo "📦 Instalando bibliotecas do runtime gráfico (Electron/GTK)..."
    ELECTRON_PKGS=(
        libgtk-3-0
        libnotify4
        libnss3
        libxss1
        libxtst6
        libx11-xcb1
        libdrm2
        libgbm1
        xdg-utils
    )

    for pkg in "${ELECTRON_PKGS[@]}"; do
        $SUDO_CMD apt-get install -y "$pkg" || true
    done

    # Tratar libasound2 ou libasound2t64
    if apt-cache show libasound2t64 >/dev/null 2>&1; then
        $SUDO_CMD apt-get install -y libasound2t64 || true
    else
        $SUDO_CMD apt-get install -y libasound2 || true
    fi
fi

# 2. Verificar / Instalar Node.js e npm
echo ""
echo "🔍 Verificando Node.js..."
INSTALL_NODE=false

if command -v node >/dev/null 2>&1; then
    NODE_CURRENT=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_CURRENT" -lt 20 ]; then
        echo "⚠️ Node.js versão $NODE_CURRENT detectada. É recomendada a versão >= 20."
        INSTALL_NODE=true
    else
        echo "✔ Node.js $(node -v) já está instalado e compatível."
    fi
else
    echo "❌ Node.js não encontrado."
    INSTALL_NODE=true
fi

if [ "$INSTALL_NODE" = true ]; then
    echo "📥 Instalando Node.js (versão LTS 20.x)..."
    if command -v curl >/dev/null 2>&1 && command -v apt-get >/dev/null 2>&1; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO_CMD bash -
        $SUDO_CMD apt-get install -y nodejs
        echo "✔ Node.js instalado com sucesso: $(node -v)"
    else
        echo "⚠️ Não foi possível instalar o Node.js automaticamente via NodeSource."
        echo "Instale manualmente o Node.js v20+ via: https://nodejs.org/"
    fi
fi

# 3. Configurar Git LFS
if command -v git-lfs >/dev/null 2>&1; then
    echo ""
    echo "⚙️ Configurando Git LFS no repositório..."
    git lfs install
    echo "✔ Git LFS configurado."
fi

# 4. Instalar dependências Node.js do projeto (npm install)
echo ""
echo "📦 Instalando dependências npm do PlanejadorTEA..."
npm install

# 5. Garantir permissões de execução dos scripts
chmod +x "$PROJECT_ROOT/release/gerar-release.sh" 2>/dev/null || true
chmod +x "$PROJECT_ROOT/instalar-prerequisitos.sh" 2>/dev/null || true

echo ""
echo "======================================================"
echo "  🎉 Todos os pré-requisitos foram configurados com sucesso!"
echo "======================================================"
echo "Comandos úteis:"
echo "  - Iniciar em modo de desenvolvimento:  npm run dev"
echo "  - Gerar o pacote .deb de distribuição: ./release/gerar-release.sh"
echo "======================================================"
