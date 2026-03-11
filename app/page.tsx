"use client";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ValuePropositions from "@/components/ValuePropositions";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Portfolio from "@/components/Portfolio";
import ClientReviewsSection from "@/components/ClientReviewsSection";
import ProcessTeamFaqSection from "@/components/ProcessTeamFaqSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-center">
      <Header />
      <Hero />
      <Testimonials />
      <ClientReviewsSection />
      <ValuePropositions />
      <Services />
      <ProcessTeamFaqSection includeTeam={false} includeFaqs={false} />
      <Portfolio mode="home" />
      <ProcessTeamFaqSection includeProcess={false} />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
