import MessageSidebar from "@/components/sidebar/MessageSideBar";

export default function ConversationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <MessageSidebar />
      <section className="w-full h-full">{children}</section>
    </div>
  );
}
