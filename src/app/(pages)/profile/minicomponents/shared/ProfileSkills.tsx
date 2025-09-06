import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Skill {
  id?: string;
  name: string;
  category?: string;
  proficiencyLevel?: number;
}

interface ProfileSkillsProps {
  skills: Skill[];
  itemVariants: any;
}

export function ProfileSkills({ skills, itemVariants }: ProfileSkillsProps) {
  const topSkills = skills.slice(0, 8);

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-4 h-4 text-primary" />
            Skills & Proficiency
          </CardTitle>
        </CardHeader>
        <CardContent>
          {skills.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No skills added
            </p>
          ) : (
            <div className="space-y-4">
              {topSkills.map((s) => (
                <div key={s.id || s.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground text-sm">
                      {s.name}
                    </span>
                    {s.category && (
                      <Badge variant="outline" className="text-xs">
                        {s.category}
                      </Badge>
                    )}
                  </div>
                  <Progress
                    value={
                      s.proficiencyLevel ? (s.proficiencyLevel / 5) * 100 : 0
                    }
                    className="h-2"
                  />
                </div>
              ))}

              {skills.length > topSkills.length && (
                <div className="text-center pt-2">
                  <Badge variant="secondary" className="text-xs">
                    And {skills.length - topSkills.length} more
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
