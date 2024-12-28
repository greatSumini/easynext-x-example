import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface CommentItemProps {
  id: string;
  content: string;
  userName: string;
  userId: string;
  createdAt: string;
  currentUserId?: string | null;
  onDelete?: () => void;
}

export function CommentItem({
  id,
  content,
  userName,
  userId,
  createdAt,
  currentUserId,
  onDelete,
}: CommentItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.from("comments").delete().eq("id", id);

      if (error) throw error;
      onDelete?.();
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="py-2 px-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-sm">{userName}</span>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(createdAt), {
            addSuffix: true,
            locale: ko,
          })}
        </span>
        {currentUserId === userId && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-sm">{content}</p>
    </div>
  );
}
