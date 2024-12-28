"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { SignUpFormData } from "@/types/auth";
import Link from "next/link";

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data: SignUpFormData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      userName: formData.get("userName") as string,
    };

    try {
      // 1. Supabase Auth로 회원가입
      const { error: signUpError, data: authData } = await supabase.auth.signUp(
        {
          email: data.email,
          password: data.password,
        }
      );

      if (signUpError) throw signUpError;

      // 2. 추가 사용자 정보를 users 테이블에 저장
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: authData.user?.id,
          email: data.email,
          user_name: data.userName,
        },
      ]);

      if (profileError) throw profileError;

      // 3. 성공시 피드 페이지로 리다이렉트
      router.push("/feed");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "회원가입 중 오류가 발생했습니다."
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

      <div className="space-y-2">
        <Label htmlFor="userName">닉네임</Label>
        <Input
          id="userName"
          name="userName"
          type="text"
          placeholder="닉네임을 입력하세요"
          required
        />
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "처리중..." : "회원가입"}
      </Button>

      <div className="text-center text-sm">
        이미 계정이 있으신가요?{" "}
        <Link href="/signin" className="text-primary hover:underline">
          로그인
        </Link>
      </div>
    </form>
  );
}
