import { 
  Users, 
  GraduationCap, 
  User2, 
  Heart, 
  Briefcase, 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Shield, 
  AlertCircle, 
  ShieldOff, 
  UserCheck, 
  UserX, 
  UserMinus, 
  MessageCircle, 
  MoreVertical, 
  Eye 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Connection } from '@/types/Network';

export const getConnectionTypeIcon = (type: string) => {
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

export const getConnectionTypeColor = (type: string) => {
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

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING': return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'ACCEPTED': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'DECLINED': return <XCircle className="w-4 h-4 text-red-500" />;
    case 'BLOCKED': return <Shield className="w-4 h-4 text-red-600" />;
    case 'WITHDRAWN': return <AlertCircle className="w-4 h-4 text-gray-500" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'ACCEPTED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'DECLINED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'BLOCKED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'WITHDRAWN': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Connection Card Component
export const ConnectionCard = ({ 
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