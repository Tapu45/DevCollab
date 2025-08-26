'use client';

import React from 'react';
import { Form } from 'antd';
import { User, MapPin, Globe2, Github, Linkedin, Clock, Target } from 'lucide-react';
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
      onChange?.({ ...form.getFieldsValue(), location: result.location, timezone: result.timezone });
    } catch (err) {
      alert('Could not detect location.');
    }
    setDetecting(false);
  };

  return (
    <div className="min-h-screen bg-background py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          initialValues={value}
          onValuesChange={(_, all) => onChange?.(all as BasicValues)}
          className="space-y-8"
        >
          {/* Glass morphism container */}
          <div className="backdrop-blur-xl bg-card/40 border border-border rounded-[var(--radius)] p-8 shadow-[0_0_15px_var(--ring)] hover:shadow-[0_0_30px_var(--ring)] transition-shadow duration-300">
            {/* Header section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                Personal Profile
              </h2>
              <p className="text-muted-foreground mt-2">
                Tell us about yourself
              </p>
            </div>

            {/* Name and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-1">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Display Name *
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-3.5 w-5 h-5"
                    color="var(--primary)"
                    stroke="var(--primary)"
                    strokeWidth={1.5}
                  />
                  <Form.Item name="displayName" rules={[{ required: true }]}>
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
                      placeholder="Your full name"
                    />
                  </Form.Item>
                </div>
              </div>

             <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Location
              </label>
              <div className="relative flex items-center">
                <MapPin
                  style={{ color: 'var(--primary)' }}
                  className="absolute left-3 top-3.5 w-5 h-5 pointer-events-none"
                />
                <Form.Item name="location" className="flex-1 mb-0">
                  <input
                    className="w-full pl-10 pr-10 py-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
                    placeholder="City, Country"
                  />
                </Form.Item>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={detecting}
                  className="absolute right-3 top-3.5 p-0 bg-transparent border-none focus:outline-none"
                  title="Detect location"
                  tabIndex={0}
                >
                  <Target
                    className={`w-5 h-5 ${detecting ? 'animate-spin' : ''}`}
                    style={{ color: 'var(--primary)' }}
                  />
                </button>
              </div>
            </div>
          </div>

            {/* Bio */}
            <div className="space-y-2 mb-1">
              <label className="block text-sm font-medium text-foreground">
                Bio *
              </label>
              <Form.Item name="bio" rules={[{ required: true }]}>
                <textarea
                  className="w-full p-4  border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground min-h-[120px]"
                  placeholder="Tell us about yourself..."
                />
              </Form.Item>
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Timezone */}
              <div className="relative group">
                <Clock
                  style={{ color: 'var(--primary)' }}
                  className="absolute left-3 top-3.5 w-5 h-5"
                />
                <Form.Item name="timezone">
                  <input
                    className="w-full pl-10 pr-4 py-3  border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground group-hover:border-primary/50 transition-colors"
                    placeholder="UTC+5:30"
                  />
                </Form.Item>
              </div>

              {/* Website */}
              <div className="relative group">
                <Globe2
                  style={{ color: 'var(--primary)' }}
                  className="absolute left-3 top-3.5 w-5 h-5"
                />
                <Form.Item name="website">
                  <input
                    className="w-full pl-10 pr-4 py-3  border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground group-hover:border-primary/50 transition-colors"
                    placeholder="https://your.site"
                  />
                </Form.Item>
              </div>

              {/* GitHub */}
              <div className="relative group">
                <Github
                  style={{ color: 'var(--primary)' }}
                  className="absolute left-3 top-3.5 w-5 h-5"
                />
                <Form.Item name="githubUrl">
                  <input
                    className="w-full pl-10 pr-4 py-3  border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground group-hover:border-primary/50 transition-colors"
                    placeholder="GitHub username"
                  />
                </Form.Item>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="relative group mt-4">
              <Linkedin
                style={{ color: 'var(--primary)' }}
                className="absolute left-3 top-3.5 w-5 h-5"
              />
              <Form.Item name="linkedinUrl">
                <input
                  className="w-full pl-10 pr-4 py-3  border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground group-hover:border-primary/50 transition-colors"
                  placeholder="LinkedIn profile URL"
                />
              </Form.Item>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => form.resetFields()}
                className="px-6 py-3 rounded-[var(--radius-sm)] border border-border text-muted-foreground hover:bg-accent transition-colors duration-200"
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
                className="px-8 py-3 rounded-[var(--radius-sm)] bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors duration-200 shadow-[0_0_20px_var(--ring)] hover:shadow-[0_0_25px_var(--ring)]"
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
