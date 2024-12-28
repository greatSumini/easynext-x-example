import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export function useUser() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 현재 세션 확인
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error checking user session:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // 인증 상태 변경 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      // 로그아웃 시 로그인 페이지로 리다이렉트
      if (event === "SIGNED_OUT") {
        router.push("/signin");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // 로그아웃 함수
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return {
    user,
    isLoading,
    signOut,
    isAuthenticated: !!user,
  };
}
