'use client'

import { AdminSideBar, AdminUserBar, SidebarSectionProps } from "@uigovpe/components";

export default function ProtectedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // 1. Mock do Usuário (No futuro, você vai pegar isso do estado global ou decodificar do JWT)
    // 1. Mock do Usuário ajustado para a tipagem exata
    const mockUser = {
        name: "Dayvson",
        role: "Administrador",
        profile: "DM" // Trocado para 'profile', conforme exigido pelo type 'User'
    };

    // 2. Mock das Seções da Barra Lateral ajustado
    // Agora o TypeScript sabe que os ícones não são strings genéricas, mas sim do tipo IconName
  const sidebarSections: SidebarSectionProps[] = [
    {
      id: "section-gestao",
      title: "Gestão",
      items: [
        { 
          id: "menu-dashboard", 
          label: "Dashboard", 
          icon: "dashboard", 
          link: "/dashboard",
        },
        { 
          id: "menu-categorias",
          label: "Categorias", 
          icon: "category", 
          link: "/categorias",
        },
        { 
          id: "menu-produtos",
          label: "Produtos", 
          icon: "inventory_2", 
          link: "/produtos",
        },
        { 
          id: "menu-usuarios",
          label: "Usuários", 
          icon: "group", 
          link: "/usuarios",
        },
      ]
    }
  ];

    return (
        <div className="flex min-h-[calc(100vh-60px)] bg-gray-50">

            {/* Agora passamos a prop sections obrigatória */}
            <AdminSideBar sections={sidebarSections} />

            <div className="flex-1 flex flex-col min-w-0">

                {/* Passamos a prop user obrigatória */}
                <AdminUserBar user={mockUser} />

                <main className="flex-1 p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
