-- comments 테이블 생성
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 인덱스 생성
create index comments_user_id_idx on public.comments(user_id);
create index comments_post_id_idx on public.comments(post_id);

-- RLS 정책 설정
alter table public.comments enable row level security;

-- 인증된 사용자만 댓글을 작성할 수 있음
create policy "인증된 사용자는 댓글을 작성할 수 있음"
  on public.comments for insert
  to authenticated
  with check ( auth.uid() = user_id );

-- 작성자만 자신의 댓글을 수정/삭제할 수 있음
create policy "작성자는 자신의 댓글을 수정할 수 있음"
  on public.comments for update
  using ( auth.uid() = user_id );

create policy "작성자는 자신의 댓글을 삭제할 수 있음"
  on public.comments for delete
  using ( auth.uid() = user_id );

-- 모든 인증된 사용자가 댓글을 볼 수 있음
create policy "인증된 사용자는 모든 댓글을 볼 수 있음"
  on public.comments for select
  to authenticated
  using ( true );

-- updated_at 트리거 생성
create trigger handle_comments_updated_at
  before update on public.comments
  for each row
  execute function handle_updated_at(); 