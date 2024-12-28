export interface Post {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  user: {
    user_name: string;
    email: string;
  };
}
