import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ForumPost {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
}

interface ForumReply {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
}

interface ProfileForumProps {
  forumPosts: ForumPost[];
  forumReplies: ForumReply[];
  itemVariants: any;
}

export function ProfileForum({
  forumPosts,
  forumReplies,
  itemVariants,
}: ProfileForumProps) {
  const allActivity = [
    ...forumPosts.map((p) => ({ ...p, type: 'Post' })),
    ...forumReplies.map((r) => ({
      ...r,
      title: `Reply to Post ${r.postId}`, // Placeholder since post title isn't fetched
      slug: r.postId, // Use postId as slug for link
      type: 'Reply',
    })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 p-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="w-4 h-4 text-primary" />
            Forum Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allActivity.length === 0 ? (
            <p className="text-muted-foreground text-center py-3 text-sm">
              No forum activity yet
            </p>
          ) : (
            <div className="space-y-2">
              {allActivity.slice(0, 5).map((activity, idx) => (
                <div
                  key={activity.id || idx}
                  className="p-2 rounded-lg bg-muted/20 border border-border/20"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm">
                        {activity.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Badge variant="outline" className="text-[10px]">
                          {activity.type}
                        </Badge>
                        <span>
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <a
                        href={`/forum/${activity.slug}`}
                        className="text-primary text-xs hover:underline mt-1 inline-block"
                      >
                        View <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
              {allActivity.length > 5 && (
                <p className="text-center text-xs text-muted-foreground">
                  And {allActivity.length - 5} more activities
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
