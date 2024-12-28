"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { EditUserNameDialog } from "./EditUserNameDialog";

interface UserProfileProps {
  userId: string;
}

interface UserData {
  email: string;
  user_name: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 현재 로그인한 사용자 정보 가져오기
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsCurrentUser(session?.user?.id === userId);

        // 프로필 사용자 정보 가져오기
        const { data, error } = await supabase
          .from("users")
          .select("email, user_name")
          .eq("id", userId)
          .single();

        if (error) throw error;
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleEditComplete = (newUserName: string) => {
    setUserData((prev) => (prev ? { ...prev, user_name: newUserName } : null));
    setShowEditDialog(false);
  };

  if (isLoading) {
    return <div className="text-center p-4">로딩중...</div>;
  }

  if (!userData) {
    return <div className="text-center p-4">사용자를 찾을 수 없습니다.</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{userData.user_name}</h2>
              <p className="text-sm text-muted-foreground">{userData.email}</p>
            </div>
            {isCurrentUser && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowEditDialog(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <EditUserNameDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        currentName={userData.user_name}
        onComplete={handleEditComplete}
      />
    </>
  );
}
