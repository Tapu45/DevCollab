import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, User, Ban, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

interface ConnectedUser {
  id: string;
  username: string;
  displayName?: string;
  profilePictureUrl?: string;
  connectedSince: string;
}

interface ConnectedTabProps {
  searchTerm: string;
  onCountChange: (count: number) => void;
  onViewProfile: (userId: string) => void;
  onBlock: (userId: string) => void;
  onMessage: (userId: string) => void;
}

const useConnectedUsers = () => {
  return useQuery({
    queryKey: ['connected-users'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/connections/connect?action=connected');
        if (!response.ok) throw new Error('Failed to fetch connected users');
        const data = await response.json();
        return Array.isArray(data.connected) ? data.connected : [];
      } catch (error) {
        console.error('Error fetching connected users:', error);
        return []; // Fallback to empty array on error
      }
    },
  });
};

export default function ConnectedTab({
  searchTerm,
  onCountChange,
  onViewProfile,
  onBlock,
  onMessage,
}: ConnectedTabProps) {
  const { data: connectedUsers = [], isLoading } = useConnectedUsers();

  // Filter connected users based on searchTerm (with safe checks)
  const filteredConnected = (connectedUsers || []).filter((user: ConnectedUser) => {
    const matchesSearch =
      !searchTerm ||
      user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Update count in parent component (with safe access)
  useEffect(() => {
    onCountChange((connectedUsers || []).length);
  }, [(connectedUsers || []).length, onCountChange]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading connected users...</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {filteredConnected.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <Link2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No connections yet
            </h3>
            <p className="text-muted-foreground">
              You don't have any accepted connections yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredConnected.map((user: ConnectedUser) => (
              <Card key={user.id} className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={user.profilePictureUrl || '/default-avatar.png'}
                        alt={user.username}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h4 className="font-semibold">
                          {user.displayName || user.username}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Connected since{' '}
                          {new Date(user.connectedSince).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewProfile(user.id)}
                        className="flex items-center gap-1"
                      >
                        <User className="w-4 h-4" />
                        View Profile
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onBlock(user.id)}
                        className="flex items-center gap-1"
                      >
                        <Ban className="w-4 h-4" />
                        Block
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onMessage(user.id)}
                        className="flex items-center gap-1"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}