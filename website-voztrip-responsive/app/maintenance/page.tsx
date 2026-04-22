export default function MaintenancePage({
  message,
}: {
  message?: string;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "#f5ede0" }}
    >
      {/* Icon */}
      <div className="mb-6 text-5xl select-none">🔧</div>

      {/* Title */}
      <h1
        className="text-2xl font-semibold text-center mb-3"
        style={{ color: "#2c2416" }}
      >
        Đang bảo trì
      </h1>

      {/* Message */}
      <p
        className="text-sm text-center leading-relaxed max-w-xs"
        style={{ color: "#8c7a5e" }}
      >
        {message ?? "VozTrip đang nâng cấp hệ thống. Vui lòng quay lại sau."}
      </p>
    </div>
  );
}
