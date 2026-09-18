# RotinaTEA 🧩

> **Planejar hoje. Mais autonomia amanhã.**  
> *Rotinas mais visuais, vidas mais tranquilas.*

O **RotinaTEA** é uma aplicação web de tecnologia assistiva desenvolvida para o planejamento, antecipação e execução visual de rotinas para pessoas no espectro autista (TEA). A plataforma opera localmente (*offline-first*), garantindo privacidade total, acessibilidade sensorial e autonomia para cuidadores e pessoas apoiadas.

---

## 🎯 Objetivos

- **Estruturação Visual**: Apoiar cuidadores, pais e terapeutas na criação de rotinas com etapas claras, pictogramas, fotografias reais e áudio.
- **Antecipação e Redução de Ansiedade**: Permitir a visualização prévia das sequências de atividades e preparação de planos de contingência para imprevistos.
- **Modo Execução Sensorialmente Acolhedor**: Interface com baixa sobrecarga cognitiva, focada em uma única etapa por vez, com botões amplos e leitura por voz.
- **Privacidade e Offline-First**: Sem transmissão de dados para a nuvem por padrão, rodando em computadores pessoais ou servidores locais com total segurança.

---

## 📊 Status do Projeto

<!-- AUTO:STATUS:START -->
- **Fase Atual**: Qualidade e Endurecimento concluída.
- **Versão**: `0.1.0`
- **Última Atualização**: 2026-09-09
<!-- AUTO:STATUS:END -->

---

## 🛠️ Stack Tecnológica

- **Backend**: Python 3.12+ / FastAPI / Pydantic / SQLAlchemy 2.x / Alembic
- **Banco de Dados**: SQLite local (com WAL e suporte a foreign keys)
- **Frontend**: HTML5, CSS3 moderno, JavaScript (modos Claro/Escuro acessíveis, redução de sobrecarga sensorial)
- **Áudio / TTS**: Integração nativa com síntese de voz (piper / espeak-ng / speechSynthesis)
- **Qualidade & Testes**: Pytest, Pytest-Asyncio, Ruff

---

## 📂 Estrutura do Projeto

```text
rotinatea/
├── app/
│   ├── main.py              # Ponto de entrada FastAPI e ciclo de vida
│   ├── api/                 # Rotas HTTP e endpoints da API REST
│   ├── core/                # Configurações, banco de dados, logging e segurança
│   ├── models/              # Modelos de domínio SQLAlchemy
│   ├── schemas/             # Schemas Pydantic para validação e serialização
│   ├── repositories/        # Camada de persistência desacoplada
│   ├── services/            # Regras de negócio da aplicação
│   ├── integrations/        # Integração com síntese de voz e áudio (TTS)
│   └── web/                 # Templates e assets estáticos (CSS, JS, imagens)
├── data/                    # Banco SQLite, mídias locais e backups
├── docs/                    # Documentação técnica detalhada
├── scripts/                 # Scripts de inicialização, desenvolvimento e backup
└── tests/                   # Testes unitários, de integração e de API
```

---

## 🚀 Instalação e Execução

### 1. Pré-requisitos
- Sistema operacional Linux (ou macOS / WSL2)
- Python 3.12 ou superior
- Git

### 2. Configuração do Ambiente
```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd planejadorTEA

# Criar e ativar o ambiente virtual
python3 -m venv .venv
source .venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
```

### 3. Execução

Modo desenvolvimento (com recarregamento automático):
```bash
./scripts/dev.sh
```

Modo padrão / produção (com auto-instalação de pré-requisitos e abertura automática no navegador):
```bash
./iniciar.sh
```

> **Dica**: O script `./iniciar.sh` na raiz do projeto verifica os pré-requisitos do sistema, configura o ambiente virtual (`.venv`), instala dependências faltantes de `requirements.txt`, aplica migrações do banco de dados e abre automaticamente a interface web no seu navegador padrão.
> 
> O script conta com **resiliência automática de portas**: se a porta 8000 estiver ocupada, ele alternará automaticamente para a próxima porta livre (8001, 8002, etc.) informando no terminal. Para encerrar o servidor a qualquer momento, pressione `CONTROL + C`.

Acesse no navegador (caso não abra automaticamente na porta alocada, ex: 8000):
- Aplicação: [http://localhost:8000](http://localhost:8000) (ou na porta informada pelo script)
- Documentação da API (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)
- Verificação de Saúde: [http://localhost:8000/health](http://localhost:8000/health)

---

## 🧪 Testes Automatizados

Executar a suíte de testes com cobertura:
```bash
pytest
```

---

## 💾 Backup Local

Para gerar uma cópia segura do banco SQLite e arquivos de mídia em `data/backups/`:
```bash
./scripts/backup.sh
```

---

## 🗺️ Roadmap de Fases

- [x] **Fase 0 — Preparação**: Fundação modular, FastAPI, SQLite, Alembic, docs e testes.
- [x] **Fase 1 — Banco e Domínio**: Modelos de dados, repositórios e serviços de domínio.
- [x] **Fase 2 — API REST**: Endpoints de perfis, rotinas, etapas, mídias e calendário.
- [x] **Fase 3 — Interface de Planejamento**: Dashboard, editor de rotina e preview.
- [x] **Fase 4 — Interface de Execução**: Modo Usuário minimalista e acessível.
- [x] **Fase 5 — Calendário**: Agendamento diário e eventos.
- [x] **Fase 6 — Áudio e Voz**: Síntese de fala para etapas (TTS).
- [x] **Fase 7 — Imprevistos**: Planos alternativos e adaptações visuais.
- [x] **Fase 8 — Qualidade e Endurecimento**: Empacotamento final, resiliência e validações completas.

---

## 📄 Licença e Uso

Desenvolvido para fins de tecnologia assistiva e inclusão.
