
import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { Page } from '../types';
import { useI18n } from '../context/i18n';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isSidebarOpen, setIsSidebarOpen, onLogout }) => {
  const { t, language } = useI18n();
  const [isTenantsMenuOpen, setTenantsMenuOpen] = useState(false);

  useEffect(() => {
    if (activePage === 'Tenants' || activePage === 'AddTenant') {
      setTenantsMenuOpen(true);
    }
  }, [activePage]);

  const menuItems: { name: Page; labelKey: string; icon: string; subItems?: { name: Page; labelKey: string }[] }[] = [
    { name: 'Dashboard', labelKey: 'sidebar.dashboard', icon: 'dashboard' },
    { 
      name: 'Tenants', 
      labelKey: 'sidebar.tenants', 
      icon: 'tenants',
      subItems: [
        { name: 'Tenants', labelKey: 'sidebar.tenants.all' },
        { name: 'AddTenant', labelKey: 'tenants.add.button' }
      ]
    },
    { name: 'Subscriptions', labelKey: 'sidebar.subscriptions', icon: 'subscriptions' },
    { name: 'PaymentGateways', labelKey: 'sidebar.paymentGateways', icon: 'cash' },
    { name: 'Reports', labelKey: 'sidebar.reports', icon: 'reports' },
    { name: 'Communication', labelKey: 'sidebar.communication', icon: 'communication' },
    { name: 'Settings', labelKey: 'sidebar.settings', icon: 'settings' },
  ];

  const sidebarBaseClasses = "flex-shrink-0 w-64 bg-white dark:bg-gray-800 flex flex-col fixed md:relative inset-y-0 z-40 transform transition-transform duration-300 ease-in-out";
  const languageSpecificClasses = language === 'ar' 
    ? 'border-l border-gray-200 dark:border-gray-700 right-0' 
    : 'border-r border-gray-200 dark:border-gray-700 left-0';
  
  const mobileTransformClass = language === 'ar'
    ? (isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0')
    : (isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0');

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      ></div>

      <div className={`${sidebarBaseClasses} ${languageSpecificClasses} ${mobileTransformClass}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">AdminPanel</h1>
          <button
            className="md:hidden p-2 rounded-md text-gray-500 dark:text-gray-400"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <Icon name="x" className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isParentActive = item.subItems?.some(sub => sub.name === activePage) || activePage === item.name;

            if (item.subItems) {
              return (
                <div key={item.name}>
                  <button
                    onClick={() => setTenantsMenuOpen(!isTenantsMenuOpen)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 text-left ${
                      isParentActive
                        ? 'bg-primary-600 text-white dark:bg-primary-700 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon name={item.icon} className={`w-5 h-5 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                      {t(item.labelKey)}
                    </div>
                    <Icon name="chevronDown" className={`w-4 h-4 transition-transform duration-200 ${isTenantsMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isTenantsMenuOpen && (
                    <div className="pt-2 pb-1 space-y-1" style={{ [language === 'ar' ? 'paddingRight' : 'paddingLeft']: '1.5rem' }}>
                      {item.subItems.map((subItem) => (
                        <a
                          key={subItem.name}
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setActivePage(subItem.name);
                            setIsSidebarOpen(false); // Close sidebar on mobile
                          }}
                          className={`block px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                            activePage === subItem.name
                              ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {t(subItem.labelKey)}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <a
                key={item.name}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage(item.name);
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  isParentActive
                    ? 'bg-primary-600 text-white dark:bg-primary-700 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon name={item.icon} className={`w-5 h-5 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                {t(item.labelKey)}
              </a>
            );
          })}
        </nav>
        <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700">
           <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onLogout();
              }}
              className="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Icon name="logout" className={`w-5 h-5 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
              {t('sidebar.logout')}
          </a>
        </div>
      </div>
    </>
  );
};

export default Sidebar;