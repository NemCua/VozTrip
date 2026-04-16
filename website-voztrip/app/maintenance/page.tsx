export default function MaintenancePage({
  message,
}: {
  message?: string;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: "#fdfaf4" }}
    >
      {/* Icon */}
      <div className="relative mb-10">
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: "#f5f0e8",
            border: "1px solid #e8dfc8",
            boxShadow: "0 8px 32px rgba(200,169,110,0.12)",
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8" }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c8a96e"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
        </div>
        {/* Decorative dots */}
        <div
          className="absolute w-3 h-3 rounded-full"
          style={{ backgroundColor: "#c8a96e", top: 8, right: 8 }}
        />
        <div
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: "#d8cbb0", bottom: 10, left: 6 }}
        />
      </div>

      {/* Text */}
      <p
        className="text-xs tracking-[0.3em] uppercase mb-4"
        style={{ color: "#c8a96e" }}
      >
        Đang bảo trì
      </p>
      <h1
        className="text-3xl font-light text-center mb-4 leading-snug"
        style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}
      >
        VozTrip tạm thời
        <br />
        không khả dụng
      </h1>
      <p
        className="text-sm text-center max-w-sm leading-relaxed mb-8"
        style={{ color: "#8c7a5e" }}
      >
        {message ??
          "Chúng tôi đang nâng cấp hệ thống để mang lại trải nghiệm tốt hơn. Vui lòng quay lại sau."}
      </p>

      {/* Status badge */}
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
        style={{
          backgroundColor: "#fff8ec",
          border: "1px solid #f0e0b8",
          color: "#92400e",
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: "#f59e0b" }}
        />
        Hệ thống đang cập nhật
      </div>

      {/* Decorative bottom strip */}
      <div
        className="flex items-center gap-5 mt-12 opacity-30"
        style={{ color: "#c8a96e" }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        ))}
      </div>
    </div>
  );
}
