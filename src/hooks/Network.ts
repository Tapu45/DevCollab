import { Connection } from '@/types/Network';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const fetchConnections = async (type: string): Promise<Connection[]> => {
  const response = await fetch(`/api/connections/connect?action=${type}`);
  if (!response.ok) throw new Error('Failed to fetch connections');
  const data = await response.json();
  return data[type] || [];
};

export const fetchBlockedUsers = async (): Promise<Connection[]> => {
  const response = await fetch('/api/connections/block?action=blocked');
  if (!response.ok) throw new Error('Failed to fetch blocked users');
  const data = await response.json();
  return data.blocked || [];
};

export const respondToConnection = async (connectionId: string, response: 'ACCEPTED' | 'DECLINED') => {
  const res = await fetch('/api/connections/connect', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'respond', connectionId, response }),
  });
  if (!res.ok) throw new Error('Failed to respond to connection');
  return res.json();
};

export const withdrawConnection = async (connectionId: string) => {
  const res = await fetch('/api/connections/connect', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'withdraw', connectionId }),
  });
  if (!res.ok) throw new Error('Failed to withdraw connection');
  return res.json();
};

export const blockUser = async (userId: string) => {
  const res = await fetch('/api/connections/block', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'block', userId }),
  });
  if (!res.ok) throw new Error('Failed to block user');
  return res.json();
};

export const unblockUser = async (userId: string) => {
  const res = await fetch('/api/connections/block', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'unblock', userId }),
  });
  if (!res.ok) throw new Error('Failed to unblock user');
  return res.json();
};

export const useReceivedConnections = () =>
  useQuery({
    queryKey: ['connections', 'received'],
    queryFn: () => fetchConnections('pending'),
    refetchInterval: 30000,
  });

export const useSentConnections = () =>
  useQuery({
    queryKey: ['connections', 'sent'],
    queryFn: () => fetchConnections('sent'),
  });

export const useAcceptedConnections = () =>
  useQuery({
    queryKey: ['connections', 'accepted'],
    queryFn: () => fetchConnections('accepted'),
  });

export const useBlockedUsers = () =>
  useQuery({
    queryKey: ['connections', 'blocked'],
    queryFn: fetchBlockedUsers,
  });

export const useRespondMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ connectionId, response }: { connectionId: string; response: 'ACCEPTED' | 'DECLINED' }) =>
      respondToConnection(connectionId, response),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['connections'] }),
  });
};

export const useWithdrawMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: withdrawConnection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['connections'] }),
  });
};

export const useBlockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blockUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['connections'] }),
  });
};

export const useUnblockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unblockUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['connections'] }),
  });
};