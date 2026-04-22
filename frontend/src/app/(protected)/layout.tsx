'use client'

import {
  AdminSideBar,
  AdminUserBar,
  AppLayout,
  MenuItem,
  SidebarSectionProps,
} from '@uigovpe/components';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { NotificationBell } from '@/src/components/NotificationBell';
import { authService, SessionUser } from '../../services/auth.service';

function mapRoleLabel(role?: string) {
  return role === 'ADMIN' ? 'Administrador' : 'Usuário';
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
        router.replace('/login');
      })
      .finally(() => {
        setIsLoadingUser(false);
      });
  }, [router]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    if (pathname.startsWith('/usuarios') && currentUser.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [currentUser, pathname, router]);

  const handleLogout = () => {
    authService.clearSession();
    router.replace('/login');
  };

  const sidebarSections: SidebarSectionProps[] = useMemo(() => {
    const managementItems: MenuItem[] = [
      {
        id: 'menu-dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
        link: '/dashboard',
      },
      {
        id: 'menu-categorias',
        label: 'Categorias',
        icon: 'category',
        link: '/categorias',
      },
      {
        id: 'menu-produtos',
        label: 'Produtos',
        icon: 'inventory_2',
        link: '/produtos',
      },
      {
        id: 'menu-notificacoes',
        label: 'Notificações',
        icon: 'notifications',
        link: '/notificacoes',
      },
    ];

    if (currentUser?.role === 'ADMIN') {
      managementItems.push({
        id: 'menu-usuarios',
        label: 'Usuários',
        icon: 'group',
        link: '/usuarios',
      });
    }

    return [
      {
        id: 'section-gestao',
        title: 'Gestão',
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
          <div className="relative">
            <AdminUserBar
              user={{
                name: currentUser?.name || currentUser?.email || 'Usuário',
                profile: mapRoleLabel(currentUser?.role),
              }}
              // A propriedade correta fica do lado de fora do objeto user:
              avatarImage={
                currentUser?.avatarUrl 
                  ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/files/image?path=${encodeURIComponent(currentUser.avatarUrl)}`
                  : undefined
              }
              avatarIcon="person" // Ícone padrão caso a imagem falhe ou não exista
              menuActions={[
                {
                  label: 'Meu Perfil',
                  command: () => router.push('/perfil'), // <-- PORTA DE ENTRADA AQUI!
                },
                {
                  label: 'Sair',
                  command: handleLogout,
                },
              ]}
            />
            /

            <div className="pointer-events-none absolute right-20 top-1/2 z-20 hidden -translate-y-1/2 lg:block">
              <div className="pointer-events-auto">
                <NotificationBell />
              </div>
            </div>
          </div>

          <AppLayout.MainContent>
            <AppLayout.PageContent className="bg-gray-50">
              <div className="mb-4 flex justify-end lg:hidden">
                <NotificationBell />
              </div>
              {children}
            </AppLayout.PageContent>
          </AppLayout.MainContent>
        </AppLayout.ContentSection>
      </AppLayout.MainLayout>
    </AppLayout>
  );
}

