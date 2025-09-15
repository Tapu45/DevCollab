import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  RefreshCw,
  Lightbulb,
  TrendingUp,
  Clock,
  Target,
  Zap,
} from 'lucide-react';
import { useSuggestions } from '@/hooks/useSuggestions';

interface ProjectIdea {
  title: string;
  description: string;
  keyFeatures: string[];
  techStack: string[];
  learningBenefits: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface SkillSuggestion {
  recommendedSkill: string;
  valueProposition: string;
  learningRoadmap: string[];
  timeInvestment: string;
  careerImpact: string;
}

export function ProjectSkillSuggestions() {
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
            {suggestions?.projectIdeas?.map(
              (idea: ProjectIdea, index: number) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <h3 className="font-semibold text-lg mb-2">{idea.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {idea.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Key Features:</span>
                    </div>
                    <ul className="list-disc list-inside text-sm space-y-1 ml-6">
                      {idea.keyFeatures.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>

                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Tech Stack:</span>
                    </div>
                    <div className="flex flex-wrap gap-1 ml-6">
                      {idea.techStack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Difficulty:</span>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          idea.difficulty === 'beginner'
                            ? 'bg-green-100 text-green-800'
                            : idea.difficulty === 'intermediate'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {idea.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              ),
            )}
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
          {suggestions?.skillSuggestions && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">
                  {suggestions.skillSuggestions.recommendedSkill}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {suggestions.skillSuggestions.valueProposition}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Learning Roadmap</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {suggestions.skillSuggestions.learningRoadmap.map(
                      (step, idx) => (
                        <li key={idx}>{step}</li>
                      ),
                    )}
                  </ul>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Time Investment</h4>
                    <p className="text-sm text-muted-foreground">
                      {suggestions.skillSuggestions.timeInvestment}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">Career Impact</h4>
                    <p className="text-sm text-muted-foreground">
                      {suggestions.skillSuggestions.careerImpact}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
