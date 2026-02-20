import getSupabase from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import type { UserRow, IUser } from '@/types/db';
import { userRowToUser } from '@/types/db';

export async function getUserById(id: string): Promise<IUser | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return userRowToUser(data as UserRow);
}

export async function getUserByIdWithPassword(id: string): Promise<(UserRow & { password: string }) | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data as UserRow & { password: string };
}

export async function getUserByEmail(email: string): Promise<(IUser & { password?: string }) | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();
  if (error || !data) return null;
  const row = data as UserRow;
  return {
    ...userRowToUser(row),
    password: row.password,
  };
}

export async function getUserByPhone(phoneNumber: string): Promise<(IUser & { password?: string }) | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone_number', phoneNumber.trim())
    .single();
  if (error || !data) return null;
  const row = data as UserRow;
  return {
    ...userRowToUser(row),
    password: row.password,
  };
}

export async function comparePassword(userPasswordHash: string, candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, userPasswordHash);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
