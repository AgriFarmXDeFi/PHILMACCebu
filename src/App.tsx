
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Programs from "./pages/Programs";
import FreeWorkshop from "./pages/FreeWorkshop";
import HowItWorks from "./pages/HowItWorks";
import ReferralSystem from "./pages/ReferralSystem";
import Register from "./pages/Register";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Student Portal Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentCourses from "./pages/student/Courses";
import StudentReferrals from "./pages/student/Referrals";
import ChallengeTraining from "./pages/student/ChallengeTraining";
import ChallengeProfirm from "./pages/student/ChallengeProfirm";
import StudentCertificates from "./pages/student/Certificates";
import StudentAwards from "./pages/student/Awards";
import StudentSupport from "./pages/student/Support";
import StudentProfile from "./pages/student/Profile";
import StudentStages from "./pages/student/Stages";
import StudentSubscription from "./pages/student/Subscription";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStudents from "./pages/admin/Students";
import AdminRegistrations from "./pages/admin/Registrations";
import AdminSubscriptions from "./pages/admin/Subscriptions";
import AdminReferrals from "./pages/admin/Referrals";
import AdminCourses from "./pages/admin/Courses";
import AdminChallenges from "./pages/admin/Challenges";
import AdminCertificates from "./pages/admin/Certificates";
import AdminAwards from "./pages/admin/Awards";
import AdminMessages from "./pages/admin/Messages";
import AdminGallery from "./pages/admin/Gallery";
import AdminContent from "./pages/admin/Content";
import AdminSettings from "./pages/admin/Settings";
import PWAInstallBanner from "./components/features/PWAInstallBanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/free-workshop" element={<FreeWorkshop />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/referral-system" element={<ReferralSystem />} />
          <Route path="/register" element={<Register />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />

          {/* Student Portal */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/courses" element={<StudentCourses />} />
          <Route path="/student/referrals" element={<StudentReferrals />} />
          <Route path="/student/challenge-training" element={<ChallengeTraining />} />
          <Route path="/student/challenge-profirm" element={<ChallengeProfirm />} />
          <Route path="/student/certificates" element={<StudentCertificates />} />
          <Route path="/student/awards" element={<StudentAwards />} />
          <Route path="/student/support" element={<StudentSupport />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/stages" element={<StudentStages />} />
          <Route path="/student/subscription" element={<StudentSubscription />} />

          {/* Admin Portal */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/registrations" element={<AdminRegistrations />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
          <Route path="/admin/referrals" element={<AdminReferrals />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/challenges" element={<AdminChallenges />} />
          <Route path="/admin/certificates" element={<AdminCertificates />} />
          <Route path="/admin/awards" element={<AdminAwards />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/gallery" element={<AdminGallery />} />
          <Route path="/admin/content" element={<AdminContent />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <PWAInstallBanner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
