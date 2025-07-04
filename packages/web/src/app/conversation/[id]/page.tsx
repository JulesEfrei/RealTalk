import ConversationWrapper from "@/components/conversation/ConversationWrapper";

interface ConversationPageProps {
  params: Promise<{
    id: string;
  }>;
}

const ConversationPage = async ({ params }: ConversationPageProps) => {
  const { id: conversationId } = await params;

  return <ConversationWrapper conversationId={conversationId} />;
};

export default ConversationPage;
