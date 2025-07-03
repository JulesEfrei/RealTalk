import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

import { ThemeProvider } from "@/components/ThemeProvider";
import ApolloProviderWrapper from "@/components/ApolloProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/AppSidebar";

export const metadata: Metadata = {
  title: "RealTalk",
  description: "RealTalk - Talk with your friends anywhere",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ApolloProviderWrapper>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <SidebarProvider>
                <AppSidebar />
                <main className="w-full">{children}</main>
              </SidebarProvider>
            </ThemeProvider>
          </ApolloProviderWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
