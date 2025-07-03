/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation CreateConversation($createConversationInput: CreateConversationInput!) {\n    createConversation(createConversationInput: $createConversationInput) {\n      users {\n        id\n      }\n      id\n    }\n  }\n": typeof types.CreateConversationDocument,
    "\n  query Messages($messagesConversationId: ID!) {\n    messages(conversationId: $messagesConversationId) {\n      content\n      createdAt\n      id\n      sender {\n        id\n        email\n        avatar\n        lastName\n        initials\n        firstName\n      }\n    }\n  }\n": typeof types.MessagesDocument,
    "\n    mutation CreateMessage($createMessageInput: CreateMessageInput!) {\n      createMessage(createMessageInput: $createMessageInput) {\n        id\n      }\n    }\n  ": typeof types.CreateMessageDocument,
    "\n  query GetAllConversations {\n    conversations {\n      users {\n        id\n        avatar\n        initials\n      }\n      createdAt\n      id\n      title\n      updatedAt\n      lastMessage\n    }\n  }\n": typeof types.GetAllConversationsDocument,
};
const documents: Documents = {
    "\n  mutation CreateConversation($createConversationInput: CreateConversationInput!) {\n    createConversation(createConversationInput: $createConversationInput) {\n      users {\n        id\n      }\n      id\n    }\n  }\n": types.CreateConversationDocument,
    "\n  query Messages($messagesConversationId: ID!) {\n    messages(conversationId: $messagesConversationId) {\n      content\n      createdAt\n      id\n      sender {\n        id\n        email\n        avatar\n        lastName\n        initials\n        firstName\n      }\n    }\n  }\n": types.MessagesDocument,
    "\n    mutation CreateMessage($createMessageInput: CreateMessageInput!) {\n      createMessage(createMessageInput: $createMessageInput) {\n        id\n      }\n    }\n  ": types.CreateMessageDocument,
    "\n  query GetAllConversations {\n    conversations {\n      users {\n        id\n        avatar\n        initials\n      }\n      createdAt\n      id\n      title\n      updatedAt\n      lastMessage\n    }\n  }\n": types.GetAllConversationsDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateConversation($createConversationInput: CreateConversationInput!) {\n    createConversation(createConversationInput: $createConversationInput) {\n      users {\n        id\n      }\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation CreateConversation($createConversationInput: CreateConversationInput!) {\n    createConversation(createConversationInput: $createConversationInput) {\n      users {\n        id\n      }\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query Messages($messagesConversationId: ID!) {\n    messages(conversationId: $messagesConversationId) {\n      content\n      createdAt\n      id\n      sender {\n        id\n        email\n        avatar\n        lastName\n        initials\n        firstName\n      }\n    }\n  }\n"): (typeof documents)["\n  query Messages($messagesConversationId: ID!) {\n    messages(conversationId: $messagesConversationId) {\n      content\n      createdAt\n      id\n      sender {\n        id\n        email\n        avatar\n        lastName\n        initials\n        firstName\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n    mutation CreateMessage($createMessageInput: CreateMessageInput!) {\n      createMessage(createMessageInput: $createMessageInput) {\n        id\n      }\n    }\n  "): (typeof documents)["\n    mutation CreateMessage($createMessageInput: CreateMessageInput!) {\n      createMessage(createMessageInput: $createMessageInput) {\n        id\n      }\n    }\n  "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetAllConversations {\n    conversations {\n      users {\n        id\n        avatar\n        initials\n      }\n      createdAt\n      id\n      title\n      updatedAt\n      lastMessage\n    }\n  }\n"): (typeof documents)["\n  query GetAllConversations {\n    conversations {\n      users {\n        id\n        avatar\n        initials\n      }\n      createdAt\n      id\n      title\n      updatedAt\n      lastMessage\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;