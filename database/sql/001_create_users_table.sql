-- users 프로필 테이블 생성
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  user_name text not null,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- 제약 조건
  constraint users_user_name_key unique (user_name),
  constraint users_email_key unique (email),
  constraint user_name_length check (char_length(user_name) >= 3)
);

-- RLS (Row Level Security) 정책 설정
alter table public.users enable row level security;

-- 사용자가 자신의 프로필만 수정할 수 있도록 정책 생성
create policy "사용자는 자신의 프로필만 수정할 수 있음"
  on public.users for all
  using ( auth.uid() = id )
  with check ( auth.uid() = id );

-- 프로필은 모든 사용자가 볼 수 있음
create policy "프로필은 모든 인증된 사용자가 볼 수 있음"
  on public.users for select
  to authenticated
  using ( true );

-- 자동으로 updated_at 갱신을 위한 트리거 함수
create function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- updated_at 트리거 생성
create trigger handle_users_updated_at
  before update on public.users
  for each row
  execute function handle_updated_at(); 