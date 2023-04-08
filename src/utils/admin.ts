import { createClient } from '@supabase/supabase-js';
const admin = createClient(
  `https://${process.env.SUPERBASE_PROJECT_ID}.supabase.co`,
  process.env.SUPERBASE_PRIVATE_SERVICE_ROLE,
);
const { auth } = admin;
export { auth };
