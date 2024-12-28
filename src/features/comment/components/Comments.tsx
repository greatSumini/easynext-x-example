import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { CommentItem } from "./CommentItem";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  user: {
    user_name: string;
  };
}

interface CommentsProps {
  postId: string;
}

export function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select(
            `
            *,
            user:users(user_name)
          `
          )
          .eq("post_id", postId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setComments(data as Comment[]);

        // 현재 로그인한 사용자 ID 가져오기
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setCurrentUserId(session?.user?.id || null);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();

    // 실시간 업데이트를 위한 구독
    const channel = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const { data: userData } = await supabase
              .from("users")
              .select("user_name")
              .eq("id", payload.new.user_id)
              .single();

            const newComment = {
              ...payload.new,
              user: userData,
            } as Comment;

            setComments((prev) => [...prev, newComment]);
          } else if (payload.eventType === "DELETE") {
            setComments((prev) =>
              prev.filter((comment) => comment.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("로그인이 필요합니다.");

      const { error } = await supabase.from("comments").insert({
        content: newComment.trim(),
        post_id: postId,
        user_id: session.user.id,
      });

      if (error) throw error;
      setNewComment("");
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">로딩중...</div>;
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="댓글을 입력하세요"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={2}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            size="sm"
          >
            {isSubmitting ? "작성 중..." : "댓글 작성"}
          </Button>
        </div>
      </form>

      <div className="space-y-2 divide-y">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            id={comment.id}
            content={comment.content}
            userName={comment.user.user_name}
            userId={comment.user_id}
            createdAt={comment.created_at}
            currentUserId={currentUserId}
            onDelete={() =>
              setComments((prev) => prev.filter((c) => c.id !== comment.id))
            }
          />
        ))}
        {comments.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            아직 댓글이 없습니다
          </p>
        )}
      </div>
    </div>
  );
}
