"use client";

import React, { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createConversation, findUserByEmail } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";

type User = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  emailAddress: string;
};

const initialState = {
  error: undefined,
  conversationId: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create conversation"}
    </Button>
  );
}

export function NewChatButton() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createConversation, initialState);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (state.conversationId) {
      setOpen(false);
      router.push(`/conversation/${state.conversationId}`);
      setUsers([]);
      setError(undefined);
      setTitle("");
    }
  }, [state.conversationId, router]);

  const handleSearchUser = async () => {
    if (users.length >= 6) {
      setError("You can add a maximum of 6 users.");
      return;
    }

    const result = await findUserByEmail(email);
    if (result.error) {
      setError(result.error);
    } else if (result.user) {
      if (users.find((user) => user.id === result.user?.id)) {
        setError("User already added.");
        return;
      }
      setUsers([...users, result.user as User]);
      setError(undefined);
      setEmail("");
    }
  };

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-center gap-2">
          <Plus className="mr-2 h-4 w-4" />
          New chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Start a new conversation</DialogTitle>
            <DialogDescription>
              Enter the email of the user you want to chat with.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right">
                Title (Optional)
              </label>
              <Input
                id="title"
                name="title"
                type="text"
                className="col-span-3"
                placeholder="Conversation title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                className="col-span-2"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="button"
                onClick={handleSearchUser}
                className="col-span-1"
              >
                Add user
              </Button>
            </div>
            {users.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {users.map((user) => (
                  <Badge key={user.id} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.imageUrl} />
                      <AvatarFallback>
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.emailAddress}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            {users.map((user) => (
              <input
                key={user.id}
                type="hidden"
                name="userIds"
                value={user.id}
              />
            ))}
            <input type="hidden" name="title" value={title} />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center col-span-4">
              {error}
            </p>
          )}
          {state.error && (
            <p className="text-red-500 text-sm text-center col-span-4">
              {state.error}
            </p>
          )}
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
