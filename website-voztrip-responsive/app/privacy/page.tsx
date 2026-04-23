"use client";
import { Shield } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { tr, LangCode } from "@/lib/translations";

type Section = { title: string; content: string[] };

const SECTIONS: Record<LangCode, Section[]> = {
  vi: [
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
      content: ["Mọi câu hỏi về quyền riêng tư, vui lòng liên hệ: **privacy@voztrip.vn**"],
    },
  ],
  en: [
    {
      title: "1. Information We Collect",
      content: [
        "**GPS Location:** The app uses your location to detect nearby attractions and automatically play audio guides. Location is only used while the app is open and is never stored on our servers.",
        "**Session ID:** An anonymous session ID is automatically generated to record POI visit counts for analytics. This ID is not linked to any personal information.",
        "**Selected Language:** Stored locally on your device to remember your language preference.",
      ],
    },
    {
      title: "2. How We Use Information",
      content: [
        "To provide automatic audio narration when you approach attractions.",
        "To count POI visits anonymously for content improvement (no personal identification).",
        "To remember your chosen guide language on the device.",
      ],
    },
    {
      title: "3. What We Do NOT Do",
      content: [
        "We do not require login or collect names, emails, or phone numbers.",
        "We do not track your location when the app is closed (no background tracking).",
        "We do not sell, share, or transfer data to third parties for commercial purposes.",
        "We do not use tracking cookies or advertising.",
      ],
    },
    {
      title: "4. Data Storage",
      content: [
        "GPS location data is never stored — it is processed only on your device in real time.",
        "Session IDs and visit logs are stored on our servers for a maximum of 90 days, then automatically deleted.",
        "Language preferences are stored in your browser's localStorage and can be cleared at any time.",
      ],
    },
    {
      title: "5. Your Rights",
      content: [
        "You may deny GPS permission — the app still works but without the auto-trigger feature.",
        "You can delete local data by clearing your browser cache or uninstalling the app.",
        "To request deletion of session data, contact us via the email below.",
      ],
    },
    {
      title: "6. Security",
      content: [
        "All connections between the app and our servers are encrypted via HTTPS.",
        "We apply appropriate technical measures to protect data from unauthorized access.",
      ],
    },
    {
      title: "7. Policy Changes",
      content: [
        "We may update this policy from time to time. The latest version is always posted on this page with the update date.",
      ],
    },
    {
      title: "8. Contact",
      content: ["For any privacy questions, please contact: **privacy@voztrip.vn**"],
    },
  ],
  zh: [
    {
      title: "1. 我们收集的信息",
      content: [
        "**GPS位置：** 应用使用您的位置来检测附近景点并自动播放语音导览。位置信息仅在应用打开时使用，不会存储在我们的服务器上。",
        "**会话ID：** 自动生成匿名会话ID，用于统计POI访问次数。该ID不与任何个人信息关联。",
        "**已选语言：** 本地存储在您的设备上，用于记住您的语言偏好。",
      ],
    },
    {
      title: "2. 我们如何使用信息",
      content: [
        "当您靠近景点时，提供自动语音解说。",
        "匿名统计POI访问量以改善内容（不涉及个人身份识别）。",
        "在设备上记住您选择的导览语言。",
      ],
    },
    {
      title: "3. 我们不会做的事",
      content: [
        "不要求登录，不收集姓名、电子邮件或电话号码。",
        "应用关闭后不跟踪您的位置（无后台跟踪）。",
        "不出售、共享或转让数据给第三方用于商业目的。",
        "不使用跟踪Cookie或广告。",
      ],
    },
    {
      title: "4. 数据存储",
      content: [
        "GPS位置数据不会被存储——仅在您的设备上实时处理。",
        "会话ID和访问日志存储在服务器上最多90天，之后自动删除。",
        "语言偏好存储在浏览器的localStorage中，可随时清除。",
      ],
    },
    {
      title: "5. 您的权利",
      content: [
        "您可以拒绝GPS权限——应用仍可正常使用，但没有自动触发功能。",
        "您可以通过清除浏览器缓存或卸载应用来删除本地数据。",
        "如需删除会话数据，请通过以下电子邮件联系我们。",
      ],
    },
    {
      title: "6. 安全性",
      content: [
        "应用与服务器之间的所有连接均通过HTTPS加密。",
        "我们采取适当的技术措施保护数据免受未授权访问。",
      ],
    },
    {
      title: "7. 政策变更",
      content: ["我们可能会不时更新此政策。最新版本始终发布在此页面上并附有更新日期。"],
    },
    {
      title: "8. 联系方式",
      content: ["如有任何隐私问题，请联系：**privacy@voztrip.vn**"],
    },
  ],
  ko: [
    {
      title: "1. 수집하는 정보",
      content: [
        "**GPS 위치:** 앱은 근처 명소를 감지하고 오디오 가이드를 자동으로 재생하기 위해 귀하의 위치를 사용합니다. 위치 정보는 앱이 열려 있는 동안만 사용되며 서버에 저장되지 않습니다.",
        "**세션 ID:** POI 방문 횟수를 기록하기 위해 익명 세션 ID가 자동 생성됩니다. 이 ID는 어떠한 개인 정보와도 연결되지 않습니다.",
        "**선택한 언어:** 언어 기본 설정을 기억하기 위해 기기에 로컬 저장됩니다.",
      ],
    },
    {
      title: "2. 정보 사용 방법",
      content: [
        "명소에 가까이 접근할 때 자동 오디오 해설을 제공합니다.",
        "콘텐츠 개선을 위해 POI 방문 횟수를 익명으로 집계합니다 (개인 식별 없음).",
        "기기에서 선택한 가이드 언어를 기억합니다.",
      ],
    },
    {
      title: "3. 하지 않는 것",
      content: [
        "로그인을 요구하거나 이름, 이메일, 전화번호를 수집하지 않습니다.",
        "앱이 닫힌 후에는 위치를 추적하지 않습니다 (백그라운드 추적 없음).",
        "상업적 목적으로 제3자에게 데이터를 판매, 공유 또는 이전하지 않습니다.",
        "추적 쿠키나 광고를 사용하지 않습니다.",
      ],
    },
    {
      title: "4. 데이터 저장",
      content: [
        "GPS 위치 데이터는 저장되지 않으며 기기에서 실시간으로만 처리됩니다.",
        "세션 ID와 방문 로그는 서버에 최대 90일 동안 저장된 후 자동 삭제됩니다.",
        "언어 기본 설정은 브라우저 localStorage에 저장되며 언제든지 삭제할 수 있습니다.",
      ],
    },
    {
      title: "5. 귀하의 권리",
      content: [
        "GPS 권한을 거부할 수 있으며, 앱은 여전히 작동하지만 자동 트리거 기능은 없습니다.",
        "브라우저 캐시를 지우거나 앱을 제거하여 로컬 데이터를 삭제할 수 있습니다.",
        "세션 데이터 삭제를 요청하려면 아래 이메일로 문의하세요.",
      ],
    },
    {
      title: "6. 보안",
      content: [
        "앱과 서버 간의 모든 연결은 HTTPS를 통해 암호화됩니다.",
        "무단 액세스로부터 데이터를 보호하기 위해 적절한 기술적 조치를 적용합니다.",
      ],
    },
    {
      title: "7. 정책 변경",
      content: ["이 정책은 수시로 업데이트될 수 있습니다. 최신 버전은 항상 업데이트 날짜와 함께 이 페이지에 게시됩니다."],
    },
    {
      title: "8. 연락처",
      content: ["개인정보 관련 문의 사항은 다음으로 연락하세요: **privacy@voztrip.vn**"],
    },
  ],
  ja: [
    {
      title: "1. 収集する情報",
      content: [
        "**GPS位置情報：** アプリは近くの観光スポットを検出し、音声ガイドを自動再生するために位置情報を使用します。位置情報はアプリが開いている間のみ使用され、サーバーには保存されません。",
        "**セッションID：** POI訪問数を記録するために匿名セッションIDが自動生成されます。このIDは個人情報とは紐付けられません。",
        "**選択した言語：** 言語設定を記憶するためにデバイスにローカル保存されます。",
      ],
    },
    {
      title: "2. 情報の利用方法",
      content: [
        "観光スポットに近づいた際に自動音声解説を提供します。",
        "コンテンツ改善のためPOI訪問数を匿名で集計します（個人識別なし）。",
        "デバイスで選択したガイド言語を記憶します。",
      ],
    },
    {
      title: "3. 行わないこと",
      content: [
        "ログインを要求したり、名前、メールアドレス、電話番号を収集したりしません。",
        "アプリが閉じられた後は位置情報を追跡しません（バックグラウンドトラッキングなし）。",
        "商業目的で第三者にデータを販売、共有、または転送しません。",
        "トラッキングCookieや広告を使用しません。",
      ],
    },
    {
      title: "4. データの保存",
      content: [
        "GPS位置データは保存されず、リアルタイムでデバイス上でのみ処理されます。",
        "セッションIDと訪問ログはサーバーに最大90日間保存された後、自動的に削除されます。",
        "言語設定はブラウザのlocalStorageに保存され、いつでも削除できます。",
      ],
    },
    {
      title: "5. あなたの権利",
      content: [
        "GPS権限を拒否できます。アプリは引き続き動作しますが、自動トリガー機能はありません。",
        "ブラウザのキャッシュをクリアするかアプリをアンインストールすることでローカルデータを削除できます。",
        "セッションデータの削除を要請する場合は、下記メールにご連絡ください。",
      ],
    },
    {
      title: "6. セキュリティ",
      content: [
        "アプリとサーバー間のすべての接続はHTTPSで暗号化されています。",
        "不正アクセスからデータを保護するための適切な技術的措置を適用しています。",
      ],
    },
    {
      title: "7. ポリシーの変更",
      content: ["このポリシーは随時更新される場合があります。最新版は常に更新日とともにこのページに掲載されます。"],
    },
    {
      title: "8. お問い合わせ",
      content: ["プライバシーに関するご質問は、こちらまでご連絡ください：**privacy@voztrip.vn**"],
    },
  ],
};

