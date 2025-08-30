'use client';

import React, { useState, useEffect } from 'react';
import { Steps, Progress, Button, notification, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';

import Basic, { BasicValues } from './minicomponents/Basic';
import Skills, { SkillInput } from './minicomponents/Skills';
import Project, { ProjectInput } from './minicomponents/Project';
import Experience, { ExperienceInput } from './minicomponents/Experience';
import Education, { EducationInput } from './minicomponents/Education';
import Review from './minicomponents/Review';

const { Step } = Steps;

// Query function for progress
async function fetchProgress(): Promise<{ section?: string }> {
  const res = await fetch('/api/profile/progress');
  if (!res.ok) throw new Error('Failed to fetch profile progress');
  return res.json();
}

// Mutation function for progress
async function updateProfileProgress(sectionKey: string) {
  const res = await fetch('/api/profile/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section: sectionKey }),
  });
  if (!res.ok) throw new Error('Error updating profile progress');
  return res.json();
}

// Mutation functions for saving data
async function saveBasicApi(basic: BasicValues) {
  const res = await fetch('/api/profile/user', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(basic),
  });
  if (!res.ok)
    throw new Error((await res.json())?.error || 'Failed to save basic info');
  return res.json();
}

async function saveSkillsApi(skills: SkillInput[]) {
  for (const s of skills) {
    const res = await fetch('/api/profile/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: s.name,
        category: s.category as any,
        proficiencyLevel: s.proficiencyLevel,
      }),
    });
    if (!res.ok) throw new Error('Failed to save a skill');
  }
}

async function saveProjectsApi(projects: ProjectInput[]) {
  for (const p of projects) {
    const res = await fetch('/api/profile/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    });
    if (!res.ok) throw new Error('Failed to save a project');
  }
}

async function saveExperiencesApi(experiences: ExperienceInput[]) {
  for (const e of experiences) {
    const res = await fetch('/api/profile/experience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(e),
    });
    if (!res.ok) throw new Error('Failed to save an experience');
  }
}

async function saveEducationsApi(educations: EducationInput[]) {
  for (const ed of educations) {
    const res = await fetch('/api/profile/education', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ed),
    });
    if (!res.ok) throw new Error('Failed to save an education entry');
  }
}

