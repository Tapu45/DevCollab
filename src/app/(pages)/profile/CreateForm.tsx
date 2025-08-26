'use client';

import React, { useState, useEffect } from 'react';
import { Steps, Progress, Button, notification, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import Basic, { BasicValues } from './minicomponents/Basic';
import Skills, { SkillInput } from './minicomponents/Skills';
import Project, { ProjectInput } from './minicomponents/Project';
import Experience, { ExperienceInput } from './minicomponents/Experience';
import Education, { EducationInput } from './minicomponents/Education';

const { Step } = Steps;

// Local storage keys
const STORAGE_KEYS = {
  CURRENT_STEP: 'profile_create_current_step',
  BASIC_DATA: 'profile_create_basic_data',
  SKILLS_DATA: 'profile_create_skills_data',
  PROJECTS_DATA: 'profile_create_projects_data',
  EXPERIENCES_DATA: 'profile_create_experiences_data',
  EDUCATIONS_DATA: 'profile_create_educations_data',
  LAST_SAVED: 'profile_create_last_saved',
};

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

  // Load saved data from localStorage on component mount
  useEffect(() => {
    try {
      // Load current step
      const savedStep = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP);
      if (savedStep !== null) {
        const stepIndex = parseInt(savedStep);
        if (stepIndex >= 0 && stepIndex < steps.length) {
          setCurrent(stepIndex);
        }
      }

      // Load form data
      const savedBasic = localStorage.getItem(STORAGE_KEYS.BASIC_DATA);
      if (savedBasic) {
        setBasic(JSON.parse(savedBasic));
      }

      const savedSkills = localStorage.getItem(STORAGE_KEYS.SKILLS_DATA);
      if (savedSkills) {
        setSkills(JSON.parse(savedSkills));
      }

      const savedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS_DATA);
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      }

      const savedExperiences = localStorage.getItem(STORAGE_KEYS.EXPERIENCES_DATA);
      if (savedExperiences) {
        setExperiences(JSON.parse(savedExperiences));
      }

      const savedEducations = localStorage.getItem(STORAGE_KEYS.EDUCATIONS_DATA);
      if (savedEducations) {
        setEducations(JSON.parse(savedEducations));
      }

      // Check if data is recent (within last 24 hours)
      const lastSaved = localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
      if (lastSaved) {
        const lastSavedTime = new Date(lastSaved).getTime();
        const now = new Date().getTime();
        const hoursDiff = (now - lastSavedTime) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          // Clear old data if it's more than 24 hours old
          clearSavedData();
        }
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
      clearSavedData();
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage();
  }, [basic, skills, projects, experiences, educations, current]);

  // Function to save all data to localStorage
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, current.toString());
      localStorage.setItem(STORAGE_KEYS.BASIC_DATA, JSON.stringify(basic));
      localStorage.setItem(STORAGE_KEYS.SKILLS_DATA, JSON.stringify(skills));
      localStorage.setItem(STORAGE_KEYS.PROJECTS_DATA, JSON.stringify(projects));
      localStorage.setItem(STORAGE_KEYS.EXPERIENCES_DATA, JSON.stringify(experiences));
      localStorage.setItem(STORAGE_KEYS.EDUCATIONS_DATA, JSON.stringify(educations));
      localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Function to clear saved data
  const clearSavedData = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  };

  function nextStep() {
    setCurrent((s) => Math.min(s + 1, steps.length - 1));
  }
  function prevStep() {
    setCurrent((s) => Math.max(s - 1, 0));
  }

  async function saveBasic() {
    const res = await fetch('/api/profile/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(basic),
    });
    if (!res.ok)
      throw new Error((await res.json())?.error || 'Failed to save basic info');
  }

  async function saveSkills() {
    for (const s of skills) {
      const res = await fetch('/api/profile/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: s.name,
          category: s.category as any, // The enum values now match the schema
          proficiencyLevel: s.proficiencyLevel,
        }),
      });
      if (!res.ok) throw new Error('Failed to save a skill');
    }
  }

  async function saveProjects() {
    for (const p of projects) {
      const res = await fetch('/api/profile/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      if (!res.ok) throw new Error('Failed to save a project');
    }
  }

  async function saveExperiences() {
    for (const e of experiences) {
      const res = await fetch('/api/profile/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(e),
      });
      if (!res.ok) throw new Error('Failed to save an experience');
    }
  }

  async function saveEducations() {
    for (const ed of educations) {
      const res = await fetch('/api/profile/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ed),
      });
      if (!res.ok) throw new Error('Failed to save an education entry');
    }
  }

  async function handleNextFromStep(index: number) {
    setLoading(true);
    try {
      if (index === 0) {
        // basic validation
        if (!basic.displayName || !basic.bio) {
          notification.error({
            message: 'Please fill required basic info (name & bio).',
            placement: 'top',
            className: 'custom-notification',
          });
          setLoading(false);
          return;
        }
        await saveBasic();
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
        await saveSkills();
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
        await saveProjects();
      } else if (index === 3) {
        // optional: save experiences if provided
        if (experiences.length) await saveExperiences();
      } else if (index === 4) {
        if (educations.length) await saveEducations();
      }

      // proceed
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
      // final save of any remaining data (safe to call again)
      await saveBasic();
      if (skills.length) await saveSkills();
      if (projects.length) await saveProjects();
      if (experiences.length) await saveExperiences();
      if (educations.length) await saveEducations();

      // Clear saved data after successful completion
      clearSavedData();

      notification.success({
        message: 'Profile created. Redirecting...',
        placement: 'top',
        className: 'custom-notification',
      });
      // redirect to profile overview or dashboard
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
          <div className="review-section">
            <h3 className="text-xl font-bold mb-6">Review Your Profile</h3>

            <div className="review-card mb-4 p-4 rounded-md bg-card/50 border border-border">
              <h4 className="font-semibold mb-2 text-primary">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <span className="ml-2 font-medium">
                    {basic.displayName || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <span className="ml-2">
                    {basic.location || 'Not provided'}
                  </span>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <span className="text-muted-foreground">Bio:</span>
                  <p className="mt-1">{basic.bio || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="review-card mb-4 p-4 rounded-md bg-card/50 border border-border">
              <h4 className="font-semibold mb-2 text-primary">
                Skills ({skills.length})
              </h4>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-accent rounded-full text-sm"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No skills added</p>
              )}
            </div>

            <div className="review-card mb-4 p-4 rounded-md bg-card/50 border border-border">
              <h4 className="font-semibold mb-2 text-primary">
                Projects ({projects.length})
              </h4>
              {projects.length > 0 ? (
                <div className="space-y-2">
                  {projects.map((project, idx) => (
                    <div key={idx} className="p-2 rounded bg-background/50">
                      <div className="font-medium">{project.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {project.description?.substring(0, 100)}...
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No projects added</p>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                onClick={prevStep}
                className="bg-muted text-foreground font-medium border-none hover:bg-muted/80"
                style={{
                  height: 44,
                  padding: '0 24px',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all 0.2s ease',
                }}
              >
                Back
              </Button>
              <Button
                type="primary"
                onClick={handleFinish}
                loading={loading}
                className="bg-primary text-primary-foreground font-semibold"
                style={{
                  height: 44,
                  padding: '0 28px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                  transition: 'all 0.2s ease',
                }}
              >
                Complete Profile
              </Button>
            </div>
          </div>
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
      <div className="pt-1 pb-6 px-8 text-center">
        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
          Create your profile
        </h1>
        <p className="text-muted-foreground">
          Complete each section to create your developer profile
        </p>
      </div>

      <div className="px-8 pb-8">
        {/* Sleek steps bar with subtle styling */}
        <div className="flex items-center justify-between mb-0 bg-card/30 px-6 py-4 rounded-lg border border-border/30">
          <Steps
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
          <div className="w-24 ml-4">
            <Progress
              percent={percent}
              size="small"
              strokeColor={{
                '0%': 'var(--primary)',
                '100%': 'var(--primary)',
              }}
              trailColor="var(--muted)"
              showInfo={false}
              className="rounded-full"
            />
          </div>
        </div>

        {/* Rest of the content remains the same */}
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
    </motion.div>
  );
}