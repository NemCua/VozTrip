import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chính sách bảo mật — VozTrip",
  description: "Chính sách bảo mật và quyền riêng tư của ứng dụng hướng dẫn du lịch VozTrip.",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2
      className="text-xs tracking-[0.3em] uppercase mb-4 pb-3"
      style={{ color: "#b09060", borderBottom: "1px solid #e8dfc8" }}
    >
      {title}
    </h2>
    <div className="space-y-3 text-sm leading-relaxed" style={{ color: "#5c4a30" }}>
      {children}
    </div>
  </section>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{ color: "#5c4a30" }}>{children}</p>
);

const Li = ({ children }: { children: React.ReactNode }) => (
  <li className="flex gap-2">
    <span style={{ color: "#c8a96e", marginTop: "2px" }}>·</span>
    <span>{children}</span>
  </li>
);

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f0e8" }}>
      {/* Header bar */}
      <header
        className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: "#2c2416", borderBottom: "1px solid #3d3020" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 flex items-center justify-center text-xs font-medium"
            style={{ backgroundColor: "#c8a96e", color: "#2c2416", borderRadius: "4px" }}
          >
            V
          </div>
          <span className="text-sm font-light tracking-wide" style={{ color: "#f5f0e8" }}>VozTrip</span>
        </div>
        <Link
          href="/login"
          className="text-xs tracking-widest uppercase transition-colors"
          style={{ color: "#8c7a5e" }}
          onMouseEnter={undefined}
        >
          Đăng nhập
        </Link>
      </header>

      {/* Hero */}
      <div className="px-6 py-14 text-center" style={{ borderBottom: "1px solid #e8dfc8", backgroundColor: "#fdfaf4" }}>
        <div className="text-xs tracking-[0.35em] uppercase mb-3" style={{ color: "#b09060" }}>
          VozTrip · Tourism Guide
        </div>
        <h1
          className="text-3xl font-light mb-4"
          style={{ color: "#2c2416", fontFamily: "Georgia, serif", letterSpacing: "-0.3px" }}
        >
          Chính sách bảo mật
        </h1>
        <p className="text-sm max-w-xl mx-auto" style={{ color: "#8c7a5e" }}>
          Chúng tôi tôn trọng quyền riêng tư của bạn. Tài liệu này giải thích cách VozTrip thu thập,
          sử dụng và bảo vệ thông tin khi bạn sử dụng ứng dụng hoặc dịch vụ của chúng tôi.
        </p>
        <div className="mt-4 text-xs" style={{ color: "#b09878" }}>
          Cập nhật lần cuối: tháng 04 năm 2025
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">

        <Section title="01 — Đối tượng áp dụng">
          <P>
            Chính sách này áp dụng cho tất cả người dùng VozTrip, bao gồm:
          </P>
          <ul className="space-y-2 mt-2">
            <Li><strong>Du khách (Guest)</strong> — người dùng ứng dụng di động để khám phá và nghe thuyết minh tại các địa điểm du lịch.</Li>
            <Li><strong>Seller (Chủ gian hàng)</strong> — cá nhân, tổ chức đăng ký tài khoản để quản lý nội dung điểm tham quan (POI).</Li>
            <Li><strong>Admin</strong> — quản trị viên hệ thống VozTrip.</Li>
          </ul>
        </Section>

        <Section title="02 — Thông tin chúng tôi thu thập">
          <P><strong className="font-medium" style={{ color: "#2c2416" }}>Đối với Du khách (Guest):</strong></P>
          <ul className="space-y-2 mt-1 mb-4">
            <Li>
              <strong>Vị trí GPS</strong> — được sử dụng duy nhất để xác định khoảng cách đến các điểm tham quan
              và kích hoạt thuyết minh tự động khi bạn đến gần. Dữ liệu vị trí <em>không</em> được lưu trữ
              vĩnh viễn và không được chia sẻ với bên thứ ba.
            </Li>
            <Li>
              <strong>Session ID</strong> — một mã định danh ẩn danh được tạo tự động mỗi khi mở ứng dụng,
              dùng để đếm lượt tham quan phục vụ thống kê. Không liên kết với danh tính cá nhân.
            </Li>
            <Li>
              <strong>Ngôn ngữ đã chọn</strong> — lưu cục bộ trên thiết bị (AsyncStorage), không đồng bộ lên máy chủ.
            </Li>
          </ul>
          <P><strong className="font-medium" style={{ color: "#2c2416" }}>Đối với Seller:</strong></P>
          <ul className="space-y-2 mt-1">
            <Li>Thông tin tài khoản: tên đăng nhập, mật khẩu (được mã hoá bằng BCrypt), họ tên, email, số điện thoại.</Li>
            <Li>Thông tin gian hàng: tên shop, mô tả, logo.</Li>
            <Li>Nội dung POI: tên địa điểm, toạ độ GPS, ảnh, video, audio thuyết minh, văn bản đa ngôn ngữ.</Li>
          </ul>
        </Section>

        <Section title="03 — Mục đích sử dụng dữ liệu">
          <ul className="space-y-2">
            <Li>Cung cấp trải nghiệm thuyết minh tự động khi du khách tiếp cận điểm tham quan.</Li>
            <Li>Hiển thị nội dung đa ngôn ngữ phù hợp với lựa chọn của người dùng.</Li>
            <Li>Thống kê lượt tham quan (ẩn danh) để hỗ trợ seller cải thiện nội dung.</Li>
            <Li>Quản lý tài khoản, phân quyền và xác thực seller qua JWT.</Li>
            <Li>Lưu trữ media (ảnh, audio, video) trên dịch vụ đám mây Cloudinary.</Li>
          </ul>
        </Section>

        <Section title="04 — Dữ liệu chúng tôi không thu thập">
          <ul className="space-y-2">
            <Li>Du khách không cần đăng ký tài khoản — không lưu tên, email hay bất kỳ thông tin nhận dạng cá nhân nào.</Li>
            <Li>Lịch sử vị trí chi tiết không được ghi lại. Chỉ sự kiện "đến gần POI" được ghi nhận dưới dạng log ẩn danh.</Li>
            <Li>Không có quảng cáo, không theo dõi hành vi, không chia sẻ dữ liệu với mạng quảng cáo.</Li>
            <Li>Không thu thập thông tin thiết bị vượt quá mức cần thiết để ứng dụng hoạt động.</Li>
          </ul>
        </Section>

        <Section title="05 — Lưu trữ và bảo mật">
          <ul className="space-y-2">
            <Li>Cơ sở dữ liệu được lưu trữ trên <strong>Neon PostgreSQL</strong> (cloud), với kết nối mã hoá SSL.</Li>
            <Li>Mật khẩu seller được mã hoá bằng thuật toán <strong>BCrypt</strong> trước khi lưu — chúng tôi không có khả năng xem mật khẩu gốc.</Li>
            <Li>Ảnh, audio và video được lưu trên <strong>Cloudinary</strong> với kiểm soát truy cập theo URL.</Li>
            <Li>API xác thực bằng <strong>JWT token</strong>, hết hạn sau thời gian nhất định.</Li>
            <Li>Admin có quyền xem và xóa nội dung vi phạm nhằm bảo vệ cộng đồng người dùng.</Li>
          </ul>
        </Section>

        <Section title="06 — Quyền của người dùng">
          <ul className="space-y-2">
            <Li><strong>Seller</strong> có thể chỉnh sửa hoặc xóa nội dung POI bất kỳ lúc nào qua dashboard.</Li>
            <Li>Yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan: liên hệ qua email bên dưới.</Li>
            <Li>Du khách có thể từ chối cấp quyền GPS — ứng dụng vẫn hoạt động nhưng tính năng trigger tự động và hiển thị khoảng cách sẽ bị vô hiệu.</Li>
          </ul>
        </Section>

        <Section title="07 — Dịch vụ bên thứ ba">
          <ul className="space-y-2">
            <Li><strong>Cloudinary</strong> — lưu trữ media. Xem chính sách tại cloudinary.com/privacy.</Li>
            <Li><strong>Neon</strong> — cơ sở dữ liệu đám mây. Xem chính sách tại neon.tech/privacy.</Li>
            <Li><strong>OpenStreetMap / Leaflet</strong> — bản đồ tương tác trên web dashboard. Không thu thập dữ liệu người dùng.</Li>
            <Li><strong>LibreTranslate</strong> — dịch tự động nội dung POI. Văn bản được gửi đi để dịch không kèm thông tin cá nhân.</Li>
          </ul>
        </Section>

        <Section title="08 — Thay đổi chính sách">
          <P>
            Chúng tôi có thể cập nhật chính sách này theo thời gian. Phiên bản mới nhất luôn được đăng tại
            địa chỉ này. Việc tiếp tục sử dụng ứng dụng sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận
            phiên bản mới.
          </P>
        </Section>

        <Section title="09 — Liên hệ">
          <P>
            Mọi thắc mắc về quyền riêng tư, yêu cầu xóa dữ liệu hoặc báo cáo vi phạm, vui lòng liên hệ:
          </P>
          <div
            className="mt-3 px-5 py-4 inline-block"
            style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8", borderRadius: "4px" }}
          >
            <div className="text-sm font-medium mb-1" style={{ color: "#2c2416" }}>VozTrip Support</div>
            <div className="text-sm" style={{ color: "#8c7a5e" }}>support@voztrip.app</div>
            <div className="text-xs mt-1" style={{ color: "#b09878" }}>Phản hồi trong vòng 3–5 ngày làm việc</div>
          </div>
        </Section>

      </main>

      {/* Footer */}
      <footer
        className="px-6 py-8 text-center"
        style={{ backgroundColor: "#2c2416", borderTop: "1px solid #3d3020" }}
      >
        <div className="text-xs mb-2" style={{ color: "#c8a96e" }}>VozTrip — Tourism Guide</div>
        <div className="text-xs" style={{ color: "#5c4a30" }}>
          © 2025 VozTrip. Bảo lưu mọi quyền.
        </div>
      </footer>
    </div>
  );
}
