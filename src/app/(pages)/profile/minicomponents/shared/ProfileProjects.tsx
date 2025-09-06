import React from 'react';
import { motion } from 'framer-motion';
import { Code, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Project {
  id?: string;
  title: string;
  shortDesc?: string;
  tech?: string[];
  githubUrl?: string;
}

interface ProfileProjectsProps {
  projects: Project[];
  itemVariants: any;
  cardHoverVariants: any;
}

export function ProfileProjects({
  projects,
  itemVariants,
  cardHoverVariants,
}: ProfileProjectsProps) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 p-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Code className="w-4 h-4 text-primary" />
            Featured Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-muted-foreground text-center py-3 text-sm">
              No projects added yet
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {projects.map((p) => (
                <motion.div
                  key={p.id || p.title}
                  variants={cardHoverVariants}
                  whileHover="hover"
                  className="p-2 rounded-lg bg-muted/20 border border-border/20 hover:border-primary/30 transition-all duration-200"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Code className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-foreground text-sm">
                          {p.title}
                        </h4>
                        {p.githubUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-6 px-1"
                          >
                            <a
                              href={p.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs line-clamp-3 mb-1">
                        {p.shortDesc}
                      </p>
                      {p.tech && (
                        <div className="flex flex-wrap gap-1">
                          {p.tech.map((t) => (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="text-[10px] px-1 py-0"
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
