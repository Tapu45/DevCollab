'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Trash2,
  Link as LinkIcon,
  Github,
  Gitlab,
  Linkedin,
  Globe,
  CheckCircle2,
  ExternalLink,
  Plus,
  Settings,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

type OAuthAccount = {
  id: string;
  provider: string;
  providerAccountId: string;
  expires_at: number | null;
  scope: string | null;
  createdAt: string;
  updatedAt: string;
};

type ExternalProfile = {
  id: string;
  provider: string;
  username: string;
  url?: string | null;
};

const oauthProviders = [
  {
    id: 'github',
    name: 'GitHub',
    Icon: Github,
    description: 'Connect your GitHub repositories and showcase your code',
    color: 'bg-slate-900 text-white',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    Icon: Gitlab,
    description: 'Link your GitLab projects and contributions',
    color: 'bg-orange-500 text-white',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    Icon: Linkedin,
    description: 'Sync your professional network and experience',
    color: 'bg-blue-600 text-white',
  },
];

const manualProviders = [
  {
    id: 'leetcode',
    name: 'LeetCode',
    description: 'Coding challenges and problem solving',
  },
  {
    id: 'behance',
    name: 'Behance',
    description: 'Creative portfolio and design work',
  },
  {
    id: 'codeforces',
    name: 'Codeforces',
    description: 'Competitive programming contests',
  },
  {
    id: 'codechef',
    name: 'CodeChef',
    description: 'Programming practice and competitions',
  },
  {
    id: 'devto',
    name: 'Dev.to',
    description: 'Developer community and articles',
  },
  {
    id: 'dribbble',
    name: 'Dribbble',
    description: 'Design inspiration and portfolio',
  },
  {
    id: 'hashnode',
    name: 'Hashnode',
    description: 'Developer blogging platform',
  },
  {
    id: 'stackoverflow',
    name: 'Stack Overflow',
    description: 'Technical Q&A and reputation',
  },
];

