# 💼 Regras de Negócio - Digital Courses

> Funcionalidades, fluxos e regras específicas da plataforma de cursos online.

---

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Modelos de Usuário](#modelos-de-usuário)
- [Sistema de Cursos](#sistema-de-cursos)
- [Matrículas e Acesso](#matrículas-e-acesso)
- [Pagamentos](#pagamentos)
- [Progressão de Cursos](#progressão-de-cursos)
- [Regras Específicas](#regras-específicas)

---

## Visão Geral

### O que é Digital Courses?

**Digital Courses** é uma plataforma de educação online que permite:

- **Criadores**: Upload e venda de cursos (vídeos, aulas, materiais)
- **Estudantes**: Compra e consumo de cursos com progresso
- **Administradores**: Gerenciamento completo da plataforma

### Proposta de Valor

- Cursos estruturados com módulos e aulas
- Materiais complementares (PDFs, documentos)
- Progresso e certificação
- Acesso vitalício ou temporário
- Comunidade e comentários

---

## Modelos de Usuário

### Roles Disponíveis

#### 1. **Student** (Aluno)

- Pode visualizar cursos publicados
- Pode se matricular em cursos
- Pode acessar aulas liberadas
- Pode deixar comentários
- Pode ver seu progresso
- **Sem** permissão para criar/editar cursos

#### 2. **Instructor** (Instrutor)

- Pode criar cursos
- Pode criar módulos e aulas nos seus cursos
- Pode fazer upload de materiais
- Pode ver engajamento dos alunos
- Não pode ver cursos de outros instrutores

#### 3. **Admin** (Administrador)

- Acesso total
- Pode criar/editar/deletar qualquer curso
- Pode gerenciar usuários
- Pode moderar comentários
- Pode gerar relatórios
- Pode gerenciar pagamentos

### Tipos de Assinatura

| Tipo        | Acesso                    | Duração             | Preço              |
| ----------- | ------------------------- | ------------------- | ------------------ |
| **Free**    | Apenas aulas free preview | Ilimitado           | Grátis             |
| **Premium** | Acesso a todos os cursos  | 30 dias (renovável) | Definido por curso |

---

## Sistema de Cursos

### Estrutura de um Curso

```
Curso
├── Módulo 1
│   ├── Aula 1 (ordem: 1)
│   ├── Aula 2 (ordem: 2)
│   └── Aula 3 (ordem: 3)
├── Módulo 2
│   ├── Aula 4 (ordem: 1)
│   └── Aula 5 (ordem: 2)
└── Módulo 3
    └── Aula 6 (ordem: 1)
```

### Propriedades de Curso

| Campo          | Tipo     | Obrigatório | Descrição                  |
| -------------- | -------- | ----------- | -------------------------- |
| `title`        | string   | ✅          | Nome do curso (max 255)    |
| `slug`         | string   | Auto        | URL-friendly (gerado)      |
| `description`  | text     | ❌          | Descrição longa            |
| `price`        | decimal  | ❌          | Preço (padrão: 0 = grátis) |
| `thumbnail`    | string   | ❌          | URL da imagem              |
| `is_published` | boolean  | ✅          | Visível publicamente?      |
| `published_at` | datetime | ❌          | Data de publicação         |

### Propriedades de Módulo

| Campo           | Tipo     | Obrigatório | Descrição                  |
| --------------- | -------- | ----------- | -------------------------- |
| `title`         | string   | ✅          | Nome do módulo (max 255)   |
| `description`   | text     | ❌          | Descrição (max 2000 chars) |
| `order`         | integer  | ✅          | Sequência (0+)             |
| `course_id`     | FK       | ✅          | Referência do curso        |

**Regras de Módulo:**
- ✅ Admin e Instructor podem criar/editar/deletar módulos
- Módulos devem ter ordem sequencial começando de 0
- Descrição é opcional mas recomendada
- Soft delete ativado

### Propriedades de Aula

| Campo                 | Tipo     | Obrigatório | Descrição                                        |
| --------------------- | -------- | ----------- | ------------------------------------------------ |
| `title`               | string   | ✅          | Nome da aula (max 255)                           |
| `description`         | text     | ❌          | Descrição (max 5000 chars)                       |
| `video_url`           | string   | ❌          | URL do vídeo (MinIO - ver seção abaixo)          |
| `duration_in_minutes` | int      | ❌          | Duração em minutos (1-1440)                      |
| `is_free_preview`     | boolean  | ✅          | Disponível sem compra?                           |
| `module_id`           | FK       | ✅          | Referência do módulo                             |

**Regras de Aula:**
- ✅ Admin e Instructor podem criar/editar/deletar aulas
- Título é obrigatório
- URL do vídeo é opcional mas deve vir do MinIO (ver MinIO Security abaixo)
- Duração: 1 a 1440 minutos (até 24h)
- `is_free_preview: true` libera acesso mesmo sem compra
- Soft delete ativado

---

## 🔒 Segurança de URLs MinIO

### Validação de URL

Todas as URLs de vídeo/materiais DEVEM:

1. **Whitelist de Hosts**: Apenas hosts MinIO autorizados (configurado via `.env`)
   - Variável: `MINIO_ALLOWED_HOSTS` (comma-separated)
   - Exemplo: `MINIO_ALLOWED_HOSTS=minio.example.com,cdn.example.com:9000`

2. **Validação de Formato**:
   - URL deve ser válida (FILTER_VALIDATE_URL)
   - Deve usar HTTPS em produção
   - Sem caracteres de controle

3. **Sanitização**:
   - Remove espaços em branco
   - Remove caracteres inválidos
   - Service: `App\Services\MinIOUrlService`

### Implementação

```php
// No StoreLessonRequest e UpdateLessonRequest:
$validated = $request->validate([
    'video_url' => 'nullable|string|max:2048',
]);

// Service valida no controller (camada adicional)
if ($validated['video_url']) {
    $validated['video_url'] = app(MinIOUrlService::class)
        ->validateAndSanitize($validated['video_url']);
}
```

### Exemplo de .env

```env
MINIO_ALLOWED_HOSTS=minio.example.com,storage.example.com
```

---

### Regras de Criação

- ✅ Admin: Pode criar cursos, módulos e aulas sem restrição
- ✅ Instructor: Pode criar cursos, módulos e aulas nos seus cursos
- ❌ Student: Não pode criar cursos, módulos ou aulas

### Regras de Publicação

- Um curso DEVE ter pelo menos 1 módulo com 1 aula para ser publicado
- Cursos privados (`is_published: false`) só aparecem para admins
- Slugs devem ser únicos no banco de dados

---

## Matrículas e Acesso

### Fluxo de Matrícula

```
[Student acessa GET /api/v1/courses/1]
  ├─ Se `is_free_preview: true` → Acesso liberado ✅
  ├─ Se `price: 0` (grátis) → Acesso liberado ✅
  ├─ Se user comprou → Acesso liberado ✅
  └─ Senão → Acesso negado ❌ (403)
```

### Tabela Enrollment

| Campo        | Descrição                         |
| ------------ | --------------------------------- |
| `user_id`    | ID do usuário                     |
| `course_id`  | ID do curso                       |
| `order_id`   | ID do pedido (se foi pago)        |
| `status`     | active, expired, completed        |
| `expires_at` | Data de expiração (se temporário) |

### Tipos de Acesso

1. **Público**: `is_published: true` + `is_free_preview: true`
2. **Autenticado**: `is_published: true` + usuário logado (não precisa pagar)
3. **Premium**: Usuário comprou acesso
4. **Expirado**: Acesso temporário venceu

---

## Pagamentos

### Modelo de Compra

```
User → Order → Enrollment
```

### Statuses de Order

- `pending` - Aguardando pagamento
- `paid` - Pagamento confirmado
- `failed` - Pagamento falhou
- `refunded` - Reembolso

### Regras

- Uma Order pode ter múltiplos cursos
- Após pagamento confirmado → Enrollment criado
- Enrollment expira conforme configurado
- Estudante pode renovar assinatura

---

## Progressão de Cursos

### Tabela CourseProgress

```php
CourseProgress
├── user_id
├── lesson_id
├── progress_percentage (0-100)
├── completed_at (nullable)
└── timestamps
```

### Cálculo de Progresso

```
Progresso do Curso = (Total de Aulas Completas / Total de Aulas) × 100
```

### Regras

- Progresso é atualizado automaticamente ao completar aula
- Certificado é gerado quando progresso ≥ 80%
- Progress não pode diminuir (apenas aumentar)
- Aulas podem ser revistas quantas vezes

---

## Comentários em Aulas

### Propriedades

| Campo        | Descrição           |
| ------------ | ------------------- |
| `user_id`    | Quem comentou       |
| `lesson_id`  | Em qual aula        |
| `content`    | Texto do comentário |
| `created_at` | Quando foi criado   |

### Regras

- Apenas usuários com acesso à aula podem comentar
- Admins podem deletar comentários
- Comentários são soft deleted
- Limite de caracteres: 5000

---

## Regras Específicas

### Categorias

- Cada curso pode ter múltiplas categorias
- Categorias facilitam descoberta
- Exemplo: `Python`, `Web Development`, `Backend`

### Materiais/Recursos

- Uma aula pode ter múltiplos arquivos
- Tipos: PDF, documento, imagem, etc.
- Máximo: 100MB por arquivo

### Comentários & Comunidade

- Comunidade é construída através de comentários
- Apenas matriculados podem comentar
- Comentários ajudam outros alunos

### Hard Deletes

- User, Course, Lesson: **Soft delete** (marcados como deletados)
- Enrollment, Order: **Hard delete** (removidos permanentemente após 30 dias)

### Soft Deletes

Permitem:

- Recuperação de dados
- Auditoria
- Histórico de compras
- Sem quebrar integridade referencial

### Validações Críticas

```php
// ✅ Curso deve ter título
'title' => 'required|string|max:255',

// ✅ Email deve ser único
'email' => 'unique:users,email',

// ✅ Preço não pode ser negativo
'price' => 'numeric|min:0',

// ✅ Role deve ser válido
'role' => 'in:student,instructor,admin',

// ✅ Progresso 0-100
'progress' => 'numeric|between:0,100',
```

---

## 📋 Checklist de Features

Ao implementar nova funcionalidade:

- [ ] Regra de negócio documentada aqui?
- [ ] Validações implementadas?
- [ ] Autorização (auth + roles) aplicada?
- [ ] Soft delete considerado?
- [ ] Migração do banco criada?
- [ ] Model com relacionamentos?
- [ ] Controller com CRUD?
- [ ] Swagger documentation?
- [ ] Testes escritos?
- [ ] Tratamento de erros?
      | **Conversão** | % de cliques que viram vendas |
      | **RPV** | Revenue per visitor |
      | **LTV** | Valor de tempo de vida do visitante |

---