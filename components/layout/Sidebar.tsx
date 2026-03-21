
import React from 'react';

interface SidebarProps {
  isDarkMode?: boolean;
}
import {
  LayoutGrid,
  ShieldCheck,
  BadgePercent,
  Wallet,
  MousePointer2,
  Cpu,
  HelpCircle,
  Settings,
  Users,
  Building2
} from 'lucide-react';
import Tooltip from '../ui/Tooltip';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  id?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive, onClick }) => {
  return (
    <Tooltip content={label} position="right" delay={0} className="z-50">
      <button
        onClick={onClick}
        className={`
          w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 group relative
          ${isActive
            ? 'bg-primary text-white shadow-md shadow-primary/25'
            : 'text-grey-400 hover:text-primary hover:bg-primary-soft dark:hover:bg-grey-800'
          }
        `}
      >
        {icon}
      </button>
    </Tooltip>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid size={18} strokeWidth={1.5} /> },
    { id: 'users', label: 'Tenants', icon: <Building2 size={18} strokeWidth={1.5} /> },
    { id: 'platformUsers', label: 'Users', icon: <Users size={18} strokeWidth={1.5} /> },
    { id: 'security', label: 'Security', icon: <ShieldCheck size={18} strokeWidth={1.5} /> },
    { id: 'offers', label: 'Offers', icon: <BadgePercent size={18} strokeWidth={1.5} /> },
    { id: 'finance', label: 'Finance', icon: <Wallet size={18} strokeWidth={1.5} /> },
    { id: 'actions', label: 'Actions', icon: <MousePointer2 size={18} strokeWidth={1.5} /> },
    { id: 'integrations', label: 'Integrations', icon: <Cpu size={18} strokeWidth={1.5} /> },
  ];

  return (
    <aside className="hidden md:flex w-16 flex-col items-center py-8 sticky top-[56px] h-[calc(100vh-56px)] bg-grey-50 dark:bg-grey-50 z-20">

      {/* Main Navigation */}
      <div className="flex flex-col gap-2 w-full items-center">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            id={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeTab === item.id}
            onClick={() => onTabChange(item.id)}
          />
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto flex flex-col gap-2 w-full items-center">
        <SidebarItem
          icon={<Settings size={18} strokeWidth={1.5} />}
          label="Settings"
          isActive={activeTab === 'userDetails'}
          onClick={() => onTabChange('userDetails')}
        />
        <SidebarItem
          icon={<HelpCircle size={18} strokeWidth={1.5} />}
          label="Help & Support"
          isActive={activeTab === 'help'}
          onClick={() => onTabChange('help')}
        />
      </div>
    </aside>
  );
};

export default Sidebar;