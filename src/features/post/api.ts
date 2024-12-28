import { supabase } from "@/lib/supabase";

export const deletePost = async (postId: string) => {
  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) throw error;
  return true;
};
