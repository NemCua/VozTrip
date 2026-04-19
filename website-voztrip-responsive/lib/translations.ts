export type LangCode = "vi" | "en" | "zh" | "ko" | "ja";

const t: Record<string, Record<LangCode, string>> = {
  tab_explore:   { vi: "Khám phá", en: "Explore",  zh: "探索",   ko: "탐색",   ja: "探索" },
  tab_nearby:    { vi: "Gần đây",  en: "Nearby",   zh: "附近",   ko: "근처",   ja: "近く" },
  tab_map:       { vi: "Bản đồ",   en: "Map",      zh: "地图",   ko: "지도",   ja: "地図" },
  tab_scan:      { vi: "Quét QR",  en: "Scan",     zh: "扫码",   ko: "QR스캔", ja: "QR" },
  tab_settings:  { vi: "Cài đặt",  en: "Settings", zh: "设置",   ko: "설정",   ja: "設定" },

  home_sub:            { vi: "Tourism Guide",            en: "Tourism Guide",          zh: "旅游指南",    ko: "관광 가이드",      ja: "観光ガイド" },
  home_hero_label:     { vi: "ĐANG Ở GẦN BẠN",          en: "NEAR YOU",               zh: "在您附近",    ko: "근처에 있음",       ja: "近くにあります" },
  home_hero_title:     { vi: "Khám phá xung quanh",      en: "Explore around",         zh: "探索周围",    ko: "주변 탐색",        ja: "周辺を探索" },
  home_places:         { vi: "địa điểm",                 en: "places",                 zh: "个地点",      ko: "장소",             ja: "か所" },
  home_list_title:     { vi: "Địa điểm gần bạn",         en: "Places near you",        zh: "附近的地点",  ko: "근처 장소",        ja: "近くの場所" },
  common_gps_chip:     { vi: "GPS tự động",              en: "GPS auto",               zh: "GPS自动",     ko: "GPS 자동",         ja: "GPS自動" },
  home_search:       { vi: "Tìm điểm tham quan...", en: "Search attractions...", zh: "搜索景点...", ko: "명소 검색...",    ja: "観光地を検索..." },
  home_filter_all:   { vi: "Tất cả",                en: "All",                   zh: "全部",        ko: "전체",           ja: "すべて" },
  home_filter_near:  { vi: "Gần đây",               en: "Nearby",                zh: "附近",        ko: "근처",           ja: "近く" },
  home_filter_popular: { vi: "Nổi bật",             en: "Popular",               zh: "热门",        ko: "인기",           ja: "人気" },
  home_loading:      { vi: "Đang tải địa điểm...",  en: "Loading places...",     zh: "正在加载...", ko: "불러오는 중...", ja: "読み込み中..." },
  home_empty:        { vi: "Không tìm thấy địa điểm", en: "No places found",    zh: "未找到地点",  ko: "장소 없음",      ja: "場所が見つかりません" },

  banner_near:   { vi: "Bạn đang ở gần", en: "You are near", zh: "您在附近",   ko: "근처에 있습니다", ja: "近くにいます" },
  banner_view:   { vi: "Xem",            en: "View",         zh: "查看",        ko: "보기",           ja: "見る" },

  nearby_sub:      { vi: "Xung quanh bạn",   en: "Around you",   zh: "在您周围",  ko: "주변",           ja: "周辺" },
  nearby_locating: { vi: "Đang định vị",      en: "Locating",     zh: "定位中",    ko: "위치 확인 중",   ja: "位置確認中" },
  nearby_hint:     { vi: "sắp xếp theo khoảng cách", en: "sorted by distance", zh: "按距离排序", ko: "거리순 정렬", ja: "距離順" },
  nearby_from_you: { vi: "từ bạn",            en: "from you",     zh: "距您",      ko: "거리",           ja: "から" },
  nearby_no_perm:  { vi: "Không có quyền vị trí", en: "No location permission", zh: "无位置权限", ko: "위치 권한 없음", ja: "位置情報なし" },

  map_listen:    { vi: "Nghe thuyết minh", en: "Listen",  zh: "收听",   ko: "듣기",       ja: "聞く" },
  map_detail:    { vi: "Chi tiết",         en: "Details", zh: "详情",   ko: "상세",       ja: "詳細" },
  map_pause:     { vi: "Dừng",             en: "Pause",   zh: "暂停",   ko: "일시정지",   ja: "一時停止" },
  map_from_you:  { vi: "từ bạn",           en: "from you", zh: "距您",  ko: "거리",       ja: "から" },

  detail_loading:    { vi: "Đang tải...",        en: "Loading...",     zh: "加载中...",   ko: "불러오는 중...", ja: "読み込み中..." },
  detail_not_found:  { vi: "Không tìm thấy POI", en: "POI not found", zh: "未找到",      ko: "찾을 수 없음",  ja: "見つかりません" },
  detail_listen:     { vi: "Nghe thuyết minh",   en: "Listen",         zh: "收听",        ko: "듣기",          ja: "聞く" },
  detail_pause:      { vi: "Dừng",                en: "Pause",          zh: "暂停",        ko: "일시정지",      ja: "一時停止" },
  detail_qa:         { vi: "Hỏi & Đáp",           en: "Q&A",            zh: "问答",        ko: "질문 & 답변",   ja: "Q&A" },
  detail_no_qa:      { vi: "Chưa có câu hỏi nào", en: "No questions yet", zh: "暂无问题", ko: "질문 없음",     ja: "質問なし" },
  detail_back:       { vi: "Quay lại",             en: "Back",           zh: "返回",        ko: "뒤로",          ja: "戻る" },
  detail_intro:      { vi: "Giới thiệu",           en: "About",          zh: "简介",        ko: "소개",          ja: "紹介" },
  detail_no_content: { vi: "Chưa có nội dung bằng ngôn ngữ này.", en: "No content in this language yet.", zh: "暂无此语言内容。", ko: "이 언어의 콘텐츠가 없습니다.", ja: "この言語のコンテンツはまだありません。" },
  detail_playing:    { vi: "Đang phát",            en: "Playing",        zh: "播放中",      ko: "재생 중",        ja: "再生中" },
  detail_listen_ans: { vi: "Nghe câu trả lời",    en: "Listen",         zh: "收听",        ko: "듣기",           ja: "聞く" },
  detail_tts:        { vi: "Đọc (TTS)",            en: "Read (TTS)",     zh: "朗读",        ko: "읽기(TTS)",      ja: "読む(TTS)" },

  profile_guest:        { vi: "Khách tham quan",          en: "Tourist",               zh: "游客",       ko: "관광객",           ja: "観光客" },
  profile_no_login:     { vi: "Không cần đăng nhập",      en: "No login needed",       zh: "无需登录",   ko: "로그인 불필요",     ja: "ログイン不要" },
  profile_lang_title:   { vi: "Ngôn ngữ thuyết minh",     en: "Guide language",        zh: "导览语言",   ko: "안내 언어",         ja: "ガイド言語" },
  profile_current_lang: { vi: "Ngôn ngữ hiện tại",        en: "Current language",      zh: "当前语言",   ko: "현재 언어",         ja: "現在の言語" },
  profile_about:        { vi: "Về ứng dụng",              en: "About",                 zh: "关于",       ko: "앱 정보",           ja: "アプリについて" },
  profile_audio:        { vi: "Thuyết minh tự động",       en: "Auto narration",        zh: "自动解说",   ko: "자동 해설",         ja: "自動解説" },
  profile_audio_sub:    { vi: "GPS phát audio khi đến gần", en: "GPS triggers audio nearby", zh: "GPS触发附近音频", ko: "GPS가 근처 오디오 재생", ja: "GPS近接オーディオ" },
  profile_gps:          { vi: "GPS tự động",               en: "GPS auto-trigger",      zh: "GPS自动",    ko: "GPS 자동",          ja: "GPS自動" },
  profile_gps_sub:      { vi: "Phát hiện POI bán kính 10–50m", en: "Detects POI within 10–50m", zh: "检测10-50m内POI", ko: "10~50m 내 POI 감지", ja: "10~50m内POI検出" },
  profile_legal:        { vi: "Pháp lý",                   en: "Legal",                 zh: "法律",       ko: "법적 정보",         ja: "法的情報" },
  profile_no_gps_note:  { vi: "GPS chỉ dùng khi mở app, không theo dõi nền", en: "GPS only used while app is open", zh: "GPS仅在使用时运行", ko: "앱 사용 중에만 GPS 사용", ja: "アプリ使用中のみGPS使用" },
  profile_privacy:      { vi: "Chính sách bảo mật",        en: "Privacy Policy",        zh: "隐私政策",   ko: "개인정보처리방침",   ja: "プライバシーポリシー" },
  profile_privacy_sub:  { vi: "Xem chi tiết",               en: "View details",          zh: "查看详情",   ko: "자세히 보기",       ja: "詳細を見る" },
  profile_change_lang:  { vi: "Đổi ngôn ngữ thuyết minh",  en: "Change guide language", zh: "更改导览语言", ko: "안내 언어 변경",    ja: "ガイド言語を変更" },
  profile_support:      { vi: "Ngôn ngữ hỗ trợ",           en: "Supported languages",   zh: "支持语言",   ko: "지원 언어",         ja: "対応言語" },

  scan_title:    { vi: "Quét mã QR",     en: "Scan QR Code",   zh: "扫描二维码",  ko: "QR 코드 스캔", ja: "QRコードスキャン" },
  scan_hint:     { vi: "Hướng camera vào mã QR", en: "Point camera at QR code", zh: "将相机对准二维码", ko: "카메라를 QR 코드에 대세요", ja: "QRコードにカメラを向けてください" },

  payment_title: { vi: "Thanh toán",    en: "Payment",   zh: "付款",   ko: "결제",   ja: "支払い" },

  common_no_image: { vi: "Không có ảnh", en: "No image", zh: "无图片", ko: "이미지 없음", ja: "画像なし" },
};

export function tr(key: string, lang: string = "vi"): string {
  const validLang = (["vi", "en", "zh", "ko", "ja"].includes(lang) ? lang : "vi") as LangCode;
  return t[key]?.[validLang] ?? t[key]?.["en"] ?? key;
}