const PRIVACY_INTRO: Record<LangCode, string> = {
  vi: "VozTrip tôn trọng quyền riêng tư của bạn. Chính sách này giải thích rõ những thông tin nào được thu thập, mục đích sử dụng và cách chúng tôi bảo vệ dữ liệu của bạn khi sử dụng ứng dụng hướng dẫn du lịch VozTrip.",
  en: "VozTrip respects your privacy. This policy explains what information is collected, how it is used, and how we protect your data when using the VozTrip tourism guide app.",
  zh: "VozTrip尊重您的隐私。本政策说明在使用VozTrip旅游导览应用时收集哪些信息、如何使用以及我们如何保护您的数据。",
  ko: "VozTrip은 귀하의 개인정보를 존중합니다. 이 정책은 VozTrip 관광 가이드 앱을 사용할 때 수집되는 정보, 사용 방법 및 데이터 보호 방법을 설명합니다.",
  ja: "VozTripはあなたのプライバシーを尊重します。このポリシーは、VozTrip観光ガイドアプリの使用時に収集される情報、その利用方法、およびデータ保護方法を説明します。",
};

function renderContent(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="text-[#2c2416] font-semibold">{part}</strong>
      : <span key={i}>{part}</span>
  );
}

export default function PrivacyPage() {
  const { lang } = useLanguage();
  const validLang = (["vi", "en", "zh", "ko", "ja"].includes(lang) ? lang : "vi") as LangCode;
  const sections = SECTIONS[validLang];
  const intro = PRIVACY_INTRO[validLang];

  return (
    <div className="min-h-screen bg-[#fdfaf4]">
      {/* Header */}
      <div className="bg-[#2c2416] px-6 pt-12 pb-8">
        <p className="text-[10px] tracking-[3px] text-[#c8a96e] uppercase mb-2">VozTrip</p>
        <div className="flex items-center gap-3 mb-2">
          <Shield size={28} color="#c8a96e" />
          <h1 className="text-2xl text-white font-light tracking-wide">{tr("privacy_title", lang)}</h1>
        </div>
        <p className="text-sm text-[#b09878]">{tr("privacy_updated", lang)}</p>
      </div>

      {/* Intro */}
      <div className="px-5 py-5 bg-[#fdf6e8] border-b border-[#e8dfc8]">
        <p className="text-sm text-[#5a4a35] leading-relaxed">{intro}</p>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-[#16a34a] font-medium">
          <Shield size={13} color="#16a34a" />
          <span>{tr("privacy_no_login", lang)}</span>
        </div>
      </div>

      {/* Sections */}
      <div className="px-5 py-6 flex flex-col gap-6">
        {sections.map((section) => (
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
          {tr("privacy_back", lang)}
        </Link>
      </div>
    </div>
  );
}
