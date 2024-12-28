"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface EditUserNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onComplete: (newName: string) => void;
}

export function EditUserNameDialog({
  open,
  onOpenChange,
  currentName,
  onComplete,
}: EditUserNameDialogProps) {
  const [userName, setUserName] = useState(currentName);
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
        .from("users")
        .update({ user_name: userName.trim() })
        .eq("id", session.user.id);

      if (error) throw error;

      onComplete(userName.trim());
    } catch (err) {
      console.error("Error updating username:", err);
      setError(
        err instanceof Error
          ? err.message
          : "닉네임 수정 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>닉네임 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userName">새로운 닉네임</Label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="새로운 닉네임을 입력하세요"
              required
            />
          </div>
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
                isLoading || !userName.trim() || userName === currentName
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
