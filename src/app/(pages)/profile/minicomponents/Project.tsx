'use client';

import React from 'react';
import { Form, Input, Select, Button, List, Space, Rate, Tag } from 'antd';
import {
  Plus as PlusOutlined,
  DeleteIcon as DeleteOutlined,
  FolderOpen,
  Target,
  ArrowLeft,
  ArrowRight,
  Github,
  Globe,
  Palette,
  FileText,
  Image,
  Users,
  Clock,
  Tag as TagIcon,
  Code,
  Calendar,
} from 'lucide-react';

export type ProjectInput = {
  title: string;
  description?: string;
  shortDesc?: string;
  status: string;
  visibility: string;
  techStack: string[];
  categories: string[];
  tags: string[];
  difficultyLevel?: string;
  estimatedHours?: number;
  maxCollaborators?: number;
  githubUrl?: string;
  liveUrl?: string;
  designUrl?: string;
  documentUrl?: string;
  thumbnailUrl?: string;
  images: string[];
  isRecruiting: boolean;
  recruitmentMsg?: string;
  requiredSkills: string[];
  preferredTimezone?: string;
};

type Props = {
  value?: ProjectInput[];
  onChange?: (v: ProjectInput[]) => void;
  onNext?: () => void;
  onPrev?: () => void;
};

const PROJECT_STATUSES = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const PROJECT_VISIBILITY = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'PRIVATE', label: 'Private' },
  { value: 'CONNECTIONS_ONLY', label: 'Connections Only' },
];

const DIFFICULTY_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

const TIMEZONES = [
  'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00',
  'UTC-07:00', 'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00',
  'UTC-02:00', 'UTC-01:00', 'UTC+00:00', 'UTC+01:00', 'UTC+02:00',
  'UTC+03:00', 'UTC+04:00', 'UTC+05:00', 'UTC+05:30', 'UTC+06:00',
  'UTC+07:00', 'UTC+08:00', 'UTC+09:00', 'UTC+10:00', 'UTC+11:00', 'UTC+12:00'
];

