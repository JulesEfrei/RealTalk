import MessageSidebar from "@/components/sidebar/MessageSideBar";

export default function ConversationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <MessageSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
