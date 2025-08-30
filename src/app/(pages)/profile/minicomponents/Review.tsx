import { Github, Globe, Linkedin, ArrowLeft, CheckCircle, Eye, Edit3, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import React from "react";
import { motion , easeOut} from "framer-motion";
import { BasicInfo, ProfileData, Education, Experience, Project, Skill } from "@/types/Review";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loader from "@/components/shared/Loader";

const fetchProfile = async (): Promise<ProfileData> => {
  const res = await fetch("/api/profile/user", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch profile data");
  // Adapt the response to ProfileData shape
  const user = await res.json();
  return {
    basic: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      avatar: user.profilePictureUrl,
      website: user.website,
      github: user.githubUrl,
      linkedin: user.linkedinUrl,
      profileVisibility: user.profileVisibility,
    },
    education: user.educations?.map((edu: any) => ({
      id: edu.id,
      institution: edu.institution,
      degree: edu.degree,
      field: edu.fieldOfStudy,
      startDate: edu.startDate,
      endDate: edu.endDate,
      description: edu.description,
      location: edu.location,
    })) ?? [],
    experience: user.experiences?.map((exp: any) => ({
      id: exp.id,
      company: exp.company,
      position: exp.title,
      startDate: exp.startDate,
      endDate: exp.endDate,
      description: exp.responsibilities,
      location: exp.location,
      type: exp.isCurrent ? "Current" : "Past",
    })) ?? [],
    projects: user.ownedProjects?.map((proj: any) => ({
      id: proj.id,
      name: proj.title,
      description: proj.description,
      technologies: proj.techStack ? proj.techStack.split(",") : [],
      link: proj.githubUrl,
      image: proj.thumbnailUrl,
      startDate: proj.startDate,
      endDate: proj.endDate,
    })) ?? [],
    skills: user.skills?.map((skill: any) => ({
      id: skill.id,
      name: skill.name,
      level: skill.proficiencyLevel?.toString(),
      category: skill.category,
    })) ?? [],
  };
};

const completeProfile = async () => {
  const res = await fetch("/api/profile/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to complete profile");
  return res.json();
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: easeOut }
  }
};

const cardHoverVariants = {
  hover: {
    y: -4,
    transition: { duration: 0.2, ease: easeOut }
  }
};

