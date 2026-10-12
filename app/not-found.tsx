"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
      
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: `32px 32px`
        }}
      />

      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 z-0" />
      
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Animated SVG Graphic */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8"
        >
          <svg
            width="240"
            height="240"
            viewBox="0 0 240 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-indigo-500 drop-shadow-[0_0_30px_rgba(99,102,241,0.4)]"
          >
            <motion.path
              d="M120 30C70.2944 30 30 70.2944 30 120C30 169.706 70.2944 210 120 210C169.706 210 210 169.706 210 120C210 70.2944 169.706 30 120 30Z"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="4 8"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.path
              d="M120 60C86.8629 60 60 86.8629 60 120C60 153.137 86.8629 180 120 180C153.137 180 180 153.137 180 120C180 86.8629 153.137 60 120 60Z"
              stroke="url(#gradient)"
              strokeWidth="2"
              fill="rgba(99,102,241,0.05)"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1.1 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
            />
            {/* The 404 Text inside SVG */}
            <text
              x="50%"
              y="53%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="white"
              fontSize="48"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              404
            </text>
            <defs>
              <linearGradient id="gradient" x1="60" y1="60" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818cf8" />
                <stop offset="1" stopColor="#c084fc" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
            Page not found
          </h1>
          <p className="text-[16px] text-zinc-400 max-w-md mx-auto mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
          
          <Link href="/">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 duration-200 cursor-pointer">
              <Home className="w-5 h-5" />
              Back to Home
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
