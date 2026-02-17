import { Menu, Bell } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
  title: string;
}

export function Header({ onMenuToggle, title }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuToggle}>
          <Menu size={24} />
        </button>
        <h1 className="page-title">{title}</h1>
      </div>
      
      <div className="header-right">
        <button className="btn btn-secondary" style={{ padding: '0.5rem' }}>
          <Bell size={20} />
        </button>
        
        <div className="user-menu">
          <div className="user-avatar">A</div>
          <span className="user-name">Admin</span>
        </div>
      </div>
    </header>
  );
}
