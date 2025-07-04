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
  ConversationQuery,
  UpdateConversationMutation,
  RemoveConversationMutation,
} from "@/lib/gql/graphql";
import { ChatInput } from "../ui/chat/chat-input";
import { Button } from "../ui/button";
import { CornerDownLeft, Edit, Trash } from "lucide-react";
import { ChatMessageList } from "../ui/chat/chat-message-list";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "../ui/chat/chat-bubble";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";

interface Props {
  conversationId: string;
}

const CONVERSATION_QUERY = gql(`
  query Conversation($conversationId: ID!) {
    conversation(id: $conversationId) {
      id
      title
    }
  }
`);

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

const UPDATE_CONVERSATION_MUTATION = gql(`
  mutation UpdateConversation($updateConversationInput: UpdateConversationInput!) {
    updateConversation(updateConversationInput: $updateConversationInput) {
      id
    }
  }
`);

const REMOVE_CONVERSATION_MUTATION = gql(`
  mutation RemoveConversation($removeConversationId: ID!) {
    removeConversation(id: $removeConversationId) {
      id
    }
  }
`);

const ConversationWrapper: (props: Props) => ReactNode = (props) => {
  const { conversationId } = props;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<MessagesQuery["messages"]>([]);
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const { getToken, userId } = useAuth();
  const router = useRouter();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("");

  const { loading: conversationLoading, error: conversationError } =
    useQuery<ConversationQuery>(CONVERSATION_QUERY, {
      variables: { conversationId },
      onCompleted: (data) => {
        if (data?.conversation?.title) {
          setConversationTitle(data.conversation.title);
        }
      },
    });

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

  const [updateConversation] = useMutation<UpdateConversationMutation>(
    UPDATE_CONVERSATION_MUTATION
  );

  const [removeConversation] = useMutation<RemoveConversationMutation>(
    REMOVE_CONVERSATION_MUTATION
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

  const handleUpdateConversationTitle = async () => {
    if (!conversationTitle.trim()) return;
    try {
      await updateConversation({
        variables: {
          updateConversationInput: {
            id: conversationId,
            title: conversationTitle,
          },
        },
      });
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Error updating conversation title:", error);
    }
  };

  const handleRemoveConversation = async () => {
    try {
      await removeConversation({
        variables: {
          removeConversationId: conversationId,
        },
      });
      router.push("/"); // Redirect to home or conversations list
    } catch (error) {
      console.error("Error removing conversation:", error);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("newMessage", (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }
  }, [socket]);

  if (messagesLoading || conversationLoading) {
    return <div>Loading conversation...</div>;
  }

  if (messagesError || conversationError) {
    return (
      <div>
        Error loading messages:{" "}
        {messagesError?.message || conversationError?.message}
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-y-hidden p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        {isEditingTitle ? (
          <Input
            value={conversationTitle}
            onChange={(e) => setConversationTitle(e.target.value)}
            onBlur={handleUpdateConversationTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleUpdateConversationTitle();
              }
            }}
            className="text-xl font-semibold"
          />
        ) : (
          <h1 className="text-xl font-semibold flex items-center gap-2">
            {conversationTitle}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditingTitle(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </h1>
        )}
        <Button
          variant="destructive"
          size="icon"
          onClick={handleRemoveConversation}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
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
                <p
                  className={
                    "absolute overflow-visible w-max mt-2 text-muted-foreground text-sm " +
                    (message.sender.id === userId ? "right-0" : "left-0")
                  }
                >
                  {new Date(message.createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </ChatBubble>
          ))}
        </ChatMessageList>
      </div>
      <div className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1 mt-4">
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
