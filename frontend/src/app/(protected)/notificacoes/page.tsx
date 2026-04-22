'use client'

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  FlexContainer,
  Icon,
  Tag,
  Typography,
} from '@uigovpe/components';
import {
  Notification,
  notificationsService,
} from '../../../services/notifications.service';

type NotificationFilter = 'all' | 'unread' | 'read';

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getNotificationIcon(type?: string) {
  switch (type) {
    case 'FAVORITE_ADDED':
      return 'favorite';
    default:
      return 'notifications';
  }
}

function getNotificationStatusLabel(notification: Notification) {
  return notification.readAt ? 'Lida' : 'Nova';
}

function NotificationList({
  notifications,
  isLoading,
  isRefreshing,
  onRefresh,
  onMarkAsRead,
}: {
  notifications: Notification[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onMarkAsRead: (notification: Notification) => Promise<void>;
}) {
  if (isLoading) {
    return (
      <Card>
        <div className="flex min-h-[260px] items-center justify-center px-6 py-12 text-center">
          <Typography variant="p" className="text-[var(--color-text-secondary)]">
            Carregando notificações...
          </Typography>
        </div>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-primary-softest)] text-[var(--color-text-primary)]">
            <Icon icon="notifications_off" className="text-[1.75rem]" />
          </div>
          <div className="space-y-2">
            <Typography variant="h4" size="lg" fontWeight="bold">
              Nenhuma notificação encontrada
            </Typography>
            <Typography variant="p" className="text-[var(--color-text-secondary)]">
              Quando houver novas interações no sistema, elas aparecerão aqui.
            </Typography>
          </div>
          <Button
            label="Atualizar"
            icon="refresh"
            severity="secondary"
            outlined
            onClick={onRefresh}
            loading={isRefreshing}
          />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => {
        const isRead = Boolean(notification.readAt);

        return (
          <Card key={notification.id}>
            <div
              className={`rounded-2xl border px-5 py-5 transition-colors ${
                isRead
                  ? 'border-[var(--color-outline-softest)] bg-white'
                  : 'border-[var(--color-outline-primary)] bg-[var(--color-surface-primary-softest)]'
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                    isRead
                      ? 'bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]'
                      : 'bg-[var(--color-surface-primary-default)] text-white'
                  }`}
                >
                  <Icon icon={getNotificationIcon(notification.type)} className="text-[1.4rem]" />
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <Typography variant="h4" size="md" fontWeight="bold">
                        {notification.title}
                      </Typography>
                      <Typography
                        variant="p"
                        className="leading-6 text-[var(--color-text-secondary)]"
                      >
                        {notification.message}
                      </Typography>
                    </div>

                    <Tag
                      value={getNotificationStatusLabel(notification)}
                      severity={isRead ? 'success' : 'info'}
                    />
                  </div>

                  <div className="flex flex-col gap-3 border-t border-[var(--color-outline-softest)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                      <span className="inline-flex items-center gap-2">
                        <Icon icon="schedule" />
                        {formatDate(notification.createdAt)}
                      </span>

                      {notification.readAt ? (
                        <span className="inline-flex items-center gap-2">
                          <Icon icon="check" />
                          Lida em {formatDate(notification.readAt)}
                        </span>
                      ) : null}
                    </div>

                    {!isRead ? (
                      <Button
                        label="Marcar como lida"
                        icon="check"
                        severity="secondary"
                        outlined
                        onClick={() => onMarkAsRead(notification)}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default function NotificacoesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications],
  );

  const readCount = notifications.length - unreadCount;

  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter((notification) => !notification.readAt);
      case 'read':
        return notifications.filter((notification) => Boolean(notification.readAt));
      default:
        return notifications;
    }
  }, [activeFilter, notifications]);

  const loadNotifications = async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const data = await notificationsService.getMine();
      setNotifications(data);
      setFeedback(null);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setFeedback('Não foi possível carregar as notificações no momento.');
    } finally {
      if (silent) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications({ silent: true });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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
      console.error('Erro ao marcar notificação como lida:', error);
      setFeedback('Não foi possível marcar a notificação como lida.');
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Typography variant="h3" size="xl" fontWeight="bold">
            Notificações
          </Typography>
          <Typography variant="p" className="text-[var(--color-text-secondary)]">
            Acompanhe interações importantes do sistema e marque os avisos já lidos.
          </Typography>
        </div>

        <Button
          label="Atualizar"
          icon="refresh"
          severity="secondary"
          outlined
          onClick={() => loadNotifications({ silent: true })}
          loading={isRefreshing}
        />
      </div>

      {feedback ? (
        <div className="rounded-xl border border-[var(--color-outline-danger)] bg-[var(--color-background-feedback-danger)] px-4 py-3 text-sm text-[var(--color-text-danger)]">
          {feedback}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="space-y-2 p-1">
            <Typography variant="p" className="text-[var(--color-text-secondary)]">
              Total
            </Typography>
            <Typography variant="h2" size="xl" fontWeight="bold">
              {notifications.length}
            </Typography>
          </div>
        </Card>

        <Card>
          <div className="space-y-2 p-1">
            <Typography variant="p" className="text-[var(--color-text-secondary)]">
              Não lidas
            </Typography>
            <Typography variant="h2" size="xl" fontWeight="bold">
              {unreadCount}
            </Typography>
          </div>
        </Card>

        <Card>
          <div className="space-y-2 p-1">
            <Typography variant="p" className="text-[var(--color-text-secondary)]">
              Lidas
            </Typography>
            <Typography variant="h2" size="xl" fontWeight="bold">
              {readCount}
            </Typography>
          </div>
        </Card>
      </div>

      <Card>
        <FlexContainer direction="row" gap="3" wrap="wrap" className="p-1">
          <Button
            label={`Todas (${notifications.length})`}
            severity={activeFilter === 'all' ? undefined : 'secondary'}
            outlined={activeFilter !== 'all'}
            onClick={() => setActiveFilter('all')}
          />
          <Button
            label={`Não lidas (${unreadCount})`}
            severity={activeFilter === 'unread' ? undefined : 'secondary'}
            outlined={activeFilter !== 'unread'}
            onClick={() => setActiveFilter('unread')}
          />
          <Button
            label={`Lidas (${readCount})`}
            severity={activeFilter === 'read' ? undefined : 'secondary'}
            outlined={activeFilter !== 'read'}
            onClick={() => setActiveFilter('read')}
          />
        </FlexContainer>
      </Card>

      <NotificationList
        notifications={filteredNotifications}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onRefresh={() => loadNotifications({ silent: true })}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
}
