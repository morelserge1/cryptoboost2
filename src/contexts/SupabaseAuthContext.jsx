
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, dbHelpers } from '@/lib/customSupabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          try {
            const userData = await dbHelpers.getUserByEmail(session.user.email);
            setUser(userData);
          } catch (dbError) {
            console.error('Error fetching user data:', dbError);
            // Create user if doesn't exist
            try {
              const newUser = await dbHelpers.createUser({
                email: session.user.email,
                role: 'client',
                balance: 0,
                invested_amount: 0,
                total_profit: 0,
                is_active: true
              });
              setUser(newUser);
            } catch (createError) {
              console.error('Error creating user:', createError);
            }
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const userData = await dbHelpers.getUserByEmail(session.user.email);
            setUser(userData);
          } catch (error) {
            console.error('Error fetching user on sign in:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      
      const userData = await dbHelpers.getUserByEmail(email);
      setUser(userData);
      return { user: userData, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error };
    }
  };

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) throw error;

      // Create user profile
      if (data.user) {
        const newUser = await dbHelpers.createUser({
          email: data.user.email,
          role: 'client',
          balance: 0,
          invested_amount: 0,
          total_profit: 0,
          is_active: true
        });
        setUser(newUser);
      }
      
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateUser = async (updates) => {
    try {
      const updatedUser = await dbHelpers.updateUser(user.id, updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
