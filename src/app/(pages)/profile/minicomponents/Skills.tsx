'use client';

import React, { useRef, useState } from 'react';
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
import GlassDropdown from '@/components/shared/GlassDropdown';

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
  const [skillLevel, setSkillLevel] = useState<number>(
      form.getFieldValue('skillLevel') || 3,
    );

     React.useEffect(() => {
      const current = form.getFieldValue('skillLevel');
      if (typeof current === 'number') setSkillLevel(current);
    }, [form]);

  function StarRating({
    value,
    onChange,
    count = 5,
    className = '',
    size = 24,
    color = 'var(--primary)',
  }: {
    value: number;
    onChange: (v: number) => void;
    count?: number;
    className?: string;
    size?: number;
    color?: string;
  }) {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
      <div
        className={`flex items-center gap-1 ${className}`}
        onMouseLeave={() => setHovered(null)}
      >
        {[...Array(count)].map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Set rating to ${i + 1}`}
            onClick={() => onChange(i + 1)}
            onMouseEnter={() => setHovered(i + 1)}
            className="focus:outline-none bg-transparent"
            style={{ lineHeight: 0 }}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={
                hovered !== null
                  ? i < hovered
                    ? color
                    : 'rgba(120,120,140,0.2)'
                  : i < value
                    ? color
                    : 'rgba(120,120,140,0.2)'
              }
              style={{ transition: 'fill 0.2s' }}
            >
              <path d="M12 2.5l3.09 6.26 6.91.54-5 4.73 1.18 6.97L12 17.77l-6.18 3.23L7 14.03l-5-4.73 6.91-.54z" />
            </svg>
          </button>
        ))}
      </div>
    );
  }

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
     setSkillLevel(3);
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
    <div className="bg-background py-0 px-0 sm:px-4 lg:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Glass morphism container */}
        <div className="backdrop-blur-xl bg-card/40 border border-border rounded-[var(--radius)] p-6 shadow-[0_0_10px_var(--ring)] hover:shadow-[0_0_18px_var(--ring)] transition-shadow duration-300">
          {/* Header section */}
          <div className="mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
              Skills & Expertise
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Showcase your technical skills and proficiency levels
            </p>
          </div>

          {/* Add Skill Form */}
          <div className="mb-6">
            <Form form={form} layout="vertical" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Skill Name */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-foreground">
                    Skill Name *
                  </label>
                  <div className="relative">
                    <Code
                      className="absolute left-3 top-3 w-5 h-5 pointer-events-none"
                      style={{ color: 'var(--primary)' }}
                      strokeWidth={1.5}
                    />
                    <Form.Item name="skillName" className="mb-0">
                      <input
                        className="w-full pl-9 pr-3 py-2 border border-input rounded-[var(--radius-sm)] bg-card/40 backdrop-blur-xl shadow-[0_0_6px_var(--ring)] text-foreground placeholder-muted-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent transition"
                        placeholder="e.g. React, Python, Docker"
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Skill Category */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-foreground">
                    Category
                  </label>
                  <Form.Item
                    name="skillCategory"
                    initialValue={CATEGORIES[0]}
                    className="mb-0"
                  >
                    <GlassDropdown
                      options={CATEGORIES.map((cat) => ({
                        value: cat,
                        label: formatCategory(cat),
                      }))}
                      value={form.getFieldValue('skillCategory')}
                      onChange={(v) =>
                        form.setFieldsValue({ skillCategory: v })
                      }
                      placeholder="Select category"
                      icon={Target}
                    />
                  </Form.Item>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Proficiency Level */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-foreground">
                    Proficiency Level
                  </label>
                  <Form.Item
                    name="skillLevel"
                    initialValue={3}
                    className="mb-0"
                  >
                    <div className="flex items-center space-x-2">
                      <StarRating
                        value={skillLevel}
                        onChange={(newValue) => {
                          setSkillLevel(newValue);
                          form.setFieldsValue({ skillLevel: newValue });
                        }}
                        count={5}
                        size={24}
                        color="var(--primary)"
                      />
                      <span className="text-sm text-muted-foreground ml-2">
                        Level {skillLevel}
                      </span>
                    </div>
                  </Form.Item>
                </div>
                {/* Years of Experience */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-foreground">
                    Years of Experience
                  </label>
                  <Form.Item name="yearsExperience" className="mb-0">
                    <GlassDropdown
                      options={EXPERIENCE_YEARS}
                      value={form.getFieldValue('yearsExperience')}
                      onChange={(v) =>
                        form.setFieldsValue({ yearsExperience: v })
                      }
                      placeholder="Select experience"
                      icon={Clock}
                    />
                  </Form.Item>
                </div>

                {/* Last Used */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-foreground">
                    Last Used
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-3 w-5 h-5 pointer-events-none"
                      style={{ color: 'var(--primary)' }}
                    />
                    <Form.Item name="lastUsed" className="mb-0">
                      <input
                        type="date"
                        className="w-full pl-9 pr-3 py-2 border border-input rounded-[var(--radius-sm)] bg-card/40 backdrop-blur-xl shadow-[0_0_6px_var(--ring)] text-foreground placeholder-muted-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent transition"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Add Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-6 py-2 rounded-[var(--radius-sm)] bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors duration-200 shadow-[0_0_12px_var(--ring)] hover:shadow-[0_0_18px_var(--ring)] flex items-center space-x-2 text-sm"
                >
                  <PlusOutlined className="w-4 h-4" />
                  <span>Add Skill</span>
                </button>
              </div>
            </Form>
          </div>

          {/* Skills List */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center">
              <Target
                className="w-5 h-5 mr-2"
                style={{ color: 'var(--primary)' }}
              />
              Your Skills ({value.length})
            </h3>

            {value.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-border rounded-[var(--radius)]">
                <Code className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-base">
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
                    className="group flex items-center justify-between p-3 border border-border rounded-[var(--radius-sm)] hover:border-primary/50 transition-all duration-200 hover:shadow-sm bg-card/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <div>
                          <div className="font-semibold text-foreground text-sm">
                            {item.name}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
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
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onPrev}
              className="px-4 py-2 rounded-[var(--radius-sm)] border border-border text-muted-foreground hover:bg-accent transition-colors duration-200 text-sm flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={() => {
                onNext?.();
              }}
              disabled={value.length === 0}
              className="px-6 py-2 rounded-[var(--radius-sm)] bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors duration-200 shadow-[0_0_12px_var(--ring)] hover:shadow-[0_0_18px_var(--ring)] flex items-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
