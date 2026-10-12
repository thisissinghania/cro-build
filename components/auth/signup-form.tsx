"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormValues } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Turnstile } from '@marsidev/react-turnstile';
import { signupAction, checkEmailExistsAction } from "@/actions/auth";
import { toast } from "sonner";

import { User, Mail, Phone, MapPin, Lock, ShieldCheck } from "lucide-react";

interface SignupFormProps {
  setView: (view: 'login' | 'signup' | 'forgot') => void;
}

export function SignupForm({ setView }: SignupFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      captcha: "",
    }
  });

  const password = watch("password") || "";

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

  const onSubmit = async (data: SignupFormValues) => {
    const res = await signupAction(data);
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
      <div className="text-left mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create Account</h2>
        <p className="mt-2 text-[16px] text-gray-500">Join CROBuild and optimize your conversions.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-[14px] font-semibold text-gray-700 mb-2" htmlFor="signup-name">Full Name</label>
          <Input id="signup-name" type="text" placeholder="John Doe" leftIcon={<User size={20} />} className={`focus:ring-primary focus:border-primary bg-gray-50/50 ${errors.fullName ? 'border-red-500' : 'border-gray-200'}`} {...register("fullName")} />
          {errors.fullName && <p className="mt-1.5 text-[13px] text-red-500 font-medium">{errors.fullName.message}</p>}
        </div>
        <div>
          <label className="block text-[14px] font-semibold text-gray-700 mb-2" htmlFor="signup-email">Email Address</label>
          <Input id="signup-email" type="email" placeholder="john@company.com" leftIcon={<Mail size={20} />} className={`focus:ring-primary focus:border-primary bg-gray-50/50 ${errors.email ? 'border-red-500' : 'border-gray-200'}`} {...register("email", {
            onBlur: async (e) => {
              const emailVal = e.target.value;
              if (!emailVal || !emailVal.includes('@')) return;
              const exists = await checkEmailExistsAction(emailVal);
              if (exists) {
                setError("email", { type: "manual", message: "This email is already registered!" });
              } else {
                if (errors.email?.type === "manual") clearErrors("email");
              }
            }
          })} />
          {errors.email && <p className="mt-1.5 text-[13px] text-red-500 font-medium">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-[14px] font-semibold text-gray-700 mb-2" htmlFor="signup-phone">Phone Number</label>
          <Input id="signup-phone" type="text" maxLength={14} placeholder="(555) 000-0000" leftIcon={<Phone size={20} />} className={`focus:ring-primary focus:border-primary bg-gray-50/50 ${errors.phone ? 'border-red-500' : 'border-gray-200'}`} {...register("phone", {
            onChange: (e) => {
              let val = e.target.value.replace(/\D/g, '');
              if (val.length > 10) val = val.slice(0, 10);
              let formatted = val;
              if (val.length > 3 && val.length <= 6) {
                formatted = `(${val.slice(0,3)}) ${val.slice(3)}`;
              } else if (val.length > 6) {
                formatted = `(${val.slice(0,3)}) ${val.slice(3,6)}-${val.slice(6)}`;
              }
              e.target.value = formatted;
              return e;
            }
          })} />
          {errors.phone && <p className="mt-1.5 text-[13px] text-red-500 font-medium">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="block text-[14px] font-semibold text-gray-700 mb-2" htmlFor="signup-address">Full Address</label>
          <Input id="signup-address" type="text" placeholder="123 Main St, City, Country" leftIcon={<MapPin size={20} />} className={`focus:ring-primary focus:border-primary bg-gray-50/50 ${errors.address ? 'border-red-500' : 'border-gray-200'}`} {...register("address")} />
          {errors.address && <p className="mt-1.5 text-[13px] text-red-500 font-medium">{errors.address.message}</p>}
        </div>
        <div>
          <label className="block text-[14px] font-semibold text-gray-700 mb-2" htmlFor="signup-password">Password</label>
          <Input id="signup-password" type="password" placeholder="••••••••" leftIcon={<Lock size={20} />} className={`focus:ring-primary focus:border-primary bg-gray-50/50 ${errors.password ? 'border-red-500' : 'border-gray-200'}`} {...register("password")} />
          
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
          
          {errors.password && !password && <p className="mt-1.5 text-[13px] text-red-500 font-medium">{errors.password.message}</p>}
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
        
        <Button type="submit" disabled={isSubmitting} className="w-full mt-2 py-6 text-[16px] font-semibold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white rounded-[var(--radius)] transition-all active:scale-[0.98] cursor-pointer">
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
      <div className="mt-5 pt-5 border-t border-gray-100">
        <p className="text-center text-[14px] text-gray-500">Already have an account? <button type="button" onClick={() => setView('login')} className="font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer">Sign In</button></p>
      </div>
    </div>
  );
}
