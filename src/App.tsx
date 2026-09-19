import React, { Suspense, lazy } from "react"
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AppLayout } from "./layouts/AppLayout"
import { LoadingSpinner } from "./components/ui/LoadingSpinner"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { NotificationProvider } from "./contexts/NotificationContext"

// Lazy loaded page chunks
const LandingPage = lazy(() => import("./pages/LandingPage").then(m => ({ default: m.LandingPage })));
const CitizenLogin = lazy(() => import("./pages/CitizenLogin").then(m => ({ default: m.CitizenLogin })));
const CitizenRegister = lazy(() => import("./pages/CitizenRegister").then(m => ({ default: m.CitizenRegister })));
const WorkerLogin = lazy(() => import("./pages/WorkerLogin").then(m => ({ default: m.WorkerLogin })));
const OperatorLogin = lazy(() => import("./pages/OperatorLogin").then(m => ({ default: m.OperatorLogin })));
const Dashboard = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));
const MapDashboard = lazy(() => import("./pages/MapDashboard").then(m => ({ default: m.MapDashboard })));
const Notifications = lazy(() => import("./pages/Notifications").then(m => ({ default: m.Notifications })));
const ServicesHub = lazy(() => import("./pages/ServicesHub").then(m => ({ default: m.ServicesHub })));
const ReportIssue = lazy(() => import("./pages/ReportIssue").then(m => ({ default: m.ReportIssue })));
const ReportIssueReview = lazy(() => import("./pages/ReportIssueReview").then(m => ({ default: m.ReportIssueReview })));
const IssueTrackingTimeline = lazy(() => import("./pages/IssueTrackingTimeline").then(m => ({ default: m.IssueTrackingTimeline })));
const AIHub = lazy(() => import("./pages/AIHub").then(m => ({ default: m.AIHub })));
const CitizenProfile = lazy(() => import("./pages/CitizenProfile").then(m => ({ default: m.CitizenProfile })));
const Settings = lazy(() => import("./pages/Settings").then(m => ({ default: m.Settings })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const WorkerDashboard = lazy(() => import("./pages/WorkerDashboard").then(m => ({ default: m.WorkerDashboard })));
const EmergencyDashboard = lazy(() => import("./pages/EmergencyDashboard").then(m => ({ default: m.EmergencyDashboard })));
const Support = lazy(() => import("./pages/Support").then(m => ({ default: m.Support })));
const AnonymousReport = lazy(() => import("./pages/AnonymousReport").then(m => ({ default: m.AnonymousReport })));
const CivicRewards = lazy(() => import("./pages/CivicRewards").then(m => ({ default: m.CivicRewards })));
const DevelopmentPlanning = lazy(() => import("./pages/DevelopmentPlanning").then(m => ({ default: m.DevelopmentPlanning })));

const queryClient = new QueryClient()

// Protected Route Wrapper
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user tries to access a route they don't have permission for, send them to their default dashboard
    switch (user.role) {
      case 'CITIZEN': return <Navigate to="/dashboard" replace />;
      case 'OPERATOR': return <Navigate to="/admin" replace />;
      case 'WORKER': return <Navigate to="/worker" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <HashRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<CitizenLogin />} />
                <Route path="/register" element={<CitizenRegister />} />
                <Route path="/worker/login" element={<WorkerLogin />} />
                <Route path="/operator/login" element={<OperatorLogin />} />
                <Route path="/report/anonymous" element={<AnonymousReport />} />
                
                {/* Protected App Routes inside layout */}
                <Route element={<AppLayout />}>
                  
                  {/* Citizen Routes */}
                  <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['CITIZEN']}><Dashboard /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><CitizenProfile /></ProtectedRoute>} />
                  <Route path="/services" element={<ProtectedRoute allowedRoles={['CITIZEN']}><ServicesHub /></ProtectedRoute>} />
                  <Route path="/report" element={<ProtectedRoute allowedRoles={['CITIZEN']}><ReportIssue /></ProtectedRoute>} />
                  <Route path="/report/review" element={<ProtectedRoute allowedRoles={['CITIZEN']}><ReportIssueReview /></ProtectedRoute>} />
                  <Route path="/rewards" element={<ProtectedRoute allowedRoles={['CITIZEN']}><CivicRewards /></ProtectedRoute>} />
                  
                  {/* Operator Routes */}
                  <Route path="/admin" element={<ProtectedRoute allowedRoles={['OPERATOR']}><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/planning" element={<ProtectedRoute allowedRoles={['OPERATOR']}><DevelopmentPlanning /></ProtectedRoute>} />
                  <Route path="/emergency" element={<ProtectedRoute allowedRoles={['OPERATOR']}><EmergencyDashboard /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute allowedRoles={['OPERATOR']}><AdminDashboard /></ProtectedRoute>} />
                  
                  {/* Worker Routes */}
                  <Route path="/worker" element={<ProtectedRoute allowedRoles={['WORKER']}><WorkerDashboard /></ProtectedRoute>} />
                  
                  {/* Shared Routes (Available to multiple roles) */}
                  <Route path="/map" element={<ProtectedRoute><MapDashboard /></ProtectedRoute>} />
                  <Route path="/ai" element={<ProtectedRoute><AIHub /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                  <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                  <Route path="/reports/:id" element={<ProtectedRoute><IssueTrackingTimeline /></ProtectedRoute>} />
                  <Route path="/track/:id" element={<ProtectedRoute><IssueTrackingTimeline /></ProtectedRoute>} />

                </Route>
              </Routes>
            </Suspense>
          </HashRouter>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
