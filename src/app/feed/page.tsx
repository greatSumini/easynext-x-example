import { CreatePostForm } from "@/features/post/components/CreatePostForm";
import { PostList } from "@/features/post/components/PostList";

export default function FeedPage() {
  return (
    <div className="flex justify-center py-8">
      <div className="w-full max-w-2xl px-4">
        <CreatePostForm />
        <PostList />
      </div>
    </div>
  );
}
