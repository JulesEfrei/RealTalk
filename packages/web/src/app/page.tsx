import { Button } from "@/components/ui/button";
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
    console.log(await res.json());
  };

  const user = await currentUser();
  console.log(user);

  return (
    <>
      <h1>Hello World</h1>
      <form action={call}>
        <Button type={"submit"}>Call API</Button>
      </form>
    </>
  );
}
