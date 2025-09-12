'use client';

import React from 'react';
import { Form } from 'antd';
import {
  User,
  MapPin,
  Globe2,
  Github,
  Linkedin,
  Clock,
  Target,
} from 'lucide-react';
import { getLocationAndTimezone } from '@/lib/Location';

export type BasicValues = {
  displayName?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  website?: string;
  githubUrl?: string;
  linkedinUrl?: string;
};

type Props = {
  value?: BasicValues;
  onChange?: (v: BasicValues) => void;
  onNext?: () => void;
};

export default function Basic({ value = {}, onChange, onNext }: Props) {
  const [form] = Form.useForm();
  const [detecting, setDetecting] = React.useState(false);

  const handleDetectLocation = async () => {
    setDetecting(true);
    try {
      const result = await getLocationAndTimezone();
      form.setFieldsValue({
        location: result.location,
        timezone: result.timezone,
      });
      onChange?.({
        ...form.getFieldsValue(),
        location: result.location,
        timezone: result.timezone,
      });
    } catch {
      alert('Could not detect location.');
    }
    setDetecting(false);
  };

  return (
    <div className="bg-background py-0 px-0 sm:px-4 lg:px-6">
      <div className="max-w-4xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          initialValues={value}
          onValuesChange={(_, all) => onChange?.(all as BasicValues)}
          className="space-y-6"
        >
          <div
            className="relative rounded-[var(--radius)] p-6 backdrop-blur-xl border border-border bg-card/50"
            style={{
              boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[calc(var(--radius)+1px)]"
              style={{
                background:
                  'linear-gradient(135deg, var(--primary) 10%, var(--accent-foreground) 50%, transparent 100%)',
                opacity: 0.08,
                maskImage:
                  'radial-gradient(1200px 400px at 0% 0%, black, transparent 60%)',
                WebkitMaskImage:
                  'radial-gradient(1200px 400px at 0% 0%, black, transparent 60%)',
              }}
            />
            <div className="mb-6 relative z-[1]">
              <div className="flex items-center gap-3">
                <div
                  className="h-7 w-7 rounded-full"
                  style={{
                    background:
                      'conic-gradient(from 180deg, var(--primary), var(--accent-foreground), var(--primary))',
                    boxShadow: '0 0 24px var(--ring)',
                    opacity: 0.85,
                  }}
                />
                <h2 className="text-[1.15rem] font-semibold leading-none bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent tracking-[0.005em]">
                  Personal Profile
                </h2>
              </div>
              <p className="text-muted-foreground mt-2 text-[0.9rem] leading-relaxed">
                Share essentials that help collaborators and AI matchmakers
                understand you better.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-0 relative z-[1]">
              <div className="space-y-1">
                <label className="block text-[0.85rem] font-medium text-foreground">
                  Display Name{' '}
                  <span className="text-muted-foreground/80">*</span>
                </label>
                <Form.Item name="displayName" rules={[{ required: true }]}>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      color="var(--primary)"
                      stroke="var(--primary)"
                      strokeWidth={1.5}
                    />
                    <input
                      className="w-full pl-9 pr-3 py-2 rounded-[var(--radius-sm)] bg-card/60 border border-input text-foreground placeholder-muted-foreground text-sm transition-all focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                </Form.Item>
              </div>

              <div className="space-y-1">
                <label className="block text-[0.85rem] font-medium text-foreground">
                  Location
                </label>
                <Form.Item name="location" className="mb-0">
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: 'var(--primary)' }}
                    />
                    <input
                      className="w-full pl-9 pr-10 py-2 rounded-[var(--radius-sm)] bg-card/60 border border-input text-foreground placeholder-muted-foreground text-sm transition-all focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="City, Country"
                    />
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={detecting}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[8px] p-1 transition-colors hover:bg-accent disabled:opacity-60"
                      title="Detect location"
                      tabIndex={0}
                    >
                      <Target
                        className={`w-4 h-4 ${detecting ? 'animate-spin' : ''}`}
                        style={{ color: 'var(--primary)' }}
                      />
                    </button>
                  </div>
                </Form.Item>
              </div>
            </div>

            <div className="space-y-1 mb-0 relative z-[1]">
              <div className="flex items-center justify-between">
                <label className="block text-[0.85rem] font-medium text-foreground">
                  Bio <span className="text-muted-foreground/80">*</span>
                </label>
              </div>
              <Form.Item name="bio" rules={[{ required: true }]}>
                <textarea
                  className="w-full p-3 rounded-[var(--radius-sm)] bg-card/60 border border-input text-foreground placeholder-muted-foreground min-h-[120px] text-sm transition-all focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  placeholder="Tell us about your focus areas, interests, and what you’re looking to build."
                 
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-[1]">
              <div className="space-y-1">
                <label className="block text-[0.85rem] font-medium text-foreground">
                  Timezone
                </label>
                <Form.Item name="timezone" className="mb-0">
                  <div className="relative">
                    <Clock
                      style={{ color: 'var(--primary)' }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    />
                    <input
                      className="w-full pl-9 pr-3 py-2 rounded-[var(--radius-sm)] bg-card/60 border border-input text-foreground placeholder-muted-foreground text-sm transition-all focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="UTC+5:30"
                    />
                  </div>
                </Form.Item>
              </div>

              <div className="space-y-1">
                <label className="block text-[0.85rem] font-medium text-foreground">
                  Website
                </label>
                <Form.Item name="website" className="mb-0">
                  <div className="relative">
                    <Globe2
                      style={{ color: 'var(--primary)' }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    />
                    <input
                      className="w-full pl-9 pr-3 py-2 rounded-[var(--radius-sm)] bg-card/60 border border-input text-foreground placeholder-muted-foreground text-sm transition-all focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="https://your.site"
                    />
                  </div>
                </Form.Item>
              </div>

              <div className="space-y-1">
                <label className="block text-[0.85rem] font-medium text-foreground">
                  GitHub
                </label>
                <Form.Item name="githubUrl" className="mb-0">
                  <div className="relative">
                    <Github
                      style={{ color: 'var(--primary)' }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    />
                    <input
                      className="w-full pl-9 pr-3 py-2 rounded-[var(--radius-sm)] bg-card/60 border border-input text-foreground placeholder-muted-foreground text-sm transition-all focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="GitHub username"
                    />
                  </div>
                </Form.Item>
              </div>
            </div>

            <div className="space-y-1 mt- relative z-[1]">
              <label className="block text-[0.85rem] font-medium text-foreground">
                LinkedIn
              </label>
              <Form.Item name="linkedinUrl" className="mb-0">
                <div className="relative">
                  <Linkedin
                    style={{ color: 'var(--primary)' }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  />
                  <input
                    className="w-full pl-9 pr-3 py-2 rounded-[var(--radius-sm)] bg-card/60 border border-input text-foreground placeholder-muted-foreground text-sm transition-all focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="LinkedIn profile URL"
                  />
                </div>
              </Form.Item>
            </div>

            <div className="flex items-center justify-end gap-3 mt-3 relative z-[1]">
              <button
                onClick={() => form.resetFields()}
                className="px-4 py-2 rounded-[var(--radius-sm)] border border-border text-muted-foreground hover:bg-accent transition-colors duration-200 text-sm"
              >
                Reset
              </button>
              <button
                onClick={async () => {
                  try {
                    await form.validateFields();
                    onNext?.();
                  } catch {}
                }}
                className="px-6 py-2 rounded-[var(--radius-sm)] bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors duration-200"
                style={{
                  boxShadow:
                    '0 0 0 1px var(--primary-foreground) inset, 0 0 24px var(--ring)',
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
