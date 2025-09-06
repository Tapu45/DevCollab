import React, { useState } from 'react';
import { Share2, Copy, Check, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  FacebookShareButton,
  RedditShareButton,
  EmailShareButton,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  FacebookIcon,
  RedditIcon,
  EmailIcon,
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
  const [isOpen, setIsOpen] = useState(false);

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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-border/50 hover:bg-accent/10 px-2 py-1"
        >
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Profile
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Link Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Profile Link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={profileUrl} readOnly className="pl-10 pr-4" />
              </div>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-600">
                Link copied to clipboard!
              </p>
            )}
          </div>

          {/* Social Share Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Share on Social Media
            </label>
            <div className="grid grid-cols-3 gap-3">
              <TwitterShareButton
                url={profileUrl}
                title={title}
                onShareWindowClose={() => setIsOpen(false)}
                className="w-full"
              >
                <div className="w-full flex items-center justify-center gap-2 p-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer">
                  <TwitterIcon size={20} className="rounded" />
                  <span className="hidden sm:inline">Twitter</span>
                </div>
              </TwitterShareButton>
              <LinkedinShareButton
                url={profileUrl}
                title={title}
                onShareWindowClose={() => setIsOpen(false)}
                className="w-full"
              >
                <div className="w-full flex items-center justify-center gap-2 p-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer">
                  <LinkedinIcon size={20} className="rounded" />
                  <span className="hidden sm:inline">LinkedIn</span>
                </div>
              </LinkedinShareButton>
              <WhatsappShareButton
                url={profileUrl}
                title={title}
                onShareWindowClose={() => setIsOpen(false)}
                className="w-full"
              >
                <div className="w-full flex items-center justify-center gap-2 p-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer">
                  <WhatsappIcon size={20} className="rounded" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </div>
              </WhatsappShareButton>
              <FacebookShareButton
                url={profileUrl}
                title={title}
                onShareWindowClose={() => setIsOpen(false)}
                className="w-full"
              >
                <div className="w-full flex items-center justify-center gap-2 p-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer">
                  <FacebookIcon size={20} className="rounded" />
                  <span className="hidden sm:inline">Facebook</span>
                </div>
              </FacebookShareButton>
              <RedditShareButton
                url={profileUrl}
                title={title}
                onShareWindowClose={() => setIsOpen(false)}
                className="w-full"
              >
                <div className="w-full flex items-center justify-center gap-2 p-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer">
                  <RedditIcon size={20} className="rounded" />
                  <span className="hidden sm:inline">Reddit</span>
                </div>
              </RedditShareButton>
              <EmailShareButton
                url={profileUrl}
                subject={title}
                body={`Check out this profile: ${profileUrl}`}
                onShareWindowClose={() => setIsOpen(false)}
                className="w-full"
              >
                <div className="w-full flex items-center justify-center gap-2 p-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer">
                  <EmailIcon size={20} className="rounded" />
                  <span className="hidden sm:inline">Email</span>
                </div>
              </EmailShareButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
