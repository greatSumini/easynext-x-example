"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";

export function CreatePostForm() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("로그인이 필요합니다.");

      const { error } = await supabase.from("posts").insert([
        {
          content: content.trim(),
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      setContent("");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b">
      <Textarea
        placeholder="무슨 일이 일어나고 있나요?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="mb-2"
        rows={3}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading || !content.trim()}>
          {isLoading ? "게시중..." : "게시하기"}
        </Button>
      </div>
    </form>
  );
}
