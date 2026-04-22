'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Typography } from "@uigovpe/components";
import { adminService, AdminSummary } from "../../../services/admin.service";
import { authService, SessionUser } from "../../../services/auth.service";

export default function Dashboard() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Descobrimos quem é o usuário logado logo que a tela abre
    const currentUser = authService.getStoredUser();
    setUser(currentUser);

    async function loadDashboardData() {
      // 2. Só faz a requisição se o cara for ADMIN
      if (currentUser?.role === 'ADMIN') {
        try {
          const data = await adminService.getSummary();
          setSummary(data);
        } catch (error) {
          console.error("Erro ao carregar resumo do dashboard:", error);
        }
      }
      // Se não for admin, ele pula direto pra cá e para de carregar
      setIsLoading(false);
    }

    loadDashboardData();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Carregando painel...</div>;
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <Typography variant="h3" size="xl" fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="p" className="text-gray-500">
          Bem-vindo(a) ao sistema, {user?.name || user?.email || 'Usuário'}.
        </Typography>
      </div>

      {/* 3. Renderização Condicional: O que o Admin vê vs O que o User vê */}
      {user?.role === 'ADMIN' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card title="Usuários">
            <Typography variant="h1" size="xxl" fontWeight="bold" className="text-blue-600">
              {summary?.users ?? 0}
            </Typography>
            <Typography variant="p" size="small" className="text-gray-400">Total cadastrado</Typography>
          </Card>

          <Card title="Categorias">
            <Typography variant="h1" size="xxl" fontWeight="bold" className="text-green-600">
              {summary?.categories ?? 0}
            </Typography>
            <Typography variant="p" size="small" className="text-gray-400">Categorias ativas</Typography>
          </Card>

          <Card title="Produtos">
            <Typography variant="h1" size="xxl" fontWeight="bold" className="text-purple-600">
              {summary?.products ?? 0}
            </Typography>
            <Typography variant="p" size="small" className="text-gray-400">Itens na vitrine</Typography>
          </Card>

          <Card title="Favoritos">
            <Typography variant="h1" size="xxl" fontWeight="bold" className="text-red-500">
              {summary?.favorites ?? 0}
            </Typography>
            <Typography variant="p" size="small" className="text-gray-400">Total de interações</Typography>
          </Card>
        </div>
      ) : (
        <Card>
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <Typography variant="h4" size="lg" fontWeight="bold">
              Acesso Rápido
            </Typography>
            <p className="mt-2 text-gray-500 max-w-md">
              Explore nosso catálogo de produtos, veja as novidades e adicione os seus itens favoritos.
            </p>
            <div className="mt-6">
              <Button 
                label="Ir para a Vitrine" 
                icon="inventory_2" 
                onClick={() => router.push('/produtos')} 
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}