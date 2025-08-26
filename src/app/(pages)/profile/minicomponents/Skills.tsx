'use client';

import React from 'react';
import { Form, Input, Select, Rate, Button, List, Space } from 'antd';
import {
  Plus as PlusOutlined,
  DeleteIcon as DeleteOutlined,
  Code,
  Target,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
} from 'lucide-react';

export type SkillInput = {
  name: string;
  category: string;
  proficiencyLevel: number;
  yearsExperience?: number;
  lastUsed?: string; // ISO date string
};

type Props = {
  value?: SkillInput[];
  onChange?: (v: SkillInput[]) => void;
  onNext?: () => void;
  onPrev?: () => void;
};

const CATEGORIES = [
  'PROGRAMMING_LANGUAGE',
  'FRAMEWORK',
  'DATABASE',
  'CLOUD_PLATFORM',
  'DEVOPS_TOOL',
  'DESIGN_TOOL',
  'PROJECT_MANAGEMENT',
  'SOFT_SKILL',
  'OTHER',
];

const EXPERIENCE_YEARS = [
  { value: 0, label: 'Less than 1 year' },
  { value: 1, label: '1 year' },
  { value: 2, label: '2 years' },
  { value: 3, label: '3 years' },
  { value: 4, label: '4 years' },
  { value: 5, label: '5 years' },
  { value: 6, label: '6-10 years' },
  { value: 7, label: '10+ years' },
];

export default function Skills({
  value = [],
  onChange,
  onNext,
  onPrev,
}: Props) {
  const [form] = Form.useForm();

  function addSkill() {
    const current = form.getFieldsValue();
    const name = current.skillName?.trim();
    const category = current.skillCategory || CATEGORIES[0];
    const level = current.skillLevel || 3;
    const yearsExp = current.yearsExperience;
    const lastUsed = current.lastUsed;

    if (!name) return;

    const next = [
      ...value,
      {
        name,
        category,
        proficiencyLevel: level,
        yearsExperience: yearsExp,
        lastUsed: lastUsed,
      },
    ];
    onChange?.(next);
    form.resetFields();

    // Set default values back for the next skill
    form.setFieldsValue({
      skillCategory: CATEGORIES[0],
      skillLevel: 3,
    });
  }

  function removeAt(i: number) {
    const next = value.filter((_, idx) => idx !== i);
    onChange?.(next);
  }

  function formatCategory(category: string) {
    return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  function formatLastUsed(dateString?: string) {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div className="min-h-screen bg-background py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Glass morphism container */}
        <div className="backdrop-blur-xl bg-card/40 border border-border rounded-[var(--radius)] p-8 shadow-[0_0_15px_var(--ring)] hover:shadow-[0_0_30px_var(--ring)] transition-shadow duration-300">
          {/* Header section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
              Skills & Expertiseee
            </h2>
            <p className="text-muted-foreground mt-2">
              Showcase your technical skills and proficiency levels
            </p>
          </div>

          {/* Add Skill Form */}
          <div className="mb-8">
            <Form form={form} layout="vertical" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skill Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Skill Name *
                  </label>
                  <div className="relative">
                    <Code
                      className="absolute left-3 top-3.5 w-5 h-5"
                      style={{ color: 'var(--primary)' }}
                      strokeWidth={1.5}
                    />
                    <Form.Item name="skillName" className="mb-0">
                      <input
                        className="w-full pl-10 pr-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
                        placeholder="e.g. React, Python, Docker"
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Skill Category */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Category
                  </label>
                  <Form.Item
                    name="skillCategory"
                    initialValue={CATEGORIES[0]}
                    className="mb-0"
                  >
                    <select className="w-full px-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background">
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {formatCategory(category)}
                        </option>
                      ))}
                    </select>
                  </Form.Item>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Proficiency Level */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Proficiency Level
                  </label>
                  <Form.Item
                    name="skillLevel"
                    initialValue={3}
                    className="mb-0"
                  >
                    <div className="flex items-center space-x-2">
                      <Rate
                        count={5}
                        className="text-lg"
                        style={{ color: 'var(--primary)' }}
                      />
                      <span className="text-sm text-muted-foreground ml-2">
                        Level {form.getFieldValue('skillLevel') || 3}
                      </span>
                    </div>
                  </Form.Item>
                </div>

                {/* Years of Experience */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Years of Experience
                  </label>
                  <Form.Item name="yearsExperience" className="mb-0">
                    <select className="w-full px-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background">
                      <option value="">Select experience</option>
                      {EXPERIENCE_YEARS.map((exp) => (
                        <option key={exp.value} value={exp.value}>
                          {exp.label}
                        </option>
                      ))}
                    </select>
                  </Form.Item>
                </div>

                {/* Last Used */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Last Used
                  </label>
                  <Form.Item name="lastUsed" className="mb-0">
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background"
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Add Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-8 py-3 rounded-[var(--radius-sm)] bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors duration-200 shadow-[0_0_20px_var(--ring)] hover:shadow-[0_0_25px_var(--ring)] flex items-center space-x-2"
                >
                  <PlusOutlined className="w-4 h-4" />
                  <span>Add Skill</span>
                </button>
              </div>
            </Form>
          </div>

          {/* Skills List */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Target
                className="w-5 h-5 mr-2"
                style={{ color: 'var(--primary)' }}
              />
              Your Skills ({value.length})
            </h3>

            {value.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-[var(--radius)]">
                <Code className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">
                  No skills added yet
                </p>
                <p className="text-muted-foreground text-sm">
                  Start by adding your first skill above
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {value.map((item, i) => (
                  <div
                    key={i}
                    className="group flex items-center justify-between p-4 border border-border rounded-[var(--radius-sm)] hover:border-primary/50 transition-all duration-200 hover:shadow-sm bg-card/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {item.name}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center space-x-2">
                              <span>{formatCategory(item.category)}</span>
                              <span>•</span>
                              <span>Level {item.proficiencyLevel}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground/80">
                              {item.yearsExperience !== undefined && (
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {item.yearsExperience === 0
                                      ? '< 1 year'
                                      : item.yearsExperience === 7
                                        ? '10+ years'
                                        : item.yearsExperience === 6
                                          ? '6-10 years'
                                          : `${item.yearsExperience} year${item.yearsExperience === 1 ? '' : 's'}`}
                                  </span>
                                </span>
                              )}
                              {item.lastUsed && (
                                <span className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    Last used: {formatLastUsed(item.lastUsed)}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Rate
                        count={5}
                        value={item.proficiencyLevel}
                        disabled
                        className="text-sm"
                        style={{ color: 'var(--primary)' }}
                      />
                      <button
                        onClick={() => removeAt(i)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-[var(--radius-sm)] transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        title="Remove skill"
                      >
                        <DeleteOutlined className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-border">
            <button
              onClick={onPrev}
              className="px-6 py-3 rounded-[var(--radius-sm)] border border-border text-foreground hover:bg-accent transition-colors duration-200 flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={() => {
                console.log('Next button clicked');
                console.log('Current skills:', value);
                console.log('Skills length:', value.length);
                console.log('onNext function:', onNext);
                onNext?.();
              }}
              disabled={value.length === 0}
              className="px-8 py-3 rounded-[var(--radius-sm)] bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors duration-200 shadow-[0_0_20px_var(--ring)] hover:shadow-[0_0_25px_var(--ring)] flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
