"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { updatePasswordAction } from "@/actions/verify";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const ResetPasswordContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: "", color: "bg-gray-200", textColor: "text-gray-500" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.match(/[A-Z]/)) score += 1;
    if (pass.match(/[0-9]/)) score += 1;
    if (pass.match(/[^A-Za-z0-9]/)) score += 1;

    if (pass.length < 6) return { score: 1, text: "Weak", color: "bg-red-500", textColor: "text-red-500" };
    if (score < 3) return { score: 2, text: "Medium", color: "bg-amber-500", textColor: "text-amber-600" };
    return { score: 3, text: "Strong", color: "bg-emerald-500", textColor: "text-emerald-600" };
  };

  const strength = getPasswordStrength(password);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Missing reset token!");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    setIsLoading(true);
    const data = await updatePasswordAction({ password }, token);
    setIsLoading(false);

    if (data?.error) {
      toast.error(data.error);
    }
    if (data?.success) {
      toast.success(data.success);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  };

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
        className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.12)] p-10 border border-gray-100"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Set New Password</h1>
          <p className="text-gray-500 font-medium text-[15px]">Enter your new secure password below.</p>
        </div>
        
        {!token ? (
          <div className="text-center p-6 bg-red-50 rounded-xl border border-red-100">
            <p className="text-red-600 font-medium text-[15px]">Missing reset token!</p>
            <p className="text-gray-500 text-sm mt-1">Please use the link from your email.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-2">New Password</label>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                leftIcon={<Lock size={20} />} 
                className="bg-gray-50/50 focus:ring-blue-600 focus:border-blue-600 border-gray-200" 
                required
              />
              {password && (
                <div className="mt-3">
                  <div className="flex gap-1.5 h-1.5 w-full rounded-full overflow-hidden">
                    <div className={`h-full flex-1 rounded-full transition-colors ${strength.score >= 1 ? strength.color : 'bg-gray-200'}`} />
                    <div className={`h-full flex-1 rounded-full transition-colors ${strength.score >= 2 ? strength.color : 'bg-gray-200'}`} />
                    <div className={`h-full flex-1 rounded-full transition-colors ${strength.score >= 3 ? strength.color : 'bg-gray-200'}`} />
                  </div>
                  <p className={`mt-1.5 text-[12px] font-bold text-right ${strength.textColor}`}>{strength.text}</p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-[14px] font-semibold text-gray-700 mb-2">Confirm Password</label>
              <Input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                leftIcon={<Lock size={20} />} 
                className="bg-gray-50/50 focus:ring-blue-600 focus:border-blue-600 border-gray-200"
                required 
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full py-6 text-[16px] font-semibold shadow-xl shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all active:scale-[0.98] cursor-pointer"
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
