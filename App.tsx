
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/Tenants';
import Subscriptions from './pages/Subscriptions';
import Reports from './pages/Reports';
import Communication from './pages/Communication';
import SystemSettings from './pages/SystemSettings';
import LoginPage from './pages/LoginPage';
import AddTenant from './pages/AddTenant';
import PaymentGateways from './pages/PaymentGateways';
import { Page, Tenant, TenantStatus } from './types';
import { useAuditLog } from './context/AuditLogContext';
import FullPageLoader from './components/FullPageLoader';

const mockTenants: Tenant[] = [
    { id: 1, companyName: 'Tech Solutions Inc.', subdomain: 'techsolutions.platform.com', currentPlan: 'الذهبية', status: TenantStatus.Active, startDate: '2023-01-15', endDate: '2024-01-15', users: '8/10' },
    { id: 2, companyName: 'Innovate Co.', subdomain: 'innovate.platform.com', currentPlan: 'التجريبية', status: TenantStatus.Trial, startDate: '2023-10-01', endDate: '2023-10-31', users: '3/5' },
    { id: 3, companyName: 'Data Systems', subdomain: 'datasys.platform.com', currentPlan: 'الفضية', status: TenantStatus.Expired, startDate: '2022-09-20', endDate: '2023-09-20', users: '5/5' },
    { id: 4, companyName: 'Creative Minds', subdomain: 'creative.platform.com', currentPlan: 'المجانية', status: TenantStatus.Deactivated, startDate: '2023-05-10', endDate: 'N/A', users: '1/2' },
    { id: 5, companyName: 'Future Forward', subdomain: 'future.platform.com', currentPlan: 'الذهبية', status: TenantStatus.Active, startDate: '2023-03-01', endDate: '2024-03-01', users: '10/10' },
];

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => sessionStorage.getItem('isAuthenticated') === 'true');
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
  const { addLog } = useAuditLog();
  const [isPageLoading, setIsPageLoading] = useState(false);


  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => setIsPageLoading(false), 300); // Simulate loading
    return () => clearTimeout(timer);
  }, [activePage]);

  const handleLoginSuccess = () => {
    sessionStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  const handleSaveTenant = (newTenant: Omit<Tenant, 'id'>) => {
      const tenantWithId: Tenant = {
          id: tenants.length > 0 ? Math.max(...tenants.map(t => t.id)) + 1 : 1,
          ...newTenant
      };
      setTenants(prevTenants => [tenantWithId, ...prevTenants]);
      addLog('audit.log.tenantCreated', { companyName: tenantWithId.companyName });
      setActivePage('Tenants');
  };
  
  const handleUpdateTenant = (updatedTenant: Tenant) => {
    setTenants(prevTenants => prevTenants.map(t => t.id === updatedTenant.id ? updatedTenant : t));
    addLog('audit.log.tenantUpdated', { companyName: updatedTenant.companyName });
  };

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Tenants':
        return <Tenants tenants={tenants} setActivePage={setActivePage} onUpdateTenant={handleUpdateTenant} />;
      case 'AddTenant':
        return <AddTenant onSave={handleSaveTenant} setActivePage={setActivePage} />;
      case 'Subscriptions':
        return <Subscriptions tenants={tenants} />;
      case 'PaymentGateways':
        return <PaymentGateways />;
      case 'Reports':
        return <Reports />;
      case 'Communication':
        return <Communication />;
      case 'Settings':
        return <SystemSettings />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setIsSidebarOpen={setIsSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 relative">
          {isPageLoading && <FullPageLoader />}
          <div className={isPageLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;