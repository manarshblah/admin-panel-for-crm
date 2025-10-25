
import React, { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../context/i18n';
import Icon from '../components/Icon';
import { Tenant, TenantStatus, Page } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

interface AddTenantProps {
  onSave: (tenant: Omit<Tenant, 'id'>) => void;
  setActivePage: (page: Page) => void;
}

const takenSubdomains = ['techsolutions', 'innovate', 'datasys', 'creative', 'future'];

const AddTenant: React.FC<AddTenantProps> = ({ onSave, setActivePage }) => {
  const { t } = useI18n();
  
  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState('الفضية');
  const [subdomain, setSubdomain] = useState('');

  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [subdomainError, setSubdomainError] = useState('');

  const slugify = (text: string) => {
    return text.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleCompanyNameBlur = () => {
      if (companyName && !subdomain) {
          setSubdomain(slugify(companyName));
      }
  };

  const checkSubdomain = useCallback((value: string) => {
      if (!value) {
          setSubdomainStatus('idle');
          return;
      }
      setSubdomainStatus('checking');
      setTimeout(() => {
          if (takenSubdomains.includes(value)) {
              setSubdomainStatus('invalid');
              setSubdomainError(t('tenants.add.subdomainTaken'));
          } else {
              setSubdomainStatus('valid');
              setSubdomainError('');
          }
      }, 500);
  }, [t]);

  useEffect(() => {
      const handler = setTimeout(() => {
          checkSubdomain(subdomain);
      }, 500);
      return () => clearTimeout(handler);
  }, [subdomain, checkSubdomain]);

  const handleGeneratePassword = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
      let newPassword = '';
      for (let i = 0; i < 12; i++) {
          newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setPassword(newPassword);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (subdomainStatus !== 'valid') {
          alert(t('tenants.add.subdomainTaken'));
          return;
      }
      const newTenant: Omit<Tenant, 'id'> = {
          companyName,
          subdomain: `${subdomain}.platform.com`,
          currentPlan: plan,
          status: plan === 'التجريبية' ? TenantStatus.Trial : TenantStatus.Active,
          startDate: new Date().toISOString().split('T')[0],
          endDate: '2025-01-01', // Placeholder
          users: '1/5', // Placeholder
      };
      onSave(newTenant);
  };

  const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500";
  const labelClasses = "block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('tenants.add.title')}</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="companyName" className={labelClasses}>{t('tenants.table.companyName')}</label>
                        <input id="companyName" type="text" placeholder={t('tenants.add.companyNamePlaceholder')} className={inputClasses} value={companyName} onChange={(e) => setCompanyName(e.target.value)} onBlur={handleCompanyNameBlur} required/>
                    </div>
                    <div>
                        <label htmlFor="adminName" className={labelClasses}>{t('tenants.add.adminName')}</label>
                        <input id="adminName" type="text" placeholder={t('tenants.add.adminNamePlaceholder')} className={inputClasses} value={adminName} onChange={(e) => setAdminName(e.target.value)} required/>
                    </div>
                    <div>
                        <label htmlFor="adminEmail" className={labelClasses}>{t('tenants.add.adminEmail')}</label>
                        <input id="adminEmail" type="email" placeholder={t('tenants.add.adminEmailPlaceholder')} className={inputClasses} value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required/>
                    </div>
                     <div>
                        <label htmlFor="password" className={labelClasses}>{t('tenants.add.password')}</label>
                        <div className="flex">
                            <input id="password" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-l-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 z-10" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                            <button type="button" onClick={handleGeneratePassword} className="px-3 bg-gray-100 dark:bg-gray-600 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-200 dark:hover:bg-gray-500">{t('tenants.add.generate')}</button>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="subdomain" className={labelClasses}>{t('tenants.table.subdomain')}</label>
                        <div className="relative flex items-center">
                            <input id="subdomain" type="text" placeholder={t('tenants.add.subdomainPlaceholder')} className={`w-full px-3 py-2 border rounded-l-md dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 z-10 ${subdomainStatus === 'invalid' ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} value={subdomain} onChange={(e) => setSubdomain(slugify(e.target.value))} required/>
                            <span className="text-gray-500 dark:text-gray-400 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md">.platform.com</span>
                            <div className="absolute right-40 h-full flex items-center">
                                {subdomainStatus === 'checking' && <LoadingSpinner />}
                                {subdomainStatus === 'valid' && <Icon name="check" className="w-5 h-5 text-green-500"/>}
                                {subdomainStatus === 'invalid' && <Icon name="x" className="w-5 h-5 text-red-500"/>}
                            </div>
                        </div>
                        {subdomainStatus === 'invalid' && <p className="text-red-500 text-xs mt-1">{subdomainError}</p>}
                    </div>
                    <div>
                        <label htmlFor="plan" className={labelClasses}>{t('tenants.table.currentPlan')}</label>
                        <select id="plan" className={inputClasses} value={plan} onChange={e => setPlan(e.target.value)}>
                            <option>التجريبية</option>
                            <option>الفضية</option>
                            <option>الذهبية</option>
                        </select>
                    </div>
                </div>
            </div>
          
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4 rtl:space-x-reverse bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
                <button type="button" onClick={() => setActivePage('Tenants')} className="px-6 py-2 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 font-medium">
                {t('common.cancel')}
                </button>
                <button type="submit" disabled={subdomainStatus !== 'valid'} className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium flex items-center disabled:bg-primary-400 dark:disabled:bg-primary-800 disabled:cursor-not-allowed">
                    {t('common.createAndSave')}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddTenant;
