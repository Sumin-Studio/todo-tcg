import "server-only";

function assertEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to .env.local for local development and to Vercel before deploying.`
    );
  }

  return value;
}

export function getSupabaseServerEnv() {
  const url = assertEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const serviceRoleKey = assertEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  return {
    url,
    serviceRoleKey,
  };
}
