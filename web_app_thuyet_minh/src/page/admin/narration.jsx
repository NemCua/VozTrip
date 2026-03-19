

export default function NarrationPage() {
  const handleSearch = (e) => {
    console.log("search:", e.target.value);
  };

  const handleLanguageFilter = (e) => {
    console.log("language:", e.target.value);
  };

  const handleStatusFilter = (e) => {
    console.log("status:", e.target.value);
  };

  return (
    <>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Narrations</div>
          <div className="stat-value">0</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Approved</div>
          <div className="stat-value">0</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Pending Review</div>
          <div className="stat-value">0</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Draft</div>
          <div className="stat-value">0</div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Narrations</h3>
        </div>

        <div className="card-body">
          {/* Actions */}
          <div className="table-actions">
            <div className="table-search">
              <input
                type="text"
                className="search-input"
                placeholder="Search narration text..."
                onChange={handleSearch}
              />
            </div>

            <div className="table-filters">
              <select
                className="form-select"
                onChange={handleLanguageFilter}
              >
                <option value="">All Languages</option>
                <option value="vi">Vietnamese</option>
                <option value="en">English</option>
              </select>

              <select
                className="form-select"
                onChange={handleStatusFilter}
              >
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>POI</th>
                  <th>Language</th>
                  <th>Text Preview</th>
                  <th>Audio</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {/* mock row */}
                <tr>
                  <td>1</td>
                  <td>Hoan Kiem Lake</td>
                  <td>vi</td>
                  <td>Hồ Hoàn Kiếm là một trong những...</td>
                  <td>🎵 Available</td>
                  <td>
                    <span className="status-badge approved">
                      approved
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm">
                      Review
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
            <h3 className="modal-title">Narration Review</h3>
            <button className="modal-close">×</button>
          </div>

          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Point of Interest</label>
              <p className="text-large">-</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Language</label>
                <span className="status-badge">-</span>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <span className="status-badge">-</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Narration Text</label>
              <div className="detail-box">
                <p>-</p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Audio Information</label>
              <div className="text-muted">-</div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-success">✓ Approve</button>
            <button className="btn btn-danger">✗ Reject</button>
            <button className="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </>
  );
}