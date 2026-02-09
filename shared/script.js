// ============================================
// TOUR GUIDE DASHBOARD - SHARED JAVASCRIPT
// Mock data, utilities, and common functions
// ============================================

// ========== MOCK DATA ==========

const MOCK_DATA = {
  // Users
  users: [
    { id: 1, name: 'Nguyen Van A', phone: '+84901234567', email: 'admin@tourguide.vn', role: 'admin', status: 'active', created_at: '2024-01-15' },
    { id: 2, name: 'Tran Thi B', phone: '+84907654321', email: 'seller1@tourguide.vn', role: 'seller', status: 'active', created_at: '2024-02-20' },
    { id: 3, name: 'Le Van C', phone: '+84909876543', email: 'seller2@tourguide.vn', role: 'seller', status: 'active', created_at: '2024-03-10' },
    { id: 4, name: 'Pham Thi D', phone: '+84912345678', email: 'tourist1@tourguide.vn', role: 'tourist', status: 'active', created_at: '2024-03-25' },
    { id: 5, name: 'Hoang Van E', phone: '+84918765432', email: 'tourist2@tourguide.vn', role: 'tourist', status: 'active', created_at: '2024-04-01' },
    { id: 6, name: 'Vo Thi F', phone: '+84923456789', email: 'seller3@tourguide.vn', role: 'seller', status: 'inactive', created_at: '2024-04-15' },
    { id: 7, name: 'Do Van G', phone: '+84934567890', email: 'tourist3@tourguide.vn', role: 'tourist', status: 'active', created_at: '2024-05-01' },
    { id: 8, name: 'Bui Thi H', phone: '+84945678901', email: 'seller4@tourguide.vn', role: 'seller', status: 'active', created_at: '2024-05-20' },
  ],
  
  // Sellers and their shops
  sellers: [
    { id: 1, user_id: 2, shop_name: 'Saigon Heritage Tours', description: 'Traditional Vietnamese cultural experiences in Ho Chi Minh City', address: '123 Nguyen Hue, District 1, HCMC', verified: true },
    { id: 2, user_id: 3, shop_name: 'Mekong Delta Adventures', description: 'River tours and countryside exploration', address: '456 Le Loi, District 1, HCMC', verified: true },
    { id: 3, user_id: 6, shop_name: 'Hanoi Old Quarter Tours', description: 'Walking tours through historic Hanoi', address: '789 Hang Bac, Hoan Kiem, Hanoi', verified: false },
    { id: 4, user_id: 8, shop_name: 'Central Highlands Explorer', description: 'Coffee plantations and ethnic villages', address: '321 Tran Phu, Da Lat', verified: true },
  ],
  
  // Points of Interest (POI)
  pois: [
    { id: 1, seller_id: 1, name: 'Ben Thanh Market', description: 'Historic central market featuring local food, crafts, and souvenirs', latitude: 10.7726, longitude: 106.6980, trigger_radius_meters: 50, status: 'active' },
    { id: 2, seller_id: 1, name: 'Notre-Dame Cathedral Basilica', description: 'French colonial cathedral in the heart of Saigon', latitude: 10.7797, longitude: 106.6990, trigger_radius_meters: 30, status: 'active' },
    { id: 3, seller_id: 1, name: 'War Remnants Museum', description: 'Museum documenting the Vietnam War', latitude: 10.7790, longitude: 106.6918, trigger_radius_meters: 40, status: 'active' },
    { id: 4, seller_id: 2, name: 'Cai Rang Floating Market', description: 'Traditional floating market on the Mekong Delta', latitude: 10.0487, longitude: 105.7672, trigger_radius_meters: 100, status: 'active' },
    { id: 5, seller_id: 2, name: 'Vinh Trang Pagoda', description: 'Ancient Buddhist temple with unique architecture', latitude: 10.2500, longitude: 106.0833, trigger_radius_meters: 50, status: 'active' },
    { id: 6, seller_id: 3, name: 'Hoan Kiem Lake', description: 'Scenic lake in central Hanoi with historic significance', latitude: 21.0285, longitude: 105.8542, trigger_radius_meters: 80, status: 'pending' },
    { id: 7, seller_id: 4, name: 'Dalat Flower Gardens', description: 'Beautiful botanical gardens featuring local flowers', latitude: 11.9404, longitude: 108.4583, trigger_radius_meters: 60, status: 'active' },
    { id: 8, seller_id: 1, name: 'Saigon Central Post Office', description: 'Historic post office designed by Gustave Eiffel', latitude: 10.7799, longitude: 106.6999, trigger_radius_meters: 30, status: 'draft' },
  ],
  
  // Narrations
  narrations: [
    { id: 1, poi_id: 1, text: 'Chào mừng đến với Chợ Bến Thành, biểu tượng của Sài Gòn. Chợ này được xây dựng năm 1912 và là trung tâm thương mại sầm uất nhất thành phố.', language: 'vi', audio_id: 1, status: 'approved' },
    { id: 2, poi_id: 1, text: 'Welcome to Ben Thanh Market, an iconic symbol of Saigon. Built in 1912, this bustling marketplace is the commercial heart of the city.', language: 'en', audio_id: 2, status: 'approved' },
    { id: 3, poi_id: 2, text: 'Nhà thờ Đức Bà Sài Gòn được xây dựng từ năm 1863 đến 1880, là một kiệt tác kiến trúc Gothic Pháp.', language: 'vi', audio_id: 3, status: 'approved' },
    { id: 4, poi_id: 2, text: 'The Notre-Dame Cathedral was built between 1863 and 1880, a masterpiece of French Gothic architecture.', language: 'en', audio_id: 4, status: 'approved' },
    { id: 5, poi_id: 3, text: 'Bảo tàng Chứng tích Chiến tranh trưng bày hơn 20,000 tài liệu và hiện vật liên quan đến chiến tranh Việt Nam.', language: 'vi', audio_id: 5, status: 'pending' },
    { id: 6, poi_id: 4, text: 'Chợ nổi Cái Răng là chợ nổi lớn nhất miền Tây, nơi người dân bán trái cây và nông sản từ thuyền.', language: 'vi', audio_id: 6, status: 'approved' },
    { id: 7, poi_id: 5, text: 'Chùa Vĩnh Tràng được xây dựng vào đầu thế kỷ 19, kết hợp kiến trúc Á-Âu độc đáo.', language: 'vi', audio_id: 7, status: 'approved' },
    { id: 8, poi_id: 7, text: 'Dalat is known as the city of eternal spring, with flower gardens showcasing thousands of varieties.', language: 'en', audio_id: 8, status: 'draft' },
  ],
  
  // Audio files
  audios: [
    { id: 1, audio_url: '/audio/benthanh-vi.mp3', duration: 45, source_type: 'upload' },
    { id: 2, audio_url: '/audio/benthanh-en.mp3', duration: 42, source_type: 'tts' },
    { id: 3, audio_url: '/audio/notredame-vi.mp3', duration: 38, source_type: 'upload' },
    { id: 4, audio_url: '/audio/notredame-en.mp3', duration: 35, source_type: 'tts' },
    { id: 5, audio_url: '/audio/warmuseum-vi.mp3', duration: 52, source_type: 'upload' },
    { id: 6, audio_url: '/audio/cairang-vi.mp3', duration: 48, source_type: 'upload' },
    { id: 7, audio_url: '/audio/vinhtrang-vi.mp3', duration: 41, source_type: 'tts' },
    { id: 8, audio_url: '/audio/dalat-en.mp3', duration: 36, source_type: 'upload' },
  ],
  
  // Media (images/videos)
  media: [
    { id: 1, poi_id: 1, type: 'image', url: 'https://via.placeholder.com/400x300/D97B4B/FFFFFF?text=Ben+Thanh+Market' },
    { id: 2, poi_id: 1, type: 'image', url: 'https://via.placeholder.com/400x300/2B4560/FFFFFF?text=Market+Interior' },
    { id: 3, poi_id: 2, type: 'image', url: 'https://via.placeholder.com/400x300/4A9B7F/FFFFFF?text=Notre+Dame' },
    { id: 4, poi_id: 3, type: 'image', url: 'https://via.placeholder.com/400x300/E8B547/FFFFFF?text=War+Museum' },
    { id: 5, poi_id: 4, type: 'video', url: '/video/floating-market.mp4' },
    { id: 6, poi_id: 5, type: 'image', url: 'https://via.placeholder.com/400x300/5B8DB8/FFFFFF?text=Vinh+Trang' },
    { id: 7, poi_id: 7, type: 'image', url: 'https://via.placeholder.com/400x300/D15959/FFFFFF?text=Dalat+Flowers' },
  ],
  
  // Questions
  questions: [
    { id: 1, poi_id: 1, question_text: 'What year was Ben Thanh Market built?', sort_order: 1, status: 'active' },
    { id: 2, poi_id: 1, question_text: 'What can you buy at Ben Thanh Market?', sort_order: 2, status: 'active' },
    { id: 3, poi_id: 2, question_text: 'Who designed the Notre-Dame Cathedral?', sort_order: 1, status: 'active' },
    { id: 4, poi_id: 3, question_text: 'How many artifacts are in the War Remnants Museum?', sort_order: 1, status: 'active' },
    { id: 5, poi_id: 4, question_text: 'What is sold at the floating market?', sort_order: 1, status: 'active' },
  ],
  
  // Answers
  answers: [
    { id: 1, question_id: 1, answer_text: 'Ben Thanh Market was built in 1912.', language: 'en', audio_id: null },
    { id: 2, question_id: 1, answer_text: 'Chợ Bến Thành được xây dựng năm 1912.', language: 'vi', audio_id: null },
    { id: 3, question_id: 2, answer_text: 'You can buy local food, handicrafts, souvenirs, textiles, and fresh produce.', language: 'en', audio_id: null },
    { id: 4, question_id: 2, answer_text: 'Bạn có thể mua thực phẩm địa phương, đồ thủ công, quà lưu niệm, hàng dệt may và nông sản tươi.', language: 'vi', audio_id: null },
    { id: 5, question_id: 3, answer_text: 'The cathedral was designed by French architect Jules Bourard.', language: 'en', audio_id: null },
    { id: 6, question_id: 4, answer_text: 'The museum displays over 20,000 documents and artifacts.', language: 'en', audio_id: null },
    { id: 7, question_id: 5, answer_text: 'Fresh fruits, vegetables, and agricultural products from local farms.', language: 'en', audio_id: null },
  ],
};

