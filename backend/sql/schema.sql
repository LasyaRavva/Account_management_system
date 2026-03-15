create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password text not null,
  balance numeric(12, 2) not null default 10000.00 check (balance >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  transfer_ref uuid not null,
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  transaction_type text not null check (transaction_type in ('credit', 'debit')),
  balance_after_transaction numeric(12, 2) not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_users_email on public.users(email);
create index if not exists idx_transactions_sender_id on public.transactions(sender_id);
create index if not exists idx_transactions_receiver_id on public.transactions(receiver_id);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);

create or replace function public.transfer_funds(
  p_sender_id uuid,
  p_receiver_id uuid,
  p_amount numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  sender_current_balance numeric(12, 2);
  receiver_current_balance numeric(12, 2);
  sender_new_balance numeric(12, 2);
  receiver_new_balance numeric(12, 2);
  transfer_id uuid := gen_random_uuid();
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Transfer amount must be greater than zero';
  end if;

  if p_sender_id = p_receiver_id then
    raise exception 'You cannot transfer money to your own account';
  end if;

  select balance
  into sender_current_balance
  from public.users
  where id = p_sender_id
  for update;

  if sender_current_balance is null then
    raise exception 'Sender account not found';
  end if;

  select balance
  into receiver_current_balance
  from public.users
  where id = p_receiver_id
  for update;

  if receiver_current_balance is null then
    raise exception 'Receiver account not found';
  end if;

  if sender_current_balance < p_amount then
    raise exception 'Insufficient balance';
  end if;

  update public.users
  set balance = balance - p_amount
  where id = p_sender_id
  returning balance into sender_new_balance;

  update public.users
  set balance = balance + p_amount
  where id = p_receiver_id
  returning balance into receiver_new_balance;

  insert into public.transactions (
    transfer_ref,
    sender_id,
    receiver_id,
    amount,
    transaction_type,
    balance_after_transaction
  )
  values
    (
      transfer_id,
      p_sender_id,
      p_receiver_id,
      p_amount,
      'debit',
      sender_new_balance
    ),
    (
      transfer_id,
      p_sender_id,
      p_receiver_id,
      p_amount,
      'credit',
      receiver_new_balance
    );

  return jsonb_build_object(
    'transfer_ref', transfer_id,
    'sender_balance', sender_new_balance,
    'receiver_balance', receiver_new_balance
  );
end;
$$;
