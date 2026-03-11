"use client";

import Header from "@/components/Header";
import Portfolio from "@/components/Portfolio";
import Footer from "@/components/Footer";

const WorksPage = () => {
  return (
    <div className="min-h-screen bg-background text-center">
      <Header />
      <main className="pt-14 md:pt-16">
        <Portfolio mode="projects" />
      </main>
      <Footer />
    </div>
  );
};

export default WorksPage;
