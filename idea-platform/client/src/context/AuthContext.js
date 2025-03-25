import React, { createContext, useState, useContext, useEffect } from 'react';

// Create Authentication Context
const AuthContext = createContext();

/**
 * AuthProvider Component
 * Provides authentication state and methods to all child components
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.storageKey - Key used for storing auth data in localStorage (default: 'auth')
 */
export const AuthProvider = ({ children, storageKey = 'auth' }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load authentication state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedAuth = localStorage.getItem(storageKey);
      
      if (savedToken && savedAuth) {
        const authData = JSON.parse(savedAuth);
        setCurrentUser(authData.user);
        setToken(savedToken);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Failed to restore authentication state:', err);
      localStorage.removeItem(storageKey);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, [storageKey]);

  // Save authentication state to localStorage whenever it changes
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      localStorage.setItem(storageKey, JSON.stringify({ 
        user: currentUser, 
        timestamp: new Date().toISOString() 
      }));
    }
  }, [currentUser, isAuthenticated, storageKey]);

  /**
   * Login function
   * Authenticates a user with provided credentials
   * 
   * @param {Object} credentials - User login credentials (typically email/username and password)
   * @param {Function} apiLoginFunction - Optional external API login function
   * @returns {Promise<Object>} - Promise resolving to the logged in user
   */
  const login = async (credentials, apiLoginFunction) => {
    setError(null);
    try {
      let userData;
      let newToken;
      
      if (apiLoginFunction) {
        // Use provided API login function
        const response = await apiLoginFunction(credentials);
        userData = response.user;
        newToken = response.token;
      } else {
        // Mock login - replace with actual API call in production
        // This is just for demonstration
        userData = { 
          id: '123', 
          name: 'User', 
          email: credentials.email,
          role: 'user',
          // Additional user data would come from your API
        };
        newToken = 'mock-token-' + Math.random().toString(36).substring(2);
      }
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setCurrentUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  /**
   * Register function
   * Registers a new user
   * 
   * @param {Object} userData - User registration data
   * @param {Function} apiRegisterFunction - Optional external API register function
   * @returns {Promise<Object>} - Promise resolving to the registered user
   */
  const register = async (userData, apiRegisterFunction) => {
    setError(null);
    try {
      let newUser;
      let newToken;
      
      if (apiRegisterFunction) {
        // Use provided API register function
        const response = await apiRegisterFunction(userData);
        newUser = response.user;
        newToken = response.token;
      } else {
        // Mock registration - replace with actual API call in production
        newUser = { 
          id: Math.random().toString(36).substr(2, 9),
          name: userData.name,
          email: userData.email,
          role: 'user',
          createdAt: new Date().toISOString(),
        };
        newToken = 'mock-token-' + Math.random().toString(36).substring(2);
      }
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      return newUser;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  /**
   * Logout function
   * Logs out the current user
   */
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem(storageKey);
    localStorage.removeItem('token');
  };

  /**
   * Update user function
   * Updates the current user's data
   * 
   * @param {Object} updates - User data updates
   * @param {Function} apiUpdateFunction - Optional external API update function
   * @returns {Promise<Object>} - Promise resolving to the updated user
   */
  const updateUser = async (updates, apiUpdateFunction) => {
    setError(null);
    try {
      if (!currentUser) {
        throw new Error('No user is logged in');
      }
      
      let updatedUser;
      
      if (apiUpdateFunction) {
        // Use provided API update function
        updatedUser = await apiUpdateFunction(currentUser.id, updates, token);
      } else {
        // Mock update - replace with actual API call in production
        updatedUser = { 
          ...currentUser,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      
      setCurrentUser(updatedUser);
      
      // Update localStorage
      const savedAuth = localStorage.getItem(storageKey);
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        authData.user = updatedUser;
        localStorage.setItem(storageKey, JSON.stringify(authData));
      }
      
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Update failed');
      throw err;
    }
  };

  /**
   * Check if the current user has a specific role
   * @param {string|string[]} roles - Role or array of roles to check
   * @returns {boolean} - True if the user has at least one of the specified roles
   */
  const hasRole = (roles) => {
    if (!currentUser || !currentUser.role) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(currentUser.role);
    }
    
    return currentUser.role === roles;
  };

  // Value object provided to consumers of this context
  const contextValue = {
    currentUser,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    hasRole
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;