"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type RegisterForm = {
  username: string;
  password: string;
  shopName: string;
  fullName?: string;
  email?: string;
  contactPhone?: string;
  description?: string;
};

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setServerError("");
    if (!agreed) {
      setConsentError(true);
      return;
    }
    try {
      await api.post("/api/auth/register", {
        username: data.username,
        password: data.password,
        shopName: data.shopName,
        fullName: data.fullName || null,
        email: data.email || null,
        contactPhone: data.contactPhone || null,
        description: data.description || null,
      });
      setSuccess(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại";
      setServerError(message);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5f0e8" }}>
        <div className="w-full max-w-md px-8 py-10 text-center" style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8", borderRadius: "2px", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
          <div className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#b09060" }}>Tourism Guide</div>
          <h1 className="text-3xl font-light tracking-tight mb-3" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>VozTrip</h1>
          <div className="mx-auto w-12 h-px mb-8" style={{ backgroundColor: "#c8a96e" }} />

          <div className="mb-6">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: "#f0e8d4", border: "1px solid #c8a96e", borderRadius: "50%" }}>
              <span style={{ color: "#c8a96e", fontSize: "20px" }}>✓</span>
            </div>
            <h2 className="text-sm tracking-[0.15em] uppercase mb-3" style={{ color: "#2c2416" }}>Đăng ký thành công</h2>
            <p className="text-xs leading-relaxed" style={{ color: "#8c7a5e" }}>
              Tài khoản của bạn đã được gửi đến Admin để xét duyệt.
              Bạn sẽ có thể đăng nhập sau khi được phê duyệt.
            </p>
          </div>

          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 text-xs tracking-[0.25em] uppercase transition-all"
            style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px" }}
            onMouseEnter={e => ((e.target as HTMLElement).style.backgroundColor = "#c8a96e")}
            onMouseLeave={e => ((e.target as HTMLElement).style.backgroundColor = "#2c2416")}
          >
            Về trang đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-10" style={{ backgroundColor: "#f5f0e8" }}>
      <div className="w-full max-w-md px-8 py-10" style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8", borderRadius: "2px", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>

        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#b09060" }}>Tourism Guide</div>
          <h1 className="text-3xl font-light tracking-tight" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>VozTrip</h1>
          <div className="mt-3 mx-auto w-12 h-px" style={{ backgroundColor: "#c8a96e" }} />
          <p className="mt-4 text-xs tracking-[0.15em] uppercase" style={{ color: "#8c7a5e" }}>
            Seller Registration
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>

          {/* Account section */}
          <div>
            <div className="text-xs tracking-[0.2em] uppercase mb-4 pb-2" style={{ color: "#b09060", borderBottom: "1px solid #e8dfc8" }}>
              Account
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c7a5e" }}>
                  Username <span style={{ color: "#c8a96e" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="username"
                  className="w-full px-4 py-3 text-sm outline-none transition-all"
                  style={{ backgroundColor: "#f5f0e8", border: `1px solid ${errors.username ? "#c0392b" : "#d8cbb0"}`, borderRadius: "1px", color: "#2c2416" }}
                  onFocus={e => (e.target.style.borderColor = "#c8a96e")}
                  {...register("username", { required: true })}
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c7a5e" }}>
                  Password <span style={{ color: "#c8a96e" }}>*</span>
                </label>
                <div className="relative">
                  {(() => {
                    const field = register("password", { required: true, minLength: 6 });
                    return (
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 text-sm outline-none transition-all pr-16"
                        style={{ backgroundColor: "#f5f0e8", border: `1px solid ${errors.password ? "#c0392b" : "#d8cbb0"}`, borderRadius: "1px", color: "#2c2416" }}
                        onFocus={e => (e.target.style.borderColor = "#c8a96e")}
                        {...field}
                      />
                    );
                  })()}
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                    style={{ color: "#8c7a5e" }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password?.type === "minLength" && (
                  <p className="mt-1 text-xs" style={{ color: "#c0392b" }}>Min 6 characters</p>
                )}
              </div>
            </div>
          </div>

          {/* Shop section */}
          <div>
            <div className="text-xs tracking-[0.2em] uppercase mb-4 pb-2" style={{ color: "#b09060", borderBottom: "1px solid #e8dfc8" }}>
              Shop Info
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c7a5e" }}>
                  Shop Name <span style={{ color: "#c8a96e" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Shop / Business name"
                  className="w-full px-4 py-3 text-sm outline-none transition-all"
                  style={{ backgroundColor: "#f5f0e8", border: `1px solid ${errors.shopName ? "#c0392b" : "#d8cbb0"}`, borderRadius: "1px", color: "#2c2416" }}
                  onFocus={e => (e.target.style.borderColor = "#c8a96e")}
                  {...register("shopName", { required: true })}
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c7a5e" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Nguyen Van A"
                  className="w-full px-4 py-3 text-sm outline-none transition-all"
                  style={{ backgroundColor: "#f5f0e8", border: "1px solid #d8cbb0", borderRadius: "1px", color: "#2c2416" }}
                  onFocus={e => (e.target.style.borderColor = "#c8a96e")}
                  {...register("fullName")}
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c7a5e" }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 text-sm outline-none transition-all"
                  style={{ backgroundColor: "#f5f0e8", border: `1px solid ${errors.email ? "#c0392b" : "#d8cbb0"}`, borderRadius: "1px", color: "#2c2416" }}
                  onFocus={e => (e.target.style.borderColor = "#c8a96e")}
                  {...register("email", { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })}
                />
                {errors.email && (
                  <p className="mt-1 text-xs" style={{ color: "#c0392b" }}>Invalid email</p>
                )}
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c7a5e" }}>
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="0901234567"
                  className="w-full px-4 py-3 text-sm outline-none transition-all"
                  style={{ backgroundColor: "#f5f0e8", border: "1px solid #d8cbb0", borderRadius: "1px", color: "#2c2416" }}
                  onFocus={e => (e.target.style.borderColor = "#c8a96e")}
                  {...register("contactPhone")}
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c7a5e" }}>
                  Description
                </label>
                <textarea
                  placeholder="Brief intro about your shop..."
                  rows={3}
                  className="w-full px-4 py-3 text-sm outline-none transition-all resize-none"
                  style={{ backgroundColor: "#f5f0e8", border: "1px solid #d8cbb0", borderRadius: "1px", color: "#2c2416" }}
                  onFocus={e => (e.target.style.borderColor = "#c8a96e")}
                  {...register("description")}
                />
              </div>
            </div>
          </div>

          <p className="text-xs leading-relaxed" style={{ color: "#b09878" }}>
            * Account requires Admin approval before login.
          </p>

          {/* Consent checkbox */}
          <div
            className="px-4 py-4 rounded-sm"
            style={{
              backgroundColor: consentError && !agreed ? "#fdf2f2" : "#f5f0e8",
              border: `1px solid ${consentError && !agreed ? "#f5c6c6" : "#e8dfc8"}`,
            }}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={agreed}
                  onChange={e => { setAgreed(e.target.checked); setConsentError(false); }}
                />
                <div
                  className="w-5 h-5 flex items-center justify-center transition-all"
                  style={{
                    border: `1.5px solid ${agreed ? "#2c2416" : "#c8b898"}`,
                    borderRadius: "4px",
                    backgroundColor: agreed ? "#2c2416" : "#fff",
                  }}
                >
                  {agreed && (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path d="M1 4L4 7L10 1" stroke="#c8a96e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs leading-relaxed" style={{ color: "#5c4a30" }}>
                Tôi đã đọc và đồng ý với{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 transition-colors"
                  style={{ color: "#c8a96e" }}
                  onClick={e => e.stopPropagation()}
                >
                  Chính sách bảo mật
                </a>
                {" "}của VozTrip. Tôi hiểu rằng thông tin tài khoản và nội dung tôi đăng tải sẽ được lưu trữ và xử lý theo chính sách đó.
              </span>
            </label>
            {consentError && !agreed && (
              <p className="mt-2 text-xs pl-8" style={{ color: "#c0392b" }}>
                Vui lòng đồng ý với chính sách bảo mật để tiếp tục.
              </p>
            )}
          </div>

          {serverError && (
            <div className="px-4 py-3 text-xs" style={{ backgroundColor: "#fdf2f2", border: "1px solid #f5c6c6", borderRadius: "1px", color: "#c0392b" }}>
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 text-xs tracking-[0.25em] uppercase transition-all mt-2"
            style={{
              backgroundColor: isSubmitting ? "#8c7a5e" : "#2c2416",
              color: "#f5f0e8",
              borderRadius: "1px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
            onMouseEnter={e => { if (!isSubmitting) (e.target as HTMLElement).style.backgroundColor = "#c8a96e"; }}
            onMouseLeave={e => { if (!isSubmitting) (e.target as HTMLElement).style.backgroundColor = "#2c2416"; }}
          >
            {isSubmitting ? "Submitting..." : "Submit Registration"}
          </button>
        </form>

        <div className="flex items-center my-7 gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: "#e0d5c0" }} />
          <span className="text-xs tracking-widest" style={{ color: "#b09878" }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "#e0d5c0" }} />
        </div>

        <p className="text-center text-xs" style={{ color: "#8c7a5e" }}>
          Already have an account?{" "}
          <a
            href="/login"
            className="underline underline-offset-4"
            style={{ color: "#8c7a5e" }}
            onMouseEnter={e => ((e.target as HTMLElement).style.color = "#c8a96e")}
            onMouseLeave={e => ((e.target as HTMLElement).style.color = "#8c7a5e")}
          >
            Sign In
          </a>
        </p>

      </div>
    </div>
  );
}
