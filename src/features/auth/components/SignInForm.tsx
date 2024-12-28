"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        if (signInError.message === "Invalid login credentials") {
          throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        throw signInError;
      }

      // 로그인 성공시 피드 페이지로 리다이렉트
      router.push("/feed");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "로그인 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "처리중..." : "로그인"}
      </Button>

      <div className="text-center text-sm">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          회원가입
        </Link>
      </div>
    </form>
  );
}
