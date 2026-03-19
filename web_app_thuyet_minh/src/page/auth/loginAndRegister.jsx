import { useState } from "react";
const API = import.meta.env.VITE_API_URL;
export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    repassword: "",
  });
  // register
  
  // ===== LOGIN =====
  const handleLoginSubmit =async (e) => {
    e.preventDefault();
    const { email, password } = loginData;

    if (!email || !password) {
      alert("Vui lòng điền đầy đủ thông tin đăng nhập.");
      return;
    }

    let res = await fetch(`${API}/api/web/post/login`,{
      method:"POST",
      headers: {
        "Content-Type": "application/json", // Dòng này cực kỳ quan trọng
      },
      body:JSON.stringify(loginData)
    })
    
    if (res.ok) {
      let data = await res.json();
      console.log(data)
      localStorage.setItem("accessToken", data.token);
      let role = data.role
      window.location.href=`/${role}/setting`
    }else {
      alert("Lỗi: Đăng nhập thất bại");
    }

  };

  // ===== REGISTER =====
  const handleRegisterSubmit = async(e) => {
    e.preventDefault();
    const { name, phone, email, password, repassword } = registerData;

    if (!name || !phone || !email || !password || !repassword) {
      alert("Vui lòng điền đầy đủ thông tin đăng ký.");
      return;
    }

    if (password !== repassword) {
      alert("Mật khẩu xác nhận không khớp.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert("Địa chỉ email không hợp lệ.");
      return;
    }

    const phonePattern = /^\d{10,}$/;
    if (!phonePattern.test(phone.replace(/\D/g, ""))) {
      alert("Số điện thoại không hợp lệ.");
      return;
    }

    alert(`Đăng ký thành công với email: ${email}\nChào mừng ${name}!`);
    let res= await fetch("/api/admin/auth/register",{
      method:"POST",
      headers:{
        "Content-Type": "application/json",
      },
      body:JSON.stringify(registerData)
    })

    // chuyển sang login + fill email
    setActiveTab("login");
    setLoginData((prev) => ({ ...prev, email }));
  };

  return (
    <div className="wrapper-body">
    <div className="container">
      {/* LEFT PANEL */}
      <div className="info-panel">
        <div className="logo-border">
          <div className="logo">
            <i className="fas fa-user-circle"></i>
          </div>
        </div>
        <h2>Chào mừng</h2>
        <p>
          Đăng nhập để truy cập vào tài khoản của bạn hoặc tạo tài khoản mới
          nếu bạn chưa có.
        </p>
        <p>
          <i
            className="fas fa-lock"
            style={{ color: "#8a7356", marginRight: 5 }}
          ></i>
          Thông tin của bạn được bảo mật
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="form-panel">
        {/* TAB SWITCH */}
        <div className="tab-switcher">
          <button
            className={`tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Đăng nhập
          </button>

          <button
            className={`tab ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            Đăng ký
          </button>
        </div>

        <div className="form-container">
          {/* LOGIN FORM */}
          {activeTab === "login" && (
            <form className="form active" onSubmit={handleLoginSubmit}>
              <h2 className="form-title">Đăng nhập</h2>

              <div className="form-group">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  placeholder="Địa chỉ email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  required
                />
              </div>

              <button type="submit" className="btn">
                Đăng nhập
              </button>

              <div className="toggle-text">
                Chưa có tài khoản?{" "}
                <a onClick={() => setActiveTab("register")}>
                  Tạo tài khoản mới
                </a>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {activeTab === "register" && (
            <form className="form active" onSubmit={handleRegisterSubmit}>
              <h2 className="form-title">Đăng ký tài khoản</h2>

              <div className="form-group">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  placeholder="Họ và tên"
                  value={registerData.name}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <i className="fas fa-phone"></i>
                <input
                  type="tel"
                  placeholder="Số điện thoại"
                  value={registerData.phone}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  placeholder="Địa chỉ email"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  value={registerData.repassword}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      repassword: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <button  type="submit" className="btn">
                Đăng ký
              </button>

              <div className="toggle-text">
                Đã có tài khoản?{" "}
                <a onClick={() => setActiveTab("login")}>Đăng nhập</a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
