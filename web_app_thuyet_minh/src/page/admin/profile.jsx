export default function ProfilePage() {
  // mock data — sau này bạn thay bằng API
  const user = {
    name: "Nguyen Van A",
    role: "administrator",
    email: "admin@email.com",
    phone: "0909 123 456",
    joined: "2025-10-12",
    shop: {
      name: "TourGuide Shop",
      address: "Hanoi",
      status: "active",
    },
  };

  const avatarText = user.name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isSeller = user.role === "seller";

  return (
    <div className="profile-grid">
      {/* Left Card */}
      <div className="card">
        <div className="card-body profile-card">
          <div className="profile-avatar-lg">
            {avatarText}
          </div>

          <h3>{user.name}</h3>
          <p className="profile-role">
            {user.role.toUpperCase()}
          </p>
          <p className="profile-email">{user.email}</p>
        </div>
      </div>

      {/* User Info */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">User Information</h3>
        </div>

        <div className="card-body info-list">
          <div className="info-row">
            <span>Full Name</span>
            <strong>{user.name}</strong>
          </div>

          <div className="info-row">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>

          <div className="info-row">
            <span>Phone</span>
            <strong>{user.phone}</strong>
          </div>

          <div className="info-row">
            <span>Role</span>
            <strong>{user.role}</strong>
          </div>

          <div className="info-row">
            <span>Joined</span>
            <strong>{user.joined}</strong>
          </div>
        </div>
      </div>

      {/* Shop Info — chỉ hiện nếu seller */}
      {isSeller && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Shop Information
            </h3>
          </div>

          <div className="card-body info-list">
            <div className="info-row">
              <span>Shop Name</span>
              <strong>{user.shop.name}</strong>
            </div>

            <div className="info-row">
              <span>Address</span>
              <strong>{user.shop.address}</strong>
            </div>

            <div className="info-row">
              <span>Status</span>
              <strong>{user.shop.status}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}