'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  UserCheck, 
  UserX, 
  Search, 
  Filter, 
  MoreVertical,
  MessageCircle,
  Shield,
  ShieldOff,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  User2,
  Briefcase,
  GraduationCap,
  Heart,
  Building2,
  Star
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import Loader from '@/components/shared/Loader';

// Types
interface Connection {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED' | 'WITHDRAWN';
  type: 'COLLABORATOR' | 'MENTOR' | 'MENTEE' | 'FRIEND' | 'COLLEAGUE' | 'PROFESSIONAL';
  message?: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    username: string;
    displayName?: string;
    profilePictureUrl?: string;
    headline?: string;
  };
  receiver?: {
    id: string;
    username: string;
    displayName?: string;
    profilePictureUrl?: string;
    headline?: string;
  };
}

interface NetworkStats {
  total: number;
  accepted: number;
  pending: number;
  blocked: number;
  byType: Record<string, number>;
}

// API Functions
const fetchConnections = async (type: string): Promise<Connection[]> => {
  const response = await fetch(`/api/connections/connect?action=${type}`);
  if (!response.ok) throw new Error('Failed to fetch connections');
  const data = await response.json();
  return data[type] || [];
};

const fetchBlockedUsers = async (): Promise<Connection[]> => {
  const response = await fetch('/api/connections/block?action=blocked');
  if (!response.ok) throw new Error('Failed to fetch blocked users');
  const data = await response.json();
  return data.blocked || [];
};

const respondToConnection = async (connectionId: string, response: 'ACCEPTED' | 'DECLINED') => {
  const res = await fetch('/api/connections/connect', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'respond', connectionId, response }),
  });
  if (!res.ok) throw new Error('Failed to respond to connection');
  return res.json();
};

const withdrawConnection = async (connectionId: string) => {
  const res = await fetch('/api/connections/connect', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'withdraw', connectionId }),
  });
  if (!res.ok) throw new Error('Failed to withdraw connection');
  return res.json();
};

const blockUser = async (userId: string) => {
  const res = await fetch('/api/connections/block', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'block', userId }),
  });
  if (!res.ok) throw new Error('Failed to block user');
  return res.json();
};

const unblockUser = async (userId: string) => {
  const res = await fetch('/api/connections/block', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'unblock', userId }),
  });
  if (!res.ok) throw new Error('Failed to unblock user');
  return res.json();
};

// Helper Functions
const getConnectionTypeIcon = (type: string) => {
  switch (type) {
    case 'COLLABORATOR': return <Users className="w-4 h-4" />;
    case 'MENTOR': return <GraduationCap className="w-4 h-4" />;
    case 'MENTEE': return <User2 className="w-4 h-4" />;
    case 'FRIEND': return <Heart className="w-4 h-4" />;
    case 'COLLEAGUE': return <Briefcase className="w-4 h-4" />;
    case 'PROFESSIONAL': return <Building2 className="w-4 h-4" />;
    default: return <Users className="w-4 h-4" />;
  }
};

