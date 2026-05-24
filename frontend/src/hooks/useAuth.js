import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Must be used inside <AuthProvider>
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default useAuth;
