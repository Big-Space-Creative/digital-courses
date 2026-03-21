# ✅ Boas Práticas - Digital Courses Backend

> Regras de código, segurança, performance, validação e qualidade para o backend Laravel.

---

## 📋 Sumário

- [PHP & Laravel](#php--laravel)
- [Controllers](#controllers)
- [Models](#models)
- [Validação](#validação)
- [Autenticação & Segurança](#autenticação--segurança)
- [Banco de Dados](#banco-de-dados)
- [APIs & Responses](#apis--responses)
- [Testes](#testes)
- [Performance](#performance)

---

## PHP & Laravel

### ✅ Fazer

```php
// ✅ Use type hints
public function store(Request $request): JsonResponse
{
    $validated = $request->validate([...]);
    return response()->json([...], 201);
}

// ✅ Use constantes para valores enumerados
public const ROLE_ADMIN = 'admin';
public const ROLE_STUDENT = 'student';

// ✅ Use early returns
if (!$user) {
    return response()->json(['message' => 'Not found'], 404);
}

// ✅ Use relationships corretamente
$courses = Course::with('modules.lessons')->get();

// ✅ Use scopes para consultas reutilizáveis
public function scopePublished($query)
{
    return $query->where('is_published', true);
}
```

### ❌ Evitar

```php
// ❌ Sem type hints
public function store($request)
{
    return $request->all();
}

// ❌ Magic strings
if ($user->role === 'admin') { ... }

// ❌ N+1 queries
$courses = Course::all();
foreach ($courses as $course) {
    echo $course->modules; // Uma query por iteração!
}

// ❌ Queries sem limit
$users = User::get(); // Pode trazer tudo!
```

---

## Controllers

### Padrão RESTful

```php
class CourseController extends Controller
{
    // ✅ Listar
    public function index(): JsonResponse
    {
        $courses = Course::paginate(15);
        return response()->json([
            'message' => 'Cursos listados',
            'data' => $courses,
        ]);
    }

    // ✅ Detalhar
    public function show(Course $course): JsonResponse
    {
        return response()->json([
            'message' => 'Curso encontrado',
            'data' => $course->load('modules.lessons'),
        ]);
    }

    // ✅ Criar
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
        ]);

        $course = Course::create($validated);

        return response()->json([
            'message' => 'Curso criado com sucesso',
            'data' => $course,
        ], 201);
    }

    // ✅ Atualizar
    public function update(Course $course, Request $request): JsonResponse
    {
        $validated = $request->validate([...]);
        $course->update($validated);

        return response()->json([
            'message' => 'Curso atualizado',
            'data' => $course,
        ]);
    }

    // ✅ Deletar
    public function destroy(Course $course): JsonResponse
    {
        $course->delete();

        return response()->json([
            'message' => 'Curso deletado',
        ]);
    }
}
```

### ✅ Fazer em Controllers

- Use model binding automático: `public function show(Course $course)`
- Retorne sempre JSON estruturado
- Use HTTP status codes corretos
- Valide com `$request->validate()`
- Mova lógica complexa para Services ou Models

### ❌ Evitar

- Lógica de negócio no controller
- Queries sem eager loading
- Sem tratamento de erros
- Magic strings/numbers
- Controllers muito grandes (>300 linhas)

---

## Models

### ✅ Estrutura Correta

```php
class Course extends Model
{
    use HasFactory, SoftDeletes;

    // Constantes para valores enumerados
    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';

    protected $fillable = [
        'title',
        'slug',
        'description',
        'price',
        'thumbnail',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'price' => 'decimal:2',
        'published_at' => 'datetime',
    ];

    // Relacionamentos
    public function modules()
    {
        return $this->hasMany(Module::class);
    }

    public function lessons()
    {
        return $this->hasManyThrough(
            Lesson::class,
            Module::class,
            'course_id',
            'module_id'
        );
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeByPrice($query, $minPrice, $maxPrice)
    {
        return $query->whereBetween('price', [$minPrice, $maxPrice]);
    }
}
```

### ✅ Fazer em Models

- Define `$fillable` (nunca use `$guarded = []`)
- Use `$casts` para tipo automático
- Defina relacionamentos claramente
- Use Scopes para consultas reutilizáveis
- Use constantes para valores enumerados
- Implemente métodos úteis (ex: `isPublished()`)

### ❌ Evitar

- `$guarded = []` (inseguro!)
- Lógica complexa nos modelos
- Queries sem eager loading
- Relacionamentos incorretos
- Casts incorretos

---

## Validação

### ✅ Validação Completa

```php
$validated = $request->validate([
    'title' => 'required|string|max:255|unique:courses,title,' . $course->id,
    'email' => 'required|email|unique:users',
    'price' => 'required|numeric|min:0|max:9999.99',
    'description' => 'nullable|string|min:10',
    'role' => 'required|in:student,instructor,admin',
    'avatar_url' => 'nullable|url|max:255',
    'password' => 'required|string|min:8|confirmed',
    'modules' => 'required|array|min:1',
    'modules.*.title' => 'required|string',
]);
```

### Mensagens de Erro Customizadas

```php
$request->validate([
    'title' => 'required|string',
], [
    'title.required' => 'O título do curso é obrigatório',
    'title.string' => 'O título deve ser um texto',
]);
```

### ✅ Fazer

- Valide SEMPRE antes de salvar
- Use regras específicas
- Mensagens em português
- Validate arrays e nested data
- Custom Form Requests para rotas complexas

### ❌ Evitar

- Deixar passar dados não validados
- Validação superficial
- Mensagens de erro genéricas em inglês
- Validar em múltiplos lugares

---

## Autenticação & Segurança

### JWT

```php
// ✅ Login retorna tokens
$token = JWTAuth::fromUser($user);
return response()->json([
    'access_token' => $token,
    'token_type' => 'bearer',
    'expires_in' => 3600,
]);

// ✅ Middleware protege rotas
Route::middleware('auth:api')->group(function() {
    Route::get('/me', [AuthController::class, 'me']);
});

// ✅ Roles específicos
Route::middleware('admin')->group(function() {
    Route::post('/courses', [CourseController::class, 'store']);
});
```

### ✅ Segurança

- Use middleware `auth:api` em rotas protegidas
- Use middleware `admin` para admin only
- Sempre validate/sanitize inputs
- Nunca exponha senhas ou tokens em respostas
- Use HTTPS em produção
- Rotate secrets regularmente
- Não log sensitive data

### ❌ Evitar

- Sem autenticação
- Sem autorização (roles)
- Exposição de tokens em logs
- SQL injection (use ORM)
- Senhas em plain text

---

## Banco de Dados

### Migrations

```php
// ✅ Migration bem estruturada
Schema::create('courses', function (Blueprint $table) {
    $table->id();
    $table->string('title', 255);
    $table->string('slug', 255)->unique();
    $table->text('description')->nullable();
    $table->decimal('price', 8, 2)->default(0);
    $table->boolean('is_published')->default(false);
    $table->timestamp('published_at')->nullable();
    $table->softDeletes();
    $table->timestamps();

    $table->index('slug');
});

// ✅ Foreign keys
$table->foreignId('course_id')
    ->constrained()
    ->onDelete('cascade');
```

### ✅ Fazer

- Uma mudança por migration
- Timestamps e soft deletes quando apropriado
- Foreign keys com cascade quando faz sentido
- Índices em colunas frequentemente consultadas
- Constraints para integridade

### ❌ Evitar

- Modificar migrations já rodadas (crie nova!)
- Sem foreign keys
- Sem timestamps
- Sem índices

---

## APIs & Responses

### Padrão de Response

```json
{
  "message": "Descrição amigável",
  "data": {
    /* dados */
  }
}
```

### Erros

```json
{
  "message": "Descrição do erro",
  "errors": {
    "field_name": ["Erro específico"]
  }
}
```

### HTTP Status Codes

| Código | Uso                       | Exemplo                   |
| ------ | ------------------------- | ------------------------- |
| 200    | Sucesso (GET, PUT, PATCH) | Retorna dados atualizados |
| 201    | Criado (POST)             | Retorna novo recurso      |
| 204    | Sem conteúdo (DELETE)     | Sem body                  |
| 400    | Requisição inválida       | Syntax error              |
| 401    | Não autenticado           | Token inválido            |
| 403    | Não autorizado            | Role insuficiente         |
| 404    | Não encontrado            | Recurso não existe        |
| 422    | Validação falhou          | Dados inválidos           |
| 500    | Erro do servidor          | Exception não tratada     |

### ✅ Fazer

- Sempre retorne JSON estruturado
- Use status codes corretos
- Inclua mensagem descritiva
- Inclua `errors` em validação
- Trate exceptions globalmente

### ❌ Evitar

- Respostas sem estrutura
- Status codes incorretos
- Sem mensagens de erro
- Expor stack traces em produção

---

## Testes

### Estrutura com Pest

```php
// ✅ Teste bem estruturado
test('criar curso como admin', function () {
    $admin = User::factory()->admin()->create();
    $token = JWTAuth::fromUser($admin);

    $response = $this->postJson(
        '/api/v1/courses',
        [
            'title' => 'Novo Curso',
            'price' => 99.90,
        ],
        ['Authorization' => "Bearer $token"]
    );

    $response->assertStatus(201);
    $response->assertJsonStructure(['message', 'data']);
    expect(Course::count())->toBe(1);
});

// ✅ Teste negativo
test('não pode criar curso sem ser admin', function () {
    $student = User::factory()->create();
    $token = JWTAuth::fromUser($student);

    $response = $this->postJson(
        '/api/v1/courses',
        ['title' => 'Curso'],
        ['Authorization' => "Bearer $token"]
    );

    $response->assertStatus(403);
});
```

### ✅ Fazer

- Teste rotas públicas
- Teste autenticação
- Teste autorização (roles)
- Teste validação
- Teste casos de erro
- Use factories para dados

### ❌ Evitar

- Sem testes
- Testes que dependem de ordem
- Dados hardcoded
- Sem limpar dados entre testes

---

## Performance

### ✅ Otimizações

```php
// ✅ Eager load relacionamentos
$courses = Course::with('modules.lessons')->paginate();

// ✅ Paginate grandes datasets
$users = User::paginate(50);

// ✅ Select apenas colunas necessárias
$courses = Course::select('id', 'title', 'price')->get();

// ✅ Use indexes em queries frequentes
$course = Course::where('slug', $slug)->first();

// ✅ Cache consultas custosas
$categories = Cache::remember(
    'categories',
    3600,
    fn() => Category::all()
);

// ✅ Use queries assíncronas para operações pesadas
Queue::dispatch(new ProcessCourseVideo($course));
```

### ❌ Evitar

- N+1 queries
- Sem paginação
- Select \* em grandes tabelas
- Sem indexes
- Sem cache
- Operações síncronas pesadas

---

## 📊 Checklist

Antes de fazer commit:

- [ ] Código segue convenções de nomenclatura?
- [ ] Há validação de todos os inputs?
- [ ] Controllers estão limpos (lógica em Models/Services)?
- [ ] Models têm relacionamentos corretos?
- [ ] Type hints em todos os métodos?
- [ ] Sem N+1 queries (eager load)?
- [ ] Responses estruturadas com message + data?
- [ ] Status codes HTTP corretos?
- [ ] Tests escritos?
- [ ] Soft delete considerado?
- [ ] Sem código duplicado?
- [ ] SOLID principles aplicados?

### Ordem dos Elementos no Script

```vue
<script setup>
// 1. Imports (Vue, Router, Stores, Components)
// 2. Props com defineProps()
// 3. Emits com defineEmits()
// 4. Inject/Provide
// 5. Refs e Reactive
// 6. Computed
// 7. Watchers
// 8. Methods/Functions
// 9. Lifecycle Hooks (onMounted, etc.)
</script>
```

### Props e Emits

```vue
<script setup>
// ✅ Props tipadas com defaults
const props = withDefaults(defineProps<{
  title: string
  isActive?: boolean
  count?: number
}>(), {
  isActive: false,
  count: 0
})

// ✅ Emits tipados
const emit = defineEmits<{
  (e: 'update', value: number): void
  (e: 'close'): void
}>()
</script>
```

---

## Tailwind CSS

### Organização de Classes

Ordem recomendada (do layout ao visual):

```html
<div
  class="
  flex items-center justify-between    <!-- 1. Layout/Flexbox -->
  w-full max-w-md                       <!-- 2. Dimensões -->
  p-4 md:p-6                            <!-- 3. Espaçamento -->
  bg-white border border-gray-200      <!-- 4. Background/Border -->
  rounded-lg shadow-sm                  <!-- 5. Decoração -->
  transition-all duration-200          <!-- 6. Transições -->
  hover:shadow-md                       <!-- 7. Estados -->
"
></div>
```

### ✅ Boas Práticas

```html
<!-- Use classes utilitárias -->
<button class="px-4 py-2 bg-primary text-gray-950 rounded-lg">
  <!-- Use cores do design system -->
  <div class="bg-gray-50 text-gray-800">
    <!-- Use transições para feedback visual -->
    <a class="transition-colors hover:text-primary"></a>
  </div>
</button>
```

### ❌ Evitar (Strict Linting Rules)

```html
<!-- 1. NÃO use valores arbitrários se existir utilitário -->
<div class="h-[500px]">
  <!-- ❌ Erro de Lint -->
  <!-- Use h-125 (500px / 4) ✅ -->
</div>

<!-- 2. NÃO use valores mágicos próximos da escala -->
<div class="w-[200px]">
  <!-- ❌ -->
  <!-- Use w-50 (200px) ✅ -->
</div>

<!-- 3. NÃO ignore redundâncias -->
<div class="gap-4 md:gap-4">
  <!-- ❌ -->
  <!-- Use gap-4 ✅ -->
</div>

<!-- 4. Sintaxe de Important -->
<!-- Siga a preferência do linter. Para este projeto: -->
<div class="bg-gray-950!">
  <!-- ✅ Sufixo preferred -->
  <!-- <div class="!bg-gray-950"> ❌ Prefira sufixo se o linter pedir -->
</div>
```

### Quando Usar `<style scoped>`

1. Animações complexas com `@keyframes`
2. Pseudo-elementos (`:before`, `:after`)
3. Overrides de bibliotecas terceiras
4. Media queries muito específicas

```vue
<style scoped>
/* Animação personalizada */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse-custom {
  animation: pulse 2s ease-in-out infinite;
}
</style>
```

---

## Responsividade

### Filosofia Mobile-First

```html
<!-- ✅ Mobile primeiro, depois breakpoints maiores -->
<div class="text-sm md:text-base lg:text-lg">
  <!-- ❌ Nunca inverta a ordem -->
  <div class="lg:text-lg md:text-base text-sm"></div>
</div>
```

### Breakpoints de Referência

| Breakpoint | Viewport | Exemplos de Dispositivos   |
| ---------- | -------- | -------------------------- |
| Default    | < 640px  | iPhone SE, Android         |
| `sm:`      | ≥ 640px  | iPhone Pro Max             |
| `md:`      | ≥ 768px  | Tablets em portrait        |
| `lg:`      | ≥ 1024px | Tablets landscape, laptops |
| `xl:`      | ≥ 1280px | Desktops                   |

### Regra dos 400px

> Sempre teste em viewports de **375px** e **400px** (iPhone SE/Mini)

```html
<!-- ✅ Larguras fluidas para telas pequenas -->
<div class="w-[90vw] max-w-md">
  <!-- ❌ Larguras fixas que podem quebrar -->
  <div class="w-[500px]"></div>
</div>
```

### Padrões Responsivos

```html
<!-- Grid responsivo -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- Stack → Row -->
  <div class="flex flex-col md:flex-row items-center gap-4">
    <!-- Esconder em mobile -->
    <span class="hidden sm:inline">Texto visível apenas acima de 640px</span>

    <!-- Padding adaptativo -->
    <section class="p-4 md:p-6 lg:p-8"></section>
  </div>
</div>
```

---

## Acessibilidade

### Semântica HTML

```html
<!-- ✅ Use tags semânticas -->
<header>...</header>
<nav>...</nav>
<main>...</main>
<article>...</article>
<section>...</section>
<footer>...</footer>

<!-- ❌ Evite "div soup" -->
<div class="header">
  <div class="nav">
    <div class="main"></div>
  </div>
</div>
```

### Aria Labels

```html
<!-- ✅ Botões com ícones precisam de aria-label -->
<button aria-label="Fechar menu">
  <XIcon />
</button>

<!-- ✅ Links que abrem em nova aba -->
<a href="..." target="_blank" aria-label="Link externo (abre em nova aba)"></a>
```

### Focus Visible

```html
<!-- ✅ Sempre tenha outline de foco visível -->
<button class="focus-visible:outline-2 focus-visible:outline-primary"></button>
```

### Contraste

- Texto normal: mínimo **4.5:1**
- Texto grande (18px+): mínimo **3:1**
- Use ferramentas como [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## Performance

### Imagens

```html
<!-- ✅ Hero/LCP: carregamento imediato -->
<img src="/hero.jpg" loading="eager" alt="Banner principal" />

<!-- ✅ Abaixo da dobra: lazy loading -->
<img src="/product.jpg" loading="lazy" alt="Produto X" />

<!-- ✅ Sempre tenha alt descritivo -->
<img src="/headphone.jpg" alt="Headphone Premium Bluetooth Preto" />
```

### CSS Performance

```html
<!-- ✅ Anime apenas propriedades performáticas -->
<div class="transition-transform duration-300 hover:scale-105">
  <!-- transform e opacity são GPU-accelerated -->
</div>

<!-- ❌ Evite animar left, top, width, height -->
<div class="transition-all duration-300 hover:left-10"></div>
```

### Code Splitting

```javascript
// ✅ Lazy load de rotas
{
  path: '/product/:id',
  component: () => import('../views/ProductView.vue'),
}

// ✅ Lazy load de componentes pesados
const HeavyChart = defineAsyncComponent(() =>
  import('./components/HeavyChart.vue')
)
```

---

## Programação Defensiva

### Optional Chaining

```javascript
// ✅ Acesso seguro a propriedades
const city = user?.address?.city ?? "Não informado";

// ❌ Pode quebrar
const city = user.address.city;
```

### Valores Default

```vue
<script setup>
// ✅ Props com defaults
const props = withDefaults(defineProps<{
  product: Product
  showPrice?: boolean
}>(), {
  showPrice: true
})
</script>
```

### Verificação no Template

```html
<!-- ✅ Verifique antes de renderizar -->
<div v-if="product">
  <h2>{{ product.name }}</h2>
  <p v-if="product.description">{{ product.description }}</p>
</div>
<div v-else>
  <p>Carregando...</p>
</div>
```

### Arrays e Loops

```javascript
// ✅ Verifique se é array antes de iterar
const items = Array.isArray(data) ? data : [];

// ✅ Use optional chaining com métodos
const firstItem = items?.[0];
const itemName = items?.find((i) => i.id === id)?.name;
```

---

## SEO

### Meta Tags Essenciais

```html
<!-- index.html -->
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta
    name="description"
    content="E-commerce de produtos afiliados com as melhores ofertas"
  />
  <title>Afiliado ML - Melhores Ofertas</title>
</head>
```

### Estrutura de Headings

```html
<!-- ✅ Um H1 por página, hierarquia correta -->
<h1>Título Principal da Página</h1>
<h2>Seção 1</h2>
<h3>Subseção 1.1</h3>
<h2>Seção 2</h2>

<!-- ❌ Pular níveis ou múltiplos H1 -->
<h1>Título 1</h1>
<h1>Título 2</h1>
<h4>Subseção</h4>
```

---

## 🎯 Definition of Done

Antes de considerar uma tarefa concluída:

- [ ] **Linting limpo** - sem erros no terminal

- [ ] **Mobile-first** - testado em 375px
- [ ] **Dark mode** - não aplicável a este projeto (light only)
- [ ] **Acessibilidade** - aria-labels, foco, contraste
- [ ] **Sem lixo** - removidos `console.log` e código morto
- [ ] **Performance** - imagens com lazy/eager corretos
- [ ] **Código legível** - auto-explicativo sem comentários óbvios
