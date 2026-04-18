export type LangCode = "vi" | "en" | "zh" | "ko" | "ja";

const t = {
  // Tab bar
  tab_explore:  { vi: "Khám phá", en: "Explore",  zh: "探索",   ko: "탐색",   ja: "探索" },
  tab_nearby:   { vi: "Gần đây",  en: "Nearby",   zh: "附近",   ko: "근처",   ja: "近く" },
  tab_map:      { vi: "Bản đồ",   en: "Map",      zh: "地图",   ko: "지도",   ja: "地図" },
  tab_scan:     { vi: "Quét QR",  en: "Scan",     zh: "扫码",   ko: "QR스캔", ja: "QR" },
  tab_settings: { vi: "Cài đặt",  en: "Settings", zh: "设置",   ko: "설정",   ja: "設定" },

  // Home screen
  home_sub:       { vi: "Tourism Guide",      en: "Tourism Guide",       zh: "旅游指南",    ko: "관광 가이드",  ja: "観光ガイド" },
  home_search:    { vi: "Tìm điểm tham quan...", en: "Search attractions...", zh: "搜索景点...", ko: "명소 검색...", ja: "観光地を検索..." },
  home_hero_label: { vi: "ĐANG Ở GẦN BẠN",   en: "NEAR YOU",            zh: "在您附近",    ko: "근처에 있음", ja: "近くにあります" },
  home_hero_title: { vi: "Khám phá\nxung quanh", en: "Explore\naround",  zh: "探索\n周围",  ko: "주변\n탐색",  ja: "周辺を\n探索" },
  home_places:    { vi: "địa điểm",           en: "places",              zh: "个地点",      ko: "장소",       ja: "か所" },
  home_filter_all: { vi: "Tất cả",            en: "All",                 zh: "全部",        ko: "전체",       ja: "すべて" },
  home_filter_near: { vi: "Gần đây",          en: "Nearby",              zh: "附近",        ko: "근처",       ja: "近く" },
  home_filter_popular: { vi: "Nổi bật",       en: "Popular",             zh: "热门",        ko: "인기",       ja: "人気" },
  home_list_title: { vi: "Địa điểm gần bạn",  en: "Places near you",    zh: "附近的地点",   ko: "근처 장소",  ja: "近くの場所" },
  home_loading:   { vi: "Đang tải địa điểm...", en: "Loading places...", zh: "正在加载...",  ko: "불러오는 중...", ja: "読み込み中..." },
  home_empty:     { vi: "Không tìm thấy địa điểm", en: "No places found", zh: "未找到地点", ko: "장소 없음",  ja: "場所が見つかりません" },

  // GPS banner
  banner_near:    { vi: "Bạn đang ở gần",     en: "You are near",       zh: "您在附近",    ko: "근처에 있습니다", ja: "近くにいます" },
  banner_view:    { vi: "Xem",                 en: "View",               zh: "查看",        ko: "보기",       ja: "見る" },

  // Nearby screen
  nearby_sub:     { vi: "Xung quanh bạn",      en: "Around you",         zh: "在您周围",    ko: "주변",       ja: "周辺" },
  nearby_locating: { vi: "Đang định vị",        en: "Locating",          zh: "定位中",      ko: "위치 확인 중", ja: "位置確認中" },
  nearby_hint:    { vi: "sắp xếp theo khoảng cách", en: "sorted by distance", zh: "按距离排序", ko: "거리순 정렬", ja: "距離順" },
  nearby_from_you: { vi: "từ bạn",             en: "from you",           zh: "距您",        ko: "거리",       ja: "から" },
  nearby_locating_dist: { vi: "Đang xác định...", en: "Determining...",  zh: "确定中...",   ko: "확인 중...", ja: "確認中..." },
  nearby_no_perm: { vi: "Không có quyền vị trí — khoảng cách sẽ không hiển thị", en: "No location permission — distance won't show", zh: "无位置权限", ko: "위치 권한 없음", ja: "位置情報なし" },

  // Map screen
  map_listen:     { vi: "Nghe thuyết minh",    en: "Listen",             zh: "收听",        ko: "듣기",       ja: "聞く" },
  map_detail:     { vi: "Chi tiết",             en: "Details",           zh: "详情",        ko: "상세",       ja: "詳細" },
  map_pause:      { vi: "Dừng",                 en: "Pause",             zh: "暂停",        ko: "일시정지",   ja: "一時停止" },
  map_from_you:   { vi: "từ bạn",               en: "from you",         zh: "距您",        ko: "거리",       ja: "から" },

  // POI Detail screen
  detail_loading:  { vi: "Đang tải...",          en: "Loading...",       zh: "加载中...",   ko: "불러오는 중...", ja: "読み込み中..." },
  detail_not_found: { vi: "Không tìm thấy POI", en: "POI not found",   zh: "未找到",      ko: "찾을 수 없음", ja: "見つかりません" },
  detail_listen:   { vi: "Nghe thuyết minh",     en: "Listen",          zh: "收听",        ko: "듣기",       ja: "聞く" },
  detail_pause:    { vi: "Dừng",                  en: "Pause",          zh: "暂停",        ko: "일시정지",   ja: "一時停止" },
  detail_qa:       { vi: "Hỏi & Đáp",             en: "Q&A",            zh: "问答",        ko: "질문 & 답변", ja: "Q&A" },
  detail_no_qa:    { vi: "Chưa có câu hỏi nào",   en: "No questions yet", zh: "暂无问题", ko: "질문 없음",  ja: "質問なし" },
  detail_back:      { vi: "Quay lại",              en: "Back",           zh: "返回",        ko: "뒤로",       ja: "戻る" },
  detail_intro:     { vi: "Giới thiệu",            en: "About",          zh: "简介",        ko: "소개",       ja: "紹介" },
  detail_no_content: { vi: "Chưa có nội dung bằng ngôn ngữ này.\nNội dung sẽ được tự động dịch sớm.", en: "No content in this language yet.\nContent will be auto-translated soon.", zh: "暂无此语言内容，即将自动翻译。", ko: "이 언어의 콘텐츠가 없습니다.\n곧 자동 번역됩니다.", ja: "この言語のコンテンツはまだありません。\nまもなく自動翻訳されます。" },
  detail_playing:   { vi: "Đang phát",             en: "Playing",        zh: "播放中",      ko: "재생 중",    ja: "再生中" },
  detail_listen_ans: { vi: "Nghe câu trả lời",     en: "Listen",         zh: "收听",        ko: "듣기",       ja: "聞く" },
  detail_tts:       { vi: "Đọc (TTS)",             en: "Read (TTS)",     zh: "朗读",        ko: "읽기(TTS)",  ja: "読む(TTS)" },

  // Profile / Settings screen
  profile_guest:   { vi: "Khách tham quan",      en: "Tourist",          zh: "游客",        ko: "관광객",     ja: "観光客" },
  profile_no_login: { vi: "Không cần đăng nhập", en: "No login needed", zh: "无需登录",    ko: "로그인 불필요", ja: "ログイン不要" },
  profile_lang_title: { vi: "Ngôn ngữ thuyết minh", en: "Guide language", zh: "导览语言",  ko: "안내 언어",  ja: "ガイド言語" },
  profile_current_lang: { vi: "Ngôn ngữ hiện tại", en: "Current language", zh: "当前语言", ko: "현재 언어",  ja: "現在の言語" },
  profile_about:   { vi: "Về ứng dụng",           en: "About",           zh: "关于",        ko: "앱 정보",    ja: "このアプリについて" },
  profile_audio:   { vi: "Thuyết minh",            en: "Audio guide",    zh: "语音导览",    ko: "오디오 가이드", ja: "音声ガイド" },
  profile_audio_sub: { vi: "Audio + TTS tự động",  en: "Audio + Auto TTS", zh: "音频+TTS", ko: "오디오+TTS", ja: "音声+TTS" },
  profile_gps:     { vi: "GPS Trigger",             en: "GPS Trigger",   zh: "GPS触发",     ko: "GPS 트리거",  ja: "GPS トリガー" },
  profile_gps_sub: { vi: "Tự động phát khi đến nơi", en: "Auto-play on arrival", zh: "到达时自动播放", ko: "도착시 자동재생", ja: "到着時自動再生" },
  profile_support: { vi: "Hỗ trợ ngôn ngữ",        en: "Languages",     zh: "支持语言",    ko: "지원 언어",  ja: "対応言語" },
  profile_change_lang: { vi: "Đổi ngôn ngữ thuyết minh", en: "Change guide language", zh: "更改导览语言", ko: "언어 변경", ja: "言語を変更" },

  // Privacy
  profile_legal:        { vi: "Pháp lý",                    en: "Legal",                   zh: "法律",          ko: "약관",          ja: "法的情報" },
  profile_privacy:      { vi: "Chính sách bảo mật",         en: "Privacy Policy",          zh: "隐私政策",      ko: "개인정보처리방침", ja: "プライバシーポリシー" },
  profile_privacy_sub:  { vi: "Xem cách chúng tôi bảo vệ dữ liệu của bạn", en: "See how we protect your data", zh: "了解我们如何保护您的数据", ko: "데이터 보호 방법 보기", ja: "データ保護方法を見る" },
  profile_privacy_open: { vi: "Mở trong trình duyệt",       en: "Open in browser",         zh: "在浏览器中打开", ko: "브라우저에서 열기", ja: "ブラウザで開く" },
  profile_no_gps_note:  { vi: "Vị trí chỉ dùng để kích hoạt thuyết minh. Không lưu trữ.", en: "Location only used to trigger audio. Not stored.", zh: "位置仅用于触发导览，不存储。", ko: "위치는 오디오 트리거에만 사용됩니다.", ja: "位置情報は音声トリガーにのみ使用されます。" },

  // Common
  common_no_image: { vi: "Chưa có ảnh",          en: "No image",        zh: "暂无图片",    ko: "이미지 없음", ja: "画像なし" },
  common_gps_chip: { vi: "GPS trigger",           en: "GPS trigger",    zh: "GPS触发",     ko: "GPS 트리거", ja: "GPS トリガー" },
} as const;

export type TranslationKey = keyof typeof t;

export function tr(key: TranslationKey, lang: string): string {
  const entry = t[key];
  if (!entry) return key;
  return (entry as Record<string, string>)[lang] ?? (entry as Record<string, string>)["en"] ?? key;
}
