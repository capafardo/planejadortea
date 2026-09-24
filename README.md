# PlanejadorTEA 🧩

> Aplicativo desktop para criação, agendamento e execução de rotinas visuais voltado para pessoas com Transtorno do Espectro Autista (TEA).

---

## 📌 Sobre o Projeto

O **PlanejadorTEA** é uma aplicação desktop desenvolvida com foco em acessibilidade e previsibilidade cognitiva. O objetivo é auxiliar pais, educadores e terapeutas no acompanhamento e desenvolvimento da autonomia de crianças e pessoas com TEA por meio do suporte visual e auditivo estruturado.

### ✨ Principais Recursos
- **Criação de Rotinas Visuais:** Monte rotinas passo a passo com títulos, pictogramas e tempos de duração customizados.
- **Biblioteca de Pictogramas:** Acompanha pictogramas pré-carregados e suporte para upload de imagens personalizadas.
- **Execução Interativa & Timer:** Interface imersiva em tela cheia com contagem regressiva para cada etapa e avisos ao concluir.
- **Síntese de Voz (TTS):** Leitura em áudio dos passos da rotina em português (PT-BR) para reforço auditivo.
- **Agenda Diária:** Planejamento e organização de eventos e rotinas ao longo dos dias.
- **Exportação para PDF / Impressão:** Geração de pranchas de rotina em formato A4 para uso impresso plastificado ou fixação em murais.
- **Tema Claro e Escuro:** Suporte a modo escuro (Dark Mode) para maior conforto visual.
- **Privacidade & Funcionamento Offline:** Banco de dados local (SQLite), garantindo que os dados fiquem no computador do usuário, sem necessidade de conexão com a internet.

---

## 🚀 Instalação do Pacote (.deb)

O instalador para distribuições Linux baseadas em Debian (como Ubuntu, Linux Mint, Debian, Pop!_OS, etc.) está localizado na pasta [`release/`](release/).

### Opção 1: Via Terminal com APT (Recomendado)
O comando `apt` resolve e instala automaticamente quaisquer dependências necessárias:

No terminal, na pasta raiz do projeto, execute:
```bash
sudo apt install ./release/planejadortea.deb
```
> **Nota:** Se você já estiver dentro do diretório `release/`, execute:
> ```bash
> sudo apt install ./planejadortea.deb
> ```

### Opção 2: Via DPKG
Caso prefira utilizar o utilitário `dpkg`:
```bash
sudo dpkg -i ./release/planejadortea.deb
```
Se o sistema acusar dependências faltantes, execute em seguida:
```bash
sudo apt install -f
```

### Opção 3: Pela Interface Gráfica (GUI)
1. Abra o gerenciador de arquivos do seu sistema e navegue até a pasta `release/`.
2. Dê um duplo clique no arquivo `planejadortea.deb`.
3. A Central de Programas ou o instalador de pacotes da sua distribuição (ex: GDebi / Loja de Aplicativos) será aberto.
4. Clique em **Instalar** (ou *Install Package*) e digite sua senha de administrador quando solicitado.

---

## 💻 Como Executar o Aplicativo

Após a instalação, você pode iniciar o PlanejadorTEA de duas formas:
- **Pelo Menu de Aplicativos:** Abra o menu de programas do sistema e pesquise por **PlanejadorTEA**.
- **Pelo Terminal:** Digite o comando:
  ```bash
  planejadortea
  ```

---

## 🗑️ Como Desinstalar

Caso queira remover o aplicativo do sistema:
```bash
sudo apt remove planejadortea
```

---

## 🛠️ Desenvolvimento e Build a partir do Código-Fonte

Caso queira executar o projeto em modo de desenvolvimento ou compilar um novo pacote:

### Pré-requisitos e Instalação Automática
Para instalar automaticamente todos os pacotes de sistema, ferramentas de compilação, Git LFS e dependências do projeto:

```bash
chmod +x instalar-prerequisitos.sh
./instalar-prerequisitos.sh
```

Ou manualmente:
- [Node.js](https://nodejs.org/) (versão 20 ou superior)
- `npm`
- `git-lfs` (para rastreamento do pacote `.deb`)

### Passos
1. **Instalar as dependências do Node:**
   ```bash
   npm install
   ```

2. **Executar em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Gerar um novo pacote instalador (`.deb`):**
   Execute o script automatizado:
   ```bash
   ./release/gerar-release.sh
   # ou via npm:
   npm run release
   ```
   O script compilará a aplicação e colocará o pacote atualizado `planejadortea.deb` em `release/`.

---

## 🧰 Tecnologias Utilizadas

- **Desktop Framework:** [Electron](https://www.electronjs.org/)
- **Frontend:** [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Banco de Dados Local:** [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **Síntese de Voz:** [node-edge-tts](https://github.com/schroffl/node-edge-tts)
- **Ícones:** [Lucide React](https://lucide.dev/)
