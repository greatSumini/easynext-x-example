import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";

interface EditPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  initialContent: string;
  onComplete: (newContent: string) => void;
}

export function EditPostDialog({
  open,
  onOpenChange,
  postId,
  initialContent,
  onComplete,
}: EditPostDialogProps) {
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("로그인이 필요합니다.");
      }

      const { error } = await supabase
        .from("posts")
        .update({ content: content.trim() })
        .eq("id", postId)
        .eq("user_id", session.user.id);

      if (error) throw error;

      onComplete(content.trim());
      onOpenChange(false);
    } catch (err) {
      console.error("Error updating post:", err);
      setError(
        err instanceof Error
          ? err.message
          : "게시글 수정 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>게시글 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="수정할 내용을 입력하세요"
            className="min-h-[100px]"
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading || !content.trim() || content === initialContent
              }
            >
              {isLoading ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
