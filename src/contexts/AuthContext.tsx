// "use client";
// import {
//   createContext,
//   ReactNode,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// // import { getCurrentUser } from "@/services/auth";
// // import { AuthMeResponse } from "@/types/api";
// // import { tokenStorage } from "@/lib/storage";

// type AuthCtx = {
//   token: string | null;
//   me: AuthMeResponse | null;
//   loading: boolean;
//   setToken: (v: string | null) => void;
//   refreshMe: () => Promise<void>;
//   logout: () => void;
// };

// const Ctx = createContext<AuthCtx | null>(null);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [token, setTokenState] = useState<string | null>(null);
//   const [me, setMe] = useState<AuthMeResponse | null>(null);
//   const [loading, setLoading] = useState(true);

//   const refreshMe = useCallback(async () => {
//     const t = tokenStorage.get();
//     if (!t) {
//       setMe(null);
//       setLoading(false);
//       return;
//     }
//     try {
//       const profile = await getCurrentUser();
//       setMe(profile);
//     } catch {
//       tokenStorage.clear();
//       setTokenState(null);
//       setMe(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     setTokenState(tokenStorage.get());
//     refreshMe();
//   }, [refreshMe]);

//   const setToken = useCallback((v: string | null) => {
//     if (v) {
//       tokenStorage.set(v);
//     } else {
//       tokenStorage.clear();
//       setMe(null);
//     }
//     setTokenState(v);
//   }, []);

//   const logout = useCallback(() => {
//     tokenStorage.clear();
//     setTokenState(null);
//     setMe(null);
//   }, []);

//   const value = useMemo(
//     () => ({ token, me, loading, setToken, refreshMe, logout }),
//     [token, me, loading, setToken, refreshMe, logout],
//   );

//   return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
// }

// export function useAuth() {
//   const ctx = useContext(Ctx);
//   if (!ctx) throw new Error("useAuth must be inside AuthProvider");
//   return ctx;
// }
