import React from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Experience {
  id?: string;
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  responsibilities?: string;
}

interface Education {
  id?: string;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

interface ProfileExperienceEducationProps {
  experiences: Experience[];
  educations: Education[];
  itemVariants: any;
  cardHoverVariants: any;
  formatDate: (date?: string) => string;
}

export function ProfileExperienceEducation({
  experiences,
  educations,
  itemVariants,
  cardHoverVariants,
  formatDate,
}: ProfileExperienceEducationProps) {
  return (
    <>
      {/* Experience Section */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 p-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="w-4 h-4 text-primary" />
              Professional Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            {experiences.length === 0 ? (
              <p className="text-muted-foreground text-center py-3 text-sm">
                No experience added yet
              </p>
            ) : (
              <div className="space-y-1">
                {experiences.map((ex, idx) => (
                  <motion.div
                    key={ex.id || `${ex.title}-${ex.company}`}
                    variants={cardHoverVariants}
                    whileHover="hover"
                    className="p-2 rounded-lg bg-muted/20 border border-border/20 hover:border-primary/30 transition-all duration-200"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm">
                          {ex.title}
                        </h4>
                        <p className="text-primary font-medium text-xs">
                          {ex.company}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {formatDate(ex.startDate)} —{' '}
                            {ex.isCurrent ? 'Present' : formatDate(ex.endDate)}
                          </span>
                        </div>
                        {ex.responsibilities && (
                          <p className="text-muted-foreground mt-1 text-xs">
                            {ex.responsibilities}
                          </p>
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

      {/* Education Section */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 p-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="w-4 h-4 text-primary" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent>
            {educations.length === 0 ? (
              <p className="text-muted-foreground text-center py-3 text-sm">
                No education entries yet
              </p>
            ) : (
              <div className="space-y-1">
                {educations.map((ed, idx) => (
                  <motion.div
                    key={ed.id || ed.institution}
                    variants={cardHoverVariants}
                    whileHover="hover"
                    className="p-2 rounded-lg bg-muted/20 border border-border/20 hover:border-primary/30 transition-all duration-200"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-accent-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm">
                          {ed.institution}
                        </h4>
                        {ed.degree && (
                          <p className="text-accent-foreground font-medium text-xs">
                            {ed.degree}
                          </p>
                        )}
                        {ed.fieldOfStudy && (
                          <p className="text-foreground text-xs">
                            {ed.fieldOfStudy}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {formatDate(ed.startDate)} —{' '}
                            {formatDate(ed.endDate)}
                          </span>
                        </div>
                        {ed.description && (
                          <p className="text-muted-foreground mt-1 text-xs">
                            {ed.description}
                          </p>
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
    </>
  );
}
