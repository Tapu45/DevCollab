'use client';

import React from 'react';
import { Form, Input, DatePicker, Button, List, Space } from 'antd';
import {
  Plus as PlusOutlined,
  DeleteIcon as DeleteOutlined,
  GraduationCap,
  Target,
  ArrowLeft,
  ArrowRight,
  Building,
  Award,
  BookOpen,
  Calendar,
  FileText,
  Star,
} from 'lucide-react';
import dayjs from 'dayjs';

export type EducationInput = {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  description?: string;
};

type Props = {
  value?: EducationInput[];
  onChange?: (v: EducationInput[]) => void;
  onNext?: () => void;
  onPrev?: () => void;
};

export default function Education({ value = [], onChange, onNext, onPrev }: Props) {
  const [form] = Form.useForm();

  function addEducation() {
    const vals = form.getFieldsValue();
    if (!vals.institution) return;
    
    const item: EducationInput = {
      institution: vals.institution,
      degree: vals.degree?.trim(),
      fieldOfStudy: vals.fieldOfStudy?.trim(),
      startDate: vals.startDate ? dayjs(vals.startDate).toISOString() : undefined,
      endDate: vals.endDate ? dayjs(vals.endDate).toISOString() : undefined,
      grade: vals.grade?.trim(),
      description: vals.description?.trim(),
    };
    
    onChange?.([...(value || []), item]);
    form.resetFields();
  }

  function removeAt(i: number) {
    onChange?.(value.filter((_, idx) => idx !== i));
  }

  function formatDate(dateString?: string) {
    if (!dateString) return 'Not specified';
    return dayjs(dateString).format('MMM YYYY');
  }

  return (
    <div className="min-h-screen bg-background py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Glass morphism container */}
        <div className="backdrop-blur-xl bg-card/40 border border-border rounded-[var(--radius)] p-8 shadow-[0_0_15px_var(--ring)] hover:shadow-[0_0_30px_var(--ring)] transition-shadow duration-300">
          {/* Header section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
              Education & Qualifications
            </h2>
            <p className="text-muted-foreground mt-2">
              Share your academic background and achievements
            </p>
          </div>

          {/* Add Education Form */}
          <div className="mb-8">
            <Form form={form} layout="vertical" className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Institution */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Institution *
                  </label>
                  <div className="relative">
                    <Building
                      className="absolute left-3 top-3.5 w-5 h-5"
                      style={{ color: 'var(--primary)' }}
                      strokeWidth={1.5}
                    />
                    <Form.Item name="institution" className="mb-0">
                      <input
                        className="w-full pl-10 pr-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
                        placeholder="University or School name"
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Degree */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Degree
                  </label>
                  <div className="relative">
                    <Award
                      className="absolute left-3 top-3.5 w-5 h-5"
                      style={{ color: 'var(--primary)' }}
                      strokeWidth={1.5}
                    />
                    <Form.Item name="degree" className="mb-0">
                      <input
                        className="w-full pl-10 pr-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
                        placeholder="e.g., B.Sc, M.Sc, B.Tech, Ph.D"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Field of Study */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Field of Study
                </label>
                <div className="relative">
                  <BookOpen
                    className="absolute left-3 top-3.5 w-5 h-5"
                    style={{ color: 'var(--primary)' }}
                    strokeWidth={1.5}
                  />
                  <Form.Item name="fieldOfStudy" className="mb-0">
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
                      placeholder="e.g., Computer Science, Design, Engineering"
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Academic Period
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <label className="block text-xs text-muted-foreground">Start Date</label>
                    <Form.Item name="startDate" className="mb-0">
                      <input
                        type="date"
                        className="w-full px-3 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background"
                      />
                    </Form.Item>
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <label className="block text-xs text-muted-foreground">End Date</label>
                    <Form.Item name="endDate" className="mb-0">
                      <input
                        type="date"
                        className="w-full px-3 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Grade */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Grade / GPA
                </label>
                <div className="relative">
                  <Star
                    className="absolute left-3 top-3.5 w-5 h-5"
                    style={{ color: 'var(--primary)' }}
                    strokeWidth={1.5}
                  />
                  <Form.Item name="grade" className="mb-0">
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
                      placeholder="e.g., 3.8/4.0, A+, First Class"
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Additional Notes
                </label>
                <div className="relative">
                  <FileText
                    className="absolute left-3 top-3.5 w-5 h-5"
                    style={{ color: 'var(--primary)' }}
                    strokeWidth={1.5}
                  />
                  <Form.Item name="description" className="mb-0">
                    <textarea
                      className="w-full pl-10 pr-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground min-h-[120px]"
                      placeholder="Relevant coursework, honors, activities, or other achievements..."
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Add Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={addEducation}
                  className="px-8 py-3 rounded-[var(--radius-sm)] bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors duration-200 shadow-[0_0_20px_var(--ring)] hover:shadow-[0_0_25px_var(--ring)] flex items-center space-x-2"
                >
                  <PlusOutlined className="w-4 h-4" />
                  <span>Add Education</span>
                </button>
              </div>
            </Form>
          </div>

          {/* Education List */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" style={{ color: 'var(--primary)' }} />
              Your Education ({value.length})
            </h3>

            {value.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-[var(--radius)]">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">No education entries yet</p>
                <p className="text-muted-foreground text-sm">Start by adding your first education entry above</p>
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
                            {item.institution}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center space-x-2">
                              {item.degree && (
                                <>
                                  <span className="font-medium">{item.degree}</span>
                                  {item.fieldOfStudy && <span>•</span>}
                                </>
                              )}
                              {item.fieldOfStudy && (
                                <span className="text-muted-foreground/80">{item.fieldOfStudy}</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground/80">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {formatDate(item.startDate)} — {formatDate(item.endDate)}
                                </span>
                              </span>
                              {item.grade && (
                                <span className="flex items-center space-x-1">
                                  <Star className="w-3 h-3" />
                                  <span>{item.grade}</span>
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs text-muted-foreground/80 mt-2 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => removeAt(i)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-[var(--radius-sm)] transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        title="Remove education entry"
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
              className="px-8 py-3 rounded-[var(--radius-sm)] bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors duration-200 shadow-[0_0_20px_var(--ring)] hover:shadow-[0_0_25px_var(--ring)] flex items-center space-x-2"
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