const getConnectionTypeColor = (type: string) => {
  switch (type) {
    case 'COLLABORATOR': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'MENTOR': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'MENTEE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'FRIEND': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
    case 'COLLEAGUE': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'PROFESSIONAL': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING': return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'ACCEPTED': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'DECLINED': return <XCircle className="w-4 h-4 text-red-500" />;
    case 'BLOCKED': return <Shield className="w-4 h-4 text-red-600" />;
    case 'WITHDRAWN': return <AlertCircle className="w-4 h-4 text-gray-500" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'ACCEPTED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'DECLINED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'BLOCKED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'WITHDRAWN': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Connection Card Component
const ConnectionCard = ({ 
  connection, 
  isReceived = false, 
  onAction, 
  onBlock, 
  onUnblock 
}: {
  connection: Connection;
  isReceived?: boolean;
  onAction: (id: string, action: string) => void;
  onBlock: (userId: string) => void;
  onUnblock: (userId: string) => void;
}) => {
  const user = isReceived ? connection.sender : connection.receiver;
  const isBlocked = connection.status === 'BLOCKED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Avatar className="h-12 w-12 ring-2 ring-background shadow-md">
              <AvatarImage src={user?.profilePictureUrl || ''} alt={user?.displayName || user?.username || ''} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {user?.displayName || user?.username}
                  </h3>
                  {user?.headline && (
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {user.headline}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className={`text-xs ${getConnectionTypeColor(connection.type)}`}>
                      {getConnectionTypeIcon(connection.type)}
                      <span className="ml-1">{connection.type}</span>
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(connection.status)}`}>
                      {getStatusIcon(connection.status)}
                      <span className="ml-1">{connection.status}</span>
                    </Badge>
                  </div>
                  {connection.message && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      "{connection.message}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {isReceived ? 'Received' : 'Sent'} {formatDate(connection.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {connection.status === 'PENDING' && isReceived && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onAction(connection.id, 'ACCEPTED')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onAction(connection.id, 'DECLINED')}
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                    </>
                  )}

                  {connection.status === 'PENDING' && !isReceived && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAction(connection.id, 'withdraw')}
                    >
                      <UserMinus className="w-4 h-4 mr-1" />
                      Withdraw
                    </Button>
                  )}

                  {connection.status === 'ACCEPTED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {/* Navigate to chat */}}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                  )}

                  {!isBlocked && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onBlock(user?.id || '')}>
                          <Shield className="w-4 h-4 mr-2" />
                          Block User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {isBlocked && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUnblock(user?.id || '')}
                      className="text-green-600 hover:text-green-700"
                    >
                      <ShieldOff className="w-4 h-4 mr-1" />
                      Unblock
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Component
export default function MyNetworkPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; connectionId: string | null }>({ open: false, connectionId: null });

  const queryClient = useQueryClient();

  // Queries
  const { data: receivedConnections = [], isLoading: loadingReceived } = useQuery({
    queryKey: ['connections', 'received'],
    queryFn: () => fetchConnections('pending'),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: sentConnections = [], isLoading: loadingSent } = useQuery({
    queryKey: ['connections', 'sent'],
    queryFn: () => fetchConnections('sent'),
  });

  const { data: blockedUsers = [], isLoading: loadingBlocked } = useQuery({
    queryKey: ['connections', 'blocked'],
    queryFn: fetchBlockedUsers,
  });

  // Mutations
  const respondMutation = useMutation({
    mutationFn: ({ connectionId, response }: { connectionId: string; response: 'ACCEPTED' | 'DECLINED' }) =>
      respondToConnection(connectionId, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update connection');
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: withdrawConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection withdrawn successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to withdraw connection');
    },
  });

  const blockMutation = useMutation({
    mutationFn: blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('User blocked successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to block user');
    },
  });

  const unblockMutation = useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('User unblocked successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to unblock user');
    },
  });

  // Handlers
  const handleConnectionAction = (connectionId: string, action: string) => {
    if (action === 'withdraw') {
      withdrawMutation.mutate(connectionId);
    } else if (action === 'ACCEPTED' || action === 'DECLINED') {
      respondMutation.mutate({ connectionId, response: action as 'ACCEPTED' | 'DECLINED' });
    }
  };

  const handleBlockUser = (userId: string) => {
    blockMutation.mutate(userId);
  };

  const handleUnblockUser = (userId: string) => {
    unblockMutation.mutate(userId);
  };

  const handleSelectAll = (connections: Connection[]) => {
    if (selectedConnections.length === connections.length) {
      setSelectedConnections([]);
    } else {
      setSelectedConnections(connections.map(c => c.id));
    }
  };

  const handleSelectConnection = (connectionId: string) => {
    setSelectedConnections(prev =>
      prev.includes(connectionId)
        ? prev.filter(id => id !== connectionId)
        : [...prev, connectionId]
    );
  };

  // Filter connections
  const filterConnections = (connections: Connection[]) => {
    return connections.filter(connection => {
      const user = connection.sender || connection.receiver;
      const matchesSearch = !searchTerm || 
        user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || connection.status === statusFilter;
      const matchesType = typeFilter === 'all' || connection.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  };

  const filteredReceived = filterConnections(receivedConnections);
  const filteredSent = filterConnections(sentConnections);
  const filteredBlocked = filterConnections(blockedUsers);

  // Calculate stats
  const stats: NetworkStats = {
    total: receivedConnections.length + sentConnections.length,
    accepted: [...receivedConnections, ...sentConnections].filter(c => c.status === 'ACCEPTED').length,
    pending: [...receivedConnections, ...sentConnections].filter(c => c.status === 'PENDING').length,
    blocked: blockedUsers.length,
    byType: [...receivedConnections, ...sentConnections].reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  if (loadingReceived || loadingSent || loadingBlocked) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-border/50 mb-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
          
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                  My Network
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage your professional connections and collaborations
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['connections'] })}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
                <Button
                  variant={showBlockedUsers ? "default" : "outline"}
                  onClick={() => setShowBlockedUsers(!showBlockedUsers)}
                  className="flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  {showBlockedUsers ? 'Hide' : 'Show'} Blocked ({stats.blocked})
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Connections</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.accepted}</p>
                  <p className="text-sm text-muted-foreground">Accepted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.blocked}</p>
                  <p className="text-sm text-muted-foreground">Blocked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col lg:flex-row gap-4 mb-6"
        >
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search connections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="DECLINED">Declined</SelectItem>
              <SelectItem value="BLOCKED">Blocked</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="COLLABORATOR">Collaborator</SelectItem>
              <SelectItem value="MENTOR">Mentor</SelectItem>
              <SelectItem value="MENTEE">Mentee</SelectItem>
              <SelectItem value="FRIEND">Friend</SelectItem>
              <SelectItem value="COLLEAGUE">Colleague</SelectItem>
              <SelectItem value="PROFESSIONAL">Professional</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Tabs defaultValue="received" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="received" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Received ({filteredReceived.length})
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Sent ({filteredSent.length})
              </TabsTrigger>
              <TabsTrigger value="blocked" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Blocked ({filteredBlocked.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="space-y-4">
              {filteredReceived.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="p-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No pending requests</h3>
                    <p className="text-muted-foreground">You don't have any pending connection requests.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedConnections.length === filteredReceived.length}
                        onCheckedChange={() => handleSelectAll(filteredReceived)}
                      />
                      <span className="text-sm text-muted-foreground">
                        Select all ({selectedConnections.length}/{filteredReceived.length})
                      </span>
                    </div>
                    {selectedConnections.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept Selected
                        </Button>
                        <Button size="sm" variant="destructive">
                          <XCircle className="w-4 h-4 mr-1" />
                          Decline Selected
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {filteredReceived.map((connection) => (
                      <ConnectionCard
                        key={connection.id}
                        connection={connection}
                        isReceived={true}
                        onAction={handleConnectionAction}
                        onBlock={handleBlockUser}
                        onUnblock={handleUnblockUser}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sent" className="space-y-4">
              {filteredSent.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="p-12 text-center">
                    <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No sent requests</h3>
                    <p className="text-muted-foreground">You haven't sent any connection requests yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredSent.map((connection) => (
                      <ConnectionCard
                        key={connection.id}
                        connection={connection}
                        isReceived={false}
                        onAction={handleConnectionAction}
                        onBlock={handleBlockUser}
                        onUnblock={handleUnblockUser}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>

            <TabsContent value="blocked" className="space-y-4">
              {filteredBlocked.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="p-12 text-center">
                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No blocked users</h3>
                    <p className="text-muted-foreground">You haven't blocked any users.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredBlocked.map((connection) => (
                      <ConnectionCard
                        key={connection.id}
                        connection={connection}
                        isReceived={false}
                        onAction={handleConnectionAction}
                        onBlock={handleBlockUser}
                        onUnblock={handleUnblockUser}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, connectionId: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Action</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to perform this action? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteDialog.connectionId) {
                    // Handle delete action
                    setDeleteDialog({ open: false, connectionId: null });
                  }
                }}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </div>
  );
}