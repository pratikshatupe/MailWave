import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Hero from '../components/landing/Hero.jsx';
import WorkflowVisual from '../components/landing/WorkflowVisual.jsx';
import FeatureGrid from '../components/landing/FeatureGrid.jsx';
import HowItWorks from '../components/landing/HowItWorks.jsx';
import UseCases from '../components/landing/UseCases.jsx';
import AnalyticsPreview from '../components/landing/AnalyticsPreview.jsx';
import AutomationSequence from '../components/landing/AutomationSequence.jsx';
import Pricing from '../components/landing/Pricing.jsx';
import Security from '../components/landing/Security.jsx';
import Testimonials from '../components/landing/Testimonials.jsx';
import FAQ from '../components/landing/FAQ.jsx';
import FinalCTA from '../components/landing/FinalCTA.jsx';

export default function LandingPage() {
  return (
    <div className="bg-white dark:bg-slate-950">
      <Navbar />
      <main>
        <Hero />
        <WorkflowVisual />
        <FeatureGrid />
        <HowItWorks />
        <UseCases />
        <AnalyticsPreview />
        <AutomationSequence />
        <Pricing />
        <Security />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
