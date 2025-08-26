'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button, Space, Typography, Spin } from 'antd';
import { PlusCircle as PlusOutlined, EyeClosed as CloseOutlined, Sparkles, Rocket, Target, Zap } from 'lucide-react';
import CreateForm from './CreateForm';
import ProfileView from './View';

const { Title, Paragraph } = Typography;

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null); // null = unknown
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function checkProfile() {
      setLoading(true);
      try {
        const res = await fetch('/api/profile/exists');
        if (!mounted) return;
        if (res.status === 401) {
          setHasProfile(false);
        } else if (res.ok) {
          const data = await res.json();
          setHasProfile(!!data.exists);
        } else {
          setHasProfile(false);
        }
      } catch (err) {
        console.error('profile check failed', err);
        setHasProfile(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkProfile();
    return () => { mounted = false; };
  }, []);

  if (loading || hasProfile === null) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-120px)] bg-[var(--color-background)]">
        <Spin size="large" />
      </div>
    );
  }

  // If user opted to open the wizard, show it inline
  if (showCreate) {
   return (
    <div className="max-w-6xl mx-auto bg-[var(--background)] rounded-xl shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <Button 
          onClick={() => setShowCreate(false)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <CloseOutlined />
          Back to overview
        </Button>
      </div>
      <CreateForm />
    </div>
   );
  }

  // No profile -> show enhanced empty state with CTA
  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">New Profile Opportunity</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent-foreground bg-clip-text text-transparent mb-4 leading-tight">
              Build Your Developer
              <br />
              <span className="relative text-blue-600">
                Empire
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"></div>
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
              Great things take time to build, but <span className="font-semibold text-foreground">legendary profiles</span> take time to craft. 
              <br />
              <span className="text-base text-muted-foreground/80 mt-2 block">
                Rome wasn't built in a day, but your GitHub profile can be! 🚀
              </span>
            </p>
          </div>

          {/* Main CTA Card */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              
              {/* Main card */}
              <div className="relative backdrop-blur-xl bg-card/60 border border-border/50 rounded-2xl p-6 md:p-8 shadow-2xl">
                <div className="grid lg:grid-cols-2 gap-6 items-center">
                  {/* Left side - Content */}
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                        Ready to become
                        <br />
                        <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                          discoverable?
                        </span>
                      </h2>
                      
                      <p className="text-base text-muted-foreground leading-relaxed">
                        Your profile is your digital handshake. Make it count with skills that speak louder than words, 
                        projects that tell stories, and experience that opens doors.
                      </p>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span className="text-muted-foreground">AI-powered skill matching</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span className="text-muted-foreground">Collaborator discovery</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span className="text-muted-foreground">Project opportunities</span>
                      </div>
                    </div>

                    {/* Humorous line */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30">
                      <p className="text-xs text-foreground font-medium text-center">
                        💡 <span className="italic">"The best time to create a profile was yesterday. The second best time is now. 
                        The third best time is after you finish this coffee."</span> ☕
                      </p>
                    </div>
                  </div>

                  {/* Right side - Visual & CTA */}
                  <div className="space-y-4">
                    {/* Animated illustration */}
                    <div className="relative h-48 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl"></div>
                      <div className="relative z-10 text-center">
                        <div className="w-20 h-20 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl">
                          <Rocket className="w-10 h-10 text-white" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="w-12 h-1.5 bg-gradient-to-r from-primary to-accent rounded-full mx-auto animate-pulse"></div>
                          <div className="w-8 h-1.5 bg-gradient-to-r from-accent to-primary rounded-full mx-auto animate-pulse delay-100"></div>
                        </div>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowCreate(true)}
                        className="w-full group relative px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-bold text-base rounded-xl shadow-xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <Zap className="w-4 h-4" />
                          Launch Profile Creation
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                      
                      <button
                        onClick={() => window.location.assign('/dashboard')}
                        className="w-full px-6 py-2.5 border-2 border-border text-muted-foreground font-medium rounded-xl hover:border-primary/50 hover:text-foreground transition-all duration-300 text-sm"
                      >
                        Maybe later (I'm still contemplating life choices)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom section with fun fact */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
              <Target className="w-4 h-4 text-accent" />
              <div className="text-xs">
                <span className="font-medium text-foreground">Pro tip:</span>
                <span className="text-muted-foreground ml-2">
                  Profiles with 3+ skills get discovered 5x faster. It's like SEO for developers! ��
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile exists -> render professional view
  return <ProfileView />;
}