// ========== CURRENT USER SESSION ==========
// This simulates logged-in user (can be changed to test different roles)
let currentUser = MOCK_DATA.users[0]; // Default: Admin user

// ========== UTILITY FUNCTIONS ==========

// Format date to readable string
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Format duration in seconds to minutes:seconds
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Get user by ID
function getUserById(id) {
  return MOCK_DATA.users.find(u => u.id === id);
}

// Get seller by user ID
function getSellerByUserId(userId) {
  return MOCK_DATA.sellers.find(s => s.user_id === userId);
}

// Get POIs by seller ID
function getPOIsBySeller(sellerId) {
  return MOCK_DATA.pois.filter(p => p.seller_id === sellerId);
}

// Get narrations by POI ID
function getNarrationsByPOI(poiId) {
  return MOCK_DATA.narrations.filter(n => n.poi_id === poiId);
}

// Get media by POI ID
function getMediaByPOI(poiId) {
  return MOCK_DATA.media.filter(m => m.poi_id === poiId);
}

// Get questions by POI ID
function getQuestionsByPOI(poiId) {
  return MOCK_DATA.questions.filter(q => q.poi_id === poiId).sort((a, b) => a.sort_order - b.sort_order);
}

// Get answers by question ID
function getAnswersByQuestion(questionId) {
  return MOCK_DATA.answers.filter(a => a.question_id === questionId);
}

