'use client';

import React from 'react';
import { Form, Input, DatePicker, Button, List, Space, Checkbox } from 'antd';
import {
  Plus as PlusOutlined,
  DeleteIcon as DeleteOutlined,
  Briefcase,
  Target,
  ArrowLeft,
  ArrowRight,
  Building,
  MapPin,
  Calendar,
  FileText,
} from 'lucide-react';
import dayjs from 'dayjs';

export type ExperienceInput = {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  responsibilities?: string;
};

type Props = {
  value?: ExperienceInput[];
  onChange?: (v: ExperienceInput[]) => void;
  onNext?: () => void;
  onPrev?: () => void;
};

export default function Experience({
  value = [],
  onChange,
  onNext,
  onPrev,
}: Props) {
  const [form] = Form.useForm();

  function addExperience() {
    const vals = form.getFieldsValue();
    if (!vals.title || !vals.company || !vals.startDate) return;

    const item: ExperienceInput = {
      title: vals.title,
      company: vals.company,
      location: vals.location?.trim(),
      startDate: dayjs(vals.startDate).toISOString(),
      endDate: vals.endDate ? dayjs(vals.endDate).toISOString() : undefined,
      isCurrent: !!vals.isCurrent,
      responsibilities: vals.responsibilities?.trim(),
    };

    onChange?.([...(value || []), item]);
    form.resetFields();

    // Set default values back
    form.setFieldsValue({
      isCurrent: false,
    });
  }

  function removeAt(i: number) {
    onChange?.(value.filter((_, idx) => idx !== i));
  }

  function formatDate(dateString: string) {
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
              Work Experience
            </h2>
            <p className="text-muted-foreground mt-2">
              Share your professional journey and achievements
            </p>
          </div>

          {/* Add Experience Form */}
          <div className="mb-8">
            <Form form={form} layout="vertical" className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Job Title *
                  </label>
                  <div className="relative">
                    <Briefcase
                      className="absolute left-3 top-3.5 w-5 h-5"
                      style={{ color: 'var(--primary)' }}
                      strokeWidth={1.5}
                    />
                    <Form.Item name="title" className="mb-0">
                      <input
                        className="w-full pl-10 pr-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
                        placeholder="e.g., Senior Engineer, Frontend Developer"
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Company *
                  </label>
                  <div className="relative">
                    <Building
                      className="absolute left-3 top-3.5 w-5 h-5"
                      style={{ color: 'var(--primary)' }}
                      strokeWidth={1.5}
                    />
                    <Form.Item name="company" className="mb-0">
                      <input
                        className="w-full pl-10 pr-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
                        placeholder="Company name"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Location
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3.5 w-5 h-5"
                    style={{ color: 'var(--primary)' }}
                    strokeWidth={1.5}
                  />
                  <Form.Item name="location" className="mb-0">
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
                      placeholder="City, Country or Remote"
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Employment Period *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <label className="block text-xs text-muted-foreground">
                      Start Date
                    </label>
                    <Form.Item name="startDate" className="mb-0">
                      <div className="relative">
                        <Calendar
                          className="absolute left-3 top-3.5 w-5 h-5 cursor-pointer"
                          style={{ color: 'var(--primary)' }}
                          strokeWidth={1.5}
                          onClick={() => {
                            const input =
                              document.getElementById('startDateInput');
                            if (input && 'showPicker' in input) {
                              (input as HTMLInputElement).showPicker();
                            }
                            input && input.click(); // fallback
                          }}
                        />
                        <input
                          id="startDateInput"
                          type="date"
                          className="w-full pl-10 px-3 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background"
                          onMouseDown={(e) => e.preventDefault()} // prevent manual open
                        />
                      </div>
                    </Form.Item>
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <label className="block text-xs text-muted-foreground">
                      End Date
                    </label>
                    <Form.Item name="endDate" className="mb-0">
                      <div className="relative">
                        <Calendar
                          className="absolute left-3 top-3.5 w-5 h-5 cursor-pointer"
                          style={{ color: 'var(--primary)' }}
                          strokeWidth={1.5}
                          onClick={() => {
                            const input =
                              document.getElementById('endDateInput');
                            input &&
                              'showPicker' in input &&
                              (input as HTMLInputElement).showPicker();
                            input && input.click();
                          }}
                        />
                        <input
                          id="endDateInput"
                          type="date"
                          className="w-full pl-10 px-3 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground bg-background"
                          onMouseDown={(e) => e.preventDefault()}
                          disabled={form.getFieldValue('isCurrent')}
                        />
                      </div>
                    </Form.Item>
                  </div>

                  {/* Current Position */}
                  <div className="space-y-2">
                    <label className="block text-xs text-muted-foreground">
                      Status
                    </label>
                    <div className="flex items-center h-12">
                      <Form.Item
                        name="isCurrent"
                        valuePropName="checked"
                        className="mb-0"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary border-border rounded focus:ring-ring mr-2"
                          onChange={(e) => {
                            if (e.target.checked) {
                              form.setFieldValue('endDate', '');
                            }
                          }}
                        />
                      </Form.Item>
                      <span className="text-sm text-foreground">
                        Current Position
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Responsibilities */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Responsibilities & Achievements
                </label>
                <div className="relative">
                  <FileText
                    className="absolute left-3 top-3.5 w-5 h-5"
                    style={{ color: 'var(--primary)' }}
                    strokeWidth={1.5}
                  />
                  <Form.Item name="responsibilities" className="mb-0">
                    <textarea
                      className="w-full pl-10 pr-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground min-h-[120px]"
                      placeholder="Describe your key responsibilities, achievements, and contributions..."
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Add Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={addExperience}
                  className="px-8 py-3 rounded-[var(--radius-sm)] bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors duration-200 shadow-[0_0_20px_var(--ring)] hover:shadow-[0_0_25px_var(--ring)] flex items-center space-x-2"
                >
                  <PlusOutlined className="w-4 h-4" />
                  <span>Add Experience</span>
                </button>
              </div>
            </Form>
          </div>

          {/* Experience List */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Target
                className="w-5 h-5 mr-2"
                style={{ color: 'var(--primary)' }}
              />
              Your Experience ({value.length})
            </h3>

            {value.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-[var(--radius)]">
                <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">
                  No experience added yet
                </p>
                <p className="text-muted-foreground text-sm">
                  Start by adding your first work experience above
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
                            {item.title}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {item.company}
                              </span>
                              {item.location && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center space-x-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{item.location}</span>
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground/80">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {formatDate(item.startDate)} —{' '}
                                {item.isCurrent
                                  ? 'Present'
                                  : formatDate(item.endDate!)}
                              </span>
                              {item.isCurrent && (
                                <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
                                  Current
                                </span>
                              )}
                            </div>
                            {item.responsibilities && (
                              <p className="text-xs text-muted-foreground/80 mt-2 line-clamp-2">
                                {item.responsibilities}
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
                        title="Remove experience"
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
