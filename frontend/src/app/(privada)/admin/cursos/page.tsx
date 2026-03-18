import { redirect } from "next/navigation";

export default function CoursesIndexPage() {
  redirect("/admin/cursos/gerenciar");
}
