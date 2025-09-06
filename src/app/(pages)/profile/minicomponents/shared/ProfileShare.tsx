import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
} from 'react-share';

interface ProfileShareProps {
  profileUrl?: string; // Optional, defaults to current URL
  title?: string; // Optional, for share message
}

export function ProfileShare({
  profileUrl = window.location.href,
  title = 'Check out my profile!',
}: ProfileShareProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-border/50 hover:bg-accent/10 px-2 py-1"
        >
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-500" />
              Link Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <TwitterShareButton url={profileUrl} title={title}>
            <TwitterIcon size={20} className="mr-2 rounded" />
            Share on Twitter
          </TwitterShareButton>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <LinkedinShareButton url={profileUrl} title={title}>
            <LinkedinIcon size={20} className="mr-2 rounded" />
            Share on LinkedIn
          </LinkedinShareButton>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <WhatsappShareButton url={profileUrl} title={title}>
            <WhatsappIcon size={20} className="mr-2 rounded" />
            Share on WhatsApp
          </WhatsappShareButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
