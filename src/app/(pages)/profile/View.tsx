// ...existing code...
'use client';

import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Avatar,
  Button,
  Tag,
  List,
  Timeline,
  Divider,
  Spin,
  Space,
  Typography,
  Progress,
} from 'antd';
import {
  EditOutlined,
  ShareAltOutlined,
  MailOutlined,
  GlobalOutlined,
  GithubOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Paragraph, Text } = Typography;

type UserProfile = {
  id?: string;
  displayName?: string;
  headline?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  website?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  avatarUrl?: string;
  availability?: string;
};

type Skill = { id?: string; name: string; category?: string; proficiencyLevel?: number };
type Project = { id?: string; title: string; githubUrl?: string; shortDesc?: string; tech?: string[] };
type Experience = { id?: string; title: string; company: string; startDate?: string; endDate?: string; isCurrent?: boolean; responsibilities?: string };
type Education = { id?: string; institution: string; degree?: string; fieldOfStudy?: string; startDate?: string; endDate?: string; grade?: string; description?: string };

export default function ProfileView() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // parallel requests to your profile APIs
        const [uRes, sRes, pRes, eRes, edRes] = await Promise.all([
          fetch('/api/profile/user'),
          fetch('/api/profile/skills'),
          fetch('/api/profile/projects'),
          fetch('/api/profile/experience'),
          fetch('/api/profile/education'),
        ]);

        // handle unauthorized / empty profile
        if (uRes.status === 401) {
          setUser(null);
        } else {
          const u = await uRes.json();
          setUser(u || null);
        }

        const s = sRes.ok ? await sRes.json() : [];
        const p = pRes.ok ? await pRes.json() : [];
        const ex = eRes.ok ? await eRes.json() : [];
        const ed = edRes.ok ? await edRes.json() : [];

        setSkills(Array.isArray(s) ? s : []);
        setProjects(Array.isArray(p) ? p : []);
        // ensure timeline order newest first
        setExperiences(Array.isArray(ex) ? ex.sort((a: Experience, b: Experience) => (b.startDate || '').localeCompare(a.startDate || '')) : []);
        setEducations(Array.isArray(ed) ? ed.sort((a: Education, b: Education) => (b.startDate || '').localeCompare(a.startDate || '')) : []);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  // if no profile (empty state)
  if (!user || (!user.displayName && skills.length === 0 && projects.length === 0 && experiences.length === 0 && educations.length === 0)) {
    return (
      <div style={{ maxWidth: 880, margin: '32px auto', padding: 24 }}>
        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%', textAlign: 'center' }}>
            <Title level={3}>Create your profile</Title>
            <Paragraph>
              You don't have a profile yet. Create a professional profile to get AI recommendations and collaborator matches.
            </Paragraph>
            <Space>
              <Button type="primary" onClick={() => router.push('/profile/create')}>Create profile</Button>
              <Button onClick={() => router.push('/dashboard')}>Go to dashboard</Button>
            </Space>
            <Divider />
            <Paragraph type="secondary">Tip: import from GitHub / LinkedIn or add basic info, 3 skills and one project to enable matching.</Paragraph>
          </Space>
        </Card>
      </div>
    );
  }

  const topSkills = skills.slice(0, 8);
  const projectsCount = projects.length;
  const collaborations = user?.id ? '-' : '-';

  function formatDate(d?: string) {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d.slice(0, 10);
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '24px auto', padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" gutter={16}>
          <Col>
            <Avatar size={96} src={user?.avatarUrl} style={{ backgroundColor: '#f0f2f5' }}>
              {user?.displayName ? user.displayName.split(' ').map((s: string) => s[0]).slice(0,2).join('') : '?'}
            </Avatar>
          </Col>

          <Col flex="auto">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <div>
                <Title level={4} style={{ margin: 0 }}>{user?.displayName || '—'}</Title>
                {user?.headline && <Text type="secondary">{user.headline}</Text>}
                <div style={{ marginTop: 8 }}>
                  {user?.location && <Text style={{ marginRight: 12 }}><i>{user.location}</i></Text>}
                  {user?.timezone && <Text type="secondary">{user.timezone}</Text>}
                </div>
              </div>

              <div>
                <Space>
                  <Button icon={<ShareAltOutlined />}>Share</Button>
                  <Button icon={<EditOutlined />} onClick={() => router.push('/profile/create')}>Edit</Button>
                </Space>
              </div>
            </div>

            {user?.bio && <Paragraph style={{ marginTop: 12 }}>{user.bio}</Paragraph>}

            <div style={{ marginTop: 8 }}>
              <Space size="small">
                {user?.githubUrl && <Button type="text" icon={<GithubOutlined />} href={user.githubUrl} target="_blank">GitHub</Button>}
                {user?.linkedinUrl && <Button type="text" icon={<LinkedinOutlined />} href={user.linkedinUrl} target="_blank">LinkedIn</Button>}
                {user?.website && <Button type="text" icon={<GlobalOutlined />} href={user.website} target="_blank">Website</Button>}
                <Button type="text" icon={<MailOutlined />}>Contact</Button>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="Summary" style={{ marginBottom: 16 }}>
            <Paragraph>
              {user?.bio || 'No summary provided.'}
            </Paragraph>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" title="Projects">
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>{projectsCount}</Text>
                  <Paragraph type="secondary">Public projects linked to your profile</Paragraph>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Match / Activity">
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>—</Text>
                  <Paragraph type="secondary">Match score & recent activity</Paragraph>
                </Card>
              </Col>
            </Row>
          </Card>

          <Card title="Experience" style={{ marginBottom: 16 }}>
            {experiences.length === 0 ? (
              <Paragraph type="secondary">No experience added yet</Paragraph>
            ) : (
              <Timeline>
                {experiences.map((ex) => (
                  <Timeline.Item key={ex.id || `${ex.title}-${ex.company}`}>
                    <div style={{ fontWeight: 600 }}>{ex.title} — <Text type="secondary">{ex.company}</Text></div>
                    <div style={{ fontSize: 12, color: '#666' }}>{formatDate(ex.startDate)} — {ex.isCurrent ? 'Present' : formatDate(ex.endDate)}</div>
                    {ex.responsibilities && <div style={{ marginTop: 6 }}>{ex.responsibilities}</div>}
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
          </Card>

          <Card title="Projects" style={{ marginBottom: 16 }}>
            {projects.length === 0 ? (
              <Paragraph type="secondary">No projects added yet</Paragraph>
            ) : (
              <List
                grid={{ gutter: 16, column: 2 }}
                dataSource={projects}
                renderItem={(p) => (
                  <List.Item key={p.id || p.title}>
                    <Card
                      size="small"
                      title={p.title}
                      extra={p.githubUrl ? <a href={p.githubUrl} target="_blank" rel="noreferrer">Repo</a> : null}
                    >
                      <Paragraph ellipsis={{ rows: 3 }}>{p.shortDesc}</Paragraph>
                      {p.tech && (
                        <div style={{ marginTop: 8 }}>
                          {p.tech.map((t) => <Tag key={t}>{t}</Tag>)}
                        </div>
                      )}
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </Card>

          <Card title="Education" style={{ marginBottom: 16 }}>
            {educations.length === 0 ? (
              <Paragraph type="secondary">No education entries yet</Paragraph>
            ) : (
              <Timeline>
                {educations.map((ed) => (
                  <Timeline.Item key={ed.id || ed.institution}>
                    <div style={{ fontWeight: 600 }}>{ed.institution} {ed.degree ? `— ${ed.degree}` : ''}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{formatDate(ed.startDate)} — {formatDate(ed.endDate)}</div>
                    {ed.description && <div style={{ marginTop: 6 }}>{ed.description}</div>}
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Skills & Proficiency" style={{ marginBottom: 16 }}>
            {skills.length === 0 ? (
              <Paragraph type="secondary">No skills added</Paragraph>
            ) : (
              <div>
                {topSkills.map((s) => (
                  <div key={s.id || s.name} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>{s.name}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{s.category}</Text>
                    </div>
                    <Progress percent={(s.proficiencyLevel ? (s.proficiencyLevel / 5) * 100 : 0)} size="small" />
                  </div>
                ))}

                {skills.length > topSkills.length && <div style={{ marginTop: 8 }}><Text type="secondary">And {skills.length - topSkills.length} more</Text></div>}
              </div>
            )}
          </Card>

          <Card title="Contact & Availability" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {user?.availability && <Text><strong>Availability:</strong> {user.availability}</Text>}
              <div>
                {user?.githubUrl && <Button type="link" icon={<GithubOutlined />} href={user.githubUrl} target="_blank">GitHub</Button>}
                {user?.linkedinUrl && <Button type="link" icon={<LinkedinOutlined />} href={user.linkedinUrl} target="_blank">LinkedIn</Button>}
                {user?.website && <Button type="link" icon={<GlobalOutlined />} href={user.website} target="_blank">Website</Button>}
              </div>
            </div>
          </Card>

          <Card title="Profile stats" size="small">
            <List size="small">
              <List.Item>
                <Text>Projects</Text>
                <Text strong>{projectsCount}</Text>
              </List.Item>
              <List.Item>
                <Text>Connections</Text>
                <Text strong>{collaborations}</Text>
              </List.Item>
              <List.Item>
                <Text>Profile completeness</Text>
                <Progress percent={Math.min(100, Math.round(( (skills.length>0?1:0) + (projects.length>0?1:0) + (experiences.length>0?1:0) + (educations.length>0?1:0) + (user?.bio?1:0) ) / 5 * 100 ))} size="small" />
              </List.Item>
            </List>
          </Card>
        </Col>
      </Row>
    </div>
  );
}