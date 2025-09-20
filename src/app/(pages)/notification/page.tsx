'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  MoreVertical,
  User,
  MessageCircle,
  Users,
  Briefcase,
  Award,
  Calendar,
  Settings,
  X,
  ChevronDown,
  Clock,
  AlertCircle,
  Info,
  CheckCircle,
  CheckSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { NotificationCategory, NotificationPriority } from '@/generated/prisma';
import { usePusherEvent } from '@/hooks/Pusher';
import { useUser } from '@clerk/nextjs';
import { usePage } from '@/context/PageContext';

// Types
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  priority: NotificationPriority;
  category: NotificationCategory;
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  actionText?: string;
  senderId?: string;
  sender?: {
    id: string;
    username: string;
    displayName?: string;
    profilePictureUrl?: string;
  };
  createdAt: Date | string;
}

interface NotificationFilters {
  category?: NotificationCategory;
  priority?: NotificationPriority;
  isRead?: boolean;
  search?: string;
}

// API Functions
const fetchNotifications = async (
  filters: NotificationFilters = {},
): Promise<{
  notifications: Notification[];
  unreadCount: number;
  hasMore: boolean;
}> => {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.isRead !== undefined)
    params.append('unreadOnly', (!filters.isRead).toString());
  if (filters.search) params.append('search', filters.search);

  const response = await fetch(`/api/notification?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch notifications');
  return response.json();
};

const markNotificationAsRead = async (
  notificationId: string,
): Promise<void> => {
  const response = await fetch('/api/notification', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'markAsRead', notificationId }),
  });
  if (!response.ok) throw new Error('Failed to mark notification as read');
};

const markAllAsRead = async (
  category?: NotificationCategory,
): Promise<void> => {
  const response = await fetch('/api/notification', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'markAllAsRead', category }),
  });
  if (!response.ok) throw new Error('Failed to mark all as read');
};

const deleteNotification = async (notificationId: string): Promise<void> => {
  const response = await fetch(`/api/notification/${notificationId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete notification');
};

// Helper Functions
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'CONNECTION_REQUEST':
    case 'CONNECTION_ACCEPTED':
    case 'CONNECTION_DECLINED':
    case 'CONNECTION_BLOCKED':
      return <Users className="w-4 h-4" />;
    case 'MESSAGE_RECEIVED':
    case 'MESSAGE_MENTIONED':
      return <MessageCircle className="w-4 h-4" />;
    case 'PROJECT_INVITATION':
    case 'PROJECT_JOINED':
    case 'PROJECT_LEFT':
    case 'PROJECT_UPDATED':
      return <Briefcase className="w-4 h-4" />;
    case 'TASK_ASSIGNED':
    case 'TASK_COMPLETED':
    case 'TASK_COMMENTED':
    case 'TASK_DUE_SOON':
      return <CheckCircle className="w-4 h-4" />;
    case 'ACHIEVEMENT_UNLOCKED':
      return <Award className="w-4 h-4" />;
    case 'EVENT_REMINDER':
      return <Calendar className="w-4 h-4" />;
    case 'SYSTEM_ANNOUNCEMENT':
      return <Settings className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

const getPriorityColor = (priority: NotificationPriority) => {
  switch (priority) {
    case 'URGENT':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'HIGH':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'NORMAL':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'LOW':
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    default:
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
};

const getCategoryColor = (category: NotificationCategory) => {
  switch (category) {
    case 'CONNECTION':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'MESSAGE':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'PROJECT':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'TASK':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'ACHIEVEMENT':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'SYSTEM':
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    case 'EVENT':
      return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
    default:
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
};

const formatTimeAgo = (date: Date | string) => {
  const now = new Date();
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!d || Number.isNaN(d.getTime())) return 'Unknown';

  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return d.toLocaleDateString();
};

// Main Component
export default function NotificationPage() {
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    [],
  );
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const { user } = useUser();
   const { setPageInfo } = usePage(); // <-- Use usePage

   useEffect(() => {
     setPageInfo('Notifications', 'View and manage all your notifications');
   }, [setPageInfo]);
  const userId = user?.id;
  const queryClient = useQueryClient();

  // Queries
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => fetchNotifications(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Reset selection mode when changing filters or searching
  useEffect(() => {
    if (selectionMode) {
      setSelectionMode(false);
      setSelectedNotifications([]);
    }
  }, [filters, searchQuery]);

  // Real-time updates
  usePusherEvent({
    channelName: userId ? `user-${userId}` : '',
    eventName: 'notification_received',
    callback: () => refetch(),
  });

  usePusherEvent({
    channelName: userId ? `user-${userId}` : '',
    eventName: 'notification_read',
    callback: () => refetch(),
  });

  // Handlers
  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate(filters.category);
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleSelectNotification = (
    notificationId: string,
    checked: boolean,
  ) => {
    setSelectedNotifications((prev) =>
      checked
        ? [...prev, notificationId]
        : prev.filter((id) => id !== notificationId),
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(data?.notifications.map((n) => n.id) || []);
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach((id) => {
      markAsReadMutation.mutate(id);
    });
    setSelectedNotifications([]);
    setSelectionMode(false);
  };

  const handleBulkDelete = () => {
    selectedNotifications.forEach((id) => {
      deleteNotificationMutation.mutate(id);
    });
    setSelectedNotifications([]);
    setSelectionMode(false);
  };

  const handleFilterChange = (key: keyof NotificationFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters((prev) => ({ ...prev, search: query }));
  };

  const toggleSelectionMode = () => {
    setSelectionMode((prev) => !prev);
    if (selectionMode) {
      setSelectedNotifications([]);
    }
  };

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;
  const allSelected =
    selectedNotifications.length === notifications.length &&
    notifications.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded-lg w-1/3"></div>
            <div className="h-10 bg-muted/50 rounded-full w-full"></div>
            <div className="space-y-3 mt-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-muted/30 rounded-xl border border-muted/20"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border border-destructive/20 bg-destructive/5 shadow-lg shadow-destructive/10">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Error Loading Notifications
              </h3>
              <p className="text-muted-foreground mb-4">
                There was an error loading your notifications. Please try again.
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/95 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-400 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">
                Notifications
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center">
                {unreadCount > 0 ? (
                  <>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-medium mr-2">
                      {unreadCount}
                    </span>
                    <span>unread notifications</span>
                  </>
                ) : (
                  <span className="inline-flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    All caught up!
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {selectionMode ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkMarkAsRead}
                    disabled={
                      markAsReadMutation.isPending ||
                      selectedNotifications.length === 0
                    }
                    className={`border-primary/30 text-primary hover:bg-primary/10 ${selectedNotifications.length === 0 ? 'opacity-50' : ''}`}
                  >
                    <CheckCheck className="w-4 h-4 mr-2" />
                    Mark Read ({selectedNotifications.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={
                      deleteNotificationMutation.isPending ||
                      selectedNotifications.length === 0
                    }
                    className={`border-destructive/30 text-destructive hover:bg-destructive/10 ${selectedNotifications.length === 0 ? 'opacity-50' : ''}`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete ({selectedNotifications.length})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSelectionMode}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectionMode}
                    className="border-muted/50 hover:border-muted"
                  >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Select
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`border-muted/50 hover:border-muted ${showFilters ? 'bg-muted/20' : ''}`}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>

                  {unreadCount > 0 && (
                    <Button
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      disabled={markAllAsReadMutation.isPending}
                      className="bg-primary/90 hover:bg-primary shadow-md shadow-primary/20"
                    >
                      <CheckCheck className="w-4 h-4 mr-2" />
                      Mark All Read
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-background/60 border-muted/30 focus-visible:ring-primary/30 focus-visible:border-primary/30 h-11 shadow-sm"
              />
            </div>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <Card className="border border-muted/30 bg-background/60 backdrop-blur-sm shadow-lg shadow-muted/5">
                  <CardContent className="p-4 py-5">
                    <div className="flex flex-wrap gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground/80">
                          Category
                        </label>
                        <select
                          value={filters.category || ''}
                          onChange={(e) =>
                            handleFilterChange(
                              'category',
                              e.target.value || undefined,
                            )
                          }
                          className="px-3 py-2 border border-muted/30 rounded-md bg-background/80 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
                        >
                          <option value="">All Categories</option>
                          <option value="CONNECTION">Connections</option>
                          <option value="MESSAGE">Messages</option>
                          <option value="PROJECT">Projects</option>
                          <option value="TASK">Tasks</option>
                          <option value="ACHIEVEMENT">Achievements</option>
                          <option value="SYSTEM">System</option>
                          <option value="EVENT">Events</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground/80">
                          Priority
                        </label>
                        <select
                          value={filters.priority || ''}
                          onChange={(e) =>
                            handleFilterChange(
                              'priority',
                              e.target.value || undefined,
                            )
                          }
                          className="px-3 py-2 border border-muted/30 rounded-md bg-background/80 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
                        >
                          <option value="">All Priorities</option>
                          <option value="URGENT">Urgent</option>
                          <option value="HIGH">High</option>
                          <option value="NORMAL">Normal</option>
                          <option value="LOW">Low</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground/80">
                          Status
                        </label>
                        <select
                          value={
                            filters.isRead === undefined
                              ? ''
                              : filters.isRead
                                ? 'read'
                                : 'unread'
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            handleFilterChange(
                              'isRead',
                              value === '' ? undefined : value === 'read',
                            );
                          }}
                          className="px-3 py-2 border border-muted/30 rounded-md bg-background/80 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
                        >
                          <option value="">All Status</option>
                          <option value="unread">Unread</option>
                          <option value="read">Read</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notifications List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {notifications.length === 0 ? (
              <Card className="border border-muted/30 bg-background/60 backdrop-blur-sm shadow-lg shadow-muted/5">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
                    <Bell className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    No notifications
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {filters.search ||
                    filters.category ||
                    filters.priority ||
                    filters.isRead !== undefined
                      ? 'No notifications match your current filters.'
                      : "You're all caught up! New notifications will appear here."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Select All (Only visible in selection mode) */}
                {selectionMode && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="border border-primary/30 bg-primary/5 backdrop-blur-sm shadow-sm mb-4">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={handleSelectAll}
                            className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <span className="text-sm font-medium">
                            Select all notifications
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-muted/30 text-muted-foreground"
                        >
                          {selectedNotifications.length}/{notifications.length}{' '}
                          selected
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Notifications */}
                <div className="space-y-3">
                  <AnimatePresence>
                    {notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card
                          className={`transition-all duration-300 backdrop-blur-sm
                            ${
                              !notification.isRead
                                ? 'border-l-4 border-l-primary bg-primary/5 shadow-md shadow-primary/5 border-primary/20'
                                : 'border border-muted/30 bg-background/60 hover:bg-muted/10'
                            }
                          `}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {selectionMode && (
                                <Checkbox
                                  checked={selectedNotifications.includes(
                                    notification.id,
                                  )}
                                  onCheckedChange={(checked) =>
                                    handleSelectNotification(
                                      notification.id,
                                      checked as boolean,
                                    )
                                  }
                                  className="mt-1.5 border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-4">
                                  <div
                                    className={`p-2.5 rounded-full ${getCategoryColor(notification.category)} flex items-center justify-center`}
                                  >
                                    {getNotificationIcon(notification.type)}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <h3
                                        className={`font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}
                                      >
                                        {notification.title}
                                      </h3>

                                      <Badge
                                        variant="outline"
                                        className={`text-xs font-medium ${getPriorityColor(notification.priority)}`}
                                      >
                                        {notification.priority}
                                      </Badge>

                                      {!notification.isRead && (
                                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                      )}
                                    </div>

                                    <p className="text-muted-foreground text-sm mb-3">
                                      {notification.message}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatTimeAgo(notification.createdAt)}
                                      </div>

                                      {notification.sender && (
                                        <div className="flex items-center gap-1.5">
                                          {notification.sender
                                            .profilePictureUrl ? (
                                            <Avatar className="w-4 h-4">
                                              <AvatarImage
                                                src={
                                                  notification.sender
                                                    .profilePictureUrl
                                                }
                                              />
                                              <AvatarFallback className="text-[8px]">
                                                {notification.sender
                                                  .displayName?.[0] ||
                                                  notification.sender
                                                    .username[0]}
                                              </AvatarFallback>
                                            </Avatar>
                                          ) : (
                                            <User className="w-3 h-3" />
                                          )}
                                          {notification.sender.displayName ||
                                            notification.sender.username}
                                        </div>
                                      )}

                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] py-0 px-1.5 ${getCategoryColor(notification.category)}`}
                                      >
                                        {notification.category}
                                      </Badge>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    {!notification.isRead && !selectionMode && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          handleMarkAsRead(notification.id)
                                        }
                                        disabled={markAsReadMutation.isPending}
                                        className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </Button>
                                    )}

                                    {!selectionMode && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-full hover:bg-muted/20"
                                          >
                                            <MoreVertical className="w-3.5 h-3.5" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                          align="end"
                                          className="border-muted/30 bg-background/95 backdrop-blur-lg"
                                        >
                                          {!notification.isRead && (
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleMarkAsRead(
                                                  notification.id,
                                                )
                                              }
                                              className="text-foreground"
                                            >
                                              <Check className="w-4 h-4 mr-2 text-primary" />
                                              Mark as Read
                                            </DropdownMenuItem>
                                          )}
                                          {notification.actionUrl && (
                                            <DropdownMenuItem asChild>
                                              <a
                                                href={notification.actionUrl}
                                                className="cursor-pointer"
                                              >
                                                <Info className="w-4 h-4 mr-2 text-blue-500" />
                                                {notification.actionText ||
                                                  'View Details'}
                                              </a>
                                            </DropdownMenuItem>
                                          )}
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleDeleteNotification(
                                                notification.id,
                                              )
                                            }
                                            className="text-destructive focus:text-destructive"
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {notification.actionUrl && (
                              <div className="mt-3 pl-11">
                                <a
                                  href={notification.actionUrl}
                                  className="text-xs inline-flex items-center text-primary hover:underline"
                                >
                                  {notification.actionText || 'View Details'}
                                  <ChevronDown className="w-3 h-3 ml-1 rotate-270" />
                                </a>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
