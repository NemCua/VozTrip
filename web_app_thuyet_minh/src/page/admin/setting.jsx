export default function SettingPage() {
  return (
    <div className="dashboard-container">

      

      

        <header className="header">
          <h1>Settings</h1>
        </header>

        <main className="content">

          <div className="card">
            <div className="card-header">
              <h3>Account Settings</h3>
            </div>

            <div className="card-body">

              <form className="settings-form">

                <label>Name</label>
                <input className="form-input" defaultValue="Nguyen Van A" />

                <label>Email</label>
                <input className="form-input" defaultValue="admin@tourguide.vn" />

                <label>Phone</label>
                <input className="form-input" defaultValue="+84901234567" />

                <button type="button" className="btn-primary">
                  Save Changes
                </button>

              </form>

            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Change Password</h3>
            </div>

            <div className="card-body settings-form">

              <input
                type="password"
                className="form-input"
                placeholder="Current password"
              />
              <input
                type="password"
                className="form-input"
                placeholder="New password"
              />
              <input
                type="password"
                className="form-input"
                placeholder="Confirm password"
              />

              <button type="button" className="btn-danger">
                Update Password
              </button>

            </div>
          </div>

        </main>
      
    </div>
  );
}