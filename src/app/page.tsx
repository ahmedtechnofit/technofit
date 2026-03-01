'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/blog/Header';
import Footer from '@/components/blog/Footer';
import HeroSection from '@/components/blog/HeroSection';
import AboutSection from '@/components/blog/AboutSection';
import ServicesSection from '@/components/blog/ServicesSection';
import ContactSection from '@/components/blog/ContactSection';
import PostGrid from '@/components/blog/PostGrid';
import PostDetail from '@/components/blog/PostDetail';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminLogin from '@/components/admin/AdminLogin';
import { AuthProvider, useAuth } from '@/lib/auth';

function HomeContent() {
  const [currentSection, setCurrentSection] = useState('home');
  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { user, logout, isLoading } = useAuth();

  // Handle navigation
  const handleNavigate = (section: string) => {
    setCurrentSection(section);
    setShowAdmin(false);
    setShowLogin(false);

    // Scroll to section
    if (section !== 'blog') {
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle admin click
  const handleAdminClick = () => {
    if (user) {
      setShowAdmin(true);
    } else {
      setShowLogin(true);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setShowAdmin(false);
    setShowLogin(false);
  };

  // Handle login success
  const handleLoginSuccess = () => {
    setShowLogin(false);
    setShowAdmin(true);
  };

  // Show loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Show login page
  if (showLogin) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <Header
          currentSection={currentSection}
          onNavigate={handleNavigate}
          onAdminClick={() => setShowLogin(false)}
        />
        <AdminLogin
          onSuccess={handleLoginSuccess}
          onCancel={() => setShowLogin(false)}
        />
      </div>
    );
  }

  // If admin mode, show admin dashboard
  if (showAdmin && user) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <Header
          currentSection={currentSection}
          onNavigate={handleNavigate}
          onAdminClick={() => setShowAdmin(false)}
          isAdmin={true}
          onLogout={handleLogout}
        />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">لوحة التحكم</h1>
            <p className="text-muted-foreground">مرحباً، {user.username}</p>
          </div>
          <AdminDashboard />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header
        currentSection={currentSection}
        onNavigate={handleNavigate}
        onAdminClick={handleAdminClick}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* About Section */}
        <AboutSection />

        {/* Services Section */}
        <ServicesSection />

        {/* Blog Section */}
        <section id="blog" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  المدونة
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">
                  أحدث <span className="text-gradient">المقالات</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  مقالات وتحليلات في التكنولوجيا والرياضة والتغذية
                </p>
              </div>

              <PostGrid onPostClick={setSelectedPostSlug} />
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <ContactSection />
      </main>

      <Footer />

      {/* Post Detail Dialog */}
      <PostDetail
        slug={selectedPostSlug}
        onClose={() => setSelectedPostSlug(null)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
