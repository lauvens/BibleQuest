"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/lib/store/user-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const isSyncing = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    const syncUserData = async (userId: string) => {
      // Prevent duplicate calls
      if (isSyncing.current) {
        console.log("[Auth] Already syncing, skipping...");
        return;
      }
      isSyncing.current = true;

      console.log("[Auth] syncUserData for:", userId);

      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        console.log("[Auth] Query result:", error ? `Error: ${error.message}` : "Success");

        if (error) {
          console.error("[Auth] Error:", error);
          isSyncing.current = false;
          return;
        }

        if (data) {
          console.log("[Auth] Setting user:", data.username);
          setUser({
            id: data.id,
            email: data.email,
            username: data.username,
            avatarUrl: data.avatar_url,
            xp: data.xp,
            level: data.level,
            coins: data.coins,
            gems: data.gems,
            hearts: data.hearts,
            heartsUpdatedAt: new Date(data.hearts_updated_at),
            currentStreak: data.current_streak,
            longestStreak: data.longest_streak,
            lastActivityDate: data.last_activity_date,
            role: data.role,
            isGuest: false,
          });
        }
      } catch (err) {
        console.error("[Auth] Exception:", err);
      } finally {
        isSyncing.current = false;
      }
    };

    // Check session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[Auth] Initial session:", session ? "exists" : "none");
      if (session?.user) {
        syncUserData(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[Auth] Event:", event);

        if (event === "SIGNED_OUT") {
          clearUser();
        } else if (event === "SIGNED_IN" && session?.user) {
          // Use setTimeout to ensure cookies are set
          setTimeout(() => {
            syncUserData(session.user.id);
          }, 100);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, clearUser]);

  return <>{children}</>;
}
