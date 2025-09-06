type Skill = {
    id?: string;
    name: string;
    category?: string;
    proficiencyLevel?: number;
    isVerified?: boolean;
    yearsExperience?: number;
};

type Project = {
    id?: string;
    title: string;
    description?: string;
    shortDesc?: string;
    status?: string;
    visibility?: string;
    tech?: string[]; // If you use techStack, map it to tech in your component
    techStack?: string[];
    categories?: string[];
    tags?: string[];
    difficultyLevel?: string;
    githubUrl?: string;
    liveUrl?: string;
    thumbnailUrl?: string;
};

type Experience = {
    id?: string;
    title: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    responsibilities?: string;
};

type Education = {
    id?: string;
    institution: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
    description?: string;
};


type Achievement = {
    achievement: {
        name: string;
        description: string;
        icon: string;
        category: string;
        points: number;
    };
    unlockedAt: string;
};

type EventParticipation = {
    event: {
        id: string;
        title: string;
        type: string;
        startDate: string;
        endDate: string;
        location?: string;
        isVirtual: boolean;
    };
    status: string;
};

type CreatedEvent = {
    id: string;
    title: string;
    type: string;
    startDate: string;
    endDate: string;
    location?: string;
    isVirtual: boolean;
};

type ForumPost = {
    id: string;
    title: string;
    slug: string;
    createdAt: string;
};

type ForumReply = {
    id: string;
    postId: string;
    content: string;
    createdAt: string;
};

type ReceivedEndorsement = {
    skill: {
        name: string;
        category: string;
    };
    message?: string;
};

export type FullProfile = {
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
    skills?: Skill[];
    ownedProjects?: Project[];
    experiences?: Experience[];
    educations?: Education[];
    achievements?: Achievement[];
    eventParticipations?: EventParticipation[]; // <-- Add this
    createdEvents?: CreatedEvent[]; // <-- Add this
    forumPosts?: ForumPost[]; // <-- Add this
    forumReplies?: ForumReply[]; // <-- Add this
    receivedEndorsements?: ReceivedEndorsement[]; // <-- Add this
};