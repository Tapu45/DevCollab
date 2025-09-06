import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Achievement {
  achievement: {
    name: string;
    description: string;
    icon: string;
    category: string;
    points: number;
  };
  unlockedAt: string;
}

interface ProfileAchievementsProps {
  achievements: Achievement[];
  itemVariants: any;
}

export function ProfileAchievements({
  achievements,
  itemVariants,
}: ProfileAchievementsProps) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 p-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4 text-primary" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <p className="text-muted-foreground text-center py-3 text-sm">
              No achievements unlocked yet
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {achievements.map((a, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="p-3 rounded-lg bg-muted/20 border border-border/20 hover:border-primary/30 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-foreground text-sm">
                          {a.achievement.name}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {a.achievement.points} pts
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs mb-1">
                        {a.achievement.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">
                          {a.achievement.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(a.unlockedAt).toLocaleDateString()}
                        </span>
                      </div>
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
