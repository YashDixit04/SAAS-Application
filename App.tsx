
import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/TableList/tenantsListViewPage';
import Users from './pages/TableList/UsersListViewPage';
import Offers from './pages/adminOffers';
import UserDetails from './pages/Details/ProfilePage';
import TenantDetailsView from './pages/Details/TenantDetailsViewPage';
import UiComponentsPage from './pages/UiComponentsPage';
import SubUsersPage from './pages/TableList/SubUsersListViewPage';
import VesselsPage from './pages/TableList/VesselsListViewPage';
import RequisitionOrdersPage from './pages/TableList/RequisitionOrdersListViewPage';
import DocumentsPage from './pages/documentsInfo/DocumentsPage';
import ActivityLogsPage from './pages/TableList/ActivityLogsListViewPage';
import CataloguePage from './pages/Catalogue/list/CataloguePage';
import AddProduct from './pages/Catalogue/AddCatalogue/AddProduct';
import CartPage from './pages/Cart/CartPage';
import LoginSignup from './pages/Auth/LoginSignup';
import AddAccountPage from './pages/Details/AddAccountPage';
import AddTenantPage from './pages/Details/AddTenantPage';
import { authService } from './services/authService';
import { canAccessPage, getAccessiblePages } from './utils/rbac';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { CartProvider } from './context/CartContext';

const App: React.FC = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);

  // Theme management logic
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsAuthChecked(true);

      // If authenticated, check if current tab is accessible
      if (authenticated) {
        const accessiblePages = getAccessiblePages();
        if (!canAccessPage(activeTab) && accessiblePages.length > 0) {
          // Redirect to first accessible page
          setActiveTab(accessiblePages[0]);
        }
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    const accessiblePages = getAccessiblePages();
    if (accessiblePages.length > 0) {
      setActiveTab(accessiblePages[0]);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

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
    '/tenant/cart': 'cart',
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
    'tenantSubUsers', 'tenantVessels', 'tenantOrders', 'tenantCatalogue', 'addProduct', 'cart', 'tenantDocuments', 'tenantActivityLogs', 'addAccount', 'addTenant'
  ];

  // Show loading state while checking authentication
  if (!isAuthChecked) {
    return (
      <div className="h-screen flex items-center justify-center bg-grey-50 dark:bg-grey-50">
        <div className="text-grey-400">Loading...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginSignup onLoginSuccess={handleLoginSuccess} />;
  }

  // Main application (authenticated users only)
  return (
    <CartProvider>
      <div className="h-screen overflow-hidden transition-colors duration-300 font-sans text-body flex flex-col bg-grey-50 dark:bg-grey-50">
        {/* Top Navigation */}
        <ErrorBoundary componentName="Navigation Bar">
          <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} onLogout={handleLogout} onNavigate={handleNavigate} />
        </ErrorBoundary>

        {/* Main Layout Container */}
        <div className="flex flex-1 overflow-hidden max-w-[1920px] mx-auto w-full">
          {/* Left Sidebar */}
          <ErrorBoundary componentName="Sidebar Menu">
            <Sidebar
              isDarkMode={isDarkMode}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </ErrorBoundary>

          {/* Main Content Area - Render only if user has access */}
          <ErrorBoundary componentName={`Page View (${activeTab})`}>
            {activeTab === 'dashboard' && canAccessPage('dashboard') && <Dashboard />}
            {activeTab === 'users' && canAccessPage('users') && <Tenants onNavigate={handleNavigate} />}
            {activeTab === 'platformUsers' && canAccessPage('platformUsers') && <Users onNavigate={handleNavigate} />}
            {activeTab === 'offers' && canAccessPage('offers') && <Offers />}
            {activeTab === 'userDetails' && canAccessPage('userDetails') && <UserDetails />}
            {activeTab === 'tenantDetails' && canAccessPage('tenantDetails') && <TenantDetailsView onNavigate={handleNavigate} />}
            {activeTab === 'help' && canAccessPage('help') && <UiComponentsPage />}
            {activeTab === 'addAccount' && canAccessPage('addAccount') && <AddAccountPage onNavigate={handleNavigate} />}

            {/* Tenant Sub Pages */}
            {activeTab === 'addTenant' && canAccessPage('addTenant') && <AddTenantPage onNavigate={handleNavigate} />}
            {activeTab === 'tenantSubUsers' && canAccessPage('tenantSubUsers') && <SubUsersPage />}
            {activeTab === 'tenantVessels' && canAccessPage('tenantVessels') && <VesselsPage />}
            {activeTab === 'tenantOrders' && canAccessPage('tenantOrders') && <RequisitionOrdersPage />}
            {activeTab === 'tenantCatalogue' && canAccessPage('tenantCatalogue') && <CataloguePage onNavigate={handleNavigate} />}
            {activeTab === 'addProduct' && canAccessPage('addProduct') && <AddProduct onNavigate={handleNavigate} />}
            {activeTab === 'cart' && canAccessPage('cart') && <CartPage onNavigate={handleNavigate} />}
            {activeTab === 'tenantDocuments' && canAccessPage('tenantDocuments') && <DocumentsPage />}
            {activeTab === 'tenantActivityLogs' && canAccessPage('tenantActivityLogs') && <ActivityLogsPage />}

            {/* Access Denied or Not Implemented */}
            {knownTabs.includes(activeTab) && !canAccessPage(activeTab) && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-grey-400 text-lg mb-2">Access Denied</p>
                  <p className="text-grey-500 text-sm">You don't have permission to view this page.</p>
                </div>
              </div>
            )}

            {/* Fallback for other tabs not yet implemented */}
            {!knownTabs.includes(activeTab) && (
              <div className="flex-1 flex items-center justify-center text-grey-400">
                Work in progress
              </div>
            )}
          </ErrorBoundary>
        </div>
      </div>
    </CartProvider>
  );
};

export default App;
