import React, { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { 
  Menu, Shield, ArrowRight, GraduationCap, Lock, ChevronRight, BookOpen, CheckCircle, FileText, Users
} from "lucide-react";
import { InstallPwaButton } from "./install-pwa-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

interface HeaderProps {
  live?: boolean;
}

export function Header({ live = true }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Top Accent Stripe - Clean Corporate Navy */}
      <div className="h-1 w-full bg-[#0A1F44] shrink-0" />
      
      {/* Utility Bar */}
      <div className="border-b border-slate-200 bg-slate-900 text-slate-300 text-[11px] sm:text-xs shrink-0">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 h-8 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 shrink-0 font-medium text-slate-200">
              <GraduationCap className="h-3.5 w-3.5 text-blue-400" /> All-India GATE 2026/2027 Examination Suite
            </span>
            <span className="opacity-30 hidden xs:inline sm:inline">|</span>
            <span className="text-slate-400 hidden md:inline truncate">
              Branches: CS · DA · EC · EE · ME · CE
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 ml-auto shrink-0 text-slate-300">
            <Link to="/auth/intern" className="hover:text-white transition-colors">
              Mock Tests
            </Link>
            <span className="opacity-30">|</span>
            <Link to="/auth/intern" className="hover:text-white transition-colors">
              PYQ Vault
            </Link>
            <span className="opacity-30 hidden sm:inline">|</span>
            <Link to="/auth/employee" className="hover:text-white transition-colors hidden sm:inline">
              SME Portal
            </Link>
            <span className="opacity-30 hidden sm:inline">|</span>
            <Link to="/auth/admin" className="hover:text-white font-medium text-amber-400 hidden sm:inline flex items-center gap-1">
              <Lock className="h-3 w-3" /> Admin Controller
            </Link>
          </div>
        </div>
      </div>

      {/* Main Top Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shrink-0">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 min-w-0 shrink">
            <div className="h-9 w-9 rounded-sm bg-[#0A1F44] text-white flex items-center justify-center font-black tracking-wider text-sm shadow-xs">
              GATE
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold text-slate-900 leading-tight tracking-tight">
                AI GATE PREP
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                Enterprise Examination Platform
              </span>
            </div>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {live ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-sm border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                Live · Mock Tests Active
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-sm border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                Maintenance Mode
              </span>
            )}
            
            <InstallPwaButton />
            
            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
              <Link 
                to="/" 
                className={`px-3 py-1.5 rounded-sm transition-colors ${
                  pathname === "/" 
                    ? "text-[#0A1F44] font-semibold bg-slate-100" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Home
              </Link>
              <Link 
                to="/auth/intern" 
                className={`px-3 py-1.5 rounded-sm transition-colors ${
                  isActive("/intern") 
                    ? "text-[#0A1F44] font-semibold bg-slate-100" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Mock Test Engine
              </Link>
              <Link 
                to="/auth/intern" 
                className="px-3 py-1.5 rounded-sm transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              >
                PYQ & Syllabus Vault
              </Link>
              <Link 
                to="/auth/employee" 
                className="px-3 py-1.5 rounded-sm transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              >
                SME Review Desk
              </Link>
              <Link 
                to="/auth/admin" 
                className="px-3 py-1.5 rounded-sm transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              >
                Admin Controller
              </Link>
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              {/* Primary Action Button */}
              <Link 
                to="/auth/intern"
                className="inline-flex items-center gap-1.5 bg-[#0A1F44] hover:bg-[#122b5c] text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-sm text-xs sm:text-sm font-semibold tracking-wide transition-colors shadow-xs shrink-0"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Aspirant Portal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              {/* Mobile Drawer Trigger */}
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open navigation menu"
                    className="lg:hidden inline-flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-sm border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 focus:outline-none transition-colors shrink-0 cursor-pointer"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>

                <SheetContent 
                  side="right" 
                  className="w-[85vw] max-w-[340px] p-0 flex flex-col justify-between bg-white border-l border-slate-200 z-50"
                >
                  <div className="flex flex-col h-full overflow-y-auto">
                    {/* Drawer Header */}
                    <SheetHeader className="p-4 border-b border-slate-200 bg-slate-50 text-left">
                      <div className="flex items-center justify-between gap-3 pr-6">
                        <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-sm bg-[#0A1F44] text-white flex items-center justify-center font-bold text-xs">
                            GATE
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 leading-tight">AI GATE PREP</span>
                            <span className="text-[10px] text-slate-500 font-medium">Enterprise Platform</span>
                          </div>
                        </Link>
                        {live && (
                          <span className="inline-flex items-center gap-1 rounded-sm border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-800 shrink-0">
                            Live
                          </span>
                        )}
                      </div>
                      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                      <SheetDescription className="sr-only">GATE Preparation Portal and Role Gateways</SheetDescription>
                    </SheetHeader>

                    {/* Navigation Items */}
                    <div className="p-4 flex flex-col gap-1 flex-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 mb-1">
                        Platform Navigation
                      </div>

                      <Link 
                        to="/" 
                        onClick={() => setMenuOpen(false)} 
                        className={`px-3 py-2.5 rounded-sm transition-colors flex items-center justify-between text-sm ${
                          pathname === "/" 
                            ? "text-[#0A1F44] font-semibold bg-slate-100 border-l-2 border-[#0A1F44]" 
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>Home Overview</span>
                        <ChevronRight className="h-4 w-4 opacity-40" />
                      </Link>

                      <Link 
                        to="/auth/intern" 
                        onClick={() => setMenuOpen(false)} 
                        className="px-3 py-2.5 rounded-sm transition-colors flex items-center justify-between text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <span className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-[#0A1F44]" />
                          GATE Aspirant Portal
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-40" />
                      </Link>

                      <Link 
                        to="/auth/employee" 
                        onClick={() => setMenuOpen(false)} 
                        className="px-3 py-2.5 rounded-sm transition-colors flex items-center justify-between text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          SME / Reviewer Desk
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-40" />
                      </Link>

                      <Link 
                        to="/auth/admin" 
                        onClick={() => setMenuOpen(false)} 
                        className="px-3 py-2.5 rounded-sm transition-colors flex items-center justify-between text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <span className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-amber-600" />
                          Admin Platform Controller
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-40" />
                      </Link>

                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 mb-2">
                          Engineering Branches
                        </div>
                        <div className="grid grid-cols-3 gap-2 px-1 text-center text-xs font-mono font-bold text-slate-700">
                          <div className="p-2 border border-slate-200 rounded-sm bg-slate-50">CS / IT</div>
                          <div className="p-2 border border-slate-200 rounded-sm bg-slate-50">DA (AI)</div>
                          <div className="p-2 border border-slate-200 rounded-sm bg-slate-50">EC</div>
                          <div className="p-2 border border-slate-200 rounded-sm bg-slate-50">EE</div>
                          <div className="p-2 border border-slate-200 rounded-sm bg-slate-50">ME</div>
                          <div className="p-2 border border-slate-200 rounded-sm bg-slate-50">CE</div>
                        </div>
                      </div>
                    </div>

                    {/* Drawer Footer */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50 mt-auto flex flex-col gap-3">
                      <Link
                        to="/auth/intern"
                        onClick={() => setMenuOpen(false)}
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#0A1F44] hover:bg-[#122b5c] text-white py-2.5 px-4 rounded-sm text-sm font-semibold transition-colors"
                      >
                        <GraduationCap className="h-4 w-4" />
                        <span>Sign In as Aspirant</span>
                      </Link>
                      <div className="text-[10px] text-slate-500 text-center font-medium">
                        AI GATE Preparation Platform · 2026-27
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
