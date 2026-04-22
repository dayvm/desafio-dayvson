'use client'

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Dialog, Icon } from '@uigovpe/components';
import {
  Notification,
  notificationsService,
} from '../services/notifications.service';

function formatNotificationDate(dateString: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

function getNotificationIcon(type?: string) {
  switch (type) {
    case 'FAVORITE_ADDED':
      return 'favorite';
    default:
      return 'notifications';
  }
}

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications],
  );

  const loadNotifications = async () => {
    try {
      const data = await notificationsService.getMine();
      setNotifications(data);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpen = () => {
    loadNotifications();
    setIsDialogVisible(true);
  };

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.readAt) {
      return;
    }

    try {
      await notificationsService.markAsRead(notification.id);
      setNotifications((currentNotifications) =>
        currentNotifications.map((currentNotification) =>
          currentNotification.id === notification.id
            ? {
                ...currentNotification,
                readAt: new Date().toISOString(),
              }
            : currentNotification,
        ),
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const handleGoToNotificationsPage = () => {
    setIsDialogVisible(false);
    router.push('/notificacoes');
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Abrir notificações"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#494C57] transition-colors hover:bg-gray-100"
      >
        <Icon icon="notifications" className="text-[1.5rem]" />

        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[0.65rem] font-bold leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      <Dialog
        header={
          <div className="flex items-center gap-2">
            <span>Notificações</span>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-[#0034B7] px-2.5 py-0.5 text-[0.7rem] font-bold text-white">
                {unreadCount} novas
              </span>
            ) : null}
          </div>
        }
        visible={isDialogVisible}
        onHide={() => setIsDialogVisible(false)}
        style={{ width: '90vw', maxWidth: '500px' }}
      >
        <div className="mt-2 max-h-[60vh] overflow-y-auto px-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-[#494C57]">
              <Icon icon="notifications_off" className="mb-3 text-4xl text-gray-300" />
              <p>Nenhuma notificação por enquanto.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {notifications.slice(0, 8).map((notification) => {
                const isRead = Boolean(notification.readAt);

                return (
                  <li
                    key={notification.id}
                    onClick={() => handleMarkAsRead(notification)}
                    className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition-all hover:-translate-y-0.5 ${
                      isRead
                        ? 'border-gray-200 bg-gray-50 opacity-70'
                        : 'border-blue-100 bg-[#EEF4FF] shadow-sm'
                    }`}
                  >
                    <div
                      className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        isRead
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-[#0034B7] text-white'
                      }`}
                    >
                      <Icon
                        icon={getNotificationIcon(notification.type)}
                        className="text-[1.2rem]"
                      />
                    </div>

                    <div className="flex-1">
                      <h4
                        className={`text-sm ${
                          isRead
                            ? 'font-semibold text-gray-700'
                            : 'font-bold text-[#28272C]'
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-[#494C57]">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-[0.65rem] font-medium uppercase tracking-wide text-gray-400">
                        {formatNotificationDate(notification.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            label="Ver todas"
            icon="arrow_forward"
            severity="secondary"
            outlined
            onClick={handleGoToNotificationsPage}
          />
        </div>
      </Dialog>
    </>
  );
}
