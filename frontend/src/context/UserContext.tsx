"use client";
import { createContext, useContext, ReactNode, useState } from "react";
import { AppUser } from "@/types/user";

interface UserContextType {
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// 2. O Provider que vai envolver a aplicação
export function UserProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: AppUser | null;
}) {
  // Iniciamos o estado com os dados que vieram do SERVIDOR
  const [user, setUser] = useState<AppUser | null>(initialUser);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// 3. Hook personalizado para facilitar o uso
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser deve ser usado dentro de un UserProvider");
  }
  return context;
}
