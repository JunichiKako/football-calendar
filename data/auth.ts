import { createClient } from '@/lib/supabase/server';

export const currentUser = async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return data?.user || null;
};
