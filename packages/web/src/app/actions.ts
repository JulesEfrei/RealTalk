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

const findUserByEmailSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const findUserByEmail = async (email: string) => {
  const validatedFields = findUserByEmailSchema.safeParse({ email });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.email?.[0],
    };
  }

  const loggedUser = await currentUser();

  if (!loggedUser) {
    return { error: "You must be logged in to search for users." };
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
      return { error: "You cannot add yourself to a conversation." };
    }

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        emailAddress: user.emailAddresses[0].emailAddress,
      },
    };
  } catch {
    return { error: "An unexpected error occurred." };
  }
};

const createConversationSchema = z.object({
  userIds: z
    .array(z.string())
    .min(1, { message: "At least one user is required." }),
  title: z.string().optional(),
});

export const createConversation: (
  prevState: unknown,
  formData: FormData
) => Promise<{
  error?: string | undefined;
  conversationId?: string | undefined;
}> = async (prevState, formData) => {
  const userIds = formData.getAll("userIds") as string[];
  const title = formData.get("title") as string;
  const validatedFields = createConversationSchema.safeParse({
    userIds,
    title,
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.userIds?.[0],
    };
  }

  try {
    const client = createClient(await cookies());

    const clerk = await clerkClient();
    const convTitle =
      validatedFields.data.title ||
      (validatedFields.data.userIds.length > 1
        ? "New Group"
        : clerk.users.getUser(userIds[0]).then((user) => {
            return (
              user.firstName ||
              user.emailAddresses[0].emailAddress.split("@")[0] ||
              "New conversation"
            );
          }));

    const { data } = await client.mutate({
      mutation: CREATE_CONVERSATION,
      variables: {
        createConversationInput: {
          userIds: validatedFields.data.userIds,
          title: await convTitle,
        },
      },
    });

    if (!data?.createConversation) {
      return { error: "Failed to create conversation." };
    }

    revalidatePath("/conversation");
    return { conversationId: data.createConversation.id };
  } catch {
    return { error: "An unexpected error occurred." };
  }
};
