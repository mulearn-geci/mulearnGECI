import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Events } from './pages/Events';
import { Leaderboard } from './pages/Leaderboard';
import { Execom } from './pages/Execom';
import { Alumni } from './pages/Alumni';
import { Theme } from './pages/Theme';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Gallery } from './pages/Gallery';
import { Timeline } from './pages/Timeline';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminPosts } from './pages/admin/AdminPosts';
import { AdminEvents } from './pages/admin/AdminEvents';
import { AdminExecom } from './pages/admin/AdminExecom';
import { AdminAlumni } from './pages/admin/AdminAlumni';
import { AdminLeaderboard } from './pages/admin/AdminLeaderboard';
import { AdminHomepage } from './pages/admin/AdminHomepage';
import { CreatePost } from './pages/admin/CreatePost';
import { CreateEvent } from './pages/admin/CreateEvent';
import { EditPost } from './pages/admin/EditPost';
import { EditEvent } from './pages/admin/EditEvent';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import NotFound from './components/NotFound';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {!isAdminRoute && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/execom" element={<Execom />} />
          <Route path="/alumni" element={<Alumni />} />
          <Route path="/theme" element={<Theme />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/homepage" 
            element={
              <ProtectedRoute>
                <AdminHomepage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/posts" 
            element={
              <ProtectedRoute>
                <AdminPosts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/events" 
            element={
              <ProtectedRoute>
                <AdminEvents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/execom" 
            element={
              <ProtectedRoute>
                <AdminExecom />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/alumni" 
            element={
              <ProtectedRoute>
                <AdminAlumni />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/leaderboard" 
            element={
              <ProtectedRoute>
                <AdminLeaderboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/posts/create" 
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/events/create" 
            element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/posts/edit/:id" 
            element={
              <ProtectedRoute>
                <EditPost />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/events/edit/:id" 
            element={
              <ProtectedRoute>
                <EditEvent />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;