"use server";

import { z } from "zod";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import createClient from "@/lib/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { gql } from "@/lib/gql";

const CREATE_CONVERSATION = gql(`
  mutation CreateConversation($createConversationInput: CreateConversationInput!) {
    createConversation(createConversationInput: $createConversationInput) {
      users {
        id
      }
      id
    }
  }
`);

const searchUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const searchUser: (
  prevState: any,
  formData: FormData
) => Promise<{
  error?: string | undefined;
  conversationId?: string | undefined;
}> = async (prevState, formData) => {
  const validatedFields = searchUserSchema.safeParse({
    email: formData.get("email"),
  });

  const loggedUser = await currentUser();

  if (!loggedUser) {
    return { error: "You must be logged in to create a conversation." };
  }

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.email?.[0],
    };
  }

  try {
    const clerk = await clerkClient();
    const { data: users } = await clerk.users.getUserList({
      emailAddress: [validatedFields.data.email],
    });

    if (users.length === 0) {
      return { error: "User not found." };
    }

    const user = users[0];

    if (user.id === loggedUser.id) {
      return { error: "You cannot create a conversation with yourself." };
    }

    const client = createClient(await cookies());
    const { data } = await client.mutate({
      mutation: CREATE_CONVERSATION,
      variables: {
        createConversationInput: {
          userIds: [user.id],
          title: "New conversation",
        },
      },
    });

    if (!data?.createConversation) {
      return { error: "Failed to create conversation." };
    }

    revalidatePath("/conversation");
    return { conversationId: data.createConversation.id };
  } catch (error) {
    return { error: "An unexpected error occurred." };
  }
};