// Get audio by ID
function getAudioById(id) {
  return MOCK_DATA.audios.find(a => a.id === id);
}

// Get POI by ID
function getPOIById(id) {
  return MOCK_DATA.pois.find(p => p.id === id);
}

// Get seller by ID
function getSellerById(id) {
  return MOCK_DATA.sellers.find(s => s.id === id);
}

// ========== MODAL FUNCTIONS ==========

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('modal-overlay')) {
    event.target.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
});

// ========== TABLE UTILITIES ==========

// Simple client-side pagination
class TablePagination {
  constructor(data, itemsPerPage = 10) {
    this.data = data;
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
  }
  
  get totalPages() {
    return Math.ceil(this.data.length / this.itemsPerPage);
  }
  
  getCurrentPageData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.data.slice(start, end);
  }
  
  goToPage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      return true;
    }
    return false;
  }
  
  nextPage() {
    return this.goToPage(this.currentPage + 1);
  }
  
  previousPage() {
    return this.goToPage(this.currentPage - 1);
  }
}

// Search/filter function
function filterData(data, searchTerm, filterFields) {
  if (!searchTerm) return data;
  
  searchTerm = searchTerm.toLowerCase();
  return data.filter(item => {
    return filterFields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(searchTerm);
    });
  });
}

// ========== FORM VALIDATION ==========

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
  return re.test(phone);
}

function validateRequired(value) {
  return value && value.trim().length > 0;
}

function showError(inputElement, message) {
  const formGroup = inputElement.closest('.form-group');
  let errorElement = formGroup.querySelector('.form-error');
  
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'form-error text-small';
    errorElement.style.color = 'var(--color-danger)';
    errorElement.style.marginTop = 'var(--spacing-xs)';
    formGroup.appendChild(errorElement);
  }
  
  errorElement.textContent = message;
  inputElement.style.borderColor = 'var(--color-danger)';
}

function clearError(inputElement) {
  const formGroup = inputElement.closest('.form-group');
  const errorElement = formGroup.querySelector('.form-error');
  
  if (errorElement) {
    errorElement.remove();
  }
  
  inputElement.style.borderColor = '';
}

// ========== NOTIFICATION SYSTEM ==========

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background-color: ${type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'};
    color: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 2000;
    animation: slideIn 0.3s ease;
    max-width: 400px;
    font-weight: 500;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ========== STATISTICS CALCULATIONS ==========

function getStatistics() {
  return {
    totalUsers: MOCK_DATA.users.length,
    totalSellers: MOCK_DATA.sellers.length,
    totalPOIs: MOCK_DATA.pois.length,
    totalNarrations: MOCK_DATA.narrations.length,
    activeUsers: MOCK_DATA.users.filter(u => u.status === 'active').length,
    verifiedSellers: MOCK_DATA.sellers.filter(s => s.verified).length,
    activePOIs: MOCK_DATA.pois.filter(p => p.status === 'active').length,
    approvedNarrations: MOCK_DATA.narrations.filter(n => n.status === 'approved').length,
    pendingNarrations: MOCK_DATA.narrations.filter(n => n.status === 'pending').length,
  };
}

// ========== LOCAL STORAGE HELPERS ==========

function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// ========== EXPORT FOR USE IN OTHER FILES ==========
// These are available globally when this script is loaded