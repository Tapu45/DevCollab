'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Search, 
  UserPlus, 
  Users, 
  Hash, 
  ArrowLeft,
  MessageCircle,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Types
interface User {
  id: string;
  username: string;
  displayName?: string;
  profilePictureUrl?: string;
  headline?: string;
  isOnline: boolean;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  owner: {
    id: string;
    username: string;
    displayName?: string;
  };
}

// API Functions
const fetchConnections = async (): Promise<User[]> => {
  const response = await fetch('/api/connections/connect?action=accepted');
  if (!response.ok) throw new Error('Failed to fetch connections');
  const data = await response.json();
  return data.accepted || [];
};

const fetchProjects = async (): Promise<Project[]> => {
  const response = await fetch('/api/projects/my-projects');
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
};



export default function NewMessagePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [activeTab, setActiveTab] = useState('direct');
  
  const router = useRouter();
  const queryClient = useQueryClient();

  const { user } = useAuth();

const createDirectChat = async (userId: string) => {
  const response = await fetch('/api/messaging/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      type: 'DIRECT', 
      participantIds: [userId]  // Only the other user (exclude current user)
    }),
  });
  if (!response.ok) throw new Error('Failed to create chat');
  return response.json();
};

const createGroupChat = async (name: string, participantIds: string[]) => {
  const response = await fetch('/api/messaging/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      type: 'GROUP', 
      name, 
      participantIds  // Selected users (exclude current user)
    }),
  });
  if (!response.ok) throw new Error('Failed to create group chat');
  return response.json();
};

const createProjectChat = async (projectId: string) => {
  const response = await fetch('/api/messaging/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      type: 'PROJECT', 
      projectId, 
      participantIds: []  // Empty (service can fetch from project)
    }),
  });
  if (!response.ok) throw new Error('Failed to create project chat');
  return response.json();
};

  // Queries
  const { data: connections = [], isLoading: loadingConnections } = useQuery({
    queryKey: ['connections', 'accepted'],
    queryFn: fetchConnections,
  });

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects', 'my-projects'],
    queryFn: fetchProjects,
  });

  // Mutations
  const createDirectChatMutation = useMutation({
  mutationFn: createDirectChat,
  onSuccess: (data) => {
    // Map chat.id to chatId for consistency
    const chatId = data.chatId || data.chat?.id;
   router.push(`/messages/${chatId}`);
    toast.success('Chat created successfully');
  },
  onError: (error) => {
    toast.error(error.message || 'Failed to create chat');
  },
});

const createGroupChatMutation = useMutation({
  mutationFn: ({ name, participantIds }: { name: string; participantIds: string[] }) =>
    createGroupChat(name, participantIds),
  onSuccess: (data) => {
    const chatId = data.chatId || data.chat?.id;
    router.push(`/messages?chat=${chatId}`);
    toast.success('Group chat created successfully');
  },
  onError: (error) => {
    toast.error(error.message || 'Failed to create group chat');
  },
});

const createProjectChatMutation = useMutation({
  mutationFn: createProjectChat,
  onSuccess: (data) => {
    const chatId = data.chatId || data.chat?.id;
    router.push(`/messages?chat=${chatId}`);
    toast.success('Project chat created successfully');
  },
  onError: (error) => {
    toast.error(error.message || 'Failed to create project chat');
  },
});

  // Handlers
  const handleUserSelect = (userId: string) => {
    if (activeTab === 'direct') {
      createDirectChatMutation.mutate(userId);
    } else {
      setSelectedUsers(prev =>
        prev.includes(userId)
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      toast.error('Please enter a group name and select participants');
      return;
    }
    createGroupChatMutation.mutate({ name: groupName.trim(), participantIds: selectedUsers });
  };

  const handleProjectSelect = (projectId: string) => {
    createProjectChatMutation.mutate(projectId);
  };

  const filteredConnections = connections.filter(user =>
  (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
  (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
);

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            New Message
          </h1>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Start a Conversation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="direct" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Direct Message
                </TabsTrigger>
                <TabsTrigger value="group" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Group Chat
                </TabsTrigger>
                <TabsTrigger value="project" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Project Chat
                </TabsTrigger>
              </TabsList>

              <TabsContent value="direct" className="mt-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search connections..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="space-y-2">
                    {loadingConnections ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      filteredConnections.map((user) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => handleUserSelect(user.id)}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profilePictureUrl || ''} alt={user.displayName || user.username} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {user.displayName?.charAt(0) || user.username.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground">
                              {user.displayName || user.username}
                            </h3>
                            {user.headline && (
                              <p className="text-sm text-muted-foreground">{user.headline}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {user.isOnline && (
                              <Badge variant="secondary" className="text-xs">
                                Online
                              </Badge>
                            )}
                            <Button size="sm" variant="outline">
                              Message
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="group" className="mt-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Group Name
                    </label>
                    <Input
                      placeholder="Enter group name..."
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search connections..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {selectedUsers.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-muted-foreground">Selected:</span>
                      {selectedUsers.map((userId) => {
                        const user = connections.find(u => u.id === userId);
                        return (
                          <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                            {user?.displayName || user?.username}
                            <button
                              onClick={() => setSelectedUsers(prev => prev.filter(id => id !== userId))}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  <div className="space-y-2">
                    {filteredConnections.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedUsers.includes(user.id) ? 'bg-primary/10 border border-primary' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleUserSelect(user.id)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profilePictureUrl || ''} alt={user.displayName || user.username} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.displayName?.charAt(0) || user.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">
                            {user.displayName || user.username}
                          </h3>
                          {user.headline && (
                            <p className="text-sm text-muted-foreground">{user.headline}</p>
                          )}
                        </div>
                        {selectedUsers.includes(user.id) && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    onClick={handleCreateGroup}
                    disabled={!groupName.trim() || selectedUsers.length === 0 || createGroupChatMutation.isPending}
                    className="w-full"
                  >
                    Create Group Chat
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="project" className="mt-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="space-y-2">
                    {loadingProjects ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      filteredProjects.map((project) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => handleProjectSelect(project.id)}
                        >
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            {project.thumbnailUrl ? (
                              <img
                                src={project.thumbnailUrl}
                                alt={project.title}
                                className="h-full w-full rounded-lg object-cover"
                              />
                            ) : (
                              <Hash className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground">{project.title}</h3>
                            {project.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {project.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              by {project.owner.displayName || project.owner.username}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            Create Chat
                          </Button>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}