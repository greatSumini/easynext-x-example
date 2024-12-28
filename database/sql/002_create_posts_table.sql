-- posts 테이블 생성
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- 제약 조건
  constraint content_length check (char_length(content) <= 500)
);

-- 인덱스 생성
create index posts_user_id_idx on public.posts(user_id);
create index posts_created_at_idx on public.posts(created_at desc);

-- RLS (Row Level Security) 정책 설정
alter table public.posts enable row level security;

-- 인증된 사용자만 게시물을 생성할 수 있음
create policy "인증된 사용자는 게시물을 생성할 수 있음"
  on public.posts for insert
  to authenticated
  with check ( auth.uid() = user_id );

-- 작성자만 자신의 게시물을 수정/삭제할 수 있음
create policy "작성자는 자신의 게시물을 수정할 수 있음"
  on public.posts for update
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

create policy "작성자는 자신의 게시물을 삭제할 수 있음"
  on public.posts for delete
  using ( auth.uid() = user_id );

-- 모든 인증된 사용자가 게시물을 볼 수 있음
create policy "인증된 사용자는 모든 게시물을 볼 수 있음"
  on public.posts for select
  to authenticated
  using ( true );

-- updated_at 트리거 생성
create trigger handle_posts_updated_at
  before update on public.posts
  for each row
  execute function handle_updated_at(); 