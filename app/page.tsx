"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const fadeVariants = {
  initial: { opacity: 0, x: 15 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -15 },
};

// Isolated Auth Components
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function AuthPage() {
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');

  return (
    <div className="h-screen w-full flex bg-white font-sans overflow-hidden">
      {/* Left Column: Premium Visual/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 h-full bg-[#0a0a0a] relative overflow-hidden flex-col justify-between p-12 border-r border-gray-800">

        {/* Grid Background */}
        <div
          className="absolute inset-0 z-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: `32px 32px`
          }}
        />

        {/* Glow & Abstract Effects */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 z-0" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 z-0" />

        {/* Logo/Brand Area */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">CROBuild</span>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 mb-20">
          <h1 className="text-5xl font-bold text-white leading-[1.15] mb-6 tracking-tight">
            Turn your traffic <br />
            into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">revenue.</span>
          </h1>
          <p className="text-gray-400 text-[18px] max-w-md leading-relaxed">
            Our AI engine analyzes your website and analytics data to deliver high-impact, priority-driven conversion strategies.
          </p>
        </div>
      </div>

      {/* Right Column: Animated Auth Forms */}
      <div className="w-full lg:w-[550px] lg:shrink-0 h-full bg-white overflow-y-auto overflow-x-hidden">
        <div className="min-h-full flex flex-col justify-center p-12 lg:p-20">
          <div className="w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full"
              >
                {view === 'login' && <LoginForm setView={setView} />}
                {view === 'signup' && <SignupForm setView={setView} />}
                {view === 'forgot' && <ForgotPasswordForm setView={setView} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
