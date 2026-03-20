import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import SeekerDashboard from './pages/Dashboard/SeekerDashboard';
import RecruiterDashboard from './pages/Dashboard/RecruiterDashboard';
import PostJob from './pages/PostJob';
import SavedJobs from './pages/SavedJobs';
import Applications from './pages/Applications';
import './App.css';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['seeker', 'recruiter']}>
            {user?.role === 'seeker' ? <SeekerDashboard /> : <RecruiterDashboard />}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/post-job" 
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <PostJob />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/saved-jobs" 
        element={
          <ProtectedRoute allowedRoles={['seeker']}>
            <SavedJobs />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/applications" 
        element={
          <ProtectedRoute allowedRoles={['seeker']}>
            <Applications />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;