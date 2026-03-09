import { jwtDecode } from "jwt-decode";

export default function decodeJwt<T>(token: string) {
  return jwtDecode<T>(token);
}
