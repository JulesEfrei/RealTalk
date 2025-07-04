"use client";

import React, { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
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
import { searchUser } from "@/app/actions";
import { useRouter } from "next/navigation";

const initialState = {
  error: undefined,
  conversationId: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Searching..." : "Search user"}
    </Button>
  );
}

export function NewChatButton() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(searchUser, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.conversationId) {
      setOpen(false);
      router.push(`/conversation/${state.conversationId}`);
    }
  }, [state.conversationId, router]);

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
              <label htmlFor="email" className="text-right">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                className="col-span-3"
                placeholder="name@example.com"
                required
              />
            </div>
            {state.error && (
              <p className="text-red-500 text-sm text-center col-span-4">
                {state.error}
              </p>
            )}
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
