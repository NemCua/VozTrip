

export default function DashboardPage() {
  return (
    <>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">120</div>
          <div className="stat-change positive">+12% this month</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Sellers</div>
          <div className="stat-value">34</div>
          <div className="stat-change positive">+8% this month</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total POIs</div>
          <div className="stat-value">256</div>
          <div className="stat-change positive">+15% this month</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Narrations</div>
          <div className="stat-value">410</div>
          <div className="stat-change">+5% this month</div>
        </div>
      </div>

      {/* Platform Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Platform Activity</h3>
        </div>

        <div className="card-body">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Active Users</div>
              <div className="stat-value">87</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Verified Sellers</div>
              <div className="stat-value">22</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Active POIs</div>
              <div className="stat-value">190</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Pending Approvals</div>
              <div className="stat-value">13</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Recent User Registrations
          </h3>
          <a href="/users" className="btn btn-secondary btn-sm">
            View All
          </a>
        </div>

        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Tran Minh</td>
                  <td>minh@email.com</td>
                  <td>User</td>
                  <td>
                    <span className="status-badge active">
                      active
                    </span>
                  </td>
                  <td>2026-02-01</td>
                </tr>

                <tr>
                  <td>Le Hoa</td>
                  <td>hoa@email.com</td>
                  <td>Seller</td>
                  <td>
                    <span className="status-badge pending">
                      pending
                    </span>
                  </td>
                  <td>2026-02-03</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent POIs */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Recent Points of Interest
          </h3>
          <a href="/pois" className="btn btn-secondary btn-sm">
            View All
          </a>
        </div>

        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Seller</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Hoan Kiem Lake</td>
                  <td>Hanoi</td>
                  <td>
                    <span className="status-badge active">
                      active
                    </span>
                  </td>
                  <td>Seller A</td>
                </tr>

                <tr>
                  <td>Ba Na Hills</td>
                  <td>Da Nang</td>
                  <td>
                    <span className="status-badge draft">
                      draft
                    </span>
                  </td>
                  <td>Seller B</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}