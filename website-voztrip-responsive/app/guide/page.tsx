"use client";
import { BookOpen, MapPin, Headphones, Navigation, QrCode, Phone, MessageSquarePlus, Globe, CreditCard, Map, Zap } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { tr, LangCode } from "@/lib/translations";

type Step = {
  icon: React.ReactNode;
  title: string;
  content: string[];
  tip?: string;
  note?: string;
};

const STEPS: Record<LangCode, Step[]> = {
  vi: [
    {
      icon: <CreditCard size={22} color="#c8a96e" />,
      title: "Bước 1 — Đăng ký thiết bị",
      content: [
        "Lần đầu mở ứng dụng, bạn cần hoàn tất bước đăng ký thiết bị để truy cập đầy đủ tính năng.",
        "Nhấn **Đăng ký** → ứng dụng tạo mã đơn hàng và hiển thị mã QR thanh toán SePay.",
        "Thực hiện chuyển khoản ngân hàng với **nội dung chính xác** như hướng dẫn (dạng: VOZTRIP xxxxxxxx).",
        "Hệ thống tự động xác nhận trong vòng vài giây sau khi nhận tiền — không cần chờ thủ công.",
        "Thiết bị được kích hoạt vĩnh viễn. Lần sau mở lại không cần đăng ký lại.",
      ],
      tip: "Mỗi thiết bị chỉ cần đăng ký một lần duy nhất. Nếu đổi trình duyệt hoặc xóa dữ liệu, cần đăng ký lại.",
    },
    {
      icon: <Globe size={22} color="#c8a96e" />,
      title: "Bước 2 — Chọn ngôn ngữ thuyết minh",
      content: [
        "Ứng dụng hỗ trợ 5 ngôn ngữ thuyết minh: **Tiếng Việt, English, 中文, 한국어, 日本語**.",
        "Mở trang chọn ngôn ngữ → nhấn vào ngôn ngữ bạn muốn → xác nhận.",
        "Toàn bộ nội dung POI (tên, mô tả, câu hỏi thường gặp, audio) sẽ hiển thị theo ngôn ngữ đã chọn.",
        "Ngôn ngữ được ghi nhớ tự động — không cần chọn lại mỗi lần mở ứng dụng.",
      ],
      tip: "Có thể thay đổi ngôn ngữ bất kỳ lúc nào trong tab Hồ sơ (Profile).",
    },
    {
      icon: <MapPin size={22} color="#c8a96e" />,
      title: "Bước 3 — Khám phá điểm tham quan",
      content: [
        "Tab **Khám phá** hiển thị toàn bộ điểm tham quan (POI) trong khu vực du lịch.",
        "Mỗi thẻ POI có: ảnh thumbnail, tên điểm, khu vực, badge **Nổi bật** nếu được đề xuất.",
        "Nhấn vào thẻ bất kỳ để vào trang chi tiết đầy đủ.",
        "Cuộn xuống để tải thêm POI. Danh sách cập nhật tự động theo nội dung seller.",
      ],
    },
    {
      icon: <Headphones size={22} color="#c8a96e" />,
      title: "Bước 4 — Chi tiết POI & nghe thuyết minh",
      content: [
        "Trang chi tiết gồm: **Gallery ảnh/video**, mô tả nội dung, bản đồ vị trí nhỏ.",
        "Nhấn nút **Listen** (tai nghe) để nghe thuyết minh âm thanh — ưu tiên file Cloudinary, fallback sang Web TTS nếu không có.",
        "Nhấn lại nút Listen đang phát để **dừng** audio.",
        "Phần **Q&A** bên dưới liệt kê các câu hỏi thường gặp tại điểm này. Nhấn vào câu hỏi để mở rộng và xem câu trả lời.",
        "Mỗi câu trả lời cũng có nút nghe audio riêng (nếu seller đã cung cấp).",
      ],
      tip: "Nhấn vào ảnh trong gallery để xem toàn màn hình. Vuốt trái/phải để chuyển ảnh.",
    },
    {
      icon: <Zap size={22} color="#c8a96e" />,
      title: "Bước 5 — GPS tự động kích hoạt thuyết minh ⭐",
      content: [
        "Đây là tính năng **nổi bật nhất** của VozTrip — không cần tìm kiếm thủ công.",
        "Khi ứng dụng hỏi quyền vị trí, nhấn **Cho phép** để bật GPS.",
        "Khi bạn đi đến gần một điểm tham quan (trong bán kính ~10–50m tùy POI), ứng dụng **tự động phát thuyết minh** và hiện banner thông báo.",
        "Banner hiển thị tên POI và 2 nút: **Xem chi tiết** (vào trang POI) và **Bỏ qua** (tắt banner).",
        "Nếu có nhiều POI kế tiếp nhau, ứng dụng xếp **hàng đợi** và phát lần lượt.",
        "Độ ưu tiên phát: POI nổi bật có audio > POI nổi bật > POI VIP có audio > POI VIP > POI thường.",
      ],
      note: "GPS chỉ hoạt động khi ứng dụng đang mở trên trình duyệt. Không theo dõi vị trí khi đóng tab.",
    },
    {
      icon: <Navigation size={22} color="#c8a96e" />,
      title: "Bước 6 — Tab Gần đây (Nearby)",
      content: [
        "Tab **Gần đây** hiển thị các POI được **sắp xếp theo khoảng cách** từ vị trí hiện tại của bạn.",
        "Mỗi thẻ POI hiển thị chip khoảng cách trực tiếp (ví dụ: 120m, 1.2km).",
        "POI trong vùng kích hoạt GPS (≤ triggerRadius) được đánh dấu **badge xanh** — bạn đang đứng trong vùng đó.",
        "Nhấn vào POI để vào chi tiết, hoặc để ứng dụng tự kích hoạt khi bạn đi đến gần.",
      ],
      tip: "Bật GPS để thấy khoảng cách chính xác. Nếu GPS tắt, danh sách vẫn hiển thị nhưng không sắp xếp theo khoảng cách.",
    },
    {
      icon: <Map size={22} color="#c8a96e" />,
      title: "Bước 7 — Tab Bản đồ",
      content: [
        "Tab **Bản đồ** hiển thị tất cả POI dưới dạng **marker** trên bản đồ tương tác (Leaflet).",
        "Chấm xanh biểu thị vị trí hiện tại của bạn (cập nhật theo GPS thời gian thực).",
        "Nhấn vào **marker POI** để xem thông tin nhanh: tên, khoảng cách, nút nghe và xem chi tiết.",
        "Nhấn nút **Về vị trí của tôi** (góc phải) để bản đồ tự động bay về chỗ bạn đứng.",
        "Chip GPS trên đầu hiển thị trạng thái: **GPS bật** (xanh) / **GPS tắt** (đỏ) / **Đang định vị** (xám).",
      ],
    },
    {
      icon: <QrCode size={22} color="#c8a96e" />,
      title: "Bước 8 — Quét mã QR",
      content: [
        "Một số điểm tham quan có **bảng QR** đặt tại chỗ (ở cổng vào, bảng giới thiệu, v.v.).",
        "Mở tab **QR** → nhấn **Bắt đầu quét** → hướng camera vào mã.",
        "Sau khi quét thành công, ứng dụng tự chuyển thẳng đến trang chi tiết của POI đó.",
        "Nếu trình duyệt không hỗ trợ camera, có thể nhập thủ công mã POI.",
      ],
      note: "Cần cấp quyền camera cho trình duyệt khi được hỏi lần đầu.",
    },
    {
      icon: <Phone size={22} color="#c8a96e" />,
      title: "Bước 9 — SOS Khẩn cấp",
      content: [
        "Nút **SOS** (màu đỏ) luôn hiển thị ở góc dưới phải mọi trang.",
        "Nhấn SOS để mở danh sách số điện thoại khẩn cấp tại địa phương.",
        "Các nhóm hỗ trợ: **Cứu hộ cứu nạn**, **Cảnh sát**, **Cấp cứu 115**, **Phòng cháy chữa cháy**, **Đường dây du lịch**.",
        "Nhấn trực tiếp vào số điện thoại để **gọi ngay** mà không cần sao chép.",
      ],
      tip: "SOS không cần internet — chỉ cần sóng điện thoại để gọi.",
    },
    {
      icon: <MessageSquarePlus size={22} color="#c8a96e" />,
      title: "Bước 10 — Góp ý & Báo lỗi",
      content: [
        "Nhấn nút **Feedback** trong tab Hồ sơ để mở form góp ý.",
        "Chọn loại phản hồi: **Lỗi kỹ thuật**, **Góp ý cải tiến**, **Nội dung sai/thiếu**, **Khác**.",
        "Nhập mô tả chi tiết (tối đa 1000 ký tự) → nhấn Gửi.",
        "Phản hồi của bạn được ghi nhận ngay và đội ngũ sẽ xem xét trong thời gian sớm nhất.",
      ],
    },
  ],

  en: [
    {
      icon: <CreditCard size={22} color="#c8a96e" />,
      title: "Step 1 — Device Registration",
      content: [
        "On first launch, you need to complete device registration to access all features.",
        "Tap **Register** → the app generates an order code and displays a SePay QR code.",
        "Make a bank transfer with the **exact content** shown (format: VOZTRIP xxxxxxxx).",
        "The system automatically confirms within seconds of receiving payment — no manual wait required.",
        "Your device is permanently activated. No need to register again on future visits.",
      ],
      tip: "Each device only needs to be registered once. If you switch browsers or clear data, re-registration is required.",
    },
    {
      icon: <Globe size={22} color="#c8a96e" />,
      title: "Step 2 — Choose Guide Language",
      content: [
        "The app supports 5 guide languages: **Tiếng Việt, English, 中文, 한국어, 日本語**.",
        "Open the language page → tap your preferred language → confirm.",
        "All POI content (names, descriptions, FAQs, audio) will be shown in the selected language.",
        "Your language is saved automatically — no need to reselect every session.",
      ],
      tip: "You can change the language at any time from the Profile tab.",
    },
    {
      icon: <MapPin size={22} color="#c8a96e" />,
      title: "Step 3 — Explore Attractions",
      content: [
        "The **Explore** tab shows all points of interest (POIs) in the tourism area.",
        "Each POI card shows: thumbnail, name, zone, and a **Featured** badge if highlighted.",
        "Tap any card to open the full detail page.",
        "Scroll down to load more POIs. The list updates automatically with seller content.",
      ],
    },
    {
      icon: <Headphones size={22} color="#c8a96e" />,
      title: "Step 4 — POI Detail & Audio Guide",
      content: [
        "The detail page includes: **photo/video gallery**, description, and a mini location map.",
        "Tap the **Listen** button (headphone icon) to play the audio guide — prioritizes Cloudinary files, falls back to Web TTS if unavailable.",
        "Tap the playing Listen button again to **stop** audio.",
        "The **Q&A** section below lists common questions at this location. Tap a question to expand and read the answer.",
        "Each answer also has its own audio button (if the seller has provided audio).",
      ],
      tip: "Tap any image in the gallery to view fullscreen. Swipe left/right to browse.",
    },
    {
      icon: <Zap size={22} color="#c8a96e" />,
      title: "Step 5 — GPS Auto-Trigger ⭐",
      content: [
        "This is VozTrip's **signature feature** — no manual searching needed.",
        "When the app asks for location permission, tap **Allow** to enable GPS.",
        "When you walk near an attraction (within ~10–50m depending on the POI), the app **automatically plays the audio guide** and shows a notification banner.",
        "The banner shows the POI name with two buttons: **View Details** (open POI page) and **Dismiss** (hide banner).",
        "If multiple POIs are close together, the app queues them and plays **one after another**.",
        "Priority order: featured + audio > featured > VIP + audio > VIP > standard.",
      ],
      note: "GPS only works while the app tab is open. Location is not tracked when the tab is closed.",
    },
    {
      icon: <Navigation size={22} color="#c8a96e" />,
      title: "Step 6 — Nearby Tab",
      content: [
        "The **Nearby** tab shows POIs **sorted by distance** from your current location.",
        "Each POI card displays a distance chip (e.g. 120m, 1.2km).",
        "POIs within GPS trigger range (≤ triggerRadius) are marked with a **green badge** — you are standing inside that zone.",
        "Tap a POI to view details, or let the app auto-trigger as you walk closer.",
      ],
      tip: "Enable GPS to see accurate distances. Without GPS, the list is still visible but not distance-sorted.",
    },
    {
      icon: <Map size={22} color="#c8a96e" />,
      title: "Step 7 — Map Tab",
      content: [
        "The **Map** tab shows all POIs as **markers** on an interactive map (Leaflet).",
        "A blue dot shows your current location, updated in real time via GPS.",
        "Tap a **POI marker** for a quick preview: name, distance, listen and details buttons.",
        "Tap the **Back to my location** button (bottom right) to fly the map back to your position.",
        "The GPS chip at the top shows: **GPS on** (green) / **GPS off** (red) / **Locating** (grey).",
      ],
    },
    {
      icon: <QrCode size={22} color="#c8a96e" />,
      title: "Step 8 — QR Code Scan",
      content: [
        "Some attractions have a **QR board** on-site (at the entrance, info panel, etc.).",
        "Open the **QR** tab → tap **Start Scanning** → point your camera at the code.",
        "After a successful scan, the app navigates directly to that POI's detail page.",
        "If your browser does not support the camera, you can enter the POI code manually.",
      ],
      note: "Grant camera permission to the browser when prompted for the first time.",
    },
    {
      icon: <Phone size={22} color="#c8a96e" />,
      title: "Step 9 — SOS Emergency",
      content: [
        "The **SOS** button (red) is always visible at the bottom right of every page.",
        "Tap SOS to open a list of local emergency phone numbers.",
        "Available groups: **Search & Rescue**, **Police**, **Ambulance 115**, **Fire Department**, **Tourism Hotline**.",
        "Tap any number directly to **call immediately** without copying.",
      ],
      tip: "SOS does not need internet — just mobile signal to make a call.",
    },
    {
      icon: <MessageSquarePlus size={22} color="#c8a96e" />,
      title: "Step 10 — Feedback & Bug Report",
      content: [
        "Tap the **Feedback** button in the Profile tab to open the feedback form.",
        "Choose a type: **Bug**, **Suggestion**, **Incorrect/Missing Content**, **Other**.",
        "Enter a description (up to 1000 characters) → tap Send.",
        "Your feedback is recorded immediately and our team will review it as soon as possible.",
      ],
    },
  ],

  zh: [
    {
      icon: <CreditCard size={22} color="#c8a96e" />,
      title: "第一步 — 设备注册",
      content: [
        "首次打开应用时，您需要完成设备注册才能使用全部功能。",
        "点击**注册** → 应用生成订单码并显示SePay二维码。",
        "按照提示进行银行转账，**转账说明必须与指示完全一致**（格式：VOZTRIP xxxxxxxx）。",
        "收款后系统将在数秒内自动确认，无需手动等待。",
        "设备永久激活，下次打开无需重新注册。",
      ],
      tip: "每台设备只需注册一次。如果更换浏览器或清除数据，则需要重新注册。",
    },
    {
      icon: <Globe size={22} color="#c8a96e" />,
      title: "第二步 — 选择导览语言",
      content: [
        "应用支持5种导览语言：**Tiếng Việt、English、中文、한국어、日本語**。",
        "打开语言页面 → 点击您想要的语言 → 确认。",
        "所有POI内容（名称、描述、常见问题、音频）将以所选语言显示。",
        "语言设置自动保存，每次打开应用无需重新选择。",
      ],
      tip: "可以随时在个人资料（Profile）标签中更改语言。",
    },
    {
      icon: <MapPin size={22} color="#c8a96e" />,
      title: "第三步 — 探索景点",
      content: [
        "**探索**标签显示旅游区域内的所有景点（POI）。",
        "每张POI卡片显示：缩略图、名称、区域，以及**推荐**标签（如已推荐）。",
        "点击任意卡片进入完整详情页。",
        "向下滚动加载更多POI，列表根据商家内容自动更新。",
      ],
    },
    {
      icon: <Headphones size={22} color="#c8a96e" />,
      title: "第四步 — 景点详情与音频导览",
      content: [
        "详情页包含：**照片/视频展示**、内容描述和小型位置地图。",
        "点击**收听**按钮（耳机图标）播放音频导览——优先使用Cloudinary文件，无文件时自动切换为网页TTS。",
        "再次点击正在播放的收听按钮可**停止**音频。",
        "下方**常见问题**部分列出该景点的常见问题，点击问题展开查看答案。",
        "每个答案也有独立的音频播放按钮（如商家已提供音频）。",
      ],
      tip: "点击图库中的任意图片可全屏查看，向左/右滑动浏览。",
    },
    {
      icon: <Zap size={22} color="#c8a96e" />,
      title: "第五步 — GPS自动触发导览 ⭐",
      content: [
        "这是VozTrip的**核心功能** — 无需手动搜索。",
        "当应用请求位置权限时，点击**允许**以启用GPS。",
        "当您走近某个景点时（距离约10–50米，视POI而定），应用会**自动播放讲解音频**并显示通知横幅。",
        "横幅显示POI名称及两个按钮：**查看详情**（进入POI页面）和**忽略**（隐藏横幅）。",
        "如果多个POI相邻，应用会将它们排入**队列**依次播放。",
        "播放优先级：推荐+音频 > 推荐 > VIP+音频 > VIP > 普通。",
      ],
      note: "GPS仅在标签页打开时工作，关闭标签页后不跟踪位置。",
    },
    {
      icon: <Navigation size={22} color="#c8a96e" />,
      title: "第六步 — 附近标签",
      content: [
        "**附近**标签显示按距离**从近到远排序**的POI列表。",
        "每张POI卡片直接显示距离标签（例如：120m、1.2km）。",
        "在GPS触发范围内的POI（≤ triggerRadius）会标注**绿色徽章**——表示您正处于该区域内。",
        "点击POI查看详情，或继续靠近让应用自动触发。",
      ],
      tip: "启用GPS以获取精确距离。未开启GPS时，列表仍可显示但不按距离排序。",
    },
    {
      icon: <Map size={22} color="#c8a96e" />,
      title: "第七步 — 地图标签",
      content: [
        "**地图**标签以**标记**形式在交互式地图（Leaflet）上显示所有POI。",
        "蓝色圆点代表您的当前位置，通过GPS实时更新。",
        "点击**POI标记**可快速预览：名称、距离、收听及详情按钮。",
        "点击**回到我的位置**按钮（右下角）地图将自动飞回您所在位置。",
        "顶部GPS状态标签显示：**GPS开启**（绿色）/  **GPS关闭**（红色）/ **定位中**（灰色）。",
      ],
    },
    {
      icon: <QrCode size={22} color="#c8a96e" />,
      title: "第八步 — 扫描二维码",
      content: [
        "部分景点在现场设有**二维码牌**（入口处、介绍牌等）。",
        "打开**二维码**标签 → 点击**开始扫描** → 将摄像头对准二维码。",
        "扫描成功后，应用将直接跳转至该POI的详情页。",
        "如果浏览器不支持摄像头，可手动输入POI代码。",
      ],
      note: "首次使用时请在浏览器提示时授予摄像头权限。",
    },
    {
      icon: <Phone size={22} color="#c8a96e" />,
      title: "第九步 — SOS紧急求助",
      content: [
        "**SOS**按钮（红色）始终显示在每个页面的右下角。",
        "点击SOS打开当地紧急电话号码列表。",
        "可用分类：**搜救队**、**警察**、**救护车115**、**消防队**、**旅游热线**。",
        "直接点击任意号码**立即拨打**，无需复制。",
      ],
      tip: "SOS不需要网络——只需手机信号即可拨打。",
    },
    {
      icon: <MessageSquarePlus size={22} color="#c8a96e" />,
      title: "第十步 — 反馈与错误报告",
      content: [
        "点击个人资料标签中的**反馈**按钮打开反馈表单。",
        "选择类型：**技术错误**、**改进建议**、**内容错误/缺失**、**其他**。",
        "输入详细描述（最多1000字） → 点击发送。",
        "您的反馈将立即被记录，我们的团队将尽快处理。",
      ],
    },
  ],

  ko: [
    {
      icon: <CreditCard size={22} color="#c8a96e" />,
      title: "1단계 — 기기 등록",
      content: [
        "처음 앱을 열면 모든 기능을 사용하기 위해 기기 등록을 완료해야 합니다.",
        "**등록**을 탭하면 앱이 주문 코드를 생성하고 SePay QR 코드를 표시합니다.",
        "안내에 표시된 **정확한 내용**으로 은행 이체를 진행합니다 (형식: VOZTRIP xxxxxxxx).",
        "입금 후 몇 초 내에 시스템이 자동으로 확인합니다 — 수동 대기 불필요.",
        "기기가 영구 활성화됩니다. 이후 방문 시 재등록이 필요 없습니다.",
      ],
      tip: "각 기기는 한 번만 등록하면 됩니다. 브라우저를 변경하거나 데이터를 초기화하면 재등록이 필요합니다.",
    },
    {
      icon: <Globe size={22} color="#c8a96e" />,
      title: "2단계 — 가이드 언어 선택",
      content: [
        "앱은 5개 가이드 언어를 지원합니다: **Tiếng Việt, English, 中文, 한국어, 日本語**.",
        "언어 페이지 열기 → 원하는 언어 탭 → 확인.",
        "모든 POI 콘텐츠(이름, 설명, FAQ, 오디오)가 선택한 언어로 표시됩니다.",
        "언어 설정은 자동으로 저장되어 매 세션마다 재선택할 필요가 없습니다.",
      ],
      tip: "프로필 탭에서 언제든지 언어를 변경할 수 있습니다.",
    },
    {
      icon: <MapPin size={22} color="#c8a96e" />,
      title: "3단계 — 관광지 탐색",
      content: [
        "**탐색** 탭에서 관광 지역 내 모든 관심 지점(POI)을 확인할 수 있습니다.",
        "각 POI 카드에는 썸네일, 이름, 구역이 표시되며 추천 시 **추천** 배지가 붙습니다.",
        "카드를 탭하면 상세 페이지로 이동합니다.",
        "아래로 스크롤하여 더 많은 POI를 불러옵니다. 목록은 셀러 콘텐츠에 따라 자동으로 업데이트됩니다.",
      ],
    },
    {
      icon: <Headphones size={22} color="#c8a96e" />,
      title: "4단계 — POI 상세 정보 및 오디오 가이드",
      content: [
        "상세 페이지에는 **사진/동영상 갤러리**, 내용 설명, 미니 위치 지도가 포함됩니다.",
        "**듣기** 버튼(헤드폰 아이콘)을 탭하면 오디오 가이드가 재생됩니다 — Cloudinary 파일을 우선 사용하고, 없는 경우 Web TTS로 전환됩니다.",
        "재생 중인 듣기 버튼을 다시 탭하면 오디오가 **정지**됩니다.",
        "아래 **Q&A** 섹션에 이 장소의 자주 묻는 질문이 나열됩니다. 질문을 탭하면 펼쳐져 답변을 볼 수 있습니다.",
        "각 답변에도 별도의 오디오 버튼이 있습니다(셀러가 오디오를 제공한 경우).",
      ],
      tip: "갤러리의 이미지를 탭하면 전체 화면으로 볼 수 있습니다. 좌우로 스와이프하여 탐색하세요.",
    },
    {
      icon: <Zap size={22} color="#c8a96e" />,
      title: "5단계 — GPS 자동 트리거 ⭐",
      content: [
        "이것은 VozTrip의 **핵심 기능**입니다 — 수동 검색이 필요 없습니다.",
        "앱이 위치 권한을 요청하면 **허용**을 탭하여 GPS를 활성화하세요.",
        "관광지에 가까이 걸어가면(POI에 따라 약 10–50m 이내), 앱이 **자동으로 오디오 가이드를 재생**하고 알림 배너를 표시합니다.",
        "배너에 POI 이름과 두 개의 버튼이 표시됩니다: **상세 보기**(POI 페이지 열기) 및 **닫기**(배너 숨기기).",
        "여러 POI가 가까이 있는 경우 앱이 **대기열**을 만들어 순서대로 재생합니다.",
        "우선순위: 추천+오디오 > 추천 > VIP+오디오 > VIP > 일반.",
      ],
      note: "GPS는 앱 탭이 열려 있는 동안에만 작동합니다. 탭을 닫으면 위치 추적이 중지됩니다.",
    },
    {
      icon: <Navigation size={22} color="#c8a96e" />,
      title: "6단계 — 근처 탭",
      content: [
        "**근처** 탭은 현재 위치에서의 **거리순**으로 POI를 표시합니다.",
        "각 POI 카드에 거리 칩이 직접 표시됩니다 (예: 120m, 1.2km).",
        "GPS 트리거 범위 내의 POI(≤ triggerRadius)는 **녹색 배지**로 표시됩니다 — 해당 구역 안에 있다는 의미입니다.",
        "POI를 탭하여 상세 정보를 보거나, 더 가까이 걸어가 자동 트리거를 기다리세요.",
      ],
      tip: "정확한 거리를 보려면 GPS를 활성화하세요. GPS 없이도 목록은 표시되지만 거리순 정렬이 되지 않습니다.",
    },
    {
      icon: <Map size={22} color="#c8a96e" />,
      title: "7단계 — 지도 탭",
      content: [
        "**지도** 탭은 모든 POI를 인터랙티브 지도(Leaflet)의 **마커**로 표시합니다.",
        "파란 점이 GPS를 통해 실시간으로 업데이트되는 현재 위치를 나타냅니다.",
        "**POI 마커**를 탭하면 빠른 미리보기가 표시됩니다: 이름, 거리, 듣기 및 상세 버튼.",
        "**내 위치로** 버튼(우측 하단)을 탭하면 지도가 현재 위치로 이동합니다.",
        "상단 GPS 칩은 상태를 표시합니다: **GPS 켜짐**(녹색) / **GPS 꺼짐**(빨간색) / **위치 확인 중**(회색).",
      ],
    },
    {
      icon: <QrCode size={22} color="#c8a96e" />,
      title: "8단계 — QR 코드 스캔",
      content: [
        "일부 관광지에는 현장에 **QR 안내판**이 설치되어 있습니다(입구, 안내판 등).",
        "**QR** 탭 열기 → **스캔 시작** 탭 → 카메라를 코드에 맞추세요.",
        "스캔 성공 후 앱이 해당 POI 상세 페이지로 바로 이동합니다.",
        "브라우저가 카메라를 지원하지 않는 경우 POI 코드를 수동으로 입력할 수 있습니다.",
      ],
      note: "처음 사용 시 브라우저 안내에 따라 카메라 권한을 허용해 주세요.",
    },
    {
      icon: <Phone size={22} color="#c8a96e" />,
      title: "9단계 — SOS 긴급 연락",
      content: [
        "**SOS** 버튼(빨간색)은 모든 페이지 우측 하단에 항상 표시됩니다.",
        "SOS를 탭하면 현지 긴급 전화번호 목록이 열립니다.",
        "이용 가능한 그룹: **수색구조대**, **경찰**, **구급차 115**, **소방서**, **관광 핫라인**.",
        "번호를 직접 탭하면 복사 없이 **즉시 전화**를 걸 수 있습니다.",
      ],
      tip: "SOS는 인터넷 없이도 가능합니다 — 통화를 위한 모바일 신호만 있으면 됩니다.",
    },
    {
      icon: <MessageSquarePlus size={22} color="#c8a96e" />,
      title: "10단계 — 피드백 및 버그 신고",
      content: [
        "프로필 탭의 **피드백** 버튼을 탭하여 피드백 양식을 엽니다.",
        "유형 선택: **버그**, **개선 제안**, **잘못된/누락된 콘텐츠**, **기타**.",
        "상세 설명 입력(최대 1000자) → 전송 탭.",
        "피드백이 즉시 기록되며 팀에서 최대한 빨리 검토합니다.",
      ],
    },
  ],

  ja: [
    {
      icon: <CreditCard size={22} color="#c8a96e" />,
      title: "ステップ1 — デバイス登録",
      content: [
        "初回起動時、すべての機能を利用するためにデバイス登録を完了する必要があります。",
        "**登録**をタップ → アプリが注文コードを生成してSePay QRコードを表示します。",
        "案内通りの**正確な内容**で銀行振込を行ってください（形式：VOZTRIP xxxxxxxx）。",
        "入金後、システムが数秒以内に自動確認します — 手動での待機は不要です。",
        "デバイスは永続的に有効化されます。次回以降の再登録は不要です。",
      ],
      tip: "各デバイスの登録は1回のみです。ブラウザを変更したりデータを消去した場合は再登録が必要です。",
    },
    {
      icon: <Globe size={22} color="#c8a96e" />,
      title: "ステップ2 — ガイド言語の選択",
      content: [
        "アプリは5つのガイド言語をサポートしています：**Tiếng Việt、English、中文、한국어、日本語**。",
        "言語ページを開く → 希望の言語をタップ → 確認。",
        "すべてのPOIコンテンツ（名前、説明、よくある質問、音声）が選択した言語で表示されます。",
        "言語設定は自動的に保存され、毎回再選択する必要はありません。",
      ],
      tip: "プロフィールタブからいつでも言語を変更できます。",
    },
    {
      icon: <MapPin size={22} color="#c8a96e" />,
      title: "ステップ3 — 観光スポットを探索",
      content: [
        "**探索**タブには観光エリア内のすべてのスポット（POI）が表示されます。",
        "各POIカードには：サムネイル、名称、エリア、おすすめの場合は**おすすめ**バッジが表示されます。",
        "任意のカードをタップして詳細ページに進みます。",
        "下にスクロールしてさらにPOIを読み込みます。リストはセラーのコンテンツに合わせて自動更新されます。",
      ],
    },
    {
      icon: <Headphones size={22} color="#c8a96e" />,
      title: "ステップ4 — POI詳細と音声ガイド",
      content: [
        "詳細ページには：**写真/動画ギャラリー**、内容説明、ミニ位置マップが含まれます。",
        "**聴く**ボタン（ヘッドフォンアイコン）をタップすると音声ガイドが再生されます — Cloudinaryファイルを優先し、ない場合はWeb TTSにフォールバックします。",
        "再生中の聴くボタンを再タップすると音声が**停止**します。",
        "下の**Q&A**セクションにこのスポットのよくある質問が一覧表示されます。質問をタップして展開し回答を確認できます。",
        "各回答にも専用の音声ボタンがあります（セラーが音声を提供している場合）。",
      ],
      tip: "ギャラリーの画像をタップするとフルスクリーンで表示できます。左右にスワイプして閲覧してください。",
    },
    {
      icon: <Zap size={22} color="#c8a96e" />,
      title: "ステップ5 — GPS自動トリガー ⭐",
      content: [
        "これはVozTripの**最大の特長**です — 手動検索は不要です。",
        "アプリが位置情報の許可を求めたら、**許可**をタップしてGPSを有効にします。",
        "観光スポットの近くに歩いて来ると（POIによって約10〜50m以内）、アプリが**自動的に音声ガイドを再生**して通知バナーを表示します。",
        "バナーにPOI名と2つのボタンが表示されます：**詳細を見る**（POIページを開く）と**閉じる**（バナーを非表示）。",
        "複数のPOIが近接している場合、アプリは**キュー**を作成して順番に再生します。",
        "優先順位：おすすめ+音声 > おすすめ > VIP+音声 > VIP > 標準。",
      ],
      note: "GPSはアプリのタブが開いている間のみ機能します。タブを閉じると位置の追跡は停止します。",
    },
    {
      icon: <Navigation size={22} color="#c8a96e" />,
      title: "ステップ6 — 近くのタブ",
      content: [
        "**近く**タブには現在地からの**距離順**でPOIが表示されます。",
        "各POIカードに距離チップが直接表示されます（例：120m、1.2km）。",
        "GPSトリガー範囲内のPOI（≤ triggerRadius）は**緑のバッジ**で表示されます — その範囲内にいることを示します。",
        "POIをタップして詳細を確認するか、さらに近づいて自動トリガーを待ちましょう。",
      ],
      tip: "正確な距離を確認するにはGPSを有効にしてください。GPS無しでもリストは表示されますが距離順にはなりません。",
    },
    {
      icon: <Map size={22} color="#c8a96e" />,
      title: "ステップ7 — マップタブ",
      content: [
        "**マップ**タブはすべてのPOIをインタラクティブマップ（Leaflet）上の**マーカー**として表示します。",
        "青い点がGPSでリアルタイム更新される現在位置を示します。",
        "**POIマーカー**をタップすると簡易プレビューが表示されます：名称、距離、聴くと詳細ボタン。",
        "**現在地に戻る**ボタン（右下）をタップするとマップが現在位置に自動移動します。",
        "上部のGPSチップが状態を表示します：**GPS オン**（緑）/ **GPS オフ**（赤）/ **測位中**（グレー）。",
      ],
    },
    {
      icon: <QrCode size={22} color="#c8a96e" />,
      title: "ステップ8 — QRコードスキャン",
      content: [
        "一部の観光スポットには現地に**QRボード**が設置されています（入口、案内板など）。",
        "**QR**タブを開く → **スキャン開始**をタップ → カメラをコードに向ける。",
        "スキャン成功後、アプリは直接そのPOIの詳細ページに移動します。",
        "ブラウザがカメラをサポートしていない場合は、POIコードを手動入力できます。",
      ],
      note: "初回使用時にブラウザのプロンプトに従ってカメラの権限を許可してください。",
    },
    {
      icon: <Phone size={22} color="#c8a96e" />,
      title: "ステップ9 — SOS緊急連絡",
      content: [
        "**SOS**ボタン（赤色）はすべてのページの右下に常に表示されます。",
        "SOSをタップすると現地の緊急電話番号一覧が開きます。",
        "利用可能なグループ：**捜索救助隊**、**警察**、**救急115**、**消防署**、**観光ホットライン**。",
        "番号を直接タップするとコピー不要で**即座に電話**できます。",
      ],
      tip: "SOSはインターネット不要 — 通話には携帯電話の電波だけあれば十分です。",
    },
    {
      icon: <MessageSquarePlus size={22} color="#c8a96e" />,
      title: "ステップ10 — フィードバック・バグ報告",
      content: [
        "プロフィールタブの**フィードバック**ボタンをタップしてフォームを開きます。",
        "種類を選択：**バグ**、**改善提案**、**コンテンツの誤り/欠如**、**その他**。",
        "詳細説明を入力（最大1000文字）→ 送信をタップ。",
        "フィードバックは即座に記録され、チームができるだけ早く確認します。",
      ],
    },
  ],
};

