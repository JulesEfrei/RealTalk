"use client";

import { ReactNode, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";
import { gql } from "@/lib/gql/gql";
import { useMutation, useQuery } from "@apollo/client";
import {
  CreateMessageMutation,
  Message,
  MessagesQuery,
} from "@/lib/gql/graphql";

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
  const [messages, setMessages] = useState<MessagesQuery["messages"]>([]);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const { getToken } = useAuth();

  const {
    loading: messagesLoading,
    error: messagesError,
    data,
  } = useQuery<MessagesQuery>(MESSAGES_QUERY, {
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
    if (!newMessageContent.trim()) return; // Don't send empty messages

    try {
      await createMessage({
        variables: {
          createMessageInput: {
            conversationId,
            content: newMessageContent,
          },
        },
      });
      setNewMessageContent(""); // Clear input after sending
      console.log("Message created successfully!");
    } catch (error) {
      console.error("Error creating message:", error);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("newMessage", (message: Message) => {
        console.log("New message received:", message);
        setMessages((prevMessages) => [...prevMessages, message]); // Add new message to state
      });
    }
  }, [socket]);

  if (messagesLoading) {
    return <div>Loading conversation...</div>;
  }

  if (messagesError) {
    console.log(messagesError);

    return <div>Error loading messages: {messagesError.message}</div>;
  }

  return (
    <div>
      <h1>Conversation ID: {conversationId}</h1>
      <div
        style={{
          border: "1px solid gray",
          height: "300px",
          overflowY: "scroll",
          padding: "10px",
        }}
      >
        {messages.map((message) => (
          <div key={message.id} style={{ marginBottom: "10px" }}>
            <strong>
              {message.sender?.firstName || message.sender?.email}:
            </strong>{" "}
            {message.content}
            <div style={{ fontSize: "0.8em", color: "gray" }}>
              {new Date(message.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          value={newMessageContent}
          onChange={(e) => setNewMessageContent(e.target.value)}
          placeholder="Type your message..."
          style={{ width: "calc(100% - 80px)", padding: "8px" }}
        />
        <button
          onClick={handleCreateMessage}
          style={{ padding: "8px", marginLeft: "5px" }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ConversationWrapper;
