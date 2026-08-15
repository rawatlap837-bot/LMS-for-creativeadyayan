import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Testimonials from "../components/Testimonials";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import TrustSection from "../components/TrustSection";
import PopularCategory from "../components/Popularcategory";
import DashboardSection from "../components/Dashboard";



export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustSection />
      <PopularCategory />
      <DashboardSection />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}