-- likes 테이블 생성
create table public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- 사용자당 게시물 하나에 좋아요 한 번만 가능하도록 제약
  constraint likes_user_post_unique unique (user_id, post_id)
);

-- 인덱스 생성
create index likes_user_id_idx on public.likes(user_id);
create index likes_post_id_idx on public.likes(post_id);

-- RLS 정책 설정
alter table public.likes enable row level security;

-- 인증된 사용자만 좋아요를 할 수 있음
create policy "인증된 사용자는 좋아요를 할 수 있음"
  on public.likes for insert
  to authenticated
  with check ( auth.uid() = user_id );

-- 사용자는 자신의 좋아요만 삭제할 수 있음
create policy "사용자는 자신의 좋아요를 삭제할 수 있음"
  on public.likes for delete
  using ( auth.uid() = user_id );

-- 모든 인증된 사용자가 좋아요 정���를 볼 수 있음
create policy "인증된 사용자는 모든 좋아요 정보를 볼 수 있음"
  on public.likes for select
  to authenticated
  using ( true ); 