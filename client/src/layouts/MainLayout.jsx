import NavBar from "../components/NavBar"
import { Outlet } from 'react-router-dom'
import SideBar from "../components/SideBar"

const MainLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-[#f5f7f8]">
      {/* Navbar at the top */}
      <div className="w-full z-10">
        <NavBar />
      </div>
      
      <div className="flex flex-row flex-1 overflow-hidden">
        {/* sidebar */}
        <div className="fixed top-24 left-0 h-screen">
          <SideBar />
        </div>
        
        {/* Main content with left margin to make room for sidebar */}
        <div className="flex-1 ml-[300px] p-4 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default MainLayout