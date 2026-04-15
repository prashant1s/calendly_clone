import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Availability from './pages/Availability';
import Meetings from './pages/Meetings';
import PublicBooking from './pages/PublicBooking';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Booking Route */}
        <Route path="/book/:slug" element={<PublicBooking />} />
        
        {/* Admin Routes with Layout */}
        <Route path="*" element={
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm py-4 px-8 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-600">Calendly Clone</h1>
              <nav className="space-x-6 text-gray-600 font-medium">
                <Link to="/" className="hover:text-blue-600">Event Types</Link>
                <Link to="/meetings" className="hover:text-blue-600">Scheduled Events</Link>
                <Link to="/availability" className="hover:text-blue-600">Availability</Link>
              </nav>
            </header>
            <main className="flex-1 max-w-5xl w-full mx-auto p-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/availability" element={<Availability />} />
                <Route path="/meetings" element={<Meetings />} />
              </Routes>
            </main>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