function renderContent(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="text-[#2c2416] font-semibold">{part}</strong>
      : <span key={i}>{part}</span>
  );
}

export default function GuidePage() {
  const { lang } = useLanguage();
  const validLang = (["vi", "en", "zh", "ko", "ja"].includes(lang) ? lang : "vi") as LangCode;
  const steps = STEPS[validLang];

  return (
    <div className="min-h-screen bg-[#fdfaf4]">
      {/* Header */}
      <div className="bg-[#2c2416] px-6 pt-12 pb-8">
        <p className="text-[10px] tracking-[3px] text-[#c8a96e] uppercase mb-2">VozTrip</p>
        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={28} color="#c8a96e" />
          <h1 className="text-2xl text-white font-light tracking-wide">{tr("guide_title", lang)}</h1>
        </div>
        <p className="text-sm text-[#b09878]">{tr("guide_updated", lang)}</p>
      </div>

      {/* Badge */}
      <div className="px-5 py-4 bg-[#fdf6e8] border-b border-[#e8dfc8]">
        <div className="flex items-center gap-2 text-[11px] text-[#16a34a] font-medium">
          <Zap size={13} color="#16a34a" />
          <span>{tr("guide_badge", lang)}</span>
        </div>
      </div>

      {/* Steps */}
      <div className="px-5 py-6 flex flex-col gap-7">
        {steps.map((step, idx) => (
          <div key={idx}>
            {/* Step header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#fdf0d8] border border-[#e8dfc8] flex items-center justify-center shrink-0">
                {step.icon}
              </div>
              <h2 className="text-[15px] font-semibold text-[#2c2416] leading-snug">{step.title}</h2>
            </div>

            {/* Bullet points */}
            <div className="flex flex-col gap-2 ml-1">
              {step.content.map((item, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className="text-[#c8a96e] mt-1 shrink-0 text-xs">•</span>
                  <p className="text-sm text-[#5a4a35] leading-relaxed">{renderContent(item)}</p>
                </div>
              ))}
            </div>

            {/* Tip box */}
            {step.tip && (
              <div className="mt-3 ml-1 bg-[#fdf6e8] border border-[#e8dfc8] rounded-xl px-3.5 py-2.5 flex gap-2">
                <span className="text-[11px] font-semibold text-[#c8a96e] shrink-0 mt-0.5">{tr("guide_tip", lang)}</span>
                <p className="text-[12px] text-[#8c7a5e] leading-relaxed">{step.tip}</p>
              </div>
            )}

            {/* Note box */}
            {step.note && (
              <div className="mt-3 ml-1 bg-white border border-[#ddd0b8] rounded-xl px-3.5 py-2.5 flex gap-2">
                <span className="text-[11px] font-semibold text-[#8c7a5e] shrink-0 mt-0.5">{tr("guide_note", lang)}</span>
                <p className="text-[12px] text-[#8c7a5e] leading-relaxed">{step.note}</p>
              </div>
            )}

            {/* Divider (not after last) */}
            {idx < steps.length - 1 && (
              <div className="mt-6 border-b border-[#e8dfc8]" />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 pb-10 pt-2 border-t border-[#e8dfc8] flex flex-col items-center gap-3 text-center">
        <p className="text-xs text-[#b09878]">© 2026 VozTrip. All rights reserved.</p>
        <Link href="/home" className="text-sm text-[#c8a96e] underline underline-offset-2">
          {tr("guide_back", lang)}
        </Link>
      </div>
    </div>
  );
}
