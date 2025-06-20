# Documentation de l'API GraphQL RealTalk

## Introduction

Cette documentation décrit l'API GraphQL du projet RealTalk. L'API est construite avec NestJS, Prisma et PostgreSQL, et utilise l'authentification Clerk. Elle permet de gérer des conversations et des messages associés à un utilisateur authentifié.

## Authentification

Toutes les requêtes GraphQL nécessitent une authentification via Clerk. Vous devez inclure un token JWT valide dans l'en-tête HTTP de chaque requête :

```
Authorization: Bearer votre_token_clerk
```

## URL de l'API

L'API GraphQL est accessible à l'URL suivante :
```
http://localhost:3000/graphql
```

Un playground GraphQL est disponible à cette même adresse pour tester les requêtes en développement.

## Modèles de données

### Conversation
- `id`: UUID unique (string)
- `clerkUserId`: ID utilisateur Clerk (string)
- `title`: Titre de la conversation (string)
- `createdAt`: Date de création (DateTime)
- `updatedAt`: Date de mise à jour (DateTime)
- `messages`: Liste des messages associés (relation)

### Message
- `id`: UUID unique (string)
- `conversationId`: ID de la conversation parente (string)
- `content`: Contenu du message (string)
- `createdAt`: Date de création (DateTime)
- `conversation`: Conversation parente (relation)

## Requêtes (Queries)

### Récupérer toutes les conversations
Récupère toutes les conversations appartenant à l'utilisateur authentifié.

**Requête**
```graphql
query {
  conversations {
    id
    title
    createdAt
    updatedAt
  }
}
```

**Réponse**
```json
{
  "data": {
    "conversations": [
      {
        "id": "913b7739-73b7-4608-ba5e-441e79e80696",
        "title": "Ma première conversation",
        "createdAt": "2025-06-19T14:10:39.370Z",
        "updatedAt": "2025-06-19T14:10:39.370Z"
      }
    ]
  }
}
```

### Récupérer une conversation spécifique
Récupère les détails d'une conversation et ses messages, si l'utilisateur authentifié en est le propriétaire.

**Requête**
```graphql
query {
  conversation(id: "913b7739-73b7-4608-ba5e-441e79e80696") {
    id
    title
    createdAt
    updatedAt
    messages {
      id
      content
      createdAt
    }
  }
}
```

**Réponse**
```json
{
  "data": {
    "conversation": {
      "id": "913b7739-73b7-4608-ba5e-441e79e80696",
      "title": "Ma première conversation",
      "createdAt": "2025-06-19T14:10:39.370Z",
      "updatedAt": "2025-06-19T14:10:39.370Z",
      "messages": [
        {
          "id": "82e23c9e-b94e-4e44-9d99-4721b41d5905",
          "content": "Bonjour, comment ça va ?",
          "createdAt": "2025-06-19T14:11:13.537Z"
        }
      ]
    }
  }
}
```

### Récupérer tous les messages d'une conversation
Récupère tous les messages d'une conversation spécifique.

**Requête**
```graphql
query {
  messages(conversationId: "913b7739-73b7-4608-ba5e-441e79e80696") {
    id
    content
    createdAt
  }
}
```

**Réponse**
```json
{
  "data": {
    "messages": [
      {
        "id": "82e23c9e-b94e-4e44-9d99-4721b41d5905",
        "content": "Bonjour, comment ça va ?",
        "createdAt": "2025-06-19T14:11:13.537Z"
      }
    ]
  }
}
```

### Récupérer un message spécifique
Récupère les détails d'un message spécifique.

**Requête**
```graphql
query {
  message(id: "82e23c9e-b94e-4e44-9d99-4721b41d5905") {
    id
    content
    createdAt
    conversation {
      id
      title
    }
  }
}
```

## Mutations

### Créer une conversation
Crée une nouvelle conversation pour l'utilisateur authentifié.

**Requête**
```graphql
mutation {
  createConversation(createConversationInput: {
    title: "Nouvelle conversation"
  }) {
    id
    title
    createdAt
  }
}
```

**Réponse**
```json
{
  "data": {
    "createConversation": {
      "id": "913b7739-73b7-4608-ba5e-441e79e80696",
      "title": "Nouvelle conversation",
      "createdAt": "2025-06-19T14:10:39.370Z"
    }
  }
}
```

### Mettre à jour une conversation
Met à jour le titre d'une conversation existante.

**Requête**
```graphql
mutation {
  updateConversation(updateConversationInput: {
    id: "913b7739-73b7-4608-ba5e-441e79e80696",
    title: "Titre mis à jour"
  }) {
    id
    title
    updatedAt
  }
}
```

