import { AppUser, UserFromApi, UserFromTokenDecoded } from "@/types/user";

function normalizePlan(value?: string) {
  const plan = value?.trim();
  return plan ? plan : undefined;
}

export function normalizeUserFromApi(
  user?: UserFromApi | null,
): AppUser | null {
  if (!user) {
    return null;
  }

  return {
    name: user.name,
    email: user.email,
    role: user.role,
    plan: normalizePlan(user.plan ?? user.subscription_type),
    urlPhoto: user.avatar_url,
  };
}

export function normalizeUserFromToken(
  user?: UserFromTokenDecoded | null,
): AppUser | null {
  if (!user) {
    return null;
  }

  return {
    name: user.name,
    email: user.email,
    role: user.role,
    plan: normalizePlan(user.plan ?? user.subscription_type),
    urlPhoto: user.urlPhoto ?? user.avatar_url,
  };
}
