'use client';

import { motion } from 'framer-motion';
import { 
  User, 
  Shield, 
  Bell, 
  MessageCircle, 
  Users, 
  Palette, 
  Settings as SettingsIcon,
  ChevronRight,
  Lock,
  Eye,
  Globe,
  Smartphone,
  Mail,
  Key,
  Trash2,
  Download,
  Upload,
  HelpCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

const settingsCategories = [
  {
    id: 'profile',
    title: 'Profile Settings',
    description: 'Manage your personal information and profile visibility',
    icon: User,
    href: '/settings/profile',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    iconColor: 'text-blue-600',
    features: ['Display name', 'Bio', 'Profile picture', 'Contact info']
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    description: 'Control who can see your information and contact you',
    icon: Shield,
    href: '/settings/privacy',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    iconColor: 'text-green-600',
    features: ['Profile visibility', 'Connection privacy', 'Message permissions']
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Customize how and when you receive notifications',
    icon: Bell,
    href: '/settings/notifications',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    iconColor: 'text-purple-600',
    features: ['Email notifications', 'Push notifications', 'Quiet hours']
  },
  {
    id: 'chat',
    title: 'Chat & Messages',
    description: 'Configure your messaging preferences and chat settings',
    icon: MessageCircle,
    href: '/settings/chat',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    iconColor: 'text-orange-600',
    features: ['Message permissions', 'Chat settings', 'File sharing']
  },
  {
    id: 'connections',
    title: 'Connections',
    description: 'Manage your network and connection preferences',
    icon: Users,
    href: '/settings/connections',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    iconColor: 'text-indigo-600',
    features: ['Connection requests', 'Network visibility', 'Blocked users']
  },
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Customize the look and feel of your interface',
    icon: Palette,
    href: '/settings/appearance',
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    iconColor: 'text-pink-600',
    features: ['Theme', 'Language', 'Display preferences']
  },
  {
    id: 'account',
    title: 'Account',
    description: 'Manage your account security and data',
    icon: Lock,
    href: '/settings/account',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    iconColor: 'text-red-600',
    features: ['Password', 'Two-factor auth', 'Data export', 'Account deletion']
  }
];

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-border/50 mb-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
          
          <div className="relative p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <SettingsIcon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage your account preferences and privacy settings
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsCategories.map((category, index) => {
            const IconComponent = category.icon;
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              >
                <Card 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20"
                  onClick={() => router.push(category.href)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${category.color}`}>
                          <IconComponent className={`w-5 h-5 ${category.iconColor}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.title}</CardTitle>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      {category.description}
                    </p>
                    
                    <div className="space-y-2">
                      {category.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
                          <span className="text-xs text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8"
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <Download className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Export Data</p>
                    <p className="text-xs text-muted-foreground">Download your data</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Import Data</p>
                    <p className="text-xs text-muted-foreground">Upload your data</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <Info className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Help Center</p>
                    <p className="text-xs text-muted-foreground">Get support</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Delete Account</p>
                    <p className="text-xs text-muted-foreground">Permanently delete</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}