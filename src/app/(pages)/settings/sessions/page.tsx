'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  Shield,
  LogOut,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Session {
  id: string;
  device: string;
  deviceType: string;
  location: string;
  ipAddress: string;
  lastActivity: string;
  createdAt: string;
  isActive: boolean;
  isCurrent: boolean;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminating, setTerminating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to terminate this session?')) return;

    setTerminating(sessionId);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/terminate`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Session terminated successfully');
        await loadSessions();
      } else {
        setError('Failed to terminate session');
      }
    } catch (error) {
      console.error('Failed to terminate session:', error);
      setError('Failed to terminate session');
    } finally {
      setTerminating(null);
    }
  };

  const terminateOtherSessions = async () => {
    if (
      !confirm(
        'Are you sure you want to terminate all other sessions? This will log you out from all other devices.',
      )
    )
      return;

    setTerminating('others');
    try {
      const response = await fetch('/api/sessions/terminate-others', {
        method: 'DELETE',
        headers: {
          'x-session-token': 'current', // You might need to get this from your session
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Terminated ${data.terminatedCount} other sessions`);
        await loadSessions();
      } else {
        setError('Failed to terminate other sessions');
      }
    } catch (error) {
      console.error('Failed to terminate other sessions:', error);
      setError('Failed to terminate other sessions');
    } finally {
      setTerminating(null);
    }
  };

  const terminateAllSessions = async () => {
    if (
      !confirm(
        'Are you sure you want to terminate ALL sessions? This will log you out from all devices including this one.',
      )
    )
      return;

    setTerminating('all');
    try {
      const response = await fetch('/api/sessions/terminate-all', {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('All sessions terminated. You will be logged out.');
        // Redirect to login page
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
      } else {
        setError('Failed to terminate all sessions');
      }
    } catch (error) {
      console.error('Failed to terminate all sessions:', error);
      setError('Failed to terminate all sessions');
    } finally {
      setTerminating(null);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Manage your active sessions across different devices. You can
            terminate individual sessions or all sessions at once.
          </p>

          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Active Sessions</h3>
              <p className="text-muted-foreground">
                You don't have any active sessions at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bulk Actions */}
              <div className="flex gap-2 p-4 bg-muted/50 rounded-lg">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={terminateOtherSessions}
                  disabled={
                    terminating === 'others' ||
                    sessions.filter((s) => !s.isCurrent).length === 0
                  }
                >
                  {terminating === 'others' ? (
                    <LogOut className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-1" />
                  )}
                  Terminate Other Sessions
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={terminateAllSessions}
                  disabled={terminating === 'all'}
                >
                  {terminating === 'all' ? (
                    <LogOut className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-1" />
                  )}
                  Terminate All Sessions
                </Button>
              </div>

              {/* Sessions List */}
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(session.deviceType)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{session.device}</span>
                          {session.isCurrent && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {session.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(session.lastActivity)}
                          </div>
                          <span className="text-xs">{session.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => terminateSession(session.id)}
                      disabled={terminating === session.id}
                    >
                      {terminating === session.id ? (
                        <LogOut className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Security Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Regularly review your active sessions and terminate any you
              don't recognize
            </li>
            <li>
              • Use "Terminate Other Sessions" when logging in from a new device
            </li>
            <li>
              • If you suspect unauthorized access, terminate all sessions
              immediately
            </li>
            <li>
              • Consider using two-factor authentication for additional security
            </li>
            <li>• Always log out from shared or public computers</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
