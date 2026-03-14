import * as Sentry from "@sentry/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/public/Index";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AuthCallback from "./pages/auth/AuthCallback";
import Onboarding from "./pages/auth/Onboarding";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/dashboard/Profile";
import ProfileLinks from "./pages/dashboard/ProfileLinks";
import Skills from "./pages/dashboard/Skills";
import Experience from "./pages/dashboard/Experience";
import Education from "./pages/dashboard/Education";
import Projects from "./pages/public/Projects";
import ProjectFormPage from "./pages/dashboard/ProjectFormPage";
import ProjectsDashboard from "./pages/dashboard/ProjectsDashboard";
import EventForm from "./pages/dashboard/EventForm";
import EventsPage from "./pages/dashboard/Events";
import Jobs from "./pages/public/Jobs";
import Professionals from "./pages/public/Professionals";
import Studios from "./pages/public/Studios";
import Events from "./pages/public/Events";
import JobDetail from "./pages/public/JobDetail";
import PublicProfile from "./pages/public/PublicProfile";
import ProjectDetail from "./pages/public/ProjectDetail";
import NewStudio from "./pages/studio/NewStudio";
import { StudioManageLayout } from "./components/studio-manage/StudioManageLayout";
import StudioDashboard from "./pages/studio/Dashboard";
import StudioProfile from "./pages/studio/Profile";
import StudioJobs from "./pages/studio/Jobs";
import JobForm from "./pages/studio/JobForm";
import Team from "./pages/studio/Team";
import Billing from "./pages/studio/Billing";
import StudioProfileLinks from "./pages/studio/StudioProfileLinks";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Settings from "./pages/dashboard/Settings";
import StudioPublicProfile from "./pages/public/StudioPublicProfile";
import StudioProjectDetail from "./pages/public/StudioProjectDetail";
import AcceptInvite from "./pages/auth/AcceptInvite";
import NotFound from "./pages/NotFound";
import Support from "./pages/public/Support";
import Terms from "./pages/public/Terms";
import Privacy from "./pages/public/Privacy";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <Sentry.ErrorBoundary fallback={<p>Algo deu errado. Por favor, recarregue a página.</p>}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <SpeedInsights />
          <Analytics />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/profile/links"
                element={
                  <ProtectedRoute>
                    <ProfileLinks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/profile/skills"
                element={
                  <ProtectedRoute>
                    <Skills />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/profile/experience"
                element={
                  <ProtectedRoute>
                    <Experience />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/profile/education"
                element={
                  <ProtectedRoute>
                    <Education />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/profile/projects"
                element={
                  <ProtectedRoute>
                    <ProjectsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/projects/new"
                element={
                  <ProtectedRoute>
                    <ProjectFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/projects/:id/edit"
                element={
                  <ProtectedRoute>
                    <ProjectFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/events"
                element={
                  <ProtectedRoute>
                    <EventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/events/new"
                element={
                  <ProtectedRoute>
                    <EventForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/events/:id/edit"
                element={
                  <ProtectedRoute>
                    <EventForm />
                  </ProtectedRoute>
                }
              />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/professionals" element={<Professionals />} />
              <Route path="/studios" element={<Studios />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/events" element={<Events />} />
              <Route path="/jobs/:slug" element={<JobDetail />} />
              <Route path="/p/:slug" element={<PublicProfile />} />
              <Route path="/p/:slug/project/:projectSlug" element={<ProjectDetail />} />
              <Route path="/invite/:token" element={<AcceptInvite />} />
              <Route
                path="/studio/manage/new"
                element={
                  <ProtectedRoute>
                    <NewStudio />
                  </ProtectedRoute>
                }
              />
              <Route
                element={
                  <ProtectedRoute>
                    <StudioManageLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/studio/manage/dashboard" element={<StudioDashboard />} />
                <Route path="/studio/manage/profile" element={<StudioProfile />} />
                <Route path="/studio/manage/profile/links" element={<StudioProfileLinks />} />
                <Route path="/studio/manage/jobs" element={<StudioJobs />} />
                <Route path="/studio/manage/jobs/new" element={<JobForm />} />
                <Route path="/studio/manage/jobs/:id/edit" element={<JobForm />} />
                <Route path="/studio/manage/team" element={<Team />} />
                <Route path="/studio/manage/billing" element={<Billing />} />
              </Route>
              <Route path="/studio/:slug" element={<StudioPublicProfile />} />
              <Route path="/studio/:slug/project/:projectSlug" element={<StudioProjectDetail />} />
              <Route
                path="/dashboard/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/support"
                element={
                  <ProtectedRoute>
                    <Support />
                  </ProtectedRoute>
                }
              />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  </AuthProvider>
);

export default App;
