'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Plus, Settings, MessageCircle, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface GroupChat {
  id: string;
  name: string;
  description?: string;
  type: string;
  projectId?: string;
  participants: {
    id: string;
    userId: string;
    isAdmin: boolean;
    user: {
      id: string;
      username: string;
      displayName?: string;
      profilePictureUrl?: string;
    };
  }[];
  project?: {
    id: string;
    title: string;
  };
  _count: {
    messages: number;
  };
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  collaborators: {
    userId: string;
    user: {
      id: string;
      username: string;
      displayName?: string;
      profilePictureUrl?: string;
    };
  }[];
}

interface GroupChatManagerProps {
  onChatSelect: (chatId: string) => void;
  selectedChatId?: string;
  onGroupCreated?: () => void; // Add this new prop
}

export default function GroupChatManager({ onChatSelect, selectedChatId }: GroupChatManagerProps) {
  const { user, isLoaded } = useUser();
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Create group form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectId: '',
    selectedParticipants: [] as string[],
    isPublic: false
  });

  useEffect(() => {
    fetchGroupChats();
    fetchUserProjects();
  }, []);

  const fetchGroupChats = async () => {
    try {
      const response = await fetch('/api/messaging/group');
      if (response.ok) {
        const chats = await response.json();
        setGroupChats(chats);
      }
    } catch (error) {
      console.error('Error fetching group chats:', error);
      toast.error('Failed to load group chats');
    }
  };

  const fetchUserProjects = async () => {
    try {
      const response = await fetch('/api/profile/projects');
      if (response.ok) {
        const userProjects = await response.json();
        setProjects(userProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const createGroupChat = async () => {
    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/messaging/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          projectId: formData.projectId || null,
          participantIds: formData.selectedParticipants,
          isPublic: formData.isPublic
        })
      });

      if (response.ok) {
        const newChat = await response.json();
        setGroupChats(prev => [newChat, ...prev]);
        setIsCreateDialogOpen(false);
        setFormData({
          name: '',
          description: '',
          projectId: '',
          selectedParticipants: [],
          isPublic: false
        });
        toast.success('Group chat created successfully');
        onChatSelect(newChat.id);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create group chat');
      }
    } catch (error) {
      console.error('Error creating group chat:', error);
      toast.error('Failed to create group chat');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedProject = () => {
    return projects.find(p => p.id === formData.projectId);
  };

  const toggleParticipant = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedParticipants: prev.selectedParticipants.includes(userId)
        ? prev.selectedParticipants.filter(id => id !== userId)
        : [...prev.selectedParticipants, userId]
    }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="font-semibold">Group Chats</h3>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Group Chat</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Group Name */}
              <div>
                <label className="text-sm font-medium mb-2 block">Group Name</label>
                <Input
                  placeholder="Enter group name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                <Textarea
                  placeholder="What's this group about?"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* Project Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Link to Project (Optional)</label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Participants Selection */}
              {formData.projectId && getSelectedProject() && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Add Participants</label>
                  <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                    {getSelectedProject()?.collaborators.map((collaborator) => (
                      <div key={collaborator.userId} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.selectedParticipants.includes(collaborator.userId)}
                          onCheckedChange={() => toggleParticipant(collaborator.userId)}
                        />
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={collaborator.user.profilePictureUrl || undefined} />
                          <AvatarFallback className="text-xs">
                            {collaborator.user.displayName?.[0] || collaborator.user.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {collaborator.user.displayName || collaborator.user.username}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: !!checked }))}
                />
                <label className="text-sm">Make this group public (anyone can join with invite link)</label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createGroupChat} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Group Chats List */}
      <div className="space-y-2">
        {groupChats.map((chat) => (
          <Card
            key={chat.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedChatId === chat.id ? 'bg-muted border-primary' : ''
            }`}
            onClick={() => onChatSelect(chat.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{chat.name}</h4>
                    {chat.project && (
                      <Badge variant="secondary" className="text-xs">
                        {chat.project.title}
                      </Badge>
                    )}
                  </div>
                  
                  {chat.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                      {chat.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {chat.participants.length} members
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {chat._count.messages} recent messages
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(chat.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Participants Preview */}
                <div className="flex -space-x-1 ml-2">
                  {chat.participants.slice(0, 3).map((participant) => (
                    <Avatar key={participant.id} className="h-6 w-6 border-2 border-background">
                      <AvatarImage src={participant.user.profilePictureUrl || undefined} />
                      <AvatarFallback className="text-xs">
                        {participant.user.displayName?.[0] || participant.user.username[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {chat.participants.length > 3 && (
                    <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-xs">+{chat.participants.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {groupChats.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No group chats yet</p>
            <p className="text-xs">Create your first group chat to collaborate with your team</p>
          </div>
        )}
      </div>
    </div>
  );
}