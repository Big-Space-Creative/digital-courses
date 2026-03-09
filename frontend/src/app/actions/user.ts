import decodeJwt from "@/libs/decodeJwt.ts";
import { normalizeUserFromToken } from "@/libs/normalizeUser";
import { UserFromTokenDecoded } from "@/types/user";
import { cookies } from "next/headers";

export async function getUserFromToken() {
  try {
    const cookieStore = await cookies();

    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return null;
    }

    const decodedToken = decodeJwt<UserFromTokenDecoded>(accessToken);

    if (!decodedToken) {
      return null;
    }

    return normalizeUserFromToken(decodedToken);
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return null;
  }
}
