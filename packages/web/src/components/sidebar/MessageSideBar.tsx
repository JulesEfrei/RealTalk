import React from "react";
import { Search, Plus, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { SidebarTrigger } from "../ui/sidebar";

const MessageSidebar = () => {
  const onlineUsers = [
    {
      id: 1,
      name: "Sarah Chen",
      avatar: "/api/placeholder/32/32",
      initials: "SC",
    },
    {
      id: 2,
      name: "Mike Johnson",
      avatar: "/api/placeholder/32/32",
      initials: "MJ",
    },
    {
      id: 3,
      name: "Emma Wilson",
      avatar: "/api/placeholder/32/32",
      initials: "EW",
    },
    {
      id: 4,
      name: "Alex Rodriguez",
      avatar: "/api/placeholder/32/32",
      initials: "AR",
    },
    {
      id: 5,
      name: "Lisa Park",
      avatar: "/api/placeholder/32/32",
      initials: "LP",
    },
    {
      id: 6,
      name: "David Kim",
      avatar: "/api/placeholder/32/32",
      initials: "DK",
    },
  ];

  const conversations = [
    {
      id: 1,
      title: "Team Project Discussion",
      avatar: "/api/placeholder/40/40",
      initials: "TP",
      lastMessage: "14:32",
      unreadCount: 3,
      isToday: true,
    },
    {
      id: 2,
      title: "Sarah Chen",
      avatar: "/api/placeholder/40/40",
      initials: "SC",
      lastMessage: "12:45",
      unreadCount: 1,
      isToday: true,
    },
    {
      id: 3,
      title: "Design Review",
      avatar: "/api/placeholder/40/40",
      initials: "DR",
      lastMessage: "1 day ago",
      unreadCount: 0,
      isToday: false,
    },
    {
      id: 4,
      title: "Mike Johnson",
      avatar: "/api/placeholder/40/40",
      initials: "MJ",
      lastMessage: "2 days ago",
      unreadCount: 5,
      isToday: false,
    },
    {
      id: 5,
      title: "Marketing Team",
      avatar: "/api/placeholder/40/40",
      initials: "MT",
      lastMessage: "1 week ago",
      unreadCount: 0,
      isToday: false,
    },
    {
      id: 6,
      title: "Emma Wilson",
      avatar: "/api/placeholder/40/40",
      initials: "EW",
      lastMessage: "2 weeks ago",
      unreadCount: 2,
      isToday: false,
    },
    {
      id: 7,
      title: "Development Updates",
      avatar: "/api/placeholder/40/40",
      initials: "DU",
      lastMessage: "1 month ago",
      unreadCount: 0,
      isToday: false,
    },
  ];

  return (
    <div className="w-80 h-screen border-r border-gray-200 flex flex-col">
      <div className="pt-4 pl-4">
        <SidebarTrigger />
      </div>
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search conversations or messages..."
            className="pl-10"
          />
        </div>

        <Button className="w-full justify-center gap-2">
          <Plus className="mr-2 h-4 w-4" />
          New chat
        </Button>
      </div>

      <div className="px-4 pb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Online now</h3>
        <ScrollArea className="w-full">
          <div className="flex space-x-3 pb-2 w-max">
            {onlineUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col items-center space-y-1 min-w-0"
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-sm">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <span className="text-xs text-gray-600 truncate max-w-20">
                  {user.name.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={conversation.avatar}
                  alt={conversation.title}
                />
                <AvatarFallback className="bg-foreground/20">
                  {conversation.initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {conversation.title}
                  </h4>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-1">
                <span className="text-xs text-gray-500">
                  {conversation.lastMessage}
                </span>
                {conversation.unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="h-4 min-w-4 rounded-full px-1 flex items-center justify-center text-xs"
                  >
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageSidebar;
