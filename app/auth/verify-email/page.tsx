"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmailAction } from "@/actions/verify";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const VerifyEmailContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!token) {
      setError("Missing verification token!");
      return;
    }

    if (hasRun.current) return;
    hasRun.current = true;

    verifyEmailAction(token)
      .then((data) => {
        if (data.error) {
          setError(data.error);
          toast.error(data.error);
        }
        if (data.success) {
          setSuccess(data.success);
          toast.success(data.success);
          setTimeout(() => {
            router.push("/");
          }, 3500);
        }
      })
      .catch(() => {
        setError("Something went wrong!");
        toast.error("Something went wrong!");
      });
  }, [token, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden font-sans p-4">
      {/* Grid Background */}
      <div
        className="absolute inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: `32px 32px`
        }}
      />

      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none" />

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.12)] p-10 text-center border border-gray-100"
      >
        <div className="flex items-center justify-center mb-6 h-[80px]">
          {!success && !error && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col items-center"
            >
              <div className="relative">
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin relative z-10" />
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col items-center w-full"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
            </motion.div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Account Verification</h1>
        
        <div className="min-h-[60px]">
          {!success && !error && (
            <p className="text-gray-500 font-medium text-[15px]">Verifying your identity...</p>
          )}

          {success && (
            <div className="flex flex-col items-center">
              <p className="text-green-600 font-medium text-[15px]">{success}</p>
              <p className="text-gray-500 text-[14px] mt-1 animate-pulse">Redirecting you to the portal...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center w-full">
              <p className="text-red-600 font-medium text-[15px] mb-5">{error}</p>
              
              <Link href="/" className="group cursor-pointer w-fit px-8 py-3.5 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[16px] font-semibold shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
