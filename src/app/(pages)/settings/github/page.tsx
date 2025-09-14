'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

export default function GitHubSettingsPage() {
  const [installations, setInstallations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInstallations();
  }, []);

  const loadInstallations = async () => {
    try {
      const response = await fetch('/api/github/installations');
      const data = await response.json();
      setInstallations(data.installations || []);
    } catch (error) {
      console.error('Failed to load installations:', error);
    } finally {
      setLoading(false);
    }
  };

  const installApp = () => {
    const appUrl =
      process.env.NEXT_PUBLIC_GITHUB_APP_URL ||
      'https://github.com/apps/dev-collab45';
    window.open(appUrl, '_blank');
  };

  const uninstallApp = async (installationId: number) => {
    try {
      await fetch(`/api/github/install?installation_id=${installationId}`, {
        method: 'DELETE',
      });
      await loadInstallations();
    } catch (error) {
      console.error('Failed to uninstall:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="w-6 h-6" />
            GitHub App Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Connect your GitHub account to sync repositories, commits, issues,
            and pull requests. This provides real-time updates and comprehensive
            analytics.
          </p>

          {installations.length === 0 ? (
            <div className="text-center py-8">
              <Github className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                No GitHub App Installed
              </h3>
              <p className="text-muted-foreground mb-4">
                Install the GitHub App to start syncing your repositories and
                activity.
              </p>
              <Button onClick={installApp} className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Install GitHub App
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {installations.map((installation) => (
                <div
                  key={installation.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium">
                        {installation.accountLogin}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {installation.repositories.length} repositories
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{installation.accountType}</Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => uninstallApp(installation.installationId)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Uninstall
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
