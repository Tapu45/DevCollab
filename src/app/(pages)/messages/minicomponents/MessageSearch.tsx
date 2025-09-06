'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, Calendar as CalendarIcon, X, MessageCircle, FileText, Image, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { debounce } from 'lodash';

interface SearchResult {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    displayName?: string;
    profilePictureUrl?: string;
  };
  chat: {
    id: string;
    name?: string;
    type: string;
    project?: {
      id: string;
      title: string;
    };
  };
  replyTo?: {
    id: string;
    content: string;
    sender: {
      id: string;
      username: string;
      displayName?: string;
    };
  };
  reactions: Array<{
    id: string;
    emoji: string;
    user: {
      id: string;
      username: string;
      displayName?: string;
    };
  }>;
}

interface MessageSearchProps {
  onMessageSelect?: (messageId: string, chatId: string) => void;
  defaultChatId?: string;
}

export default function MessageSearch({ onMessageSelect, defaultChatId }: MessageSearchProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [filters, setFilters] = useState({
    chatId: defaultChatId || '',
    type: 'all',
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
    senderId: ''
  });

  // Available chats for filter - Initialize as empty array
  const [availableChats, setAvailableChats] = useState<Array<{
    id: string;
    name?: string;
    type: string;
    project?: { id: string; title: string };
  }>>([]);

  useEffect(() => {
    fetchAvailableChats();
  }, []);

  const fetchAvailableChats = async () => {
    try {
      const response = await fetch('/api/messaging/chats');
      if (response.ok) {
        const chats = await response.json();
        // Ensure chats is an array before setting state
        setAvailableChats(Array.isArray(chats) ? chats : []);
      } else {
        console.error('Failed to fetch chats:', response.statusText);
        setAvailableChats([]);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setAvailableChats([]);
    }
  };

  // ...existing code...

  const performSearch = async (query: string, page = 1, resetResults = true) => {
    if (!query.trim()) {
      setSearchResults([]);
      setTotalCount(0);
      setHasMore(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: '20'
      });

      if (filters.chatId) params.append('chatId', filters.chatId);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
      if (filters.senderId) params.append('senderId', filters.senderId);

      const response = await fetch(`/api/messaging/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        
        if (resetResults) {
          setSearchResults(Array.isArray(data.messages) ? data.messages : []);
        } else {
          setSearchResults(prev => [...prev, ...(Array.isArray(data.messages) ? data.messages : [])]);
        }
        
        setTotalCount(data.totalCount || 0);
        setHasMore(data.hasMore || false);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error searching messages:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      performSearch(query, 1, true);
    }, 300),
    [filters]
  );

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
      setTotalCount(0);
      setHasMore(false);
    }
  }, [searchQuery, debouncedSearch]);

  // Re-search when filters change
  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery, 1, true);
    }
  }, [filters]);

  const loadMore = () => {
    if (hasMore && !loading) {
      performSearch(searchQuery, currentPage + 1, false);
    }
  };

  const clearFilters = () => {
    setFilters({
      chatId: '',
      type: 'all',
      dateFrom: null,
      dateTo: null,
      senderId: ''
    });
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'text':
        return <MessageCircle className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'file':
        return <Paperclip className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const highlightSearchText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getChatDisplayName = (chat: SearchResult['chat']) => {
    if (chat.name) return chat.name;
    if (chat.project) return chat.project.title;
    return chat.type === 'DIRECT' ? 'Direct Message' : 'Group Chat';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Search className="h-4 w-4 mr-2" />
          Search Messages
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Messages</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Chat Filter */}
            <Select
              value={filters.chatId}
              onValueChange={(value) => setFilters(prev => ({ ...prev, chatId: value }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All chats" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All chats</SelectItem>
                {Array.isArray(availableChats) && availableChats.map((chat) => (
                  <SelectItem key={chat.id} value={chat.id}>
                    {getChatDisplayName(chat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="file">Files</SelectItem>
                <SelectItem value="code">Code</SelectItem>
              </SelectContent>
            </Select>

            {/* Date From */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {filters.dateFrom ? format(filters.dateFrom, 'MMM dd') : 'From date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom || undefined}
                  onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date || null }))}
                />
              </PopoverContent>
            </Popover>

            {/* Date To */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {filters.dateTo ? format(filters.dateTo, 'MMM dd') : 'To date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateTo || undefined}
                  onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date || null }))}
                />
              </PopoverContent>
            </Popover>

            {/* Clear Filters */}
            {(filters.chatId || filters.type !== 'all' || filters.dateFrom || filters.dateTo || filters.senderId) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto">
            {searchQuery && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Searching...' : `Found ${totalCount} result(s) for "${searchQuery}"`}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {searchResults.map((message) => (
                <Card
                  key={message.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    onMessageSelect?.(message.id, message.chat.id);
                    setIsOpen(false);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={message.sender.profilePictureUrl || undefined} />
                        <AvatarFallback>
                          {message.sender.displayName?.[0] || message.sender.username[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {message.sender.displayName || message.sender.username}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {getChatDisplayName(message.chat)}
                          </Badge>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            {getMessageTypeIcon(message.type)}
                            <span className="text-xs">
                              {format(new Date(message.createdAt), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                        </div>

                        {message.replyTo && (
                          <div className="text-xs text-muted-foreground mb-1 pl-2 border-l-2 border-muted">
                            Replying to {message.replyTo.sender.displayName || message.replyTo.sender.username}:{' '}
                            {message.replyTo.content.substring(0, 50)}...
                          </div>
                        )}

                        <p className="text-sm">
                          {highlightSearchText(message.content, searchQuery)}
                        </p>

                        {message.reactions.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {message.reactions.map((reaction) => (
                              <Badge key={reaction.id} variant="outline" className="text-xs">
                                {reaction.emoji}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Load More */}
              {hasMore && (
                <div className="text-center py-4">
                  <Button variant="outline" onClick={loadMore} disabled={loading}>
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}

              {/* No Results */}
              {searchQuery && !loading && searchResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No messages found</p>
                  <p className="text-sm">Try adjusting your search terms or filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}