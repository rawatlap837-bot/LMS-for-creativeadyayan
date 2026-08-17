import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Testimonials from "../components/Testimonials";
import TrustSection from "../components/TrustSection";
import PopularCategory from "../components/Popularcategory";
import DashboardSection from "../components/Dashboard";
import InstructorExcellence from "../components/Instructorexcellence";
import LiveCourses from "../components/Livecourses";
import FAQ from "../components/FAQ";


export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustSection />
      <PopularCategory />
      <DashboardSection />
      <InstructorExcellence />
      <LiveCourses />
      <FAQ />
      <Testimonials />
    </>
  );
}