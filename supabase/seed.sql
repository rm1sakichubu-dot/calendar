insert into public.users (display_name, color, pin_hash, role)
values
  ('管理者', '#2563eb', crypt('1234', gen_salt('bf')), 'admin'),
  ('佐藤', '#16a34a', crypt('1111', gen_salt('bf')), 'editor'),
  ('鈴木', '#f97316', crypt('2222', gen_salt('bf')), 'editor'),
  ('高橋', '#6366f1', crypt('3333', gen_salt('bf')), 'editor'),
  ('田中', '#ec4899', crypt('4444', gen_salt('bf')), 'editor'),
  ('伊藤', '#0ea5e9', crypt('5555', gen_salt('bf')), 'editor');

insert into public.sites (name, address, map_url)
values
  ('中央ビル改修', '東京都千代田区1-1-1', 'https://maps.example.com/site1'),
  ('湾岸倉庫点検', '東京都江東区2-2-2', 'https://maps.example.com/site2'),
  ('新宿ホテル施工', '東京都新宿区3-3-3', 'https://maps.example.com/site3');

with
  users_cte as (select id, display_name from public.users),
  sites_cte as (select id, name from public.sites),
  week_days as (
    select generate_series(date_trunc('week', now())::date, date_trunc('week', now())::date + interval '6 days', interval '1 day') as work_date
  )
insert into public.assignments (
  user_id,
  site_id,
  title,
  start_at,
  end_at,
  meeting_time,
  is_direct_go,
  is_direct_return,
  note,
  created_by,
  updated_by
)
select
  u.id,
  s.id,
  s.name,
  (week_days.work_date + time '09:00')::timestamptz,
  (week_days.work_date + time '17:00')::timestamptz,
  (week_days.work_date + time '08:30')::timestamptz,
  false,
  false,
  '初期投入',
  u.id,
  u.id
from week_days
join users_cte u on u.display_name in ('佐藤', '鈴木', '高橋')
join sites_cte s on s.name = '中央ビル改修'
limit 5;
