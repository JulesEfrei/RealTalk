import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

export default async function Home() {
  const call = async () => {
    "use server";
    const res = await fetch("http://localhost:3000/protected", {
      headers: {
        Cookie: (await cookies()).toString(),
      },
    });
    const data = await res.json();
    console.log(data?.user?.data || "No user data available");
  };

  const user = await currentUser();

  return (
    <div className="flex">
      <form action={call}>
        <Button type={"submit"}>Call API</Button>
      </form>
    </div>
  );
}
