
import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/tenants';
import Users from './pages/Users';
import Offers from './pages/adminOffers';
import UserDetails from './pages/ProfileView';
import TenantDetailsView from './pages/Details/TenantDetailsView';
import UiComponentsPage from './pages/UiComponentsPage';
import SubUsersPage from './pages/UserDetails/TableList/SubUsersPage';
import VesselsPage from './pages/vessel/VesselsPage';
import RequisitionOrdersPage from './pages/Requsition&Order/RequisitionOrdersPage';
import DocumentsPage from './pages/Details/DocumentsPage';
import ActivityLogsPage from './pages/Details/ActivityLogsPage';
import CataloguePage from './pages/Catalogue/list/CataloguePage';
import AddProduct from './pages/Catalogue/AddCatalogue/AddProduct';
const App: React.FC = () => {
  // Theme management logic
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Toggle logic
  const toggleTheme = () => {
    const root = window.document.documentElement;
    root.classList.add('no-transitions');
    setIsDarkMode(!isDarkMode);
    setTimeout(() => {
      root.classList.remove('no-transitions');
    }, 0);
  };

  // Map redirectUrl paths to tab IDs
  const redirectUrlToTab: Record<string, string> = {
    '/tenant/sub-users': 'tenantSubUsers',
    '/tenant/vessels': 'tenantVessels',
    '/tenant/orders': 'tenantOrders',
    '/tenant/catalogue': 'tenantCatalogue',
    '/tenant/catalogue/add-product': 'addProduct',
    '/tenant/documents': 'tenantDocuments',
    '/tenant/activity-logs': 'tenantActivityLogs',
  };

  const handleNavigate = (tabOrUrl: string) => {
    // If it's a redirect URL path, convert to tab ID
    const tabId = redirectUrlToTab[tabOrUrl] || tabOrUrl;
    setActiveTab(tabId);
  };

  const knownTabs = [
    'dashboard', 'users', 'platformUsers', 'offers', 'userDetails', 'tenantDetails', 'help',
    'tenantSubUsers', 'tenantVessels', 'tenantOrders', 'tenantCatalogue', 'addProduct', 'tenantDocuments', 'tenantActivityLogs',
  ];

  return (
    <div className="h-screen overflow-hidden transition-colors duration-300 font-sans text-body flex flex-col bg-grey-50 dark:bg-grey-50">
      {/* Top Navigation */}
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden max-w-[1920px] mx-auto w-full">
        {/* Left Sidebar */}
        <Sidebar
          isDarkMode={isDarkMode}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main Content Area */}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'users' && <Tenants onNavigate={handleNavigate} />}
        {activeTab === 'platformUsers' && <Users onNavigate={handleNavigate} />}
        {activeTab === 'offers' && <Offers />}
        {activeTab === 'userDetails' && <UserDetails />}
        {activeTab === 'tenantDetails' && <TenantDetailsView onNavigate={handleNavigate} />}
        {activeTab === 'help' && <UiComponentsPage />}

        {/* Tenant Sub Pages */}
        {activeTab === 'tenantSubUsers' && <SubUsersPage />}
        {activeTab === 'tenantVessels' && <VesselsPage />}
        {activeTab === 'tenantOrders' && <RequisitionOrdersPage />}
        {activeTab === 'tenantCatalogue' && <CataloguePage onNavigate={handleNavigate} />}
        {activeTab === 'addProduct' && <AddProduct onNavigate={handleNavigate} />}
        {activeTab === 'tenantDocuments' && <DocumentsPage />}
        {activeTab === 'tenantActivityLogs' && <ActivityLogsPage />}

        {/* Fallback for other tabs not yet implemented */}
        {!knownTabs.includes(activeTab) && (
          <div className="flex-1 flex items-center justify-center text-grey-400">
            Work in progress
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
