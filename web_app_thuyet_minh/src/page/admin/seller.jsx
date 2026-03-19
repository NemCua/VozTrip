
export default function SellerPage() {
  const handleSearch = (e) => {
    console.log("search:", e.target.value);
  };

  const handleVerifiedFilter = (e) => {
    console.log("verified:", e.target.value);
  };

  return (
    <>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Sellers</div>
          <div className="stat-value">42</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Verified Sellers</div>
          <div className="stat-value">28</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Pending Verification</div>
          <div className="stat-value">14</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total POIs</div>
          <div className="stat-value">210</div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Sellers</h3>
        </div>

        <div className="card-body">
          {/* Actions */}
          <div className="table-actions">
            <div className="table-search">
              <input
                type="text"
                className="search-input"
                placeholder="Search by shop name or owner..."
                onChange={handleSearch}
              />
            </div>

            <div className="table-filters">
              <select
                className="form-select"
                onChange={handleVerifiedFilter}
              >
                <option value="">All Status</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Shop Name</th>
                  <th>Owner</th>
                  <th>Address</th>
                  <th>POIs</th>
                  <th>Verification</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {/* mock rows */}
                <tr>
                  <td>1</td>
                  <td>Hanoi Tours</td>
                  <td>Tran Minh</td>
                  <td>Hanoi</td>
                  <td>12</td>
                  <td>
                    <span className="status-badge active">
                      verified
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm">
                      View
                    </button>
                  </td>
                </tr>

                <tr>
                  <td>2</td>
                  <td>Danang Travel</td>
                  <td>Le Hoa</td>
                  <td>Da Nang</td>
                  <td>5</td>
                  <td>
                    <span className="status-badge pending">
                      unverified
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm">
                      View
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h3 className="modal-title">Seller Details</h3>
            <button className="modal-close">×</button>
          </div>

          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Shop Name</label>
              <p className="text-large">-</p>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <p>-</p>
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <p>-</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Owner</label>
                <p>-</p>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Contact Email
                </label>
                <p>-</p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Contact Phone
                </label>
                <p>-</p>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Verification Status
                </label>
                <span className="status-badge">-</span>
              </div>
            </div>

            <div className="form-group mt-lg">
              <label className="form-label">
                Points of Interest (POIs)
              </label>
              <div>-</div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-success">
              Verify Seller
            </button>
            <button className="btn btn-danger">
              Unverify Seller
            </button>
            <button className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}