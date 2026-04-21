import { redirect } from "next/navigation";

export default function RootPage() {
  // Redireciona automaticamente qualquer acesso à raiz ("/") para "/login"
  redirect("/login");
}