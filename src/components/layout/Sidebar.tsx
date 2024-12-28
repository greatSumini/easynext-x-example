"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { Home, User, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, signOut } = useUser();

  if (!isAuthenticated) {
    return null;
  }

  const navigation = [
    {
      name: "피드",
      href: "/feed",
      icon: Home,
    },
    {
      name: "마이페이지",
      href: "/mypage",
      icon: User,
    },
  ];

  return (
    <div className="flex flex-col gap-2 p-4 border-r min-h-screen w-[240px]">
      <div className="mb-8">
        <h1 className="text-xl font-bold">SNS 앱</h1>
      </div>
      <nav className="flex flex-col gap-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  pathname === item.href && "bg-accent"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </Button>
      </nav>
    </div>
  );
}