export default function CreateForm() {
  const router = useRouter();

  const steps = [
    { key: 'basic', title: 'Basic' },
    { key: 'skills', title: 'Skills' },
    { key: 'projects', title: 'Projects' },
    { key: 'experience', title: 'Experience' },
    { key: 'education', title: 'Education' },
    { key: 'review', title: 'Review' },
  ];

  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);

  // Centralized state
  const [basic, setBasic] = useState<BasicValues>({});
  const [skills, setSkills] = useState<SkillInput[]>([]);
  const [projects, setProjects] = useState<ProjectInput[]>([]);
  const [experiences, setExperiences] = useState<ExperienceInput[]>([]);
  const [educations, setEducations] = useState<EducationInput[]>([]);

  const percent = Math.round(((current + 1) / steps.length) * 100);

  // TanStack Query for progress
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['profile', 'progress'],
    queryFn: fetchProgress,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    if (progressData?.section) {
      const stepIndex = steps.findIndex(s => s.key === progressData.section);
      if (stepIndex >= 0) setCurrent(stepIndex);
    }
  }, [progressData]);

  // Mutations
  const updateProgressMutation = useMutation({
    mutationFn: updateProfileProgress,
  });

  const saveBasicMutation = useMutation({
    mutationFn: saveBasicApi,
  });

  const saveSkillsMutation = useMutation({
    mutationFn: saveSkillsApi,
  });

  const saveProjectsMutation = useMutation({
    mutationFn: saveProjectsApi,
  });

  const saveExperiencesMutation = useMutation({
    mutationFn: saveExperiencesApi,
  });

  const saveEducationsMutation = useMutation({
    mutationFn: saveEducationsApi,
  });

  function nextStep() {
    setCurrent((s) => Math.min(s + 1, steps.length - 1));
  }
  function prevStep() {
    setCurrent((s) => Math.max(s - 1, 0));
  }

  async function handleNextFromStep(index: number) {
    setLoading(true);
    try {
      if (index === 0) {
        if (!basic.displayName || !basic.bio) {
          notification.error({
            message: 'Please fill required basic info (name & bio).',
            placement: 'top',
            className: 'custom-notification',
          });
          setLoading(false);
          return;
        }
        await saveBasicMutation.mutateAsync(basic);
      } else if (index === 1) {
        if (skills.length < 3) {
          notification.error({
            message: 'Add at least 3 skills to improve matching.',
            placement: 'top',
            className: 'custom-notification',
          });
          setLoading(false);
          return;
        }
        await saveSkillsMutation.mutateAsync(skills);
      } else if (index === 2) {
        if (projects.length < 1) {
          notification.error({
            message: 'Add at least one project.',
            placement: 'top',
            className: 'custom-notification',
          });
          setLoading(false);
          return;
        }
        await saveProjectsMutation.mutateAsync(projects);
      } else if (index === 3) {
        if (experiences.length) await saveExperiencesMutation.mutateAsync(experiences);
      } else if (index === 4) {
        if (educations.length) await saveEducationsMutation.mutateAsync(educations);
      }

      await updateProgressMutation.mutateAsync(steps[index + 1]?.key || steps[index].key);

      nextStep();
    } catch (err: any) {
      notification.error({
        message: err?.message || 'Save failed',
        placement: 'top',
        className: 'custom-notification',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleFinish() {
    setLoading(true);
    try {
      await saveBasicMutation.mutateAsync(basic);
      if (skills.length) await saveSkillsMutation.mutateAsync(skills);
      if (projects.length) await saveProjectsMutation.mutateAsync(projects);
      if (experiences.length) await saveExperiencesMutation.mutateAsync(experiences);
      if (educations.length) await saveEducationsMutation.mutateAsync(educations);

      await updateProgressMutation.mutateAsync('review');

      notification.success({
        message: 'Profile created. Redirecting...',
        placement: 'top',
        className: 'custom-notification',
      });
      router.push('/profile');
    } catch (err: any) {
      notification.error({
        message: err?.message || 'Finish failed',
        placement: 'top',
        className: 'custom-notification',
      });
    } finally {
      setLoading(false);
    }
  }

  function renderCurrentStep() {
    switch (steps[current].key) {
      case 'basic':
        return (
          <Basic
            value={basic}
            onChange={setBasic}
            onNext={() => handleNextFromStep(0)}
          />
        );
      case 'skills':
        return (
          <Skills
            value={skills}
            onChange={setSkills}
            onNext={() => handleNextFromStep(1)}
            onPrev={prevStep}
          />
        );
      case 'projects':
        return (
          <Project
            value={projects}
            onChange={setProjects}
            onNext={() => handleNextFromStep(2)}
            onPrev={prevStep}
          />
        );
      case 'experience':
        return (
          <Experience
            value={experiences}
            onChange={setExperiences}
            onNext={() => handleNextFromStep(3)}
            onPrev={prevStep}
          />
        );
      case 'education':
        return (
          <Education
            value={educations}
            onChange={setEducations}
            onNext={() => handleNextFromStep(4)}
            onPrev={prevStep}
          />
        );

      case 'review':
    return (
      <Review />
    );
       default:
        return null;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="profile-create-container mx-auto"
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        background: 'var(--background)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        border: '',
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <div className="px-1 pb-8">
        {/* Move steps bar to the left side */}
        <div className="flex flex-row gap-8">
          {/* Steps bar on the left */}
          <div className="flex flex-col items-center min-w-[180px] pt-8">
            <Steps
              direction="vertical"
              current={current}
              labelPlacement="vertical"
              responsive={false}
              className="w-full"
              items={steps.map((s, idx) => ({
                key: s.key,
                icon: (
                  <div
                    className={`w-7 h-7 flex items-center justify-center rounded-full 
                  ${
                    current === idx
                      ? 'bg-primary border-none text-primary-foreground'
                      : current > idx
                        ? 'bg-primary/20 border-none text-primary'
                        : 'bg-card border border-border text-muted-foreground'
                  }
                `}
                    style={{
                      boxShadow:
                        current === idx
                          ? '0 0 0 2px var(--primary-foreground), 0 0 0 4px var(--primary)'
                          : 'none',
                    }}
                  >
                    <span className="font-semibold text-sm">{idx + 1}</span>
                  </div>
                ),
                title: (
                  <span
                    className={`font-medium text-sm
                  ${
                    current === idx
                      ? 'text-primary'
                      : current > idx
                        ? 'text-primary/70'
                        : 'text-muted-foreground'
                  }
                `}
                  >
                    {s.title}
                  </span>
                ),
              }))}
            />
          
          </div>
          {/* Form content on the right */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  padding: '28px 0 0 0',
                  borderRadius: 0,
                  minHeight: 350,
                  boxShadow: 'none',
                  border: 'none',
                }}
              >
                {loading ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '60px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    <Spin size="large" />
                    <p className="text-muted-foreground mt-4">
                      Saving your information...
                    </p>
                  </div>
                ) : (
                  renderCurrentStep()
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
