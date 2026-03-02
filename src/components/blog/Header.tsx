'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, User, Briefcase, FileText, Mail, Settings, LogOut, Shield } from 'lucide-react';

interface HeaderProps {
  currentSection: string;
  onNavigate: (section: string) => void;
  onAdminClick: () => void;
  isAdmin?: boolean;
  onLogout?: () => void;
}

const navItems = [
  { id: 'home', label: 'الرئيسية', icon: Home },
  { id: 'about', label: 'من أنا', icon: User },
  { id: 'services', label: 'الخدمات', icon: Briefcase },
  { id: 'blog', label: 'المدونة', icon: FileText },
  { id: 'contact', label: 'تواصل معي', icon: Mail },
];

export default function Header({ currentSection, onNavigate, onAdminClick, isAdmin = false, onLogout }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (section: string) => {
    onNavigate(section);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigate('home')}>
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl tech-gradient">
            <span className="text-white font-black text-xl">TF</span>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full fitness-gradient" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black tracking-tight">
              <span className="text-gradient">TechnoFit</span>
            </h1>
            <p className="text-[10px] text-muted-foreground -mt-1">Tech × Fitness × Nutrition</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {isAdmin ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                <Shield className="h-4 w-4" />
                وضع المشرف
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                خروج
              </Button>
            </>
          ) : (
            <>
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentSection === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigate(item.id)}
                  className={`gap-2 ${currentSection === item.id ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={onAdminClick}
                className="gap-2 text-muted-foreground"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <div className="flex flex-col gap-2 mt-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl tech-gradient">
                  <span className="text-white font-black text-lg">TF</span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-gradient">TechnoFit</h2>
                  <p className="text-xs text-muted-foreground">Tech × Fitness × Nutrition</p>
                </div>
              </div>

              {isAdmin ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm mb-4">
                    <Shield className="h-4 w-4" />
                    وضع المشرف
                  </div>
                  <Button
                    variant="outline"
                    className="justify-start gap-3 w-full text-destructive hover:text-destructive"
                    onClick={() => {
                      onLogout?.();
                      setMobileOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                    تسجيل الخروج
                  </Button>
                </>
              ) : (
                <>
                  {navItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={currentSection === item.id ? 'default' : 'ghost'}
                      className="justify-start gap-3"
                      onClick={() => handleNavigate(item.id)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  ))}

                  <div className="border-t mt-4 pt-4">
                    <Button
                      variant="outline"
                      className="justify-start gap-3 w-full"
                      onClick={() => {
                        onAdminClick();
                        setMobileOpen(false);
                      }}
                    >
                      <Settings className="h-5 w-5" />
                      لوحة التحكم
                    </Button>
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
