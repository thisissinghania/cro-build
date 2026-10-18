"use client";

import { User, Mail, Phone, MapPin, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema, type SettingsFormValues } from "@/lib/validations/settings";
import { updateSettingsAction } from "@/actions/settings";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SettingsForm({ user }: { user: any }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    mode: "onChange",
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const phoneValue = watch("phone");
  const passwordValue = watch("password") || "";

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 10) input = input.slice(0, 10);
    
    let formatted = input;
    if (input.length > 6) {
      formatted = `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6)}`;
    } else if (input.length > 3) {
      formatted = `(${input.slice(0, 3)}) ${input.slice(3)}`;
    } else if (input.length > 0) {
      formatted = `(${input}`;
    }
    setValue("phone", formatted, { shouldValidate: true, shouldDirty: true });
  };

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

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: SettingsFormValues) => {
    const res = await updateSettingsAction(data);
    if (res?.error) {
      toast.error(res.error);
    }
    if (res?.success) {
      toast.success(res.success);
      setValue("currentPassword", "");
      setValue("password", "");
      setValue("confirmPassword", "");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200/60 p-6">
        <div className="mb-6 pb-6 border-b border-zinc-100">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Account Settings</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your profile information and security settings.</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-lg font-bold text-zinc-900 mb-6">Profile Information</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Full Name</label>
                <Input 
                  type="text" 
                  placeholder="John Doe" 
                  leftIcon={<User size={20} />} 
                  className={`bg-gray-50/50 ${errors.fullName ? 'border-red-500' : 'border-gray-200'}`} 
                  {...register("fullName")} 
                />
                {errors.fullName && <p className="mt-1.5 text-[13px] text-red-500 font-medium">{errors.fullName.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Phone Number</label>
                <Input 
                  type="text" 
                  placeholder="(555) 123-4567" 
                  leftIcon={<Phone size={20} />} 
                  className={`bg-gray-50/50 ${errors.phone ? 'border-red-500' : 'border-gray-200'}`} 
                  {...register("phone")}
                  onChange={handlePhoneChange} 
                />
                {errors.phone && <p className="mt-1.5 text-[13px] text-red-500 font-medium">{errors.phone.message}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Email Address</label>
              <Input 
                type="email" 
                placeholder="john@company.com" 
                leftIcon={<Mail size={20} />} 
                className={`bg-gray-50/50 ${errors.email ? 'border-red-500' : 'border-gray-200'}`} 
                {...register("email")} 
              />
              {errors.email && <p className="mt-1.5 text-[13px] text-red-500 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Address</label>
              <Input 
                type="text" 
                placeholder="123 Main St, City, Country" 
                leftIcon={<MapPin size={20} />} 
                className={`bg-gray-50/50 ${errors.address ? 'border-red-500' : 'border-gray-200'}`} 
                {...register("address")} 
              />
              {errors.address && <p className="mt-1.5 text-[13px] text-red-500 font-medium">{errors.address.message}</p>}
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-100">
              <h2 className="text-lg font-bold text-zinc-900 mb-6">Security & Password</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Current Password</label>
                  <Input 
                    type="password" 
                    placeholder="Enter your current password" 
                    leftIcon={<Lock size={20} />} 
                    className={`bg-gray-50/50 ${errors.currentPassword ? 'border-red-500' : 'border-gray-200'}`} 
                    {...register("currentPassword")} 
                  />
                  {errors.currentPassword && <p className="mt-1.5 text-[13px] text-red-500 font-medium">{errors.currentPassword.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">New Password (Optional)</label>
                    <Input 
                      type="password" 
                      placeholder="Enter new password" 
                      leftIcon={<Lock size={20} />} 
                      className={`bg-gray-50/50 ${errors.password ? 'border-red-500' : 'border-gray-200'}`} 
                      {...register("password")} 
                    />
                    
                    {passwordValue && (
                      <div className="mt-3">
                        <div className="flex gap-1.5 h-1.5 w-full rounded-full overflow-hidden">
                          <div className={`h-full flex-1 rounded-full transition-colors ${strength.score >= 1 ? strength.color : 'bg-gray-200'}`} />
                          <div className={`h-full flex-1 rounded-full transition-colors ${strength.score >= 2 ? strength.color : 'bg-gray-200'}`} />
                          <div className={`h-full flex-1 rounded-full transition-colors ${strength.score >= 3 ? strength.color : 'bg-gray-200'}`} />
                        </div>
                        <p className={`mt-1.5 text-[12px] font-bold text-right ${strength.textColor}`}>{strength.text}</p>
                      </div>
                    )}

                    {errors.password && !passwordValue && <p className="mt-1.5 text-[13px] text-red-500 font-medium">{errors.password.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Confirm New Password</label>
                    <Input 
                      type="password" 
                      placeholder="Confirm new password" 
                      leftIcon={<Lock size={20} />} 
                      className={`bg-gray-50/50 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'}`} 
                      {...register("confirmPassword")} 
                    />
                    {errors.confirmPassword && <p className="mt-1.5 text-[13px] text-red-500 font-medium">{errors.confirmPassword.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-100 flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="px-8 h-[48px] bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-semibold rounded-lg shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] cursor-pointer">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
