import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Lightbulb, TrendingUp } from 'lucide-react';
import { useSuggestions } from '@/hooks/useSuggestions';

export function DeveloperSuggestions() {
  const { suggestions, loading, error, refreshSuggestions } = useSuggestions();

  if (loading) {
    return <SuggestionsSkeleton />;
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load suggestions</p>
          <Button onClick={() => refreshSuggestions()} variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Ideas Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI-Suggested Project Ideas
          </CardTitle>
          <Button
            onClick={refreshSuggestions}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {suggestions?.projectIdeas.map((idea, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <p className="text-sm font-medium">{idea}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skill Suggestions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Skill Development Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">
              {suggestions?.skillSuggestions}
            </p>
          </div>
        </CardContent>
      </Card>

      {suggestions?.fromCache && (
        <p className="text-xs text-muted-foreground text-center">
          Suggestions cached • Updated within 24 hours
        </p>
      )}
    </div>
  );
}

function SuggestionsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
