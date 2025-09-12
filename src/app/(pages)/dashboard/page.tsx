'use client';

import React, { useEffect, useState } from 'react';
import { usePage } from '@/context/PageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Github,
  Gitlab,
  Linkedin,
  Code,
  Star,
  Users,
  GitBranch,
  Trophy,
  TrendingUp,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface Stat {
  id: string;
  provider: string;
  statsType: string;
  value: number;
  metadata?: any;
  lastUpdated: string;
}

const page = () => {
  const { setPageInfo } = usePage();
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  useEffect(() => {
    setPageInfo(
      'Dashboard',
      'Manage your projects, track progress, and collaborate with your team in one central hub.',
    );
    loadStats();
  }, [setPageInfo]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats/collect');
      const data = await response.json();
      setStats(data.stats || []);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async (provider: string) => {
    setRefreshing(provider);
    try {
      await fetch('/api/stats/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, forceRefresh: true }),
      });
      await loadStats();
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    } finally {
      setRefreshing(null);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'github':
        return <Github className="w-5 h-5" />;
      case 'gitlab':
        return <Gitlab className="w-5 h-5" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      case 'leetcode':
        return <Code className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'github':
        return 'GitHub';
      case 'gitlab':
        return 'GitLab';
      case 'linkedin':
        return 'LinkedIn';
      case 'leetcode':
        return 'LeetCode';
      default:
        return provider;
    }
  };

  const getStatIcon = (statsType: string) => {
    switch (statsType) {
      case 'repositories':
      case 'projects':
        return <GitBranch className="w-4 h-4" />;
      case 'followers':
      case 'following':
        return <Users className="w-4 h-4" />;
      case 'stars':
        return <Star className="w-4 h-4" />;
      case 'total_solved':
      case 'easy_solved':
      case 'medium_solved':
      case 'hard_solved':
        return <Trophy className="w-4 h-4" />;
      case 'ranking':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getStatLabel = (statsType: string) => {
    switch (statsType) {
      case 'repositories':
        return 'Repositories';
      case 'projects':
        return 'Projects';
      case 'followers':
        return 'Followers';
      case 'following':
        return 'Following';
      case 'stars':
        return 'Stars';
      case 'total_solved':
        return 'Problems Solved';
      case 'easy_solved':
        return 'Easy Solved';
      case 'medium_solved':
        return 'Medium Solved';
      case 'hard_solved':
        return 'Hard Solved';
      case 'ranking':
        return 'Ranking';
      case 'connections':
        return 'Connections';
      case 'profile_views':
        return 'Profile Views';
      default:
        return statsType;
    }
  };

  const formatValue = (value: number, statsType: string) => {
    if (statsType === 'ranking' && value > 0) {
      return `#${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  const groupedStats = stats.reduce(
    (acc, stat) => {
      if (!acc[stat.provider]) {
        acc[stat.provider] = [];
      }
      acc[stat.provider].push(stat);
      return acc;
    },
    {} as Record<string, Stat[]>,
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connected Accounts Stats */}
      {Object.keys(groupedStats).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedStats).map(([provider, providerStats]) => (
            <Card key={provider}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getProviderIcon(provider)}
                    <CardTitle>{getProviderName(provider)} Stats</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshStats(provider)}
                    disabled={refreshing === provider}
                  >
                    {refreshing === provider ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {providerStats.map((stat) => (
                    <div
                      key={stat.id}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      {getStatIcon(stat.statsType)}
                      <div>
                        <div className="text-sm font-medium">
                          {getStatLabel(stat.statsType)}
                        </div>
                        <div className="text-lg font-bold">
                          {formatValue(stat.value, stat.statsType)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  Last updated:{' '}
                  {new Date(providerStats[0]?.lastUpdated).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              <ExternalLink className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                No Connected Accounts
              </h3>
              <p>
                Connect your GitHub, GitLab, LinkedIn, or LeetCode accounts to
                see your stats here.
              </p>
            </div>
            <Button asChild>
              <a href="/settings/integrations">Connect Accounts</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <a href="/collaborate">Find Collaborators</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/profile">Update Profile</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/settings/integrations">Manage Integrations</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default page;
