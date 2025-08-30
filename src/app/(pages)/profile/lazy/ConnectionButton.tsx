import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserPlus, Check, X, Loader2, UserMinus } from 'lucide-react';
import { toast } from 'sonner';

interface ConnectionButtonProps {
  userId: string;
  className?: string;
}

type ConnectionStatus = 'NONE' | 'PENDING' | 'ACCEPTED' | 'DECLINED';

const ConnectionButton = ({ userId, className }: ConnectionButtonProps) => {
  const queryClient = useQueryClient();

  // Fetch connection status and connectionId
  const { data: connectionData, isLoading: statusLoading } = useQuery({
    queryKey: ['connection-status', userId],
    queryFn: async () => {
      const res = await fetch(`/api/connections/connect/status?userId=${userId}`);
      const data = await res.json();
      // Fetch the actual connection object if status is PENDING
      if (data.status === 'PENDING') {
        const connRes = await fetch(`/api/connections/connect/detail?userId=${userId}`);
        const connData = await connRes.json();
        return { status: data.status, connectionId: connData.connectionId };
      }
      return { status: data.status, connectionId: null };
    },
  });

  // Send connection request
  const { mutate: sendRequest, isPending: isSending } = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/connections/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          receiverId: userId,
          type: 'COLLABORATOR',
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-status', userId] });
      toast.success('Connection request sent', {
        description: 'The user will be notified of your request.',
      });
    },
    onError: (error) => {
      toast.error('Error', {
        description: error.message,
      });
    },
  });

  // Withdraw connection request
  const { mutate: withdrawRequest, isPending: isWithdrawing } = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/connections/connect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'withdraw',
          connectionId: connectionData?.connectionId,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-status', userId] });
      toast.success('Request withdrawn', {
        description: 'Your connection request has been withdrawn.',
      });
    },
    onError: (error) => {
      toast.error('Error', {
        description: error.message,
      });
    },
  });

  if (statusLoading) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (connectionData?.status === 'ACCEPTED') {
    return (
      <Button variant="ghost" size="sm" className={`${className} bg-primary/10 text-primary`}>
        <Check className="w-4 h-4 mr-2" />
        Connected
      </Button>
    );
  }

  if (connectionData?.status === 'PENDING') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={`${className} bg-accent/10`}>
            <Loader2 className="w-4 h-4 mr-2" />
            Request Pending
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => withdrawRequest()}
            disabled={isWithdrawing}
            className="text-destructive focus:text-destructive"
          >
            {isWithdrawing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <UserMinus className="w-4 h-4 mr-2" />
            )}
            Withdraw Request
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (connectionData?.status === 'DECLINED') {
    return (
      <Button variant="ghost" size="sm" className={`${className} bg-destructive/10 text-destructive`}>
        <X className="w-4 h-4 mr-2" />
        Request Declined
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => sendRequest()}
      disabled={isSending}
      className={className}
    >
      {isSending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <UserPlus className="w-4 h-4 mr-2" />
      )}
      Connect
    </Button>
  );
};

export default ConnectionButton;
