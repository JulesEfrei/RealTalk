import Link from "next/link";
import {
  HomeIcon,
  CalendarIcon,
  PersonIcon,
  BookmarkIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarGroupAction,
} from "@/components/ui/sidebar";
import { DialogClose } from "@radix-ui/react-dialog";
import ToggleTheme from "./ToggleTheme";
import { Input } from "../ui/input";

export function AppSidebar() {
  const labels = [
    { id: "1", name: "Work", href: "/labels/work" },
    { id: "2", name: "Personal", href: "/labels/personal" },
    { id: "3", name: "Urgent", href: "/labels/urgent" },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <h2>RealTalk</h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/conversation">
                  <HomeIcon />
                  Messages
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/friends">
                  <PersonIcon />
                  Friends
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/calendar">
                  <CalendarIcon />
                  Calendar
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Labels</SidebarGroupLabel>
          <SidebarGroupAction>
            <Dialog>
              <form>
                <DialogTrigger asChild>
                  <PlusIcon />
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create new label</DialogTitle>
                    <DialogDescription>
                      Give your new label a name. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="name" className="text-right">
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter label name"
                        className="col-span-3"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Create new label</Button>
                  </DialogFooter>
                </DialogContent>
              </form>
            </Dialog>
          </SidebarGroupAction>
          <SidebarMenu>
            {labels.map((label) => (
              <SidebarMenuItem key={label.id}>
                <SidebarMenuButton asChild>
                  <Link href={label.href}>
                    <BookmarkIcon />
                    {label.name}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Other</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <ToggleTheme />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserButton />
      </SidebarFooter>
    </Sidebar>
  );
}
