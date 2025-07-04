import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { SidebarTrigger } from "../ui/sidebar";
import { gql } from "@/lib/gql";
import { GetAllConversationsQuery } from "@/lib/gql/graphql";
import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import createClient from "@/lib/client";
import { NewChatButton } from "./NewChatButton";

const GetAllConversations = gql(`
  query GetAllConversations {
    conversations {
      users {
        id
        avatar
        initials
      }
      createdAt
      id
      title
      updatedAt
      lastMessage
    }
  }
`);

const MessageSidebar = async () => {
  const client = createClient(await cookies());
  const { data } = await client.query<GetAllConversationsQuery>({
    query: GetAllConversations,
  });

  const loggedUser = await currentUser();

  if (!loggedUser) return null; // TODO: redirect to sign-in

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
        <NewChatButton />
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
          {data.conversations.map((conversation) => {
            const otherUser = conversation.users.find(
              (user) => user.id !== loggedUser!.id
            );

            if (!otherUser) {
              return null;
            }

            return (
              <Link
                key={conversation.id}
                href={`/conversation/${conversation.id}`}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={otherUser!.avatar}
                    alt={conversation.title}
                  />
                  <AvatarFallback className="bg-foreground/20">
                    {otherUser!.initials}
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
                  {0 > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-4 min-w-4 rounded-full px-1 flex items-center justify-center text-xs"
                    >
                      2
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageSidebar;
