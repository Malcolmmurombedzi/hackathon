import { createContext, useContext, useState, useEffect } from 'react';

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
  const [userType, setUserType] = useState(null); // 'admin' or 'student'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    const storedUserType = localStorage.getItem('userType');
    
    if (storedUser && storedUserType) {
      setUser(JSON.parse(storedUser));
      setUserType(storedUserType);
    }
    setIsLoading(false);
  }, []);

  const loginAsAdmin = (adminData) => {
    setUser(adminData);
    setUserType('admin');
    localStorage.setItem('user', JSON.stringify(adminData));
    localStorage.setItem('userType', 'admin');
  };

  const loginAsStudent = (studentData) => {
    setUser(studentData);
    setUserType('student');
    localStorage.setItem('user', JSON.stringify(studentData));
    localStorage.setItem('userType', 'student');
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  };

  const value = {
    user,
    userType,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: userType === 'admin',
    isStudent: userType === 'student',
    loginAsAdmin,
    loginAsStudent,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
