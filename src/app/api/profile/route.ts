import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  // Get the requesting user's ID (viewer) using Clerk
  const { userId: viewerId } = await auth();
  if (!viewerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all public info for the profile page, including blockedUserIds
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      firstName: true,
      lastName: true,
      username: true,
      profilePictureUrl: true,
      bio: true,
      location: true,
      timezone: true,
      website: true,
      githubUrl: true,
      linkedinUrl: true,
      profileVisibility: true,
      accountType: true,
      reputationScore: true,
      totalContributions: true,
      isActive: true,
      isBanned: true,
      bannedUntil: true,
      banReason: true,
      showEmail: true,
      showLocation: true,
      allowMessages: true,
      profileCompleted: true,
      createdAt: true,
      updatedAt: true,

      // Skills
      skills: {
        select: {
          name: true,
          category: true,
          proficiencyLevel: true,
          isVerified: true,
          yearsExperience: true,
        }
      },

      // Experiences
      experiences: {
        select: {
          title: true,
          company: true,
          location: true,
          startDate: true,
          endDate: true,
          isCurrent: true,
          responsibilities: true,
        }
      },

      // Educations
      educations: {
        select: {
          institution: true,
          degree: true,
          fieldOfStudy: true,
          startDate: true,
          endDate: true,
          grade: true,
          description: true,
        }
      },

      // Projects
      ownedProjects: {
        select: {
          id: true,
          title: true,
          description: true,
          shortDesc: true,
          status: true,
          visibility: true,
          techStack: true,
          categories: true,
          tags: true,
          difficultyLevel: true,
          githubUrl: true,
          liveUrl: true,
          thumbnailUrl: true,
        }
      },
      projectCollaborations: {
        select: {
          project: {
            select: {
              id: true,
              title: true,
              status: true,
              visibility: true,
              thumbnailUrl: true,
            }
          },
          role: true,
          joinedAt: true,
        }
      },

      // Connections
      sentConnections: {
        select: {
          id: true,
          receiverId: true,
          status: true,
          type: true,
          createdAt: true,
          receiver: {
            select: {
              id: true,
              displayName: true,
              username: true,
              profilePictureUrl: true,
            }
          },
        },
        where: {
          status: 'ACCEPTED',
        },
      },
      receivedConnections: {
        select: {
          id: true,
          senderId: true,
          status: true,
          type: true,
          createdAt: true,
          sender: {
            select: {
              id: true,
              displayName: true,
              username: true,
              profilePictureUrl: true,
            }
          },
        },
        where: {
          status: 'ACCEPTED',
        },
      },

      // Messages (only meta, not content)
      sentMessages: {
        select: {
          id: true,
          chatId: true,
          receiverId: true,
          type: true,
          createdAt: true,
        }
      },
      receivedMessages: {
        select: {
          id: true,
          chatId: true,
          senderId: true,
          type: true,
          createdAt: true,
        }
      },

      // Chat participation
      chatParticipants: {
        select: {
          chatId: true,
          joinedAt: true,
          isAdmin: true,
        }
      },

      // Tasks
      taskAssignments: {
        select: {
          id: true,
          projectId: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
        }
      },
      createdTasks: {
        select: {
          id: true,
          projectId: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
        }
      },

      // Comments
      comments: {
        select: {
          id: true,
          taskId: true,
          content: true,
          createdAt: true,
        }
      },

      // Achievements
      achievements: {
        select: {
          achievement: {
            select: {
              name: true,
              description: true,
              icon: true,
              category: true,
              points: true,
            }
          },
          unlockedAt: true,
        }
      },

      // Endorsements
      endorsements: {
        select: {
          skill: {
            select: {
              name: true,
              category: true,
            }
          },
          message: true,
        }
      },
      receivedEndorsements: {
        select: {
          skill: {
            select: {
              name: true,
              category: true,
            }
          },
          message: true,
        }
      },

      // Forum
      forumPosts: {
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
        }
      },
      forumReplies: {
        select: {
          id: true,
          postId: true,
          content: true,
          createdAt: true,
        }
      },

      // Events
      eventParticipations: {
        select: {
          event: {
            select: {
              id: true,
              title: true,
              type: true,
              startDate: true,
              endDate: true,
              location: true,
              isVirtual: true,
            }
          },
          status: true,
        }
      },
      createdEvents: {
        select: {
          id: true,
          title: true,
          type: true,
          startDate: true,
          endDate: true,
          location: true,
          isVirtual: true,
        }
      },

      // Notifications (meta only)
      sentNotifications: {
        select: {
          id: true,
          type: true,
          title: true,
          isRead: true,
          createdAt: true,
        }
      },
      receivedNotifications: {
        select: {
          id: true,
          type: true,
          title: true,
          isRead: true,
          createdAt: true,
        }
      },

      // Profile progress
      profileProgress: {
        select: {
          currentSection: true,
          lastUpdated: true,
        }
      },

      // Connection privacy (add blockedUserIds)
      connectionPrivacy: {
        select: {
          connectionPrivacyLevel: true,
          connectionRequestLevel: true,
          hideConnections: true,
          blockedUserIds: true, // <-- Add this to check blocks
        }
      },

      // Notification preferences
      notificationPreferences: {
        select: {
          category: true,
          inAppEnabled: true,
          emailEnabled: true,
          pushEnabled: true,
          smsEnabled: true,
          digestFrequency: true,
        }
      },

      // Message reactions and reads (meta)
      messageReactions: {
        select: {
          messageId: true,
          emoji: true,
        }
      },
      messageReads: {
        select: {
          messageId: true,
          readAt: true,
        }
      },

      // Question progress (meta)
      questionProgress: {
        select: {
          questionId: true,
          status: true,
          updatedAt: true,
        }
      },
    }
  });

  // Hide if profile is private
  if (!user || user.profileVisibility === 'PRIVATE') {
    return NextResponse.json({ error: 'User not found or profile is private' }, { status: 404 });
  }

  // Block check: If viewer is in blockedUserIds, deny access
  if (user.connectionPrivacy?.blockedUserIds?.includes(viewerId)) {
    return NextResponse.json({ blocked: true }, { status: 403 });
  }

  // Merge network lists into a single array of users
  let connections: any[] = [];
  if (user) {
    const sent = user.sentConnections?.map((c: any) => c.receiver) || [];
    const received = user.receivedConnections?.map((c: any) => c.sender) || [];
    // Remove duplicates by user id
    const all = [...sent, ...received];
    const seen = new Set();
    connections = all.filter((u: any) => {
      if (seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    });
    // Cast to any to avoid type errors
    const userData = user as any;
    // Remove the network fields from user object
    delete userData.sentConnections;
    delete userData.receivedConnections;
    // Attach the merged connections
    userData.connections = connections;
    return NextResponse.json(userData);
  }

  return NextResponse.json(user);
}