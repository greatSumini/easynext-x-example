import { UserProfile } from "@/features/user/components/UserProfile";
import { UserPosts } from "@/features/user/components/UserPosts";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserPage({ params: paramPromise }: PageProps) {
  const param = await paramPromise;

  console.log(param);

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", param.id)
      .single();

    if (error || !data) {
      notFound();
    }

    return (
      <div className="container max-w-2xl py-8 space-y-8">
        <UserProfile userId={param.id} />
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">작성한 글</h2>
          <UserPosts userId={param.id} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error checking user:", error);
    notFound();
  }
}
