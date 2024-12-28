"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/features/user/components/UserProfile";
import { UserPosts } from "@/features/user/components/UserPosts";
import { supabase } from "@/lib/supabase";

export default function MyPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/signin");
        return;
      }

      setUserId(session.user.id);
    };

    checkAuth();
  }, [router]);

  if (!userId) {
    return null;
  }

  return (
    <div className="container max-w-2xl py-8 space-y-8">
      <UserProfile userId={userId} />
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">내가 쓴 글</h2>
        <UserPosts userId={userId} />
      </div>
    </div>
  );
}
