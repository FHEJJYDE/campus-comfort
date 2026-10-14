import React, { useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext, AuthContextType } from "@/types/auth";

// Custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<import('@supabase/supabase-js').Session | null>(null);
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);
  const [userType, setUserType] = useState<"admin" | "agent" | "user" | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we're accessing preview routes specifically
    const isPreviewRoute = window.location.pathname.startsWith('/preview/');

    if (isPreviewRoute) {
      // For preview routes only, create a mock user and determine type from URL
      const mockUser = {
        id: 'preview-user',
        email: 'preview@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        email_confirmed_at: new Date().toISOString(),
        phone: '',
        confirmed_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setUser(mockUser as import('@supabase/supabase-js').User);

      // Determine user type from URL
      if (window.location.pathname.includes('admin')) {
        setUserType("admin");
      } else {
        // All other users are now just "user" type since we removed agents
        setUserType("user");
      }
      setLoading(false);
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setUserType(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      } else {
        setLoading(false);
      }
    });

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn("Auth loading timeout - setting loading to false");
      setLoading(false);
    }, 10000); // 10 second timeout

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []); // FIXED: Empty dependency array prevents infinite loop

  async function fetchUserProfile(userId: string) {
    // Check if we're in preview mode
    const isPreviewMode = window.location.pathname.startsWith('/preview/');

    if (isPreviewMode) {
      // For preview mode, determine user type from URL
      if (window.location.pathname.includes('/admin')) {
        setUserType("admin");
      } else {
        // All other users are now just "user" type since we removed agents
        setUserType("user");
      }
      setLoading(false);
      return;
    }

    try {
      // Use explicit typing for the response
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId) // Use the userId parameter instead of user.id
        .single() as { data: { user_type: string } | null; error: Error | null };

      if (error) {
        console.error("Error fetching user profile:", error);
        // If profile doesn't exist, this might be a new user
        // Create a minimal profile and default to 'user' type
        try {
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: user?.email || 'unknown@example.com',
              user_type: 'user',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (createError) {
            console.error("Error creating fallback profile:", createError);
          } else {
            console.log("Created fallback profile for user:", userId);
          }
        } catch (createProfileError) {
          console.error("Error in fallback profile creation:", createProfileError);
        }

        // Default to 'user' type
        setUserType("user");
        setLoading(false);
        return;
      }

      if (data) {
        // Validate the user_type value
        const validUserTypes = ["admin", "agent", "user"];
        const userTypeValue = data.user_type as "admin" | "agent" | "user";

        if (validUserTypes.includes(userTypeValue)) {
          setUserType(userTypeValue);
        } else {
          // If user_type is invalid, default to 'user' and log warning
          console.warn(`Invalid user_type '${data.user_type}' for user ${userId}, defaulting to 'user'`);
          setUserType("user");
        }
      } else {
        // If no data returned, default to 'user' type
        setUserType("user");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      // On any error, default to 'user' type and stop loading
      setUserType("user");
      setLoading(false);
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userType,
        signOut,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function RequireAuth({
  children,
  requiredUserType
}: {
  children: JSX.Element;
  requiredUserType?: "admin" | "agent" | "user";
}) {
  const context = useContext(AuthContext);
  console.log("RequireAuth context:", context);
  console.log("Required user type:", requiredUserType);

  if (context === undefined) {
    throw new Error("RequireAuth must be used within an AuthProvider");
  }
  const { user, userType, loading } = context;

  console.log("Auth state:", { user, userType, loading });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    console.log("No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (requiredUserType && userType !== requiredUserType) {
    console.log("User type mismatch:", { userType, requiredUserType });
    // If userType is null but user exists, it might still be loading
    if (userType === null && user) {
      return <div className="flex justify-center items-center h-screen">Verifying access...</div>;
    }

    // Redirect to the appropriate dashboard if logged in but wrong type
    if (userType === "admin") {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (userType === "agent") {
      return <Navigate to="/dashboard/agent" replace />;
    } else if (userType === "user") {
      return <Navigate to="/dashboard/user" replace />;
    }
  }

  console.log("Access granted to protected route");
  return children;
}