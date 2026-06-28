import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Search, Heart } from 'lucide-react';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Heart className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">CompanionConnect</span>
            </Link>
            <Link to="/browse" className="hidden md:flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              <Search className="w-4 h-4" />
              Browse
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {!currentUser ? (
              <>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium px-4 py-2 transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md">
                  Signup
                </Link>
                <Link to="/signup" className="hidden sm:block text-indigo-600 border border-indigo-600 px-5 py-2 rounded-full font-medium hover:bg-indigo-50 transition-all">
                  Become Companion
                </Link>
              </>
            ) : (
              <>
                <Link to="/browse" className="md:hidden text-gray-600 hover:text-indigo-600 font-medium">
                  Browse
                </Link>
                <Link to="/companion-dashboard" className="hidden sm:block text-gray-600 hover:text-indigo-600 font-medium">
                  Become Companion
                </Link>
                <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>
                <Link to="/profile" className="flex items-center gap-2 group">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-transparent group-hover:border-indigo-600 transition-all overflow-hidden">
                    {currentUser.profilePhoto ? (
                      <img src={currentUser.profilePhoto} alt={currentUser.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="text-indigo-600 w-5 h-5" />
                    )}
                  </div>
                </Link>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 p-2 transition-colors" title="Sign Out">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
