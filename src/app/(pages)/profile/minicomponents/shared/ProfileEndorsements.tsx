import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Endorsement {
  skill: {
    name: string;
    category: string;
  };
  message?: string;
}

interface ProfileEndorsementsProps {
  receivedEndorsements: Endorsement[];
  itemVariants: any;
}

export function ProfileEndorsements({
  receivedEndorsements,
  itemVariants,
}: ProfileEndorsementsProps) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 p-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ThumbsUp className="w-4 h-4 text-primary" />
            Endorsements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {receivedEndorsements.length === 0 ? (
            <p className="text-muted-foreground text-center py-3 text-sm">
              No endorsements yet
            </p>
          ) : (
            <div className="space-y-2">
              {receivedEndorsements.slice(0, 5).map((endorsement, idx) => (
                <div
                  key={idx} // Use idx since id is not available
                  className="p-2 rounded-lg bg-muted/20 border border-border/20"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm">
                        {endorsement.skill.name}
                      </h4>
                      {endorsement.skill.category && (
                        <Badge variant="outline" className="text-[10px] mt-1">
                          {endorsement.skill.category}
                        </Badge>
                      )}
                      {endorsement.message && (
                        <p className="text-muted-foreground text-xs mt-1 italic">
                          "{endorsement.message}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {receivedEndorsements.length > 5 && (
                <p className="text-center text-xs text-muted-foreground">
                  And {receivedEndorsements.length - 5} more endorsements
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