const Review = () => {
  const router = useRouter();

  const {
    data: profileData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["profile-review"],
    queryFn: fetchProfile,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation({
    mutationFn: completeProfile,
    onSuccess: () => {
      router.push("/profile/view");
    },
    onError: (err: any) => {
      alert("Error: " + (err instanceof Error ? err.message : "Failed to complete profile"));
    },
  });

  const handleCompleteProfile = () => {
    mutation.mutate();
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) return <Loader />;
  
  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-[60vh] flex items-center justify-center p-6"
      >
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Eye className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Failed to Load Profile</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Failed to fetch profile data"}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
  
  if (!profileData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-[60vh] flex items-center justify-center p-6"
      >
        <Card className="w-full max-w-md border-muted bg-muted/5">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mb-4">
              <Edit3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle>No Profile Data</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              No profile data found. Please create your profile first.
            </p>
            <Button 
              onClick={() => router.push('/profile/create')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const renderBasicInfo = (basic: BasicInfo) => (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 p-6 border-b border-border/20">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Avatar className="h-24 w-24 lg:h-32 lg:w-32 ring-4 ring-background shadow-xl">
                <AvatarImage
                  src={basic.avatar || '/default-avatar.png'}
                  alt={basic.displayName}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl lg:text-3xl">
                  {getInitials(basic.displayName)}
                </AvatarFallback>
              </Avatar>
              
              {/* Profile Visibility Badge */}
              <div className="absolute -bottom-2 -right-2 bg-accent text-accent-foreground rounded-full p-2 shadow-lg">
                <Eye className="w-3 h-3" />
              </div>
            </motion.div>

            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {basic.displayName}
              </h2>
              <p className="text-muted-foreground text-lg">{basic.email}</p>
              {basic.bio && (
                <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
                  {basic.bio}
                </p>
              )}
              
              <div className="flex items-center gap-3 mt-4 justify-center lg:justify-start">
                {basic.website && (
                  <Button variant="outline" size="sm" asChild className="border-border/50 hover:bg-accent/10">
                    <a href={basic.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Website
                    </a>
                  </Button>
                )}
                {basic.github && (
                  <Button variant="outline" size="sm" asChild className="border-border/50 hover:bg-accent/10">
                    <a href={basic.github} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
                {basic.linkedin && (
                  <Button variant="outline" size="sm" asChild className="border-border/50 hover:bg-accent/10">
                    <a href={basic.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const renderEducation = (education: Education[]) => (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-accent-foreground" />
            </div>
            Education
          </CardTitle>
        </CardHeader>
        <CardContent>
          {education.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No education information added yet
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {education.map((edu) => (
                <motion.div
                  key={edu.id}
                  variants={cardHoverVariants}
                  whileHover="hover"
                  className="p-4 rounded-xl bg-muted/20 border border-border/20 hover:border-accent/30 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Edit3 className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-lg">{edu.institution}</h3>
                      <p className="text-accent-foreground font-medium">{edu.degree}</p>
                      <p className="text-foreground">{edu.field}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {edu.startDate} - {edu.endDate || 'Present'}
                      </p>
                      {edu.description && (
                        <p className="mt-2 text-muted-foreground">{edu.description}</p>
                      )}
                      {edu.location && (
                        <p className="text-sm text-muted-foreground mt-2">{edu.location}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderExperience = (experience: Experience[]) => (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-primary" />
            </div>
            Professional Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          {experience.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No experience information added yet
            </div>
          ) : (
            <div className="space-y-4">
              {experience.map((exp) => (
                <motion.div
                  key={exp.id}
                  variants={cardHoverVariants}
                  whileHover="hover"
                  className="p-4 rounded-xl bg-muted/20 border border-border/20 hover:border-primary/30 transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Edit3 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{exp.company}</h3>
                        <p className="text-primary font-medium">{exp.position}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>{exp.location}</span>
                          <span>•</span>
                          <Badge variant={exp.type === "Current" ? "default" : "secondary"}>
                            {exp.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-nowrap">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </p>
                  </div>
                  {exp.description && (
                    <p className="mt-3 text-muted-foreground">{exp.description}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderProjects = (projects: Project[]) => (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-primary" />
            </div>
            Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No projects added yet
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  variants={cardHoverVariants}
                  whileHover="hover"
                  className="p-4 rounded-xl bg-muted/20 border border-border/20 hover:border-primary/30 transition-all duration-200"
                >
                  {project.image && (
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Edit3 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-lg mb-2">{project.name}</h3>
                      <p className="text-muted-foreground mb-3">{project.description}</p>
                      
                      {project.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.technologies.map((tech, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {project.link && (
                        <Button variant="outline" size="sm" asChild className="text-xs">
                          <a href={project.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Project
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderSkills = (skills: Skill[]) => (
    <motion.div variants={itemVariants}>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-accent-foreground" />
            </div>
            Skills & Expertise
          </CardTitle>
        </CardHeader>
        <CardContent>
          {skills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No skills added yet
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-full border border-border/30 hover:border-accent/30 transition-colors"
                >
                  <span className="font-medium text-foreground">{skill.name}</span>
                  {skill.level && (
                    <Badge variant="secondary" className="text-xs">
                      {skill.level}
                    </Badge>
                  )}
                  {skill.category && (
                    <Badge variant="outline" className="text-xs">
                      {skill.category}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Profile Review</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-4">
            Review Your Profile
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Take a final look at your profile before publishing. Make sure all information is accurate and complete.
          </p>
        </motion.div>

        {/* Profile Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Basic Information</h2>
            {renderBasicInfo(profileData.basic)}
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Education</h2>
            {renderEducation(profileData.education)}
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Experience</h2>
            {renderExperience(profileData.experience)}
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Projects</h2>
            {renderProjects(profileData.projects)}
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Skills</h2>
            {renderSkills(profileData.skills)}
          </section>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-col sm:flex-row justify-center gap-4 mt-12"
        >
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={mutation.isPending}
            className="border-border/50 hover:bg-accent/10 px-8 py-3 text-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          
          <Button
            onClick={handleCompleteProfile}
            disabled={mutation.isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold"
          >
            {mutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Complete Profile
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Review;