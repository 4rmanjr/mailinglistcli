import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Mail, FileText } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
}

export function Sidebar({ isOpen = true }: SidebarProps) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">ML</div>
        <div>
          <div className="sidebar-title">Mailing List</div>
          <div className="sidebar-subtitle">Management System</div>
        </div>
      </div>
      
      <nav className="nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Pelanggan</span>
        </NavLink>
        
        <NavLink to="/letters" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText size={20} />
          <span>Surat</span>
        </NavLink>
        
        <NavLink to="/mailing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Mail size={20} />
          <span>Mailing</span>
        </NavLink>
        
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Pengaturan</span>
        </NavLink>
      </nav>
    </aside>
  );
}
