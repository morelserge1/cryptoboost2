
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, dbHelpers } from '@/lib/customSupabaseClient';

const AuthContext = createContext({});

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
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user) {
        try {
          const userData = await dbHelpers.getUserById(session.user.id);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          try {
            const userData = await dbHelpers.getUserById(session.user.id);
            setUser(userData);
          } catch (error) {
            // If user doesn't exist in our database, create them
            if (error.code === 'PGRST116') {
              const newUser = {
                id: session.user.id,
                email: session.user.email,
                role: 'client',
                balance: 0,
                invested_amount: 0,
                total_profit: 0,
                is_active: true,
                created_at: new Date().toISOString()
              };
              
              try {
                const createdUser = await dbHelpers.createUser(newUser);
                setUser(createdUser);
              } catch (createError) {
                console.error('Error creating user:', createError);
              }
            } else {
              console.error('Error fetching user data:', error);
            }
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates) => {
    if (!user) return { error: 'No user logged in' };
    
    try {
      const updatedUser = await dbHelpers.updateUser(user.id, updates);
      setUser(updatedUser);
      return { data: updatedUser, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
