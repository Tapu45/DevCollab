'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Bell,
  Mail,
  Smartphone,
  Clock,
  Save,
  Volume2,
  VolumeX,
  Settings
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
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Types
interface NotificationPreferences {
  category: 'CONNECTION' | 'PROJECT' | 'TASK' | 'MESSAGE' | 'ACHIEVEMENT' | 'SYSTEM' | 'EVENT';
  inAppEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  digestFrequency: 'IMMEDIATE' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'NEVER';
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
}

// API Functions
const fetchNotificationPreferences = async (): Promise<NotificationPreferences[]> => {
  const response = await fetch('/api/notifications/preferences');
  if (!response.ok) throw new Error('Failed to fetch notification preferences');
  return response.json();
};

const updateNotificationPreferences = async (preferences: NotificationPreferences[]) => {
  const response = await fetch('/api/notifications/preferences', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferences }),
  });
  if (!response.ok) throw new Error('Failed to update notification preferences');
  return response.json();
};

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences[]>([]);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  const [timezone, setTimezone] = useState('UTC');
  
  const router = useRouter();
  const queryClient = useQueryClient();

  // Queries
  const { data: notificationPreferences, isLoading } = useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: fetchNotificationPreferences,
    // onSuccess: (data: NotificationPreferences[]) => {
    //   setPreferences(data);
    //   if (data.length > 0) {
    //     setQuietHoursStart(data[0].quietHoursStart || '22:00');
    //     setQuietHoursEnd(data[0].quietHoursEnd || '08:00');
    //     setTimezone(data[0].timezone || 'UTC');
    //   }
    // },
  });

  // Mutations
  const updatePreferencesMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification preferences updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update notification preferences');
    },
  });

  // Handlers
  const handlePreferenceChange = (category: string, field: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.category === category 
          ? { ...pref, [field]: value }
          : pref
      )
    );
  };

  const handleSave = () => {
    const updatedPreferences = preferences.map(pref => ({
      ...pref,
      quietHoursStart,
      quietHoursEnd,
      timezone,
    }));
    updatePreferencesMutation.mutate(updatedPreferences);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CONNECTION': return '👥';
      case 'PROJECT': return '��';
      case 'TASK': return '✅';
      case 'MESSAGE': return '💬';
      case 'ACHIEVEMENT': return '🏆';
      case 'SYSTEM': return '⚙️';
      case 'EVENT': return '📅';
      default: return '🔔';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'CONNECTION': return 'Connections';
      case 'PROJECT': return 'Projects';
      case 'TASK': return 'Tasks';
      case 'MESSAGE': return 'Messages';
      case 'ACHIEVEMENT': return 'Achievements';
      case 'SYSTEM': return 'System';
      case 'EVENT': return 'Events';
      default: return category;
    }
  };

  if (isLoading) {
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
            Notification Settings
          </h1>
        </div>

        <div className="space-y-6">
          {/* Global Settings */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Global Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quietHoursStart">Quiet Hours Start</Label>
                  <Input
                    id="quietHoursStart"
                    type="time"
                    value={quietHoursStart}
                    onChange={(e) => setQuietHoursStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quietHoursEnd">Quiet Hours End</Label>
                  <Input
                    id="quietHoursEnd"
                    type="time"
                    value={quietHoursEnd}
                    onChange={(e) => setQuietHoursEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">
                      Eastern Time
                    </SelectItem>
                    <SelectItem value="America/Chicago">
                      Central Time
                    </SelectItem>
                    <SelectItem value="America/Denver">
                      Mountain Time
                    </SelectItem>
                    <SelectItem value="America/Los_Angeles">
                      Pacific Time
                    </SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                    <SelectItem value="Asia/Kolkata">India</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Category Preferences */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Category Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {preferences.map((pref) => (
                <div key={pref.category} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getCategoryIcon(pref.category)}
                    </span>
                    <h3 className="text-lg font-semibold">
                      {getCategoryName(pref.category)}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        <Label>In-App Notifications</Label>
                      </div>
                      <Switch
                        checked={pref.inAppEnabled}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(
                            pref.category,
                            'inAppEnabled',
                            checked,
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <Label>Push Notifications</Label>
                      </div>
                      <Switch
                        checked={pref.pushEnabled}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(
                            pref.category,
                            'pushEnabled',
                            checked,
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <Label>SMS Notifications</Label>
                      </div>
                      <Switch
                        checked={pref.smsEnabled}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(
                            pref.category,
                            'smsEnabled',
                            checked,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Digest Frequency</Label>
                    <Select
                      value={pref.digestFrequency}
                      onValueChange={(value) =>
                        handlePreferenceChange(
                          pref.category,
                          'digestFrequency',
                          value,
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IMMEDIATE">Immediate</SelectItem>
                        <SelectItem value="HOURLY">Hourly</SelectItem>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="NEVER">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updatePreferencesMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {updatePreferencesMutation.isPending
                ? 'Saving...'
                : 'Save Preferences'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}