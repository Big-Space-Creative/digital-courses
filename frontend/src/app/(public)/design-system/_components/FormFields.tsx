"use client";

import { MdOutlineEmail, MdLockOutline } from "react-icons/md";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Field } from "@/components/ui/Field";

export default function FormFields() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="bg-panel border-border flex flex-col gap-5 rounded-[var(--radius-panel)] border p-6">
        <p className="text-text-muted text-sm">
          Campos com label, ajuda e erro associados automaticamente.
        </p>
        <Input
          label="E-mail"
          type="email"
          icon={MdOutlineEmail}
          placeholder="voce@exemplo.com"
          help="Usamos este endereço para confirmar sua conta."
        />
        <Input
          label="Senha"
          type="password"
          icon={MdLockOutline}
          placeholder="Digite sua senha"
          error="A senha precisa ter pelo menos 8 caracteres."
        />
        <Textarea
          label="Mensagem"
          rows={3}
          help="Descreva o que aconteceu, em poucas linhas."
        />
      </div>

      <div className="bg-panel border-border flex flex-col gap-5 rounded-[var(--radius-panel)] border p-6">
        <Select label="Nível atual" defaultValue="iniciante">
          <option value="iniciante">Iniciante</option>
          <option value="intermediario">Intermediário</option>
          <option value="avancado">Avançado</option>
        </Select>
        <Checkbox
          label={
            <>
              Li e aceito os{" "}
              <a
                href="/termos-de-uso"
                className="text-text decoration-accent hover:text-text-muted underline underline-offset-4"
              >
                Termos de Uso
              </a>
            </>
          }
          help="Obrigatório para criar a conta."
        />
        <Field
          id="demo-apelido"
          label="Apelido de exibição"
          help="Aparece ao lado dos seus comentários."
        >
          <input
            id="demo-apelido"
            className="ui-control"
            aria-describedby="demo-apelido-help"
            placeholder="Como quer ser chamado"
          />
        </Field>
        <p className="text-text-muted text-sm">
          Para controles personalizados, use Field e associe o controle ao id.
          Use ui-control no input e aponte aria-describedby para ajuda e erro.
        </p>
      </div>
    </div>
  );
}
