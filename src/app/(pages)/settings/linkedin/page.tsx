'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Linkedin,
  ExternalLink,
  CheckCircle,
  XCircle,
  RefreshCw,
  Users,
  Briefcase,
  GraduationCap,
  Award,
  MessageSquare,
  MapPin,
  Building,
} from 'lucide-react';

interface LinkedInStats {
  profile: {
    name: string;
    headline: string;
    industry: string;
    location: string;
    profilePictureUrl: string;
    publicProfileUrl: string;
  };
  experiences: number;
  educations: number;
  skills: number;
  connections: number;
  posts: number;
  topSkills: Array<{ name: string; endorsements: number }>;
  currentExperience: any;
  recentPosts: any[];
  lastSynced: string;
}

export default function LinkedInSettingsPage() {
  const [stats, setStats] = useState<LinkedInStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadStats();

    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }
    if (urlParams.get('error')) {
      setError(urlParams.get('error'));
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/linkedin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load LinkedIn stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectLinkedIn = async () => {
    try {
      const response = await fetch('/api/linkedin/connect', { method: 'POST' });
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Failed to connect LinkedIn:', error);
    }
  };

  const syncLinkedIn = async () => {
    setSyncing(true);
    try {
      await fetch('/api/linkedin/sync', { method: 'POST' });
      await loadStats();
    } catch (error) {
      console.error('Failed to sync LinkedIn:', error);
    } finally {
      setSyncing(false);
    }
  };

  const disconnectLinkedIn = async () => {
    if (!confirm('Are you sure you want to disconnect LinkedIn?')) return;

    try {
      await fetch('/api/linkedin/disconnect', { method: 'DELETE' });
      setStats(null);
    } catch (error) {
      console.error('Failed to disconnect LinkedIn:', error);
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
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          LinkedIn connected successfully!
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Linkedin className="w-6 h-6" />
            LinkedIn Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Connect your LinkedIn profile to sync your professional information,
            experiences, education, skills, and network.
          </p>

          {!stats ? (
            <div className="text-center py-8">
              <Linkedin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                LinkedIn Not Connected
              </h3>
              <p className="text-muted-foreground mb-4">
                Connect your LinkedIn account to start syncing your professional
                profile.
              </p>
              <Button onClick={connectLinkedIn} className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Connect LinkedIn
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Overview */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                {stats.profile.profilePictureUrl && (
                  <img
                    src={stats.profile.profilePictureUrl}
                    alt="Profile"
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {stats.profile.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {stats.profile.headline}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    {stats.profile.industry && (
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {stats.profile.industry}
                      </div>
                    )}
                    {stats.profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {stats.profile.location}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={syncLinkedIn}
                    disabled={syncing}
                  >
                    {syncing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Sync
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={disconnectLinkedIn}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Disconnect
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm font-medium">Experiences</div>
                    <div className="text-lg font-bold">{stats.experiences}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-sm font-medium">Education</div>
                    <div className="text-lg font-bold">{stats.educations}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Award className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-sm font-medium">Skills</div>
                    <div className="text-lg font-bold">{stats.skills}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Users className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="text-sm font-medium">Connections</div>
                    <div className="text-lg font-bold">{stats.connections}</div>
                  </div>
                </div>
              </div>

              {/* Current Experience */}
              {stats.currentExperience && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Current Position</h4>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium">
                      {stats.currentExperience.title}
                    </span>
                    <span className="text-muted-foreground">at</span>
                    <span className="font-medium">
                      {stats.currentExperience.companyName}
                    </span>
                  </div>
                  {stats.currentExperience.location && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {stats.currentExperience.location}
                    </p>
                  )}
                </div>
              )}

              {/* Top Skills */}
              {stats.topSkills.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Top Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {stats.topSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {skill.name}
                        <span className="text-xs">({skill.endorsements})</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Posts */}
              {stats.recentPosts.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Recent Posts</h4>
                  <div className="space-y-3">
                    {stats.recentPosts.map((post, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <MessageSquare className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm">
                            {post.text?.substring(0, 100)}...
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Last synced: {new Date(stats.lastSynced).toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
