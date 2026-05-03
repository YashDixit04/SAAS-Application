import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/TableList/tenantsListViewPage';
import Users from './pages/TableList/UsersListViewPage';
import Offers from './pages/adminOffers';
import UserDetails from './pages/Details/ProfilePage';
import TenantDetailsView from './pages/Details/TenantDetailsViewPage';
import UiComponentsPage from './pages/UiComponentsPage';
import SubUsersPage from './pages/TableList/SubUsersListViewPage.tsx';
import VesselsPage from './pages/TableList/VesselsListViewPage';
import RequisitionOrdersPage from './pages/TableList/RequisitionOrdersListViewPage';
import DocumentsPage from './pages/documentsInfo/DocumentsPage';
import ActivityLogsPage from './pages/TableList/ActivityLogsListViewPage';
import CataloguePage from './pages/Catalogue/list/CataloguePage';
import SuperadminCataloguePage from './pages/Catalogue/SuperadminCataloguePage';
import AddProduct from './pages/Catalogue/AddCatalogue/AddProduct';
import CartPage from './pages/Cart/CartPage';
import LoginSignup from './pages/Auth/LoginSignup';
import VendorRegistrationPage from './pages/Auth/VendorRegistrationPage';
import AddAccountPage from './pages/Details/AddAccountPage';
import AddSubUserPage from './pages/Details/AddSubUserPage';
import AddTenantPage from './pages/Details/AddTenantPage';
import AddVesselPage from './pages/Details/AddVesselPage';
import AddVendorPage from './pages/Details/AddVendorPage';
import VendorDetailsViewPage from './pages/Details/VendorDetailsViewPage';
import VendorsListViewPage from './pages/TableList/VendorsListViewPage';
import { authService } from './services/authService';
import { canAccessPage, getAccessiblePages } from './utils/rbac';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { CartProvider } from './context/CartContext';
import {
  extractTenantIdFromPath,
  extractVendorIdFromPath,
  getAccessPageForLegacyTab,
  getDefaultPathForAccessPages,
  initializeRoutingManifest,
  pathToLegacyTab,
  resolveNavigationTarget,
} from './lib/appRouting.ts';

const KNOWN_TABS = [
  'dashboard',
  'users',
  'platformUsers',
  'superadminCatalogue',
  'security',
  'offers',
  'finance',
  'actions',
  'integrations',
  'userDetails',
  'tenantDetails',
  'help',
  'tenantSubUsers',
  'tenantVendors',
  'tenantVessels',
  'tenantOrders',
  'tenantCatalogue',
  'addProduct',
  'cart',
  'tenantDocuments',
  'tenantActivityLogs',
  'addAccount',
  'addTenant',
  'addSubUser',
  'addVendor',
  'addVessel',
];

