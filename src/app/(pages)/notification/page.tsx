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
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationCategory, NotificationPriority } from '@/generated/prisma';
import { useSocket } from '@/hooks/useSocket';

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
  createdAt: Date;
}

interface NotificationFilters {
  category?: NotificationCategory;
  priority?: NotificationPriority;
  isRead?: boolean;
  search?: string;
}

// API Functions
const fetchNotifications = async (filters: NotificationFilters = {}): Promise<{
  notifications: Notification[];
  unreadCount: number;
  hasMore: boolean;
}> => {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.isRead !== undefined) params.append('unreadOnly', (!filters.isRead).toString());
  if (filters.search) params.append('search', filters.search);

  const response = await fetch(`/api/notification?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch notifications');
  return response.json();
};

const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const response = await fetch('/api/notifications', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'markAsRead', notificationId }),
  });
  if (!response.ok) throw new Error('Failed to mark notification as read');
};

const markAllAsRead = async (category?: NotificationCategory): Promise<void> => {
  const response = await fetch('/api/notifications', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'markAllAsRead', category }),
  });
  if (!response.ok) throw new Error('Failed to mark all as read');
};

const deleteNotification = async (notificationId: string): Promise<void> => {
  const response = await fetch(`/api/notifications/${notificationId}`, {
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
      return 'text-red-500 bg-red-50 dark:bg-red-950/20';
    case 'HIGH':
      return 'text-orange-500 bg-orange-50 dark:bg-orange-950/20';
    case 'NORMAL':
      return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20';
    case 'LOW':
      return 'text-gray-500 bg-gray-50 dark:bg-gray-950/20';
    default:
      return 'text-gray-500 bg-gray-50 dark:bg-gray-950/20';
  }
};

const getCategoryColor = (category: NotificationCategory) => {
  switch (category) {
    case 'CONNECTION':
      return 'text-purple-600 bg-purple-50 dark:bg-purple-950/20';
    case 'MESSAGE':
      return 'text-green-600 bg-green-50 dark:bg-green-950/20';
    case 'PROJECT':
      return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20';
    case 'TASK':
      return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20';
    case 'ACHIEVEMENT':
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20';
    case 'SYSTEM':
      return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
    case 'EVENT':
      return 'text-pink-600 bg-pink-50 dark:bg-pink-950/20';
    default:
      return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

// Main Component
export default function NotificationPage() {
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { socket } = useSocket();
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

  // Real-time updates
  useEffect(() => {
    if (socket) {
      socket.on('notification_received', () => {
        refetch();
      });

      socket.on('notification_read', () => {
        refetch();
      });

      return () => {
        socket.off('notification_received');
        socket.off('notification_read');
      };
    }
  }, [socket, refetch]);

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

  const handleSelectNotification = (notificationId: string, checked: boolean) => {
    setSelectedNotifications(prev => 
      checked 
        ? [...prev, notificationId]
        : prev.filter(id => id !== notificationId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(data?.notifications.map(n => n.id) || []);
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => {
      markAsReadMutation.mutate(id);
    });
    setSelectedNotifications([]);
  };

  const handleBulkDelete = () => {
    selectedNotifications.forEach(id => {
      deleteNotificationMutation.mutate(id);
    });
    setSelectedNotifications([]);
  };

  const handleFilterChange = (key: keyof NotificationFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, search: query }));
  };

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;
  const allSelected = selectedNotifications.length === notifications.length && notifications.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded-lg w-1/3"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Notifications</h3>
              <p className="text-muted-foreground mb-4">
                There was an error loading your notifications. Please try again.
              </p>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Notifications
              </h1>
              <p className="text-muted-foreground mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {selectedNotifications.length > 0 && (
                <div className="flex items-center gap-2 mr-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkMarkAsRead}
                    disabled={markAsReadMutation.isPending}
                  >
                    <CheckCheck className="w-4 h-4 mr-2" />
                    Mark Read ({selectedNotifications.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={deleteNotificationMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete ({selectedNotifications.length})
                  </Button>
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Category:</label>
                      <select
                        value={filters.category || ''}
                        onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                        className="px-3 py-1 border border-border rounded-md bg-background text-foreground"
                      >
                        <option value="">All</option>
                        <option value="CONNECTION">Connections</option>
                        <option value="MESSAGE">Messages</option>
                        <option value="PROJECT">Projects</option>
                        <option value="TASK">Tasks</option>
                        <option value="ACHIEVEMENT">Achievements</option>
                        <option value="SYSTEM">System</option>
                        <option value="EVENT">Events</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Priority:</label>
                      <select
                        value={filters.priority || ''}
                        onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
                        className="px-3 py-1 border border-border rounded-md bg-background text-foreground"
                      >
                        <option value="">All</option>
                        <option value="URGENT">Urgent</option>
                        <option value="HIGH">High</option>
                        <option value="NORMAL">Normal</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Status:</label>
                      <select
                        value={filters.isRead === undefined ? '' : filters.isRead ? 'read' : 'unread'}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleFilterChange('isRead', 
                            value === '' ? undefined : value === 'read'
                          );
                        }}
                        className="px-3 py-1 border border-border rounded-md bg-background text-foreground"
                      >
                        <option value="">All</option>
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
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  {filters.search || filters.category || filters.priority || filters.isRead !== undefined
                    ? 'No notifications match your current filters.'
                    : 'You\'re all caught up! New notifications will appear here.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Select All */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm font-medium">
                      Select all ({notifications.length} notifications)
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <AnimatePresence>
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className={`transition-all duration-200 hover:shadow-md ${
                      !notification.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={selectedNotifications.includes(notification.id)}
                            onCheckedChange={(checked) => 
                              handleSelectNotification(notification.id, checked as boolean)
                            }
                            className="mt-1"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`p-2 rounded-lg ${getCategoryColor(notification.category)}`}>
                                  {getNotificationIcon(notification.type)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className={`font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                      {notification.title}
                                    </h3>
                                    <Badge 
                                      variant="secondary" 
                                      className={`text-xs ${getPriorityColor(notification.priority)}`}
                                    >
                                      {notification.priority}
                                    </Badge>
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    )}
                                  </div>
                                  
                                  <p className="text-muted-foreground text-sm mb-2">
                                    {notification.message}
                                  </p>
                                  
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatTimeAgo(notification.createdAt)}
                                    </div>
                                    
                                    {notification.sender && (
                                      <div className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {notification.sender.displayName || notification.sender.username}
                                      </div>
                                    )}
                                    
                                    <Badge variant="outline" className="text-xs">
                                      {notification.category}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {!notification.isRead && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    disabled={markAsReadMutation.isPending}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                )}
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {!notification.isRead && (
                                      <DropdownMenuItem
                                        onClick={() => handleMarkAsRead(notification.id)}
                                      >
                                        <Check className="w-4 h-4 mr-2" />
                                        Mark as Read
                                      </DropdownMenuItem>
                                    )}
                                    {notification.actionUrl && (
                                      <DropdownMenuItem asChild>
                                        <a href={notification.actionUrl}>
                                          <Info className="w-4 h-4 mr-2" />
                                          {notification.actionText || 'View Details'}
                                        </a>
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteNotification(notification.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}