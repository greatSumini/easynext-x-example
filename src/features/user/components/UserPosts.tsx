"use client";

import { useEffect, useState } from "react";
import { PostItem } from "@/features/post/components/PostItem";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/types/post";

interface UserPostsProps {
  userId: string;
}

export function UserPosts({ userId }: UserPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select(
            `
            *,
            user:users(user_name, email)
          `
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPosts(data as Post[]);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId]);

  if (isLoading) {
    return <div className="text-center p-4">로딩중...</div>;
  }

  if (posts.length === 0) {
    return <div className="text-center p-4">작성한 글이 없습니다.</div>;
  }

  return (
    <div className="divide-y border rounded-lg">
      {posts.map((post) => (
        <PostItem
          key={post.id}
          postId={post.id}
          content={post.content}
          userName={post.user.user_name}
          userId={post.user_id}
          createdAt={post.created_at}
        />
      ))}
    </div>
  );
}
