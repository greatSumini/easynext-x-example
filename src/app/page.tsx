"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // 로그인된 상태면 피드로 이동
        router.push("/feed");
      } else {
        // 로그인되지 않은 상태면 로그인 페이지로 이동
        router.push("/signin");
      }
    };

    checkAuth();
  }, [router]);

  return null; // 리다이렉션 중에는 아무것도 표시하지 않음
}
