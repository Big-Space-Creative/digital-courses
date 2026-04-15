# 03_COMPONENTS_AND_PATTERNS — Frontend

## Componentes Compartilhados (src/components/)

### UI (src/components/ui/)
| Componente | Path | Descrição |
|-----------|------|-----------|
| Toast | ui/Toast.tsx | Sistema de toasts (success/error/info); usar via `toast()` |
| ProgressBar | ui/ProgressBar.tsx | Barra de progresso com label, current e max |
| VideoPlayer | ui/VideoPlayer.tsx | Player de vídeo simples (stub, sem player real) |

### Formulários (src/components/form/)
| Componente | Path | Descrição |
|-----------|------|-----------|
| Input | form/Input.tsx | Input com label, ícone, erro integrado react-hook-form |

### Admin (src/app/(privada)/admin/components/)
| Componente | Path | Descrição |
|-----------|------|-----------|
| Sidebar | admin/components/Sidebar.tsx | Sidebar desktop + mobile overlay com hamburguer |
| DeleteConfirmModal | admin/components/DeleteConfirmModal.tsx | Modal de confirmação genérico |
| ModuleNameModal | admin/components/ModuleNameModal.tsx | Modal de criar módulo com input |

### Aluno (inline nas páginas por enquanto)
- LessonTabs (src/app/(privada)/aluno/aula/[lessonId]/LessonTabs.tsx) — tabs resumo/dicas/materiais

## Padrões de Código

### Estrutura de Página Admin
```tsx
"use client"; // se tiver estado
export default function PageName() {
  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* conteúdo */}
      </main>
    </div>
  );
}
```

### Cards de Estatística (admin)
```tsx
<article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
  <div className="mb-4 rounded-lg bg-orange-50 p-2 text-[cor]"><Icon size={22} /></div>
  <p className="text-sm font-semibold text-gray-500">Label</p>
  <p className="text-secondary mt-1 text-2xl font-bold">Valor</p>
</article>
```

### Formulário com react-hook-form + zod
```tsx
const schema = z.object({ campo: z.string().min(1) });
const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
// Input component já trata o error prop
```

### Toast
```tsx
import { toast } from "@/components/ui/Toast";
toast("Titulo", { description: "Detalhes", variant: "success" | "error" | "info" });
```

### User Context
```tsx
import { useUser } from "@/context/UserContext";
const { user, setUser } = useUser();
// user tem: id, name, email, role, subscription
```

## Padrão de Modal
- Props: open (boolean), label (string), title, description, confirmLabel, onCancel, onConfirm
- Renderiza null se !open; usa fixed overlay + dialog centralizado

## Padrão de Tabela Admin
- tag table com min-w-[Npx] para scroll horizontal em mobile
- thead: bg-gray-100 text-xs uppercase tracking-wide text-gray-500
- tbody: divide-y divide-gray-100 text-sm
- hover: hover:bg-gray-50/70 nas linhas

## Padrão de Accordion (módulos do aluno)
- grid-rows[1fr] / grid-rows[0fr] com transition-all para animação suave
- opacity-100 / opacity-0 para fade
