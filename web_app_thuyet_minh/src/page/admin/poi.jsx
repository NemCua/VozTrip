export default function POIPage() {
  const handleSearch = (e) => {
    console.log("search:", e.target.value);
  };

  const handleStatusFilter = (e) => {
    console.log("status:", e.target.value);
  };

  return (
    <>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total POIs</div>
          <div className="stat-value">0</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Active POIs</div>
          <div className="stat-value">0</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Pending Review</div>
          <div className="stat-value">0</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Draft POIs</div>
          <div className="stat-value">0</div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Points of Interest</h3>
        </div>

        <div className="card-body">
          {/* Actions */}
          <div className="table-actions">
            <div className="table-search">
              <input
                type="text"
                className="search-input"
                placeholder="Search POI by name..."
                onChange={handleSearch}
              />
            </div>

            <div className="table-filters">
              <select
                className="form-select"
                onChange={handleStatusFilter}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Seller</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Radius (m)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {/* mock row */}
                <tr>
                  <td>1</td>
                  <td>Hoan Kiem Lake</td>
                  <td>Seller A</td>
                  <td>21.0285</td>
                  <td>105.8542</td>
                  <td>150</td>
                  <td>
                    <span className="status-badge active">
                      active
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm">
                      Edit
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button className="btn btn-sm">Prev</button>
            <button className="btn btn-sm">1</button>
            <button className="btn btn-sm">Next</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h3 className="modal-title">POI Details</h3>
            <button className="modal-close">×</button>
          </div>

          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea"></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input
                  type="number"
                  className="form-input"
                  step="0.0001"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input
                  type="number"
                  className="form-input"
                  step="0.0001"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Trigger Radius (meters)
                </label>
                <input type="number" className="form-input" />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Seller</label>
              <p className="text-muted">-</p>
            </div>

            <div className="form-group mt-lg">
              <label className="form-label">Media Gallery</label>
              <div className="media-grid">
                {/* media items here */}
              </div>
            </div>

            <div className="form-group mt-lg">
              <label className="form-label">Narrations</label>
              <div>-</div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-primary">
              Save Changes
            </button>
            <button className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}