export default function Project({ value = [], onChange, onNext, onPrev }: Props) {
  const [form] = Form.useForm();

  function addProject() {
    const current = form.getFieldsValue();
    const title = current.title?.trim();
    const description = current.description?.trim();
    const shortDesc = current.shortDesc?.trim();
    const status = current.status || PROJECT_STATUSES[0].value;
    const visibility = current.visibility || PROJECT_VISIBILITY[0].value;
    const techStack = current.techStack || [];
    const categories = current.categories || [];
    const tags = current.tags || [];
    const difficultyLevel = current.difficultyLevel;
    const estimatedHours = current.estimatedHours;
    const maxCollaborators = current.maxCollaborators || 5;
    const githubUrl = current.githubUrl?.trim();
    const liveUrl = current.liveUrl?.trim();
    const designUrl = current.designUrl?.trim();
    const documentUrl = current.documentUrl?.trim();
    const thumbnailUrl = current.thumbnailUrl?.trim();
    const images = current.images || [];
    const isRecruiting = current.isRecruiting || false;
    const recruitmentMsg = current.recruitmentMsg?.trim();
    const requiredSkills = current.requiredSkills || [];
    const preferredTimezone = current.preferredTimezone;

    if (!title) return;

    const next = [
      ...value,
      {
        title,
        description,
        shortDesc,
        status,
        visibility,
        techStack,
        categories,
        tags,
        difficultyLevel,
        estimatedHours,
        maxCollaborators,
        githubUrl,
        liveUrl,
        designUrl,
        documentUrl,
        thumbnailUrl,
        images,
        isRecruiting,
        recruitmentMsg,
        requiredSkills,
        preferredTimezone,
      },
    ];
    onChange?.(next);
    form.resetFields();
    
    // Set default values back
    form.setFieldsValue({
      status: PROJECT_STATUSES[0].value,
      visibility: PROJECT_VISIBILITY[0].value,
      maxCollaborators: 5,
      isRecruiting: false,
    });
  }

  function removeAt(i: number) {
    const next = value.filter((_, idx) => idx !== i);
    onChange?.(next);
  }

  function addArrayItem(field: string, item: string) {
    if (!item.trim()) return;
    const current = form.getFieldValue(field) || [];
    const updated = [...current, item.trim()];
    form.setFieldValue(field, updated);
  }

  function removeArrayItem(field: string, index: number) {
    const current = form.getFieldValue(field) || [];
    const updated = current.filter((_: any, i: number) => i !== index);
    form.setFieldValue(field, updated);
  }

  function renderArrayField(field: string, label: string, placeholder: string) {
    const items = form.getFieldValue(field) || [];
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addArrayItem(field, e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              const input = document.querySelector(`input[placeholder="${placeholder}"]`) as HTMLInputElement;
              if (input) {
                addArrayItem(field, input.value);
                input.value = '';
              }
            }}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-[var(--radius-sm)] hover:bg-primary/90 transition-colors"
          >
            Add
          </button>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item: string, index: number) => (
              <Tag
                key={index}
                closable
                onClose={() => removeArrayItem(field, index)}
                className="bg-accent text-accent-foreground"
              >
                {item}
              </Tag>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Glass morphism container */}
        <div className="backdrop-blur-xl bg-card/40 border border-border rounded-[var(--radius)] p-8 shadow-[0_0_15px_var(--ring)] hover:shadow-[0_0_30px_var(--ring)] transition-shadow duration-300">
          {/* Header section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
              Projects & Portfolio
            </h2>
            <p className="text-muted-foreground mt-2">
              Showcase your projects and development work
            </p>
          </div>

          {/* Add Project Form */}
          <div className="mb-8">
            <Form form={form} layout="vertical" className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Project Title *
                  </label>
                  <div className="relative">
                    <FolderOpen
                      className="absolute left-3 top-3.5 w-5 h-5"
                      style={{ color: 'var(--primary)' }}
                      strokeWidth={1.5}
                    />
                    <Form.Item name="title" className="mb-0">
                      <input
                        className="w-full pl-10 pr-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
                        placeholder="Enter project title"
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Project Status */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Project Status
                  </label>
                  <Form.Item name="status" initialValue={PROJECT_STATUSES[0].value} className="mb-0">
                    <select className="w-full px-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background">
                      {PROJECT_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </Form.Item>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Description
                </label>
                <Form.Item name="description" className="mb-0">
                  <textarea
                    className="w-full p-4 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground min-h-[100px]"
                    placeholder="Describe your project..."
                  />
                </Form.Item>
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Short Description
                </label>
                <Form.Item name="shortDesc" className="mb-0">
                  <input
                    className="w-full px-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
                    placeholder="Brief summary (max 280 characters)"
                    maxLength={280}
                  />
                </Form.Item>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Visibility */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Visibility
                  </label>
                  <Form.Item name="visibility" initialValue={PROJECT_VISIBILITY[0].value} className="mb-0">
                    <select className="w-full px-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background">
                      {PROJECT_VISIBILITY.map((vis) => (
                        <option key={vis.value} value={vis.value}>
                          {vis.label}
                        </option>
                      ))}
                    </select>
                  </Form.Item>
                </div>

                {/* Difficulty Level */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Difficulty Level
                  </label>
                  <Form.Item name="difficultyLevel" className="mb-0">
                    <select className="w-full px-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background">
                      <option value="">Select difficulty</option>
                      {DIFFICULTY_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </Form.Item>
                </div>

                {/* Estimated Hours */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Estimated Hours
                  </label>
                  <Form.Item name="estimatedHours" className="mb-0">
                    <input
                      type="number"
                      min="1"
                      className="w-full px-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
                      placeholder="e.g., 40"
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Collaboration Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Max Collaborators */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Max Collaborators
                  </label>
                  <Form.Item name="maxCollaborators" initialValue={5} className="mb-0">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      className="w-full px-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
                    />
                  </Form.Item>
                </div>

                {/* Preferred Timezone */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Preferred Timezone
                  </label>
                  <Form.Item name="preferredTimezone" className="mb-0">
                    <select className="w-full px-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background">
                      <option value="">Select timezone</option>
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </Form.Item>
                </div>
              </div>

              {/* URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GitHub URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    GitHub URL
                  </label>
                  <div className="relative">
                    <Github
                      className="absolute left-3 top-3.5 w-5 h-5"
                      style={{ color: 'var(--primary)' }}
                      strokeWidth={1.5}
                    />
                    <Form.Item name="githubUrl" className="mb-0">
                      <input
                        type="url"
                        className="w-full pl-10 pr-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
                        placeholder="https://github.com/..."
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Live URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Live URL
                  </label>
                  <div className="relative">
                    <Globe
                      className="absolute left-3 top-3.5 w-5 h-5"
                      style={{ color: 'var(--primary)' }}
                      strokeWidth={1.5}
                    />
                    <Form.Item name="liveUrl" className="mb-0">
                      <input
                        type="url"
                        className="w-full pl-10 pr-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
                        placeholder="https://your-project.com"
                      />
        </Form.Item>
                  </div>
                </div>
              </div>

              {/* Additional URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Design URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Design URL
                  </label>
                  <div className="relative">
                    <Palette
                      className="absolute left-3 top-3.5 w-5 h-5"
                      style={{ color: 'var(--primary)' }}
                      strokeWidth={1.5}
                    />
                    <Form.Item name="designUrl" className="mb-0">
                      <input
                        type="url"
                        className="w-full pl-10 pr-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
                        placeholder="Figma, Adobe XD, etc."
                      />
        </Form.Item>
                  </div>
                </div>

                {/* Document URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Document URL
                  </label>
                  <div className="relative">
                    <FileText
                      className="absolute left-3 top-3.5 w-5 h-5"
                      style={{ color: 'var(--primary)' }}
                      strokeWidth={1.5}
                    />
                    <Form.Item name="documentUrl" className="mb-0">
                      <input
                        type="url"
                        className="w-full pl-10 pr-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
                        placeholder="Google Docs, Notion, etc."
                      />
        </Form.Item>
                  </div>
                </div>
              </div>

              {/* Array Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderArrayField('techStack', 'Tech Stack', 'e.g., React, Node.js')}
                {renderArrayField('categories', 'Categories', 'e.g., Web App, Mobile')}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderArrayField('tags', 'Tags', 'e.g., JavaScript, API')}
                {renderArrayField('requiredSkills', 'Required Skills', 'e.g., React, TypeScript')}
              </div>

              {/* Recruitment Settings */}
              <div className="space-y-4 p-4 border border-border rounded-[var(--radius-sm)] bg-card/30">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h4 className="font-medium text-foreground">Recruitment Settings</h4>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Form.Item name="isRecruiting" valuePropName="checked" className="mb-0">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                    />
                  </Form.Item>
                  <label className="text-sm text-foreground">
                    This project is recruiting collaborators
                  </label>
                </div>

                <Form.Item name="recruitmentMsg" className="mb-0">
                  <textarea
                    className="w-full p-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground min-h-[80px]"
                    placeholder="Recruitment message for potential collaborators..."
                  />
        </Form.Item>
              </div>

              {/* Add Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={addProject}
                  className="px-8 py-3 rounded-[var(--radius-sm)] bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors duration-200 shadow-[0_0_20px_var(--ring)] hover:shadow-[0_0_25px_var(--ring)] flex items-center space-x-2"
                >
                  <PlusOutlined className="w-4 h-4" />
                  <span>Add Project</span>
                </button>
              </div>
      </Form>
          </div>

          {/* Projects List */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" style={{ color: 'var(--primary)' }} />
              Your Projects ({value.length})
            </h3>

            {value.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-[var(--radius)]">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">No projects added yet</p>
                <p className="text-muted-foreground text-sm">Start by adding your first project above</p>
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
                          <div className="font-semibold text-foreground">{item.title}</div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-accent rounded-full text-xs">
                                {item.status}
                              </span>
                              <span>•</span>
                              <span className="px-2 py-1 bg-accent rounded-full text-xs">
                                {item.visibility}
                              </span>
                            </div>
                            {item.shortDesc && (
                              <p className="text-xs text-muted-foreground/80">
                                {item.shortDesc}
                              </p>
                            )}
                            {item.techStack.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.techStack.slice(0, 3).map((tech, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-background/50 rounded text-xs">
                                    {tech}
                                  </span>
                                ))}
                                {item.techStack.length > 3 && (
                                  <span className="px-2 py-1 bg-background/50 rounded text-xs">
                                    +{item.techStack.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => removeAt(i)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-[var(--radius-sm)] transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        title="Remove project"
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
              onClick={onNext}
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