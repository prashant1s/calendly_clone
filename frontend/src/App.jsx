import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Availability from './pages/Availability';
import Meetings from './pages/Meetings';
import PublicBooking from './pages/PublicBooking';
import { Plus, Calendar, Clock, Settings } from 'lucide-react';

// Updated NavLink for Vertical Sidebar
function NavLink({ to, children, icon: Icon }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`relative flex items-center px-6 py-3 text-sm font-semibold transition-all ${
        isActive 
          ? 'bg-blue-50 text-blue-600' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {/* Active Indicator (Vertical line on the left) */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
      )}
      
      {Icon && <Icon size={18} className="mr-3" />}
      {children}
    </Link>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Booking Route (Full Screen) */}
        <Route path="/book/:slug" element={<PublicBooking />} />
        
        {/* Admin Routes with Vertical Sidebar */}
        <Route path="*" element={
          <div className="min-h-screen flex bg-white">
            
            {/* --- VERTICAL SIDEBAR --- */}
            <aside className="w-64 border-r border-gray-200 bg-white flex flex-col sticky top-0 h-screen">
              
              {/* Logo Section */}
              <div className="p-6 mb-2">
                <h1 className="text-2xl font-black text-blue-600 tracking-tight">Calendly</h1>
              </div>

             

              {/* Navigation Links Stacking Vertically */}
              <nav className="flex-1 flex flex-col">
                <NavLink to="/" icon={Calendar}>Event Types</NavLink>
                <NavLink to="/meetings" icon={Clock}>Scheduled Events</NavLink>
                <NavLink to="/availability" icon={Settings}>Availability</NavLink>
              </nav>

              {/* Footer / Help (Optional) */}
              <div className="p-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Calendly Clone v1.0</p>
              </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 bg-gray-50/30 overflow-y-auto">
              <div className="max-w-5xl mx-auto p-12">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/availability" element={<Availability />} />
                  <Route path="/meetings" element={<Meetings />} />
                </Routes>
              </div>
            </main>

          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