### Supprimer une conversation
Supprime une conversation et tous ses messages associés.

**Requête**
```graphql
mutation {
  removeConversation(id: "913b7739-73b7-4608-ba5e-441e79e80696") {
    id
    title
  }
}
```

### Créer un message
Ajoute un nouveau message à une conversation existante.

**Requête**
```graphql
mutation {
  createMessage(createMessageInput: {
    conversationId: "913b7739-73b7-4608-ba5e-441e79e80696",
    content: "Ceci est un nouveau message"
  }) {
    id
    content
    createdAt
  }
}
```

**Réponse**
```json
{
  "data": {
    "createMessage": {
      "id": "82e23c9e-b94e-4e44-9d99-4721b41d5905",
      "content": "Ceci est un nouveau message",
      "createdAt": "2025-06-19T14:11:13.537Z"
    }
  }
}
```

### Supprimer un message
Supprime un message existant.

**Requête**
```graphql
mutation {
  removeMessage(id: "82e23c9e-b94e-4e44-9d99-4721b41d5905") {
    id
    content
  }
}
```

## Sécurité et Contrôle d'accès

Toutes les requêtes GraphQL sont protégées par l'authentification Clerk. Les utilisateurs ne peuvent accéder qu'aux données dont ils sont propriétaires. Les vérifications de sécurité sont implémentées à plusieurs niveaux :

1. **Niveau API** : Le garde `ClerkAuthGuard` vérifie la présence d'un token JWT valide dans chaque requête.
2. **Niveau Service** : Chaque opération de service vérifie que l'utilisateur authentifié est bien le propriétaire de la ressource demandée.

## Intégration avec le Frontend

Pour intégrer cette API avec un frontend React/Next.js, utilisez Apollo Client :

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useAuth } from '@clerk/nextjs';

// Configuration du lien HTTP
const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql',
});

// Middleware d'authentification pour inclure le token Clerk
const authLink = setContext(async (_, { headers }) => {
  const { getToken } = useAuth();
  const token = await getToken();
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Création du client Apollo
const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

## Exemples d'utilisation avec Apollo Client

### Récupération des conversations
```typescript
import { gql, useQuery } from '@apollo/client';

const GET_CONVERSATIONS = gql`
  query GetConversations {
    conversations {
      id
      title
      createdAt
    }
  }
`;

function ConversationsList() {
  const { loading, error, data } = useQuery(GET_CONVERSATIONS);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error.message}</p>;

  return (
    <ul>
      {data.conversations.map(conversation => (
        <li key={conversation.id}>{conversation.title}</li>
      ))}
    </ul>
  );
}
```

### Création d'un message
```typescript
import { gql, useMutation } from '@apollo/client';

const CREATE_MESSAGE = gql`
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(createMessageInput: $input) {
      id
      content
      createdAt
    }
  }
`;

function NewMessageForm({ conversationId }) {
  const [content, setContent] = useState('');
  const [createMessage] = useMutation(CREATE_MESSAGE);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMessage({ 
        variables: { 
          input: { 
            conversationId, 
            content 
          } 
        } 
      });
      setContent('');
    } catch (error) {
      console.error('Error creating message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Tapez votre message..."
      />
      <button type="submit">Envoyer</button>
    </form>
  );
}
```

## Gestion des erreurs

L'API GraphQL retourne des erreurs formatées dans la propriété `errors` de la réponse JSON. Voici les erreurs courantes et leurs significations :

- **Authentication required** : Le token d'authentification est manquant ou invalide
- **Conversation not found or access denied** : La conversation demandée n'existe pas ou n'appartient pas à l'utilisateur authentifié
- **Message not found or access denied** : Le message demandé n'existe pas ou n'appartient pas à l'utilisateur authentifié

Exemple d'erreur :
```json
{
  "errors": [
    {
      "message": "Authentication required for GraphQL.",
      "locations": [
        {
          "line": 1,
          "column": 12
        }
      ],
      "path": [
        "conversations"
      ],
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ],
  "data": null
}
```

## Limitations et considérations

- L'API ne prend pas en charge la pagination pour le moment. Si le nombre de conversations ou de messages devient important, il est recommandé d'implémenter une solution de pagination.
- Tous les champs de réponse sont par défaut non null, sauf indication contraire dans le schéma.
- Les requêtes et mutations sont limitées aux ressources appartenant à l'utilisateur authentifié pour des raisons de sécurité.

## Compatibilité

Cette API GraphQL est compatible avec :
- Apollo Client 3.x et versions ultérieures
- React 16.8+ (pour les hooks avec Apollo Client)
- Next.js 13+ avec App Router
