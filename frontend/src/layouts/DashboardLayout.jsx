import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  // Mobile ke liye Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      
      {/* Premium Aurora background effect */}
      <div className="aurora" />
      
      {/* Layout Container */}
      <div className="relative z-10 flex h-screen">
        
        {/* Mobile Header: Hamburger Menu Button (Phone par dikhega) */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg bg-card border border-border shadow-lg text-foreground hover:bg-secondary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Sidebar Container (Fixed on mobile, static on desktop) */}
        <div 
          className={`
            fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
            md:relative md:transform-none md:z-auto
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Mobile Close Button (Sidebar ke andar top-right par) */}
          <div className="md:hidden absolute top-4 right-4">
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="text-foreground/70 hover:text-foreground p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Aapka original Sidebar component yahan aayega */}
          <Sidebar />
        </div>

        {/* Mobile Backdrop (Sidebar ke bahar click karne par band karne ke liye) */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area (Right side) */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-6 lg:p-8 mt-14 md:mt-0">
          {/* Yahan Dashboard, Create, Subscription, Settings pages load honge */}
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}