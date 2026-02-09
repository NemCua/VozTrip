import Header from "./header.jsx"
import SlideBar from "./slideBar.jsx"
import { Outlet } from "react-router-dom"
export default function Wrapper() {
  return (
    <div className="dashboard-container">
      <SlideBar />

      <div className="main-content">
        <Header />

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}