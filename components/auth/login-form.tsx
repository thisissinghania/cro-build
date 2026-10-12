"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { loginAction } from "@/actions/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock } from "lucide-react";

interface LoginFormProps {
  setView: (view: 'login' | 'signup' | 'forgot') => void;
}

export function LoginForm({ setView }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    const res = await loginAction(data);
    if (res?.error) {
      toast.error(res.error);
    }
    if (res?.success) {
      toast.success(res.success);
    }
  };

  return (
    <div>
      <div className="text-left mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          Welcome back <span>👋</span>
        </h2>
        <p className="mt-2 text-[16px] text-gray-500">Enter your credentials to access your dashboard.</p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-[14px] font-semibold text-gray-700 mb-2" htmlFor="login-email">Email Address</label>
          <Input id="login-email" type="email" placeholder="john@company.com" leftIcon={<Mail size={20} />} className={`focus:ring-primary focus:border-primary bg-gray-50/50 ${errors.email ? 'border-red-500' : 'border-gray-200'}`} {...register("email")} />
          {errors.email && <p className="mt-1.5 text-[13px] text-red-500 font-medium">{errors.email.message}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[14px] font-semibold text-gray-700" htmlFor="login-password">Password</label>
            <button type="button" onClick={() => setView('forgot')} className="text-[14px] font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer">Forgot password?</button>
          </div>
          <Input id="login-password" type="password" placeholder="••••••••" leftIcon={<Lock size={20} />} className={`focus:ring-primary focus:border-primary bg-gray-50/50 ${errors.password ? 'border-red-500' : 'border-gray-200'}`} {...register("password")} />
          {errors.password && <p className="mt-1.5 text-[13px] text-red-500 font-medium">{errors.password.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full py-6 text-[16px] font-semibold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white rounded-[var(--radius)] transition-all active:scale-[0.98] cursor-pointer">
          {isSubmitting ? "Signing In..." : "Sign in"}
        </Button>
      </form>
      <div className="mt-5 pt-5 border-t border-gray-100">
        <p className="text-center text-[14px] text-gray-500">Don't have an account? <button type="button" onClick={() => setView('signup')} className="font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer">Create new account</button></p>
      </div>
    </div>
  );
}
