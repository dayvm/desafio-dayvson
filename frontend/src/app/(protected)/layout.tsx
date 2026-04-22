'use client'

import {
  AdminSideBar,
  AdminUserBar,
  AppLayout,
  MenuItem,
  SidebarSectionProps,
} from "@uigovpe/components";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { authService, SessionUser } from "../../services/auth.service";

function mapRoleLabel(role?: string) {
  return role === "ADMIN" ? "Administrador" : "Usuário";
}

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const storedUser = authService.getStoredUser();

    if (storedUser) {
      setCurrentUser(storedUser);
      setIsLoadingUser(false);
      return;
    }

    authService
      .getProfile()
      .then((profile) => {
        const fallbackUser: SessionUser = {
          id: profile.userId,
          name: profile.email,
          email: profile.email,
          role: profile.role,
        };

        setCurrentUser(fallbackUser);
      })
      .catch(() => {
        authService.clearSession();
        router.replace("/login");
      })
      .finally(() => {
        setIsLoadingUser(false);
      });
  }, [router]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    if (pathname.startsWith("/usuarios") && currentUser.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [currentUser, pathname, router]);

  const handleLogout = () => {
    authService.clearSession();
    router.replace("/login");
  };

  const sidebarSections: SidebarSectionProps[] = useMemo(() => {
    const managementItems: MenuItem[] = [
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
    ];

    if (currentUser?.role === "ADMIN") {
      managementItems.push({
        id: "menu-usuarios",
        label: "Usuarios",
        icon: "group",
        link: "/usuarios",
      });
    }

    return [
      {
        id: "section-gestao",
        title: "Gestao",
        items: managementItems,
      },
    ];
  }, [currentUser?.role]);

  if (isLoadingUser) {
    return (
      <div className="flex min-h-[calc(100vh-60px)] items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Carregando sessão...</p>
      </div>
    );
  }

  return (
    <AppLayout>
      <AppLayout.MainLayout>
        <AdminSideBar sections={sidebarSections} />

        <AppLayout.ContentSection>
          <AdminUserBar
            user={{
              name: currentUser?.name || currentUser?.email || "Usuário",
              profile: mapRoleLabel(currentUser?.role),
            }}
            menuActions={[
              {
                label: "Sair",
                command: handleLogout,
              },
            ]}
          />

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
