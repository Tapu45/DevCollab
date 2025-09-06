import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EventParticipation {
  event: {
    id: string;
    title: string;
    type: string;
    startDate: string;
    endDate: string;
    location?: string;
    virtualLink?: string;
    isVirtual: boolean;
  };
}

interface CreatedEvent {
  id: string;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  location?: string;
  virtualLink?: string;
  isVirtual: boolean;
}

interface ProfileEventsProps {
  eventParticipations: EventParticipation[];
  createdEvents: CreatedEvent[];
  itemVariants: any;
}

export function ProfileEvents({
  eventParticipations,
  createdEvents,
  itemVariants,
}: ProfileEventsProps) {
  const allEvents = [
    ...eventParticipations.map((p) => ({ ...p.event, role: 'Participant' })),
    ...createdEvents.map((e) => ({ ...e, role: 'Organizer' })),
  ].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 p-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4 text-primary" />
            Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-3 text-sm">
              No events yet
            </p>
          ) : (
            <div className="space-y-2">
              {allEvents.slice(0, 5).map((event, idx) => (
                <div
                  key={event.id || idx}
                  className="p-2 rounded-lg bg-muted/20 border border-border/20"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Badge variant="outline" className="text-[10px]">
                          {event.type}
                        </Badge>
                        <span>
                          {new Date(event.startDate).toLocaleDateString()}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {event.role}
                        </Badge>
                      </div>
                      {event.location && (
                        <p className="text-muted-foreground text-xs mt-1">
                          {event.isVirtual ? 'Virtual' : event.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {allEvents.length > 5 && (
                <p className="text-center text-xs text-muted-foreground">
                  And {allEvents.length - 5} more events
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
