import { Wrench } from "lucide-react";

export default function MaintenancePage({ message }: { message?: string }) {
  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .maintenance-float { animation: float 2.8s ease-in-out infinite; }
        .maintenance-fade  { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>

      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "#fdfaf4" }}
      >
        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8 maintenance-fade">

          {/* Floating icon */}
          <div className="relative flex items-center justify-center maintenance-float" style={{ width: 140, height: 140 }}>
            {/* Outer circle */}
            <div
              className="absolute flex items-center justify-center rounded-full"
              style={{
                width: 120, height: 120,
                backgroundColor: "#f5f0e8",
                border: "1px solid #e8dfc8",
                boxShadow: "0 8px 24px rgba(200,169,110,0.18)",
              }}
            >
              {/* Inner circle */}
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 88, height: 88,
                  backgroundColor: "#fdfaf4",
                  border: "1px solid #e8dfc8",
                }}
              >
                <Wrench size={42} color="#c8a96e" strokeWidth={1.5} />
              </div>
            </div>

            {/* Decorative dots */}
            <span className="absolute rounded-full" style={{ width: 12, height: 12, backgroundColor: "#c8a96e", top: 10, right: 10 }} />
            <span className="absolute rounded-full" style={{ width: 12, height: 12, backgroundColor: "#c8a96e", bottom: 8, left: 14 }} />
            <span className="absolute rounded-full" style={{ width: 7,  height: 7,  backgroundColor: "#d8cbb0", top: 20, left: 6  }} />
          </div>

          {/* Text block */}
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-xs font-semibold tracking-[0.3em]" style={{ color: "#c8a96e" }}>
              ĐANG BẢO TRÌ
            </p>
            <h1 className="text-2xl font-light leading-snug" style={{ color: "#2c2416", letterSpacing: "0.3px" }}>
              Tính năng tạm thời<br />không khả dụng
            </h1>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "#8c7a5e" }}>
              {message ?? "Chúng tôi đang nâng cấp để mang lại\ntrải nghiệm tốt hơn. Vui lòng quay lại sau."}
            </p>
          </div>

          {/* Status badge */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ backgroundColor: "#fff8ec", border: "1px solid #f0e0b8" }}
          >
            <span
              className="rounded-full shrink-0"
              style={{ width: 7, height: 7, backgroundColor: "#f59e0b" }}
            />
            <span className="text-xs font-medium" style={{ color: "#92400e" }}>
              Hệ thống đang cập nhật
            </span>
          </div>

        </div>

        {/* Bottom decorative strip */}
        <div
          className="flex justify-center items-center gap-5 py-5"
          style={{ borderTop: "1px solid #f0ebe0" }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Wrench key={i} size={12} color="#e8dfc8" strokeWidth={1.5} />
          ))}
        </div>
      </div>
    </>
  );
}
