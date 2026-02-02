import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ProfilePortfolio from "./pages/ProfilePortfolio";
import Skills from "./pages/Skills";
import Experience from "./pages/Experience";
import Education from "./pages/Education";
import Projects from "./pages/Projects";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import PublicProfile from "./pages/PublicProfile";
import NewStudio from "./pages/studio/NewStudio";
import StudioDashboard from "./pages/studio/Dashboard";
import StudioProfile from "./pages/studio/Profile";
import StudioJobs from "./pages/studio/Jobs";
import JobForm from "./pages/studio/JobForm";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
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
            path="/dashboard/profile/portfolio"
            element={
              <ProtectedRoute>
                <ProfilePortfolio />
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
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:slug" element={<JobDetail />} />
          <Route path="/p/:slug" element={<PublicProfile />} />
          <Route
            path="/studio/new"
            element={
              <ProtectedRoute>
                <NewStudio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/studio/dashboard"
            element={
              <ProtectedRoute>
                <StudioDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/studio/profile"
            element={
              <ProtectedRoute>
                <StudioProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/studio/jobs"
            element={
              <ProtectedRoute>
                <StudioJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/studio/jobs/new"
            element={
              <ProtectedRoute>
                <JobForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/studio/jobs/:id/edit"
            element={
              <ProtectedRoute>
                <JobForm />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
