"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type LoginForm = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const [role, setRole] = useState<"seller" | "admin">("seller");
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setServerError("");

    const result = await signIn("credentials", {
      username: data.username,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError(result.error);
      return;
    }

    // Lấy session để biết role, sau đó redirect đúng dashboard
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();

    if (session?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/seller");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5f0e8" }}>
      <div className="w-full max-w-md px-8 py-10" style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8", borderRadius: "2px", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>

        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#b09060" }}>
            Tourism Guide
          </div>
          <h1 className="text-3xl font-light tracking-tight" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>
            VozTrip
          </h1>
          <div className="mt-3 mx-auto w-12 h-px" style={{ backgroundColor: "#c8a96e" }} />
        </div>

        {/* Role Tab */}
        <div className="flex mb-8" style={{ border: "1px solid #d8cbb0", borderRadius: "1px" }}>
          {(["seller", "admin"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => { setRole(r); setServerError(""); }}
              className="flex-1 py-2 text-xs tracking-[0.2em] uppercase transition-all"
              style={{
                backgroundColor: role === r ? "#2c2416" : "transparent",
                color: role === r ? "#f5f0e8" : "#8c7a5e",
              }}
            >
              {r === "seller" ? "Seller" : "Admin"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c7a5e" }}>
              Tên đăng nhập
            </label>
            {(() => {
              const field = register("username", { required: "Vui lòng nhập tên đăng nhập" });
              return (
                <input
                  type="text"
                  placeholder="username"
                  className="w-full px-4 py-3 text-sm outline-none transition-all"
                  style={{ backgroundColor: "#f5f0e8", border: `1px solid ${errors.username ? "#c0392b" : "#d8cbb0"}`, borderRadius: "1px", color: "#2c2416" }}
                  onFocus={e => (e.target.style.borderColor = "#c8a96e")}
                  {...field}
                  onBlur={e => { field.onBlur(e); e.target.style.borderColor = errors.username ? "#c0392b" : "#d8cbb0"; }}
                />
              );
            })()}
            {errors.username && (
              <p className="mt-1 text-xs" style={{ color: "#c0392b" }}>{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c7a5e" }}>
              Mật khẩu
            </label>
            {(() => {
              const field = register("password", { required: "Vui lòng nhập mật khẩu" });
              return (
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 text-sm outline-none transition-all"
                  style={{ backgroundColor: "#f5f0e8", border: `1px solid ${errors.password ? "#c0392b" : "#d8cbb0"}`, borderRadius: "1px", color: "#2c2416" }}
                  onFocus={e => (e.target.style.borderColor = "#c8a96e")}
                  {...field}
                  onBlur={e => { field.onBlur(e); e.target.style.borderColor = errors.password ? "#c0392b" : "#d8cbb0"; }}
                />
              );
            })()}
            {errors.password && (
              <p className="mt-1 text-xs" style={{ color: "#c0392b" }}>{errors.password.message}</p>
            )}
          </div>

          {/* Server error */}
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
            {isSubmitting ? "Đang đăng nhập..." : `Đăng nhập với tư cách ${role === "seller" ? "Seller" : "Admin"}`}
          </button>
        </form>

        {role === "seller" && (
          <>
            <div className="flex items-center my-7 gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: "#e0d5c0" }} />
              <span className="text-xs tracking-widest" style={{ color: "#b09878" }}>hoặc</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "#e0d5c0" }} />
            </div>
            <p className="text-center text-xs" style={{ color: "#8c7a5e" }}>
              Chưa có tài khoản?{" "}
              <a
                href="/register"
                className="underline underline-offset-4"
                style={{ color: "#8c7a5e" }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = "#c8a96e")}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = "#8c7a5e")}
              >
                Đăng ký Seller
              </a>
            </p>
          </>
        )}

      </div>
    </div>
  );
}
