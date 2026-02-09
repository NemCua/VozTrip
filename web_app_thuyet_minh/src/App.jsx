import { useState } from 'react'
import Wrapper from './partials/container'
import { Routes, Route } from "react-router-dom"
import NarrationPage from './page/admin/narration'
import DashboardPage from './page/admin/dashborad'
import POIPage from './page/admin/poi'
import ProfilePage from './page/admin/profile'
import SellerPage from './page/admin/seller'
import SettingPage from './page/admin/setting'
import UsersPage from './page/admin/user'
function App() {
  return (
    <Routes>
      <Route element={<Wrapper />}>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/admin/narrations" element={<NarrationPage />} />
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/poi" element={<POIPage />} />
        <Route path="/admin/profile" element={<ProfilePage />} />
        <Route path="/admin/seller" element={<SellerPage />} />
        <Route path="/admin/setting" element={<SettingPage />} />
        <Route path="/admin/user" element={<UsersPage />} />
      </Route>
    </Routes>
  )
}

export default App
