"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/lib/store/user-store";
import { User } from "@supabase/supabase-js";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  const syncUserData = useCallback(async (authUser: User) => {
    const supabase = createClient();

    // Fetch user data from our users table
    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
      return;
    }

    if (userData) {
      setUser({
        id: userData.id,
        email: userData.email,
        username: userData.username,
        avatarUrl: userData.avatar_url,
        xp: userData.xp,
        level: userData.level,
        coins: userData.coins,
        gems: userData.gems,
        hearts: userData.hearts,
        heartsUpdatedAt: new Date(userData.hearts_updated_at),
        currentStreak: userData.current_streak,
        longestStreak: userData.longest_streak,
        lastActivityDate: userData.last_activity_date,
        role: userData.role,
        isGuest: false,
      });
    }
  }, [setUser]);

  useEffect(() => {
    const supabase = createClient();

    // Check initial session using getUser() which validates the JWT
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        // No valid session or error
        return;
      }

      if (user) {
        await syncUserData(user);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") && session?.user) {
          await syncUserData(session.user);
        } else if (event === "SIGNED_OUT") {
          clearUser();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [syncUserData, clearUser]);

  return <>{children}</>;
}
