"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validations/auth";
import { forgotPasswordAction } from "@/actions/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Turnstile } from '@marsidev/react-turnstile';

import { Mail } from "lucide-react";

interface ForgotPasswordFormProps {
  setView: (view: 'login' | 'signup' | 'forgot') => void;
}

export function ForgotPasswordForm({ setView }: ForgotPasswordFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      captcha: "",
    }
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    const res = await forgotPasswordAction({ email: data.email, captcha: data.captcha });
    if (res?.error) {
      toast.error(res.error);
    }
    if (res?.success) {
      toast.success(res.success);
      setView('login');
    }
  };

  return (
    <div>
      <div className="text-left mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Reset Password</h2>
        <p className="mt-2 text-[16px] text-gray-500">Enter your email and we'll send you a reset link.</p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-[14px] font-semibold text-gray-700 mb-2" htmlFor="forgot-email">Email Address</label>
          <Input id="forgot-email" type="email" placeholder="john@company.com" leftIcon={<Mail size={20} />} className={`focus:ring-primary focus:border-primary bg-gray-50/50 ${errors.email ? 'border-red-500' : 'border-gray-200'}`} {...register("email")} />
          {errors.email && <p className="mt-1.5 text-[13px] text-red-500 font-medium">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-[14px] font-semibold text-gray-700 mb-2">Security Captcha</label>
          <div className="flex justify-start">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
              onSuccess={(token) => {
                setValue("captcha", token, { shouldValidate: true });
              }}
              options={{
                theme: 'light',
              }}
            />
          </div>
          {errors.captcha && <p className="mt-1.5 text-[13px] text-red-500 font-medium">{errors.captcha.message}</p>}
        </div>
        
        <Button type="submit" disabled={isSubmitting} className="w-full py-6 text-[16px] font-semibold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white rounded-[var(--radius)] transition-all active:scale-[0.98]">
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
      <div className="mt-5 pt-5 border-t border-gray-100">
        <p className="text-center text-[14px] text-gray-500">Remember your password? <button type="button" onClick={() => setView('login')} className="font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer">Back to Sign In</button></p>
      </div>
    </div>
  );
}
