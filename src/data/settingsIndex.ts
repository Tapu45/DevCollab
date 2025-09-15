export type SettingsIndexItem = {
    id: string;
    title: string;
    description?: string;
    href: string;
    keywords?: string[];
};

export const settingsIndex: SettingsIndexItem[] = [
    {
        id: 'profile',
        title: 'Profile Settings',
        href: '/settings/profile',
        keywords: ['display name', 'bio', 'profile picture', 'contact', 'visibility'],
    },
    {
        id: 'privacy',
        title: 'Privacy & Security',
        href: '/settings/privacy',
        keywords: ['privacy', 'security', 'visibility', 'message permissions'],
    },
    {
        id: 'notifications',
        title: 'Notifications',
        href: '/settings/notifications',
        keywords: ['email', 'push', 'quiet hours', 'alerts'],
    },
    {
        id: 'chat',
        title: 'Chat & Messages',
        href: '/settings/chat',
        keywords: ['chat', 'messages', 'file sharing', 'permissions'],
    },
    {
        id: 'connections',
        title: 'Connections',
        href: '/settings/connections',
        keywords: ['network', 'requests', 'blocked'],
    },
    {
        id: 'appearance',
        title: 'Appearance',
        href: '/settings/appearance',
        keywords: ['theme', 'language', 'display'],
    },
    {
        id: 'account',
        title: 'Account',
        href: '/settings/account',
        keywords: ['password', '2fa', 'data export', 'delete'],
    },
    {
        id: 'integrations',
        title: 'Integrations',
        href: '/settings/integrations',
        keywords: ['github', 'linkedin', 'api', 'external profiles'],
    },
    {
        id: 'sessions',
        title: 'Active Sessions',
        href: '/settings/sessions',
        keywords: ['sessions', 'devices', 'terminate'],
    },
];