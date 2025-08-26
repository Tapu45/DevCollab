"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';


interface SuggestedUser {
  userId: string;
  displayName: string;
  score: number;
  profile: {
    id: string;
    displayName: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
    location: string | null;
    bio: string | null;
    skills: Array<{
      name: string;
      category: string;
      proficiencyLevel: number;
    }>;
  };
}

export default function DeveloperSuggestions() {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/suggestions/similar');
        
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }
        
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError('Could not load suggestions at this time');
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSuggestions();
  }, []);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Suggested Developers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-3 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Suggested Developers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Suggested Developers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">No developer suggestions available yet.</p>
            <p className="text-muted-foreground text-sm mt-1">
              Complete your profile to get matched with similar developers.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggested Developers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.userId} className="flex items-start gap-4 p-3 border rounded hover:bg-slate-50 transition-colors">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.profile?.profileImage || ''} alt={user.profile?.displayName || ''} />
                <AvatarFallback>
                  {getInitials(user.profile?.displayName || user.profile?.firstName || '')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{user.profile?.displayName || `${user.profile?.firstName} ${user.profile?.lastName}`}</h4>
                
                {user.profile?.location && (
                  <p className="text-muted-foreground text-xs">{user.profile.location}</p>
                )}
                
                {user.profile?.bio && (
                  <p className="text-sm mt-1 line-clamp-1">{user.profile.bio}</p>
                )}
                
                {user.profile?.skills && user.profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.profile.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill.name} variant="secondary" className="text-xs">
                        {skill.name}
                      </Badge>
                    ))}
                    {user.profile.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.profile.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => router.push(`/profile/${user.userId}`)}
              >
                View
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}