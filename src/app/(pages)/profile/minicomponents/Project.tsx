'use client';

import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  List,
  Space,
  Rate,
  Tag,
  message,
} from 'antd';
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
import GlassDropdown from '@/components/shared/GlassDropdown';
import {
  UploadOutlined,
  LoadingOutlined,
  DeleteOutlined as AntDeleteOutlined,
} from '@ant-design/icons';

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
  'UTC-12:00',
  'UTC-11:00',
  'UTC-10:00',
  'UTC-09:00',
  'UTC-08:00',
  'UTC-07:00',
  'UTC-06:00',
  'UTC-05:00',
  'UTC-04:00',
  'UTC-03:00',
  'UTC-02:00',
  'UTC-01:00',
  'UTC+00:00',
  'UTC+01:00',
  'UTC+02:00',
  'UTC+03:00',
  'UTC+04:00',
  'UTC+05:00',
  'UTC+05:30',
  'UTC+06:00',
  'UTC+07:00',
  'UTC+08:00',
  'UTC+09:00',
  'UTC+10:00',
  'UTC+11:00',
  'UTC+12:00',
];

export default function Project({
  value = [],
  onChange,
  onNext,
  onPrev,
}: Props) {
  const [form] = Form.useForm();
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [imagesUploading, setImagesUploading] = useState(false);
  const [projectStatus, setProjectStatus] = useState<string>(
    PROJECT_STATUSES[0].value as string,
  );
  const [techStackInput, setTechStackInput] = useState('');
  const [categoriesInput, setCategoriesInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('');

  function addProject() {
    const current = form.getFieldsValue();
    const title = current.title?.trim();
    const description = current.description?.trim();
    const shortDesc = current.shortDesc?.trim();
    const status = current.status || PROJECT_STATUSES[0].value;
    const visibility = current.visibility || PROJECT_VISIBILITY[0].value;
    const techStack = current.techStackRaw
      ? current.techStackRaw
          .split(',')
          .map((v: string) => v.trim())
          .filter((v: string) => v)
      : [];
    const categories = current.categoriesRaw
      ? current.categoriesRaw
          .split(',')
          .map((v: string) => v.trim())
          .filter((v: string) => v)
      : [];
    const tags = current.tagsRaw
      ? current.tagsRaw
          .split(',')
          .map((v: string) => v.trim())
          .filter((v: string) => v)
      : [];
    const difficultyLevel = current.difficultyLevel;
    const estimatedHours = current.estimatedHours
      ? Number(current.estimatedHours)
      : undefined;
    const maxCollaborators = current.maxCollaborators || 5;
    const githubUrl = current.githubUrl?.trim();
    const liveUrl = current.liveUrl?.trim();
    const designUrl = current.designUrl?.trim();
    const documentUrl = current.documentUrl?.trim();
    const thumbnailUrl = current.thumbnailUrl?.trim();
    const images = current.images || [];
    const isRecruiting = current.isRecruiting || false;
    const recruitmentMsg = current.recruitmentMsg?.trim();
    const requiredSkills = current.requiredSkillsRaw
      ? current.requiredSkillsRaw
          .split(',')
          .map((v: string) => v.trim())
          .filter((v: string) => v)
      : [];
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

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.data?.secure_url) {
        form.setFieldValue('thumbnailUrl', data.data.secure_url);
        message.success('Thumbnail uploaded!');
      } else if (data.data?.url) {
        form.setFieldValue('thumbnailUrl', data.data.url);
        message.success('Thumbnail uploaded!');
      } else {
        message.error('Upload failed');
      }
    } catch (err) {
      message.error('Upload failed');
    }
    setThumbnailUploading(false);
  }

  function handleRemoveThumbnail() {
    form.setFieldValue('thumbnailUrl', '');
  }

  // Upload images
  async function handleImagesUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setImagesUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));

    try {
      const res = await fetch('/api/upload', {
        method: 'PUT',
        body: formData,
      });
      const data = await res.json();
      if (data.files) {
        const urls = data.files.map((f: any) => f.secure_url || f.url);
        form.setFieldValue('images', urls);
        message.success('Images uploaded!');
      } else {
        message.error('Upload failed');
      }
    } catch (err) {
      message.error('Upload failed');
    }
    setImagesUploading(false);
  }

  function renderArrayField(
    field: string,
    label: string,
    placeholder: string,
    inputValue: string,
    setInputValue: React.Dispatch<React.SetStateAction<string>>,
  ) {
    const items = form.getFieldValue(field) || [];

    function handleInput(value: string) {
      setInputValue(value);
      if (value.includes(',')) {
        const arr = value
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v.length > 0);
        form.setFieldValue(field, arr);
        setInputValue('');
      }
    }

    function handleBlur() {
      if (inputValue.trim()) {
        const arr = inputValue
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v.length > 0);
        form.setFieldValue(field, arr);
        setInputValue('');
      }
    }

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
        <input
          type="text"
          value={inputValue}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 border border-input rounded-[var(--radius-sm)]  text-foreground placeholder-muted-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent transition"
          onChange={(e) => handleInput(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleBlur();
              e.preventDefault();
            }
          }}
        />
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item: string, index: number) => (
              <Tag
                key={index}
                closable
                onClose={() => {
                  const updated = items.filter(
                    (_: any, i: number) => i !== index,
                  );
                  form.setFieldValue(field, updated);
                }}
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

  function handleRemoveImage(idx: number) {
    const images = form.getFieldValue('images') || [];
    const updated = images.filter((_: string, i: number) => i !== idx);
    form.setFieldValue('images', updated);
  }

  return (
    <div className="bg-background py-0 px-0 sm:px-4 lg:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Glass morphism container */}
        <div className="backdrop-blur-xl bg-card/40 border border-border rounded-[var(--radius)] p-6 shadow-[0_0_10px_var(--ring)] hover:shadow-[0_0_18px_var(--ring)] transition-shadow duration-300">
          {/* Header section */}
          <div className="mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
              Projects & Portfolio
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Showcase your projects and development work
            </p>
          </div>

          {/* Add Project Form */}
          {/* Add Project Form */}
          <div className="mb-6">
            <Form form={form} layout="vertical" className="space-y-6">
              {/* Essential Project Info */}
              <div className="space-y-4">
                {/* Title + Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Project Title */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-foreground">
                      Project Title *
                    </label>
                    <div className="relative">
                      <FolderOpen
                        className="absolute left-3 top-3 w-5 h-5"
                        style={{ color: 'var(--primary)' }}
                        strokeWidth={1.5}
                      />
                      <Form.Item name="title" className="mb-0">
                        <input
                          className="w-full pl-9 pr-3 py-2 border border-input rounded-[var(--radius-sm)] text-foreground placeholder-muted-foreground text-sm"
                          placeholder="Enter project title"
                        />
                      </Form.Item>
                    </div>
                  </div>

                  {/* Project Status */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-foreground">
                      Project Status
                    </label>
                    <Form.Item
                      name="status"
                      initialValue={PROJECT_STATUSES[0].value}
                      className="mb-0"
                    >
                      <GlassDropdown
                        options={PROJECT_STATUSES}
                        value={projectStatus}
                        onChange={(v) => {
                          form.setFieldsValue({ status: v });
                          setProjectStatus(v as string);
                        }}
                        placeholder="Select status"
                        icon={Target}
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-foreground">
                    Description
                  </label>
                  <Form.Item name="description" className="mb-0">
                    <textarea
                      className="w-full p-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground min-h-[80px] text-sm"
                      placeholder="Describe your project..."
                    />
                  </Form.Item>
                </div>

                {/* Visibility, Difficulty, Hours */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-foreground">
                      Visibility
                    </label>
                    <Form.Item
                      name="visibility"
                      initialValue={PROJECT_VISIBILITY[0].value}
                      className="mb-0"
                    >
                      <GlassDropdown
                        options={PROJECT_VISIBILITY}
                        value={form.getFieldValue('visibility')}
                        onChange={(v) => form.setFieldsValue({ visibility: v })}
                        placeholder="Select visibility"
                        icon={Users}
                      />
                    </Form.Item>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-foreground">
                      Difficulty Level
                    </label>
                    <Form.Item name="difficultyLevel" className="mb-0">
                      <GlassDropdown
                        options={DIFFICULTY_LEVELS}
                        value={form.getFieldValue('difficultyLevel')}
                        onChange={(v) =>
                          form.setFieldsValue({ difficultyLevel: v })
                        }
                        placeholder="Select difficulty"
                        icon={Code}
                      />
                    </Form.Item>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-foreground">
                      Estimated Hours
                    </label>
                    <Form.Item name="estimatedHours" className="mb-0">
                      <input
                        type="number"
                        min="1"
                        className="w-full px-3 py-2 border border-input rounded-[var(--radius-sm)] text-foreground placeholder-muted-foreground text-sm"
                        placeholder="e.g., 40"
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Tech Stack + Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tech Stack */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Tech Stack
                    </label>
                    <Form.Item name="techStackRaw" className="mb-0">
                      <input
                        type="text"
                        placeholder="e.g., React,Node.js,Express"
                        className="w-full pl-9 pr-3 py-2 border border-input rounded-[var(--radius-sm)] text-foreground placeholder-muted-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent transition"
                      />
                    </Form.Item>
                  </div>
                  {/* Categories */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Categories
                    </label>
                    <Form.Item name="categoriesRaw" className="mb-0">
                      <input
                        type="text"
                        placeholder="e.g., Web App,Mobile,API"
                        className="w-full pl-9 pr-3 py-2 border border-input rounded-[var(--radius-sm)] text-foreground placeholder-muted-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent transition"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Project Links */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* GitHub + Live URL */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-foreground">
                      GitHub URL
                    </label>
                    <div className="relative">
                      <Github
                        className="absolute left-3 top-3 w-5 h-5"
                        style={{ color: 'var(--primary)' }}
                        strokeWidth={1.5}
                      />
                      <Form.Item name="githubUrl" className="mb-0">
                        <input
                          type="url"
                          className="w-full pl-9 pr-3 py-2 border border-input rounded-[var(--radius-sm)] text-foreground placeholder-muted-foreground text-sm"
                          placeholder="https://github.com/..."
                        />
                      </Form.Item>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-foreground">
                      Live URL
                    </label>
                    <div className="relative">
                      <Globe
                        className="absolute left-3 top-3 w-5 h-5"
                        style={{ color: 'var(--primary)' }}
                        strokeWidth={1.5}
                      />
                      <Form.Item name="liveUrl" className="mb-0">
                        <input
                          type="url"
                          className="w-full pl-9 pr-3 py-2 border border-input rounded-[var(--radius-sm)] text-foreground placeholder-muted-foreground text-sm"
                          placeholder="https://your-project.com"
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Design + Document URL */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-foreground">
                      Design URL
                    </label>
                    <div className="relative">
                      <Palette
                        className="absolute left-3 top-3 w-5 h-5"
                        style={{ color: 'var(--primary)' }}
                        strokeWidth={1.5}
                      />
                      <Form.Item name="designUrl" className="mb-0">
                        <input
                          type="url"
                          className="w-full pl-9 pr-3 py-2 border border-input rounded-[var(--radius-sm)] text-foreground placeholder-muted-foreground text-sm"
                          placeholder="Figma, Adobe XD, etc."
                        />
                      </Form.Item>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-foreground">
                      Document URL
                    </label>
                    <div className="relative">
                      <FileText
                        className="absolute left-3 top-3 w-5 h-5"
                        style={{ color: 'var(--primary)' }}
                        strokeWidth={1.5}
                      />
                      <Form.Item name="documentUrl" className="mb-0">
                        <input
                          type="url"
                          className="w-full pl-9 pr-3 py-2 border border-input rounded-[var(--radius-sm)] text-foreground placeholder-muted-foreground text-sm"
                          placeholder="Google Docs, Notion, etc."
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collaboration Section */}
              {projectStatus !== 'COMPLETED' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Max Collaborators + Timezone */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-foreground">
                        Max Collaborators
                      </label>
                      <Form.Item
                        name="maxCollaborators"
                        initialValue={5}
                        className="mb-0"
                      >
                        <input
                          type="number"
                          min="1"
                          max="20"
                          className="w-full px-3 py-2 border border-input rounded-[var(--radius-sm)] text-foreground placeholder-muted-foreground text-sm"
                        />
                      </Form.Item>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-foreground">
                        Preferred Timezone
                      </label>
                      <Form.Item name="preferredTimezone" className="mb-0">
                        <GlassDropdown
                          options={TIMEZONES.map((tz) => ({
                            value: tz,
                            label: tz,
                          }))}
                          value={form.getFieldValue('preferredTimezone')}
                          onChange={(v) =>
                            form.setFieldsValue({ preferredTimezone: v })
                          }
                          placeholder="Select timezone"
                          icon={Clock}
                        />
                      </Form.Item>
                    </div>
                  </div>

                  {/* Tags + Required Skills */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Tags
                    </label>
                    <Form.Item name="tagsRaw" className="mb-0">
                      <input
                        type="text"
                        placeholder="e.g., JavaScript,API,Open Source"
                        className="w-full pl-9 pr-3 py-2 border border-input rounded-[var(--radius-sm)] text-foreground placeholder-muted-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent transition"
                      />
                    </Form.Item>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Required Skills
                    </label>
                    <Form.Item name="requiredSkillsRaw" className="mb-0">
                      <input
                        type="text"
                        placeholder="e.g., React,TypeScript,Node"
                        className="w-full pl-9 pr-3 py-2 border border-input rounded-[var(--radius-sm)] text-foreground placeholder-muted-foreground text-sm focus:ring-2 focus:ring-ring focus:border-transparent transition"
                      />
                    </Form.Item>
                  </div>
                </div>
              )}
              {/* Thumbnail Upload */}
              <div className="space-y-4">
                {/* Thumbnail Upload */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-foreground">
                    Thumbnail Image
                  </label>
                  <Form.Item name="thumbnailUrl" className="mb-0">
                    <div className="relative flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        disabled={thumbnailUploading}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className="w-full text-white flex items-center justify-center px-4 py-2 bg-accent rounded-[var(--radius-sm)] cursor-pointer text-sm font-medium hover:bg-accent/80 transition border border-input"
                      >
                        {thumbnailUploading ? (
                          <LoadingOutlined className="mr-2" />
                        ) : (
                          <UploadOutlined className="mr-2" />
                        )}
                        {thumbnailUploading
                          ? 'Uploading...'
                          : 'Upload Thumbnail'}
                      </label>
                      {form.getFieldValue('thumbnailUrl') && (
                        <div className="relative mt-2 border border-input rounded-[var(--radius-sm)] bg-background/60 p-2 flex items-center justify-center w-full max-w-xs">
                          <img
                            src={form.getFieldValue('thumbnailUrl')}
                            alt="Thumbnail"
                            className="w-32 h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveThumbnail}
                            className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80"
                            title="Remove thumbnail"
                          >
                            <AntDeleteOutlined />
                          </button>
                        </div>
                      )}
                    </div>
                  </Form.Item>
                </div>

                {/* Images Upload */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-white">
                    Project Images
                  </label>
                  <Form.Item name="images" className="mb-0">
                    <div className="relative flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesUpload}
                        disabled={imagesUploading}
                        className="hidden"
                        id="images-upload"
                      />
                      <label
                        htmlFor="images-upload"
                        className="w-full text-white flex items-center justify-center px-4 py-2 bg-accent rounded-[var(--radius-sm)] cursor-pointer text-sm font-medium hover:bg-accent/80 transition border border-input"
                      >
                        {imagesUploading ? (
                          <LoadingOutlined className="mr-2" />
                        ) : (
                          <UploadOutlined className="mr-2" />
                        )}
                        {imagesUploading ? 'Uploading...' : 'Upload Images'}
                      </label>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {(form.getFieldValue('images') || []).map(
                          (url: string, idx: number) => (
                            <div
                              key={idx}
                              className="relative border border-input rounded-[var(--radius-sm)] bg-background/60 p-2"
                            >
                              <img
                                src={url}
                                alt={`Project image ${idx + 1}`}
                                className="w-20 h-16 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80"
                                title="Remove image"
                              >
                                <AntDeleteOutlined />
                              </button>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </Form.Item>
                </div>
              </div>

              {/* Recruitment Section */}
              {projectStatus !== 'COMPLETED' && (
                <div className="space-y-3 p-3 border border-border rounded-[var(--radius-sm)] bg-card/30">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h4 className="font-medium text-foreground text-sm">
                      Recruitment Settings
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Form.Item
                      name="isRecruiting"
                      valuePropName="checked"
                      className="mb-0"
                      style={{ marginBottom: 0 }}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary border-border rounded focus:ring-ring align-middle"
                      />
                    </Form.Item>
                    <label
                      className="text-sm text-foreground align-middle cursor-pointer"
                      htmlFor="isRecruiting"
                    >
                      This project is recruiting collaborators
                    </label>
                  </div>
                  <Form.Item name="recruitmentMsg" className="mb-0">
                    <textarea
                      className="w-full p-3 border border-input rounded-[var(--radius-sm)] focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground min-h-[80px] text-sm"
                      placeholder="Recruitment message for potential collaborators..."
                    />
                  </Form.Item>
                </div>
              )}

              {/* Add Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={addProject}
                  className="px-6 py-2 rounded-[var(--radius-sm)] bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors duration-200 shadow-[0_0_12px_var(--ring)] hover:shadow-[0_0_18px_var(--ring)] flex items-center space-x-2 text-sm"
                >
                  <PlusOutlined className="w-4 h-4" />
                  <span>Add Project</span>
                </button>
              </div>
            </Form>
          </div>

          {/* Projects List */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center">
              <Target
                className="w-5 h-5 mr-2"
                style={{ color: 'var(--primary)' }}
              />
              Your Projects ({value.length})
            </h3>

            {value.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-border rounded-[var(--radius)]">
                <FolderOpen className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-base">
                  No projects added yet
                </p>
                <p className="text-muted-foreground text-sm">
                  Start by adding your first project above
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
                            {item.title}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
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
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-background/50 rounded text-xs"
                                  >
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
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onPrev}
              className="px-4 py-2 rounded-[var(--radius-sm)] border border-border text-muted-foreground hover:bg-accent transition-colors duration-200 text-sm flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={onNext}
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
