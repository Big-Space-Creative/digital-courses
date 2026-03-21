# .agent - Contexto de IA para Digital Courses Backend

> Esta pasta contém APENAS arquivos essenciais para desenvolvimento com IA.
> Sem visualização humana, apenas informações práticas para implementações futuras.

## 📋 Arquivos Essenciais (5 total)

### 1. **CONTEXT.md** ⭐ START HERE
```
- Visão geral completa do projeto
- Stack técnico (Laravel 12, PostgreSQL, JWT, MinIO)
- Estrutura de pastas essencial
- Modelos de dados
- Relacionamentos
- O que está completo
- O que falta (roadmap)
- Como começar desenvolvimento
```

### 2. **API_REFERENCE.md**
```
- Base URL e autenticação
- 15+ Endpoints documentados
- Estrutura de requisição/resposta
- Validações de cada endpoint
- Status codes
- Segurança MinIO
```

### 3. **ARCHITECTURE.md**
```
- Stack completo
- Estrutura de código (app/ structure)
- Fluxos entre componentes
- Relacionamentos de dados
- Segurança (JWT, roles, MinIO validation)
- 14 Migrações de banco
- Controllers & Actions
- Testes (Pest 3.8.5)
- Code quality (Pint PSR-12)
- Containerização (Docker)
```

### 4. **best-practices.md**
```
- Padrões de código PHP/Laravel
- Validação e sanitização
- Segurança (roles, MinIO)
- Performance
- Testes
- Commits
- Pull requests
```

### 5. **business-rules.md**
```
- Regras de negócio
- Roles (student, instructor, admin)
- Estrutura de cursos
- Matrículas e acesso
- Permissões
```

---

## 📂 Estrutura Simplificada

```
.agent/
├── INDEX.md                (Este arquivo)
├── CONTEXT.md              (Contexto completo) ⭐
├── API_REFERENCE.md        (Endpoints)
├── ARCHITECTURE.md         (Tech stack & structure)
├── best-practices.md       (Padrões & segurança)
└── business-rules.md       (Regras de negócio)
```

---

## 🎯 Como Usar

### Para Implementar Nova Feature

1. **Abra:** `CONTEXT.md` - entenda o projeto
2. **Consulte:** `API_REFERENCE.md` - veja endpoints relacionados
3. **Siga:** `ARCHITECTURE.md` - estrutura de código
4. **Aplique:** `best-practices.md` - padrões e segurança
5. **Considere:** `business-rules.md` - regras de negócio

### Exemplo: Criar Nova Migração

```
1. CONTEXT.md → Modelos de dados e relacionamentos
2. ARCHITECTURE.md → Onde colocar migração
3. best-practices.md → Padrões de código
→ Implementar
```

### Exemplo: Adicionar Novo Endpoint

```
1. CONTEXT.md → Rotas existentes
2. API_REFERENCE.md → Padrão de response
3. ARCHITECTURE.md → Controllers & flow
4. best-practices.md → Validação & segurança
5. business-rules.md → Regras aplicáveis
→ Implementar
```

---

## ✅ Status do Projeto

- ✅ Setup validado (máquina zerada)
- ✅ 9/9 testes passando
- ✅ 0 code style issues
- ✅ Autenticação completa (JWT)
- ✅ CRUD Cursos/Módulos/Aulas
- ✅ Validação MinIO
- ✅ Swagger documentado
- ✅ Docker configurado

---

## 📝 O Que Falta

1. **setup.ps1** - Automação de setup (Iteração 2)
2. **CI/CD** - GitHub Actions (Iteração 3)
3. **Exemplos** - cURL, Postman, JS, Python (Iteração 4)
4. **Seeders** - Dados de teste (Iteração 5)
5. **Health Check** - GET /api/v1/health (Iteração 7)
6. **Logging** - JSON estruturado (Iteração 8)
7. **Produção** - .env.production, Dockerfile.prod (Iterações 9-10)

---

## 🔗 Links Rápidos

- **Swagger UI:** http://localhost:8000/api/documentation
- **Database:** PgAdmin em http://localhost:8080
- **MinIO:** http://localhost:9001

---

## 💡 Dica

Sempre comece por **CONTEXT.md** para entender o projeto completamente.
