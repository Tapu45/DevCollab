'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import {
  Users,
  UserPlus,
  UserCheck,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Loader from '@/components/shared/Loader';
import { Connection, NetworkStats } from '@/types/Network';
import {
  useReceivedConnections,
  useSentConnections,
  useBlockedUsers,
  useRespondMutation,
  useWithdrawMutation,
  useBlockMutation,
  useUnblockMutation,
} from '@/hooks/Network';
import { ConnectionCard } from './Style';
import ConnectedTab from './ConnectedTab';

// Main Component
export default function MyNetworkPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    connectionId: string | null;
  }>({ open: false, connectionId: null });
  const [connectedCount, setConnectedCount] = useState(0); // State for connected count

  const router = useRouter(); // Initialize router

  const { data: receivedConnections = [], isLoading: loadingReceived } =
    useReceivedConnections();
  const { data: sentConnections = [], isLoading: loadingSent } =
    useSentConnections();
  const { data: blockedUsers = [], isLoading: loadingBlocked } =
    useBlockedUsers();

  const respondMutation = useRespondMutation();
  const withdrawMutation = useWithdrawMutation();
  const blockMutation = useBlockMutation();
  const unblockMutation = useUnblockMutation();

  // Handlers
  const handleConnectionAction = (connectionId: string, action: string) => {
    if (action === 'withdraw') {
      withdrawMutation.mutate(connectionId);
    } else if (action === 'ACCEPTED' || action === 'DECLINED') {
      respondMutation.mutate({
        connectionId,
        response: action as 'ACCEPTED' | 'DECLINED',
      });
    }
  };

  const handleBlockUser = (userId: string) => {
    blockMutation.mutate(userId);
  };

  const handleUnblockUser = (userId: string) => {
    unblockMutation.mutate(userId);
  };

  const handleViewProfile = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const handleMessageUser = (userId: string) => {
    router.push(`/messages?user=${userId}`);
  };

  const handleSelectAll = (connections: Connection[]) => {
    if (selectedConnections.length === connections.length) {
      setSelectedConnections([]);
    } else {
      setSelectedConnections(connections.map((c) => c.id));
    }
  };

  // Filter connections
  const filterConnections = (connections: Connection[]) => {
    return connections.filter((connection) => {
      const user = connection.sender || connection.receiver;
      const matchesSearch =
        !searchTerm ||
        user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || connection.status === statusFilter;
      const matchesType =
        typeFilter === 'all' || connection.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  };

  const filteredReceived = filterConnections(receivedConnections);
  const filteredSent = filterConnections(sentConnections);
  const filteredBlocked = filterConnections(blockedUsers);

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
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Tabs defaultValue="connected" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger
                value="connected"
                className="flex items-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                Connected ({connectedCount})
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Requests ({filteredReceived.length + filteredSent.length})
              </TabsTrigger>
              <TabsTrigger value="blocked" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Blocked ({filteredBlocked.length})
              </TabsTrigger>
            </TabsList>

            {/* Connected Tab */}
            <TabsContent value="connected">
              <div className="flex items-center gap-3 mb-4">
                <Input
                  placeholder="Search connections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value="COLLABORATOR">Collaborator</SelectItem>
                    <SelectItem value="MENTOR">Mentor</SelectItem>
                    <SelectItem value="MENTEE">Mentee</SelectItem>
                    <SelectItem value="FRIEND">Friend</SelectItem>
                    <SelectItem value="COLLEAGUE">Colleague</SelectItem>
                    <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ConnectedTab
                searchTerm={searchTerm}
                onCountChange={setConnectedCount}
                onViewProfile={handleViewProfile}
                onBlock={handleBlockUser}
                onMessage={handleMessageUser}
                typeFilter={typeFilter}
              />
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests" className="space-y-8">
              {/* Received Requests */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Received Requests ({filteredReceived.length})
                </h4>
                {filteredReceived.length === 0 ? (
                  <Card className="border-border/50">
                    <CardContent className="p-8 text-center">
                      <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      <div className="text-muted-foreground">
                        No pending received requests.
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Checkbox
                        checked={
                          selectedConnections.length === filteredReceived.length
                        }
                        onCheckedChange={() =>
                          handleSelectAll(filteredReceived)
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        Select all ({selectedConnections.length}/
                        {filteredReceived.length})
                      </span>
                      {selectedConnections.length > 0 && (
                        <div className="flex items-center gap-2 ml-4">
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
              </div>
              {/* Sent Requests */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Sent Requests ({filteredSent.length})
                </h4>
                {filteredSent.length === 0 ? (
                  <Card className="border-border/50">
                    <CardContent className="p-8 text-center">
                      <UserCheck className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      <div className="text-muted-foreground">
                        No sent requests.
                      </div>
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
              </div>
            </TabsContent>

            {/* Blocked Tab */}
            <TabsContent value="blocked" className="space-y-4">
              {filteredBlocked.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="p-12 text-center">
                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No blocked users
                    </h3>
                    <p className="text-muted-foreground">
                      You haven't blocked any users.
                    </p>
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
        <AlertDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, connectionId: null })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Action</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to perform this action? This cannot be
                undone.
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
