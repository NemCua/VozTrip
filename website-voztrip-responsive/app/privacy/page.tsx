import { Shield } from "lucide-react";
import Link from "next/link";

const SECTIONS = [
  {
    title: "1. Thông tin chúng tôi thu thập",
    content: [
      "**Vị trí GPS:** Ứng dụng sử dụng vị trí của bạn để phát hiện các điểm tham quan gần bạn và tự động phát thuyết minh âm thanh. Vị trí chỉ được sử dụng trong thời gian bạn đang mở ứng dụng và không được lưu trữ trên máy chủ của chúng tôi.",
      "**Session ID:** Một mã phiên ẩn danh được tạo tự động để ghi nhận lượt tham quan các điểm POI, phục vụ mục đích thống kê. Mã này không liên kết với bất kỳ thông tin cá nhân nào.",
      "**Ngôn ngữ đã chọn:** Lưu cục bộ trên thiết bị của bạn để ghi nhớ tùy chọn ngôn ngữ.",
    ],
  },
  {
    title: "2. Cách chúng tôi sử dụng thông tin",
    content: [
      "Cung cấp trải nghiệm thuyết minh tự động khi bạn đến gần các điểm tham quan.",
      "Thống kê lượt truy cập các điểm POI để cải thiện nội dung (ẩn danh, không định danh cá nhân).",
      "Ghi nhớ ngôn ngữ thuyết minh bạn đã chọn trên thiết bị.",
    ],
  },
  {
    title: "3. Chúng tôi KHÔNG làm những điều sau",
    content: [
      "Không yêu cầu đăng nhập hay thu thập tên, email, số điện thoại.",
      "Không theo dõi vị trí của bạn khi ứng dụng đóng (background tracking).",
      "Không bán, chia sẻ hay chuyển nhượng dữ liệu cho bên thứ ba vì mục đích thương mại.",
      "Không sử dụng cookie theo dõi hay quảng cáo.",
    ],
  },
  {
    title: "4. Lưu trữ dữ liệu",
    content: [
      "Dữ liệu vị trí GPS không được lưu trữ — chỉ xử lý trực tiếp trên thiết bị của bạn trong thời gian thực.",
      "Session ID và log lượt tham quan được lưu trên máy chủ trong thời gian tối đa 90 ngày, sau đó tự động xóa.",
      "Tùy chọn ngôn ngữ lưu trong localStorage trên trình duyệt và có thể xóa bất kỳ lúc nào.",
    ],
  },
  {
    title: "5. Quyền của bạn",
    content: [
      "Bạn có thể từ chối quyền GPS — ứng dụng vẫn hoạt động nhưng không có tính năng kích hoạt tự động.",
      "Bạn có thể xóa dữ liệu cục bộ bằng cách xóa cache trình duyệt hoặc gỡ cài đặt ứng dụng.",
      "Để yêu cầu xóa dữ liệu phiên, liên hệ chúng tôi qua email bên dưới.",
    ],
  },
  {
    title: "6. Bảo mật",
    content: [
      "Mọi kết nối giữa ứng dụng và máy chủ đều được mã hóa qua HTTPS.",
      "Chúng tôi áp dụng các biện pháp kỹ thuật phù hợp để bảo vệ dữ liệu khỏi truy cập trái phép.",
    ],
  },
  {
    title: "7. Thay đổi chính sách",
    content: [
      "Chúng tôi có thể cập nhật chính sách này theo thời gian. Phiên bản mới nhất luôn được đăng tại trang này kèm ngày cập nhật.",
    ],
  },
  {
    title: "8. Liên hệ",
    content: [
      "Mọi câu hỏi về quyền riêng tư, vui lòng liên hệ: **privacy@voztrip.vn**",
    ],
  },
];

function renderContent(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="text-[#2c2416] font-semibold">{part}</strong>
      : <span key={i}>{part}</span>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fdfaf4]">
      {/* Header */}
      <div className="bg-[#2c2416] px-6 pt-12 pb-8">
        <p className="text-[10px] tracking-[3px] text-[#c8a96e] uppercase mb-2">VozTrip</p>
        <div className="flex items-center gap-3 mb-2">
          <Shield size={28} color="#c8a96e" />
          <h1 className="text-2xl text-white font-light tracking-wide">Chính sách bảo mật</h1>
        </div>
        <p className="text-sm text-[#b09878]">Privacy Policy · Cập nhật: 18/04/2026</p>
      </div>

      {/* Intro */}
      <div className="px-5 py-5 bg-[#fdf6e8] border-b border-[#e8dfc8]">
        <p className="text-sm text-[#5a4a35] leading-relaxed">
          VozTrip tôn trọng quyền riêng tư của bạn. Chính sách này giải thích rõ những thông tin
          nào được thu thập, mục đích sử dụng và cách chúng tôi bảo vệ dữ liệu của bạn khi sử dụng
          ứng dụng hướng dẫn du lịch VozTrip.
        </p>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-[#16a34a] font-medium">
          <Shield size={13} color="#16a34a" />
          <span>Không yêu cầu đăng nhập · Không thu thập thông tin cá nhân</span>
        </div>
      </div>

      {/* Sections */}
      <div className="px-5 py-6 flex flex-col gap-6">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="text-[15px] font-semibold text-[#2c2416] mb-3">{section.title}</h2>
            <div className="flex flex-col gap-2">
              {section.content.map((item, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className="text-[#c8a96e] mt-1 shrink-0 text-xs">•</span>
                  <p className="text-sm text-[#5a4a35] leading-relaxed">{renderContent(item)}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 pb-10 pt-2 border-t border-[#e8dfc8] flex flex-col items-center gap-3 text-center">
        <p className="text-xs text-[#b09878]">© 2026 VozTrip. All rights reserved.</p>
        <Link
          href="/home"
          className="text-sm text-[#c8a96e] underline underline-offset-2"
        >
          ← Quay về ứng dụng
        </Link>
      </div>
    </div>
  );
}