const IMPLEMENTED_TABS = new Set([
  'dashboard',
  'users',
  'platformUsers',
  'superadminCatalogue',
  'offers',
  'userDetails',
  'tenantDetails',
  'help',
  'tenantSubUsers',
  'tenantVendors',
  'tenantVessels',
  'tenantOrders',
  'tenantCatalogue',
  'addProduct',
  'cart',
  'tenantDocuments',
  'tenantActivityLogs',
  'addAccount',
  'addTenant',
  'addSubUser',
  'addVendor',
  'addVessel',
]);

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const session = authService.getSession();
  const activeTab = useMemo(
    () => pathToLegacyTab(location.pathname, session?.tenantId),
    [location.pathname, session?.tenantId],
  );
  const tabBase = activeTab.split('_')[0];
  const tabParam = activeTab.split('_')[1];
  const routeTenantId = extractTenantIdFromPath(location.pathname);
  const routeVendorId = extractVendorIdFromPath(location.pathname, session?.tenantId);
  const navigationTenantId = tabParam || routeTenantId || session?.tenantId || '';

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    setIsAuthChecked(true);

    if (authenticated) {
      void initializeRoutingManifest();
    }
  }, []);

  useEffect(() => {
    if (!isAuthChecked || !isAuthenticated) {
      return;
    }

    const accessiblePages = getAccessiblePages();
    const defaultPath = getDefaultPathForAccessPages(accessiblePages, session?.tenantId);

    if (location.pathname === '/') {
      navigate(defaultPath, { replace: true });
      return;
    }

    const accessPage = getAccessPageForLegacyTab(activeTab);
    if (accessPage && !canAccessPage(accessPage) && accessiblePages.length > 0) {
      if (location.pathname !== defaultPath) {
        navigate(defaultPath, { replace: true });
      }
    }
  }, [
    isAuthChecked,
    isAuthenticated,
    location.pathname,
    activeTab,
    navigate,
    session?.tenantId,
  ]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    void initializeRoutingManifest();
    const loggedInSession = authService.getSession();
    const defaultPath = getDefaultPathForAccessPages(
      getAccessiblePages(),
      loggedInSession?.tenantId,
    );
    navigate(defaultPath, { replace: true });
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    navigate('/dashboard', { replace: true });
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    root.classList.add('no-transitions');
    setIsDarkMode(!isDarkMode);
    setTimeout(() => {
      root.classList.remove('no-transitions');
    }, 0);
  };

  const handleNavigate = (tabOrUrl: string) => {
    const nextPath = resolveNavigationTarget(tabOrUrl, {
      sessionTenantId: session?.tenantId,
      currentTenantId: navigationTenantId,
    });

    if (nextPath !== location.pathname) {
      navigate(nextPath);
    }
  };

  const accessTab = getAccessPageForLegacyTab(activeTab);

  if (!isAuthChecked) {
    return (
      <div className="h-screen flex items-center justify-center bg-grey-50 dark:bg-grey-50">
        <div className="text-grey-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (location.pathname === '/vendor-register') {
      return (
        <VendorRegistrationPage
          onBackToLogin={() => navigate('/', { replace: true })}
        />
      );
    }

    return (
      <LoginSignup
        onLoginSuccess={handleLoginSuccess}
        onRegisterVendor={() => navigate('/vendor-register')}
      />
    );
  }

  return (
    <CartProvider>
      <div className="h-screen overflow-hidden transition-colors duration-300 font-sans text-body flex flex-col bg-grey-50 dark:bg-grey-50">
        <ErrorBoundary componentName="Navigation Bar">
          <Navbar
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        </ErrorBoundary>

        <div className="flex flex-1 overflow-hidden max-w-[1920px] mx-auto w-full">
          <ErrorBoundary componentName="Sidebar Menu">
            <Sidebar
              isDarkMode={isDarkMode}
              activeTab={tabBase}
              onTabChange={handleNavigate}
            />
          </ErrorBoundary>

          <ErrorBoundary componentName={`Page View (${location.pathname})`}>
            {tabBase === 'dashboard' && canAccessPage('dashboard') && <Dashboard />}
            {tabBase === 'users' && canAccessPage('users') && <Tenants onNavigate={handleNavigate} />}
            {tabBase === 'platformUsers' && canAccessPage('platformUsers') && <Users onNavigate={handleNavigate} />}
            {tabBase === 'superadminCatalogue' && canAccessPage('superadminCatalogue') && (
              <SuperadminCataloguePage />
            )}
            {tabBase === 'offers' && canAccessPage('offers') && <Offers />}
            {tabBase === 'userDetails' && canAccessPage('userDetails') && <UserDetails />}
            {tabBase === 'tenantDetails' && canAccessPage('tenantDetails') && (
              <TenantDetailsView onNavigate={handleNavigate} tenantId={tabParam} />
            )}
            {tabBase === 'help' && canAccessPage('help') && <UiComponentsPage />}
            {tabBase === 'addAccount' && canAccessPage('addAccount') && (
              <AddAccountPage onNavigate={handleNavigate} />
            )}
            {tabBase === 'addSubUser' && canAccessPage('tenantSubUsers') && (
              <AddSubUserPage onNavigate={handleNavigate} tenantId={tabParam} />
            )}

            {tabBase === 'addVendor' && canAccessPage('tenantVendors') && (
              <AddVendorPage onNavigate={handleNavigate} tenantId={tabParam} />
            )}

            {tabBase === 'addVessel' && canAccessPage('tenantVessels') && (
              <AddVesselPage onNavigate={handleNavigate} tenantId={tabParam} />
            )}

            {tabBase === 'addTenant' && canAccessPage('addTenant') && (
              <AddTenantPage onNavigate={handleNavigate} />
            )}
            {tabBase === 'tenantSubUsers' && canAccessPage('tenantSubUsers') && (
              <SubUsersPage onNavigate={handleNavigate} tenantId={tabParam} />
            )}
            {tabBase === 'tenantVendors' && canAccessPage('tenantVendors') && (
              routeVendorId ? (
                <VendorDetailsViewPage
                  tenantId={tabParam}
                  vendorId={routeVendorId}
                  onNavigate={handleNavigate}
                />
              ) : (
                <VendorsListViewPage tenantId={tabParam} onNavigate={handleNavigate} />
              )
            )}
            {tabBase === 'tenantVessels' && canAccessPage('tenantVessels') && (
              <VesselsPage tenantId={tabParam} onNavigate={handleNavigate} />
            )}
            {tabBase === 'tenantOrders' && canAccessPage('tenantOrders') && <RequisitionOrdersPage />}
            {tabBase === 'tenantCatalogue' && canAccessPage('tenantCatalogue') && (
              <CataloguePage onNavigate={handleNavigate} tenantId={tabParam} />
            )}
            {tabBase === 'addProduct' && canAccessPage('addProduct') && (
              <AddProduct onNavigate={handleNavigate} tenantId={tabParam} />
            )}
            {tabBase === 'cart' && canAccessPage('cart') && <CartPage onNavigate={handleNavigate} />}
            {tabBase === 'tenantDocuments' && canAccessPage('tenantDocuments') && (
              <DocumentsPage tenantId={tabParam} />
            )}
            {tabBase === 'tenantActivityLogs' && canAccessPage('tenantActivityLogs') && (
              <ActivityLogsPage tenantId={tabParam} />
            )}

            {KNOWN_TABS.includes(tabBase) && accessTab && !canAccessPage(accessTab) && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-grey-400 text-lg mb-2">Access Denied</p>
                  <p className="text-grey-500 text-sm">You don't have permission to view this page.</p>
                </div>
              </div>
            )}

            {KNOWN_TABS.includes(tabBase) && accessTab && canAccessPage(accessTab) && !IMPLEMENTED_TABS.has(tabBase) && (
              <div className="flex-1 flex items-center justify-center text-grey-400">
                Work in progress
              </div>
            )}

            {!KNOWN_TABS.includes(tabBase) && (
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