export default function IntegrationsPage() {
  const [accounts, setAccounts] = useState<OAuthAccount[]>([]);
  const [profiles, setProfiles] = useState<ExternalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [form, setForm] = useState<
    Record<string, { username: string; url: string }>
  >({});
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const load = async () => {
    setLoading(true);
    const [a, p] = await Promise.all([
      fetch('/api/integrations/accounts').then((r) => r.json()),
      fetch('/api/integrations/profiles').then((r) => r.json()),
    ]);
    setAccounts(a.accounts ?? []);
    setProfiles(p.profiles ?? []);
    setLoading(false);
  };

   useEffect(() => {
     load();

     // Check for URL parameters to show alerts
     const urlParams = new URLSearchParams(window.location.search);
     const success = urlParams.get('success');
     const error = urlParams.get('error');

     if (success === 'github_connected') {
       setAlert({
         type: 'success',
         message: 'GitHub account connected successfully!',
       });
     } else if (error) {
       const errorMessages: Record<string, string> = {
         missing_installation_id: 'Missing installation ID',
         installation_failed: 'GitHub installation failed',
         oauth_failed: 'GitHub OAuth failed',
         callback_failed: 'Callback processing failed',
         invalid_callback: 'Invalid callback parameters',
       };
       setAlert({
         type: 'error',
         message: errorMessages[error] || 'An error occurred',
       });
     }

     // Clear URL parameters
     if (success || error) {
       window.history.replaceState({}, '', window.location.pathname);
     }
   }, []);

  const connected = (provider: string) =>
    accounts.some((a) => a.provider === provider);

  const onOAuthConnect = async (provider: string) => {
    try {
      if (provider === 'github') {
        const appUrl =
          process.env.NEXT_PUBLIC_GITHUB_APP_URL ||
          'https://github.com/apps/dev-collab45/installations/new';
        window.open(appUrl, '_blank');
        return;
      }

      if (provider === 'linkedin') {
        const response = await fetch('/api/integrations/linkedin/connect', {
          method: 'POST',
        });
        const { authUrl } = await response.json();
        if (authUrl) {
          window.location.href = authUrl;
        }
        return;
      }

      console.log(`Custom OAuth flow for ${provider} not implemented yet`);
    } catch (error) {
      console.error('OAuth connection error:', error);
    }
  };

  const unlinkAccount = async (id: string) => {
    await fetch(`/api/integrations/accounts/${id}`, { method: 'DELETE' });
    await load();
  };

  const saveProfile = async (provider: string) => {
    const data = form[provider] || { username: '', url: '' };
    if (!data.username) return;
    setSaving(provider);
    await fetch('/api/integrations/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        username: data.username,
        url: data.url || undefined,
      }),
    });
    setSaving(null);
    await load();
  };

  const removeProfile = async (id: string) => {
    await fetch(`/api/integrations/profiles/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Integrations
              </h1>
              <p className="text-muted-foreground">
                Connect your accounts and showcase your work across platforms
              </p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {alert && (
          <Alert
            className={
              alert.type === 'success'
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
            }
          >
            <div className="flex items-center gap-2">
              {alert.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription
                className={
                  alert.type === 'success'
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }
              >
                {alert.message}
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAlert(null)}
              className="ml-auto"
            >
              ×
            </Button>
          </Alert>
        )}

        {/* OAuth Integrations Section */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  OAuth Integrations
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Securely connect your accounts with one-click authentication
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {accounts.length} connected
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {oauthProviders.map(({ id, name, Icon, description, color }) => {
                const isConnected = connected(id);
                return (
                  <div
                    key={id}
                    className={`group relative overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-md ${
                      isConnected
                        ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg ${color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        {isConnected && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">
                          {name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {description}
                        </p>
                      </div>

                      <div className="pt-2">
                        {isConnected ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                const acct = accounts.find(
                                  (a) => a.provider === id,
                                );
                                if (acct) unlinkAccount(acct.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Disconnect
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => onOAuthConnect(id)}
                          >
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Manual Profiles Section */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  Manual Profiles
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your profiles from other platforms manually
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {profiles.length} added
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {manualProviders.map(({ id, name, description }) => {
                const existing = profiles.find((p) => p.provider === id);
                return (
                  <div
                    key={id}
                    className={`group relative overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-md ${
                      existing
                        ? 'border-primary/20 bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Globe className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {description}
                            </p>
                          </div>
                        </div>
                        {existing && (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        )}
                      </div>

                      <div className="space-y-3">
                        <Input
                          placeholder="Username"
                          value={form[id]?.username ?? ''}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              [id]: {
                                username: e.target.value,
                                url: prev[id]?.url ?? '',
                              },
                            }))
                          }
                          className="bg-background"
                        />
                        <Input
                          placeholder="Profile URL (optional)"
                          value={form[id]?.url ?? ''}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              [id]: {
                                username: prev[id]?.username ?? '',
                                url: e.target.value,
                              },
                            }))
                          }
                          className="bg-background"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => saveProfile(id)}
                          disabled={saving === id || !form[id]?.username}
                          size="sm"
                          className="flex-1"
                        >
                          {saving === id ? (
                            'Saving...'
                          ) : existing ? (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Update
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Profile
                            </>
                          )}
                        </Button>

                        {existing && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeProfile(existing.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {existing && (
                        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <span>Linked as:</span>
                            <span className="font-medium text-foreground">
                              {existing.username}
                            </span>
                            {existing.url && (
                              <>
                                <span>•</span>
                                <a
                                  href={existing.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-1"
                                >
                                  View Profile
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {!loading && accounts.length === 0 && profiles.length === 0 && (
          <Card className="border-dashed border-2 border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <Settings className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No integrations yet
              </h3>
              <p className="text-muted-foreground max-w-md">
                Connect your accounts and add your profiles to showcase your
                work and build a comprehensive developer profile.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
