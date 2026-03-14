// "use client";
// import { useRouter } from "next/navigation";
// import { ReactNode, useEffect } from "react";

// export function AuthGuard({ children }: { children: ReactNode }) {
//   const { token, loading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!loading && !token) router.replace("/login");
//   }, [loading, token, router]);

//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950">
//         <div className="flex flex-col items-center gap-4">
//           <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent" />
//           <p className="text-indigo-300 text-sm">Loading…</p>
//         </div>
//       </div>
//     );
//   }

//   if (!token) return null;
//   return <>{children}</>;
// }
