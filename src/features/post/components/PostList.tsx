"use client";

import { useEffect, useState } from "react";
import { PostItem } from "./PostItem";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/types/post";

export function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select(
            `
            *,
            user:users(user_name, email)
          `
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        setPosts(data as Post[]);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();

    // 실시간 업데이트를 위한 구독
    const channel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
        },
        async (payload) => {
          // 새로운 포스트의 사용자 정보를 가져옵니다
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("user_name, email")
            .eq("id", payload.new.user_id)
            .single();

          if (userError) {
            console.error("Error fetching user data:", userError);
            return;
          }

          // 새로운 포스트를 목록 맨 앞에 추가합니다
          const newPost = {
            ...payload.new,
            user: userData,
          } as Post;

          setPosts((currentPosts) => [newPost, ...currentPosts]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return <div className="p-4 text-center">로딩중...</div>;
  }

  return (
    <div className="divide-y">
      {posts.map((post) => (
        <PostItem
          key={post.id}
          userId={post.user_id}
          postId={post.id}
          content={post.content}
          userName={post.user.user_name}
          createdAt={post.created_at}
        />
      ))}
    </div>
  );
}
