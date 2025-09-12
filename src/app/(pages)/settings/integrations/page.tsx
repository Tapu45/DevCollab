'use client';

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Trash2,
  Link as LinkIcon,
  Github,
  Gitlab,
  Linkedin,
  Globe,
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
  { id: 'github', name: 'GitHub', Icon: Github },
  { id: 'gitlab', name: 'GitLab', Icon: Gitlab },
  { id: 'linkedin', name: 'LinkedIn', Icon: Linkedin },
];

const manualProviders = [
  { id: 'leetcode', name: 'LeetCode' },
  { id: 'behance', name: 'Behance' },
  { id: 'codeforces', name: 'Codeforces' },
  { id: 'codechef', name: 'CodeChef' },
  { id: 'devto', name: 'Dev.to' },
  { id: 'dribbble', name: 'Dribbble' },
  { id: 'hashnode', name: 'Hashnode' },
  { id: 'stackoverflow', name: 'Stack Overflow' },
];

export default function IntegrationsPage() {
  const [accounts, setAccounts] = useState<OAuthAccount[]>([]);
  const [profiles, setProfiles] = useState<ExternalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [form, setForm] = useState<
    Record<string, { username: string; url: string }>
  >({});

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
  }, []);

  const connected = (provider: string) =>
    accounts.some((a) => a.provider === provider);

  const onOAuthConnect = async (provider: string) => {
    await signIn(provider, { callbackUrl: '/settings/integrations' });
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
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>OAuth Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {oauthProviders.map(({ id, name, Icon }) => (
              <div
                key={id}
                className="flex items-center justify-between gap-4 border rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <div className="font-medium">{name}</div>
                </div>
                <div className="flex items-center gap-2">
                  {connected(id) ? (
                    <>
                      <span className="text-sm text-green-600">Connected</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const acct = accounts.find((a) => a.provider === id);
                          if (acct) unlinkAccount(acct.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Unlink
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => onOAuthConnect(id)}>
                      <LinkIcon className="w-4 h-4 mr-1" /> Connect
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {!loading && accounts.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No accounts connected yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Manual Profiles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {manualProviders.map(({ id, name }) => {
              const existing = profiles.find((p) => p.provider === id);
              return (
                <div key={id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      <div className="font-medium">{name}</div>
                    </div>
                    {existing ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProfile(existing.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Remove
                      </Button>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                    />
                    <Button
                      onClick={() => saveProfile(id)}
                      disabled={saving === id}
                    >
                      {saving === id
                        ? 'Saving...'
                        : existing
                          ? 'Update'
                          : 'Save'}
                    </Button>
                  </div>
                  {existing ? (
                    <div className="text-xs text-muted-foreground">
                      Linked as {existing.username}
                      {existing.url ? ` · ${existing.url}` : ''}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
