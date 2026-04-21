'use client'

import {
  AdminSideBar,
  AdminUserBar,
  AppLayout,
  SidebarSectionProps,
} from "@uigovpe/components";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const mockUser = {
    name: "Dayvson",
    role: "Administrador",
    profile: "DM",
  };

  const sidebarSections: SidebarSectionProps[] = [
    {
      id: "section-gestao",
      title: "Gestao",
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
          label: "Usuarios",
          icon: "group",
          link: "/usuarios",
        },
      ],
    },
  ];

  return (
    <AppLayout>
      <AppLayout.MainLayout>
        <AdminSideBar sections={sidebarSections} />

        <AppLayout.ContentSection>
          <AdminUserBar user={mockUser} />

          <AppLayout.MainContent>
            <AppLayout.PageContent className="bg-gray-50">
              {children}
            </AppLayout.PageContent>
          </AppLayout.MainContent>
        </AppLayout.ContentSection>
      </AppLayout.MainLayout>
    </AppLayout>
  );
}
