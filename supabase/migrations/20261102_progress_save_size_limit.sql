-- Cap each learner's saved progress (photo included) at 300 KB so nobody can fill the database.
alter table public.progress add constraint progress_save_size check (octet_length(save::text) < 300000);
