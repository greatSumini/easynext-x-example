import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import { Heart, MessageCircle, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Comments } from "@/features/comment/components/Comments";
import { DeletePostDialog } from "./DeletePostDialog";
import { useUser } from "@/hooks/useUser";
import { EditPostDialog } from "./EditPostDialog";

interface PostItemProps {
  content: string;
  userName: string;
  userId: string;
  postId: string;
  createdAt: string;
  initialLikeCount?: number;
  initialIsLiked?: boolean;
}

export function PostItem({
  content: _content,
  userName,
  userId,
  postId,
  createdAt,
  initialLikeCount = 0,
  initialIsLiked = false,
}: PostItemProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const { user } = useUser();
  const isOwner = user?.id === userId;
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [content, setContent] = useState(_content);

  useEffect(() => {
    setContent(_content);
  }, [_content]);

  useEffect(() => {
    const checkLikeStatus = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", session.user.id)
        .single();

      setIsLiked(!!data);
    };

    const fetchLikeCount = async () => {
      const { count } = await supabase
        .from("likes")
        .select("id", { count: "exact" })
        .eq("post_id", postId);

      setLikeCount(count || 0);
    };

    const fetchCommentCount = async () => {
      const { count } = await supabase
        .from("comments")
        .select("id", { count: "exact" })
        .eq("post_id", postId);

      setCommentCount(count || 0);
    };

    checkLikeStatus();
    fetchLikeCount();
    fetchCommentCount();

    const channel = supabase
      .channel(`comments_count_${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCommentCount((prev) => prev + 1);
          } else if (payload.eventType === "DELETE") {
            setCommentCount((prev) => prev - 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const handleLikeClick = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      // 로그인이 필요하다는 메시지를 표시할 수 있습니다
      return;
    }

    setIsLoading(true);
    try {
      if (isLiked) {
        // 좋아요 취소
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", session.user.id);

        setLikeCount((prev) => prev - 1);
      } else {
        // 좋아요 추가
        await supabase.from("likes").insert({
          post_id: postId,
          user_id: session.user.id,
        });

        setLikeCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border-b">
      <div className="flex items-center gap-2 mb-2">
        <Link href={`/user/${userId}`} className="font-bold hover:underline">
          {userName}
        </Link>
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(createdAt), {
            addSuffix: true,
            locale: ko,
          })}
        </span>
        <div className="flex-1" />
        {isOwner && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEditDialog(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <DeletePostDialog postId={postId} />
          </div>
        )}
      </div>
      <p className="text-sm whitespace-pre-wrap mb-2">{content}</p>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={handleLikeClick}
          disabled={isLoading}
        >
          <Heart
            className={`h-4 w-4 ${
              isLiked ? "fill-red-500 text-red-500" : "text-gray-500"
            }`}
          />
          <span className="text-sm">{likeCount}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">{commentCount}</span>
        </Button>
      </div>
      {showComments && (
        <div className="mt-4">
          <Comments postId={postId} />
        </div>
      )}
      {isOwner && (
        <EditPostDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          postId={postId}
          initialContent={content}
          onComplete={(newContent) => {
            // 컴포넌트 상태 업데이트
            setContent(newContent);
          }}
        />
      )}
    </div>
  );
}
