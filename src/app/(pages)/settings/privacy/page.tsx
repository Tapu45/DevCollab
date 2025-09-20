'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Eye,
  Users,
  UserX,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Types
interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';
  connectionPrivacyLevel: 'EVERYONE' | 'CONNECTIONS_ONLY' | 'MUTUAL_CONNECTIONS' | 'NOBODY';
  connectionRequestLevel: 'EVERYONE' | 'VERIFIED_ONLY' | 'CONNECTIONS_ONLY' | 'NOBODY';
  hideConnections: boolean;
  autoDeclineRequests: boolean;
  allowMessages: boolean;
  blockedUserIds: string[];
}

interface BlockedUser {
  id: string;
  username: string;
  displayName?: string;
  profilePictureUrl?: string;
  blockedAt: string;
}

// API Functions
const fetchPrivacySettings = async (): Promise<PrivacySettings> => {
  const response = await fetch('/api/connections/privacy');
  if (!response.ok) throw new Error('Failed to fetch privacy settings');
  return response.json();
};

const updatePrivacySettings = async (data: Partial<PrivacySettings>) => {
  const response = await fetch('/api/connections/privacy', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update privacy settings');
  return response.json();
};

const fetchBlockedUsers = async (): Promise<BlockedUser[]> => {
  const response = await fetch('/api/connections/block?action=blocked');
  if (!response.ok) throw new Error('Failed to fetch blocked users');
  const data = await response.json();
  return data.blocked || [];
};

const unblockUser = async (userId: string) => {
  const response = await fetch('/api/connections/block', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'unblock', userId }),
  });
  if (!response.ok) throw new Error('Failed to unblock user');
  return response.json();
};

export default function PrivacySettingsPage() {
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'PUBLIC',
    connectionPrivacyLevel: 'EVERYONE',
    connectionRequestLevel: 'EVERYONE',
    hideConnections: false,
    autoDeclineRequests: false,
    allowMessages: true,
    blockedUserIds: [],
  });
  
  const router = useRouter();
  const queryClient = useQueryClient();

  // Queries
  const { data: privacySettings, isLoading: loadingSettings } = useQuery({
    queryKey: ['privacy', 'settings'],
    queryFn: fetchPrivacySettings,
  });

  // Update local state when privacySettings changes
  useEffect(() => {
    if (privacySettings) {
      setSettings(privacySettings);
    }
  }, [privacySettings]);

  const { data: blockedUsers = [], isLoading: loadingBlocked } = useQuery({
    queryKey: ['privacy', 'blocked'],
    queryFn: fetchBlockedUsers,
  });

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: updatePrivacySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy'] });
      toast.success('Privacy settings updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update privacy settings');
    },
  });

  const unblockUserMutation = useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy', 'blocked'] });
      toast.success('User unblocked successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to unblock user');
    },
  });

  // Handlers
  const handleSettingChange = (field: keyof PrivacySettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleUnblock = (userId: string) => {
    unblockUserMutation.mutate(userId);
  };

  if (loadingSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            Privacy & Security
          </h1>
        </div>

        <div className="space-y-6">
          {/* Profile Visibility */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Profile Visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profileVisibility">Who can see your profile?</Label>
                <Select
                  value={settings.profileVisibility}
                  onValueChange={(value) => handleSettingChange('profileVisibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Everyone</SelectItem>
                    <SelectItem value="CONNECTIONS_ONLY">Connections only</SelectItem>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowMessages">Allow messages from others</Label>
                  <p className="text-sm text-muted-foreground">
                    Let other users send you messages
                  </p>
                </div>
                <Switch
                  id="allowMessages"
                  checked={settings.allowMessages}
                  onCheckedChange={(checked) => handleSettingChange('allowMessages', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Connection Privacy */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Connection Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="connectionPrivacyLevel">Who can see your connections?</Label>
                <Select
                  value={settings.connectionPrivacyLevel}
                  onValueChange={(value) => handleSettingChange('connectionPrivacyLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EVERYONE">Everyone</SelectItem>
                    <SelectItem value="CONNECTIONS_ONLY">Connections only</SelectItem>
                    <SelectItem value="MUTUAL_CONNECTIONS">Mutual connections only</SelectItem>
                    <SelectItem value="NOBODY">Nobody</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="connectionRequestLevel">Who can send you connection requests?</Label>
                <Select
                  value={settings.connectionRequestLevel}
                  onValueChange={(value) => handleSettingChange('connectionRequestLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EVERYONE">Everyone</SelectItem>
                    <SelectItem value="VERIFIED_ONLY">Verified users only</SelectItem>
                    <SelectItem value="CONNECTIONS_ONLY">Connections only</SelectItem>
                    <SelectItem value="NOBODY">Nobody</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="hideConnections">Hide connections list</Label>
                  <p className="text-sm text-muted-foreground">
                    Don't show your connections to anyone
                  </p>
                </div>
                <Switch
                  id="hideConnections"
                  checked={settings.hideConnections}
                  onCheckedChange={(checked) => handleSettingChange('hideConnections', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoDeclineRequests">Auto-decline connection requests</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically decline all connection requests
                  </p>
                </div>
                <Switch
                  id="autoDeclineRequests"
                  checked={settings.autoDeclineRequests}
                  onCheckedChange={(checked) => handleSettingChange('autoDeclineRequests', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Blocked Users */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="w-5 h-5" />
                Blocked Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingBlocked ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : blockedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <UserX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No blocked users</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {blockedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {user.profilePictureUrl ? (
                            <img
                              src={user.profilePictureUrl}
                              alt={user.displayName || user.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium">
                              {user.displayName?.charAt(0) || user.username.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.displayName || user.username}</p>
                          <p className="text-sm text-muted-foreground">
                            Blocked {new Date(user.blockedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnblock(user.id)}
                        disabled={unblockUserMutation.isPending}
                      >
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updateSettingsMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}