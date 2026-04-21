'use client'

import { Card, Typography } from "@uigovpe/components";

export default function Dashboard() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <Typography variant="h3" size="xl" fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="p" className="text-gray-500">
          Bem-vindo ao painel de controle administrativo.
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Exemplo de Cards rápidos para preencher a tela */}
        <Card title="Usuários Cadastrados">
          <Typography variant="h1" size="xxl" fontWeight="bold" className="text-blue-600">
            12
          </Typography>
        </Card>

        <Card title="Categorias">
          <Typography variant="h1" size="xxl" fontWeight="bold" className="text-green-600">
            5
          </Typography>
        </Card>

        <Card title="Produtos na Vitrine">
          <Typography variant="h1" size="xxl" fontWeight="bold" className="text-purple-600">
            24
          </Typography>
        </Card>
      </div>
    </div>
  );
}