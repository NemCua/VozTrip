
import { useEffect, useState } from "react"
const API = import.meta.env.VITE_API_URL;

export default function UsersPage() {
  const closeModal = () => {};
  const toggleUserStatus = () => {};
  async function getThisUser() {
    let res = await fetch(`${API}/api/web/get/all/user`);
    let data = await res.json();
    console.log(data);
   
  }

  useEffect(() => {
    getThisUser();
  }, []);
  return (
    <>
      <div className="dashboard-container">

        {/* Sidebar */}
        

        {/* Main */}
        

          {/* Header */}
          

          {/* Content */}
          <main className="content">

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Users</div>
                <div className="stat-value" id="statTotal">0</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Active Users</div>
                <div className="stat-value" id="statActive">0</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Sellers</div>
                <div className="stat-value" id="statSellers">0</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Tourists</div>
                <div className="stat-value" id="statTourists">0</div>
              </div>
            </div>

            {/* Table Card */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">All Users</h3>
              </div>

              <div className="card-body">

                {/* Search + Filters */}
                <div className="table-actions">
                  <div className="table-search">
                    <input
                      type="text"
                      id="searchInput"
                      className="search-input"
                      placeholder="Search by name, email, or phone..."
                    />
                  </div>

                  <div className="table-filters">
                    <select id="roleFilter" className="form-select">
                      <option value="">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="seller">Seller</option>
                      <option value="tourist">Tourist</option>
                    </select>

                    <select id="statusFilter" className="form-select">
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
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
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody id="usersTableBody">
                      {/* JS render rows here */}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="pagination" id="pagination" />

              </div>
            </div>

          </main>
        
      </div>

      {/* Modal */}
      <div className="modal-overlay" id="userDetailModal">
        <div className="modal">
          <div className="modal-header">
            <h3 className="modal-title">User Details</h3>
            <button
              className="modal-close"
              onClick={() => closeModal()}
            >
              &times;
            </button>
          </div>

          <div className="modal-body">

            <div className="form-group">
              <label className="form-label">Name</label>
              <p id="detailName" className="text-large">-</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <p id="detailEmail">-</p>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <p id="detailPhone">-</p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Role</label>
                <p><span id="detailRole" className="status-badge">-</span></p>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <p><span id="detailStatus" className="status-badge">-</span></p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Joined Date</label>
              <p id="detailCreated">-</p>
            </div>

          </div>

          <div className="modal-footer">
            <button
              className="btn btn-success"
              id="btnActivate"
              onClick={() => toggleUserStatus()}
            >
              Activate
            </button>

            <button
              className="btn btn-danger"
              id="btnDeactivate"
              onClick={() => toggleUserStatus()}
            >
              Deactivate
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => closeModal()}
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
