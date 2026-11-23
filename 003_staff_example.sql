-- Create staff users in Supabase Authentication > Users first.
-- Replace example addresses with the actual staff account emails, then run the intended statement.
-- No default passwords or public registration endpoint are supplied.
insert into public.sateku_staff(user_id,role)
select id,'cashier' from auth.users where email='GANTI_EMAIL_KASIR'
on conflict(user_id) do update set role=excluded.role;
insert into public.sateku_staff(user_id,role)
select id,'kitchen' from auth.users where email='GANTI_EMAIL_DAPUR'
on conflict(user_id) do update set role=excluded.role;
-- Optional owner/admin (can access both dashboards and manage products):
-- insert into public.sateku_staff(user_id,role)
-- select id,'admin' from auth.users where email='GANTI_EMAIL_ADMIN'
-- on conflict(user_id) do update set role=excluded.role;
