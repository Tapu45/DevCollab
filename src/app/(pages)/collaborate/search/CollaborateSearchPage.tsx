'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion, easeOut } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, MapPin, Search } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: easeOut },
  },
};

export default function CollaborateSearchPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get('q') || '');
  const [skills, setSkills] = useState<string[]>(
    sp.get('skills')?.split(',').filter(Boolean) || [],
  );
  const [location, setLocation] = useState(sp.get('location') || '');
  const [hasProjects, setHasProjects] = useState<string>(
    sp.get('hasProjects') || '',
  );
  const [educationDegree, setEducationDegree] = useState(
    sp.get('educationDegree') || '',
  );
  const [page, setPage] = useState(parseInt(sp.get('page') || '1', 10));
  const [limit, setLimit] = useState(12);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ total: number; users: any[] }>({
    total: 0,
    users: [],
  });

  // Reset to first page when filters change (not when page itself changes)
  useEffect(() => {
    setPage(1);
  }, [q, skills, location, hasProjects, educationDegree]);

  const query = useMemo(() => {
    const usp = new URLSearchParams();
    if (q) usp.set('q', q);
    if (skills.length) usp.set('skills', skills.join(','));
    if (location) usp.set('location', location);
    if (hasProjects) usp.set('hasProjects', hasProjects);
    if (educationDegree) usp.set('educationDegree', educationDegree);
    usp.set('page', String(page));
    usp.set('limit', String(limit));
    return usp.toString();
  }, [q, skills, location, hasProjects, educationDegree, page, limit]);

  // Debounce: fetch and update the URL after user stops typing/changing filters
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query);
      router.replace(`/collaborate/search?${query}`, { scroll: false });
    }, 450);
    return () => clearTimeout(t);
  }, [query, router]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/users?${debouncedQuery}`);
        const json = await res.json();
        setData({ total: json.total || 0, users: json.users || [] });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [debouncedQuery]);

  const onReset = () => {
    setQ('');
    setSkills([]);
    setLocation('');
    setHasProjects('');
    setEducationDegree('');
    setPage(1);
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{
        background:
          'linear-gradient(135deg, var(--color-background), color-mix(in oklab, var(--color-background) 90%, var(--color-primary) 10%))',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header with filters - slightly reduced size and cleaner styling */}
        {/* Header with filters - refined styling */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl border mb-6"
          style={{
            borderColor:
              'color-mix(in oklab, var(--color-border) 80%, transparent)',
            background:
              'radial-gradient(1200px 320px at 15% -50%, color-mix(in oklab, var(--color-primary) 16%, transparent) 0%, transparent 60%), radial-gradient(900px 260px at 85% -10%, color-mix(in oklab, var(--color-accent) 14%, transparent) 0%, transparent 55%), linear-gradient(0deg, color-mix(in oklab, var(--color-card) 94%, transparent), color-mix(in oklab, var(--color-card) 94%, transparent))',
            boxShadow:
              '0 8px 24px -12px color-mix(in oklab, var(--color-primary) 20%, transparent), inset 0 1px 0 color-mix(in oklab, var(--color-foreground) 6%, transparent)',
          }}
        >
          <div className="relative p-5 md:p-6">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                maskImage:
                  'radial-gradient(60% 40% at 10% 0%, black, transparent 70%)',
              }}
            />
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-xl"
                style={{
                  backgroundColor:
                    'color-mix(in oklab, var(--color-primary) 18%, transparent)',
                }}
              >
                <Sparkles
                  className="w-5 h-5"
                  style={{ color: 'var(--color-primary)' }}
                />
              </div>
              <div className="flex-1">
                <h1
                  className="text-[20px] md:text-[24px] font-bold leading-tight"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, var(--color-foreground), var(--color-muted-foreground))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Find Developers
                </h1>
                <p
                  className="text-[12px] md:text-[13px] mt-1"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  Search across skills, experience, education, and projects
                </p>

                {/* Filters - single row, compact */}
                <div className="mt-4 overflow-x-auto">
                  <div className="flex items-stretch gap-2.5 min-w-full whitespace-nowrap pr-1">
                    <div
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border"
                      style={{
                        backgroundColor: 'var(--color-input)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <Search
                        size={16}
                        style={{ color: 'var(--color-muted-foreground)' }}
                      />
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm"
                        style={{ color: 'var(--color-foreground)' }}
                        placeholder="Search people, roles, tech..."
                      />
                    </div>

                    <input
                      className="px-3.5 py-2.5 rounded-xl border text-sm"
                      style={{
                        backgroundColor: 'var(--color-input)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-foreground)',
                      }}
                      placeholder="Skills (comma separated)"
                      value={skills.join(',')}
                      onChange={(e) =>
                        setSkills(
                          e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        )
                      }
                    />

                    <div
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border"
                      style={{
                        backgroundColor: 'var(--color-input)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <MapPin
                        size={16}
                        style={{ color: 'var(--color-muted-foreground)' }}
                      />
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm"
                        style={{ color: 'var(--color-foreground)' }}
                        placeholder="Location"
                      />
                    </div>

                    <input
                      className="px-3.5 py-2.5 rounded-xl border text-sm"
                      style={{
                        backgroundColor: 'var(--color-input)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-foreground)',
                      }}
                      placeholder="Education degree (e.g., B.Tech, M.Sc)"
                      value={educationDegree}
                      onChange={(e) => setEducationDegree(e.target.value)}
                    />
                  </div>
                </div>

                {/* Meta row */}
                <div
                  className="mt-3 text-xs"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  {loading ? 'Searching…' : `Found ${data.total} users`}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {data.users.map((u) => {
            return (
              <motion.div key={u.id} variants={itemVariants}>
                <Card className="h-full border border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0">
                          <div
                            className="w-16 h-16 rounded-full overflow-hidden"
                            style={{
                              backgroundColor: 'var(--color-muted)',
                              border: '2px solid var(--color-border)',
                            }}
                          >
                            <img
                              src={u.profilePictureUrl || '/logo.png'}
                              alt={
                                u.displayName || u.username || 'Profile photo'
                              }
                              className="w-full h-full object-cover"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3
                              className="font-semibold text-base truncate"
                              style={{ color: 'var(--color-foreground)' }}
                            >
                              {u.displayName || u.username}
                            </h3>
                          </div>

                          {u.location && (
                            <div
                              className="flex items-center gap-1 text-xs mt-1"
                              style={{ color: 'var(--color-muted-foreground)' }}
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate">{u.location}</span>
                            </div>
                          )}

                          {u.bio && (
                            <p
                              className="text-sm mt-3 line-clamp-3"
                              style={{ color: 'var(--color-muted-foreground)' }}
                            >
                              {u.bio}
                            </p>
                          )}

                          <div className="mt-4">
                            <Button
                              className="w-full justify-center"
                              onClick={() => router.push(`/profile/${u.id}`)}
                              style={{
                                backgroundColor: 'var(--color-primary)',
                                color: 'var(--color-primary-foreground)',
                              }}
                            >
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Load more */}
        {data.total > page * limit && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              className="px-6"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-card-foreground)',
              }}
            >
              Load more
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
