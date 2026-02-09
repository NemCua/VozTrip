export default function SlideBar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>TourGuide Admin</h2>
        <p>Platform Management</p>
      </div>

      <nav>
        <ul className="sidebar-nav">
          <li><a href="/" className="active">📊 Dashboard</a></li>
          <li><a href="/users">👥 User Management</a></li>
          <li><a href="/sellers">🏪 Seller Management</a></li>
          <li><a href="/pois">📍 POI Management</a></li>
          <li><a href="/narrations">🎙️ Content Moderation</a></li>
        </ul>
      </nav>
    </aside>
  );
}
