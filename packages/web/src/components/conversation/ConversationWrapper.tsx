"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";
import { gql } from "@/lib/gql/gql";
import { useMutation, useQuery } from "@apollo/client";
import {
  CreateMessageMutation,
  Message,
  MessagesQuery,
} from "@/lib/gql/graphql";
import { ChatInput } from "../ui/chat/chat-input";
import { Button } from "../ui/button";
import { CornerDownLeft } from "lucide-react";
import { ChatMessageList } from "../ui/chat/chat-message-list";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "../ui/chat/chat-bubble";

interface Props {
  conversationId: string;
}

const MESSAGES_QUERY = gql(`
  query Messages($messagesConversationId: ID!) {
    messages(conversationId: $messagesConversationId) {
      content
      createdAt
      id
      sender {
        id
        email
        avatar
        lastName
        initials
        firstName
      }
    }
  }
`);

const ConversationWrapper: (props: Props) => ReactNode = (props) => {
  const { conversationId } = props;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<MessagesQuery["messages"]>([]);
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const { getToken, userId } = useAuth();

  const { loading: messagesLoading, error: messagesError } =
    useQuery<MessagesQuery>(MESSAGES_QUERY, {
      variables: { messagesConversationId: conversationId },
      onCompleted: (data) => {
        if (data?.messages) {
          setMessages(data.messages);
        }
      },
      fetchPolicy: "network-only", // Ensure fresh data
    });

  useEffect(() => {
    const connectSocket = async () => {
      try {
        const token = await getToken();
        const newSocket = io(
          process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3000",
          {
            auth: {
              token: token,
            },
          }
        );

        newSocket.on("connect", () => {
          console.log("Connected to WebSocket server");
          newSocket.emit("joinConversation", conversationId);
        });

        newSocket.on("connect_error", (err) => {
          console.error("WebSocket connection error:", err);
        });

        newSocket.on("disconnect", () => {
          console.log("Disconnected from WebSocket server");
        });

        setSocket(newSocket);
      } catch (err) {
        console.error("Error getting token or connecting to socket:", err);
      }
    };

    connectSocket();

    return () => {
      if (socket) {
        socket.emit("leaveConversation", conversationId);
        socket.disconnect();
      }
    };
  }, [conversationId, getToken]);

  const CREATE_MESSAGE_MUTATION = gql(`
    mutation CreateMessage($createMessageInput: CreateMessageInput!) {
      createMessage(createMessageInput: $createMessageInput) {
        id
      }
    }
  `);

  const [createMessage] = useMutation<CreateMessageMutation>(
    CREATE_MESSAGE_MUTATION
  );

  const handleCreateMessage = async () => {
    if (!inputRef.current?.value.trim()) return;

    try {
      await createMessage({
        variables: {
          createMessageInput: {
            conversationId,
            content: inputRef.current.value,
          },
        },
      });

      inputRef.current.value = "";
      console.log("Message created successfully!");
    } catch (error) {
      console.error("Error creating message:", error);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("newMessage", (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }
  }, [socket]);

  if (messagesLoading) {
    return <div>Loading conversation...</div>;
  }

  if (messagesError) {
    return <div>Error loading messages: {messagesError.message}</div>;
  }

  return (
    <div className="relative h-screen overflow-y-hidden p-4">
      <div className="h-[calc(100%-100px)]">
        <ChatMessageList>
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.sender.id === userId ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                src={message.sender.avatar}
                fallback={message.sender.initials}
              />
              <div className="relative my-3">
                <ChatBubbleMessage
                  variant={message.sender.id === userId ? "sent" : "received"}
                >
                  {message.content}
                </ChatBubbleMessage>
                <p className="absolute right-0 overflow-visible w-max mt-2 text-muted-foreground text-sm">
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </div>
            </ChatBubble>
          ))}
        </ChatMessageList>
      </div>
      <div className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1">
        <ChatInput
          placeholder="Type your message here..."
          className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
          ref={inputRef}
          onKeyDown={(e) => {
            if (e.code === "Enter" && (e.ctrlKey || e.metaKey)) {
              handleCreateMessage();
            }
          }}
        />
        <div className="flex items-center p-3 pt-0">
          <Button
            size="sm"
            className="ml-auto gap-1.5"
            onClick={handleCreateMessage}
          >
            Send Message
            <CornerDownLeft className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConversationWrapper;
