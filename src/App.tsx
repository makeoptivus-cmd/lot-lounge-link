import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LandOwnerForm from "./pages/LandOwnerForm";
import LandDetailsForm from "./pages/LandDetailsForm";
import SiteVisitForm from "./pages/SiteVisitForm";
import OwnerMeetingForm from "./pages/OwnerMeetingForm";
import MediationForm from "./pages/MediationForm";
import BuyerSellerMeetingForm from "./pages/BuyerSellerMeetingForm";
import MeetingPlaceForm from "./pages/MeetingPlaceForm";
import AdvanceRegistrationForm from "./pages/AdvanceRegistrationForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/land-owner" element={<LandOwnerForm />} />
          <Route path="/land-details" element={<LandDetailsForm />} />
          <Route path="/site-visit" element={<SiteVisitForm />} />
          <Route path="/owner-meeting" element={<OwnerMeetingForm />} />
          <Route path="/mediation" element={<MediationForm />} />
          <Route path="/buyer-seller" element={<BuyerSellerMeetingForm />} />
          <Route path="/meeting-place" element={<MeetingPlaceForm />} />
          <Route path="/advance-registration" element={<AdvanceRegistrationForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
