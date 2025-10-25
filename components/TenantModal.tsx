
import React, { useState, useEffect } from 'react';
import { Tenant, TenantStatus } from '../types';
import { useI18n } from '../context/i18n';
import Icon from './Icon';

interface TenantModalProps {
  tenant: Tenant | null;
  mode: 'view' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  onSave: (tenant: Tenant) => void;
}

const TenantModal: React.FC<TenantModalProps> = ({ tenant, mode, isOpen, onClose, onSave }) => {
  const { t } = useI18n();
  const [formData, setFormData] = useState<Tenant | null>(null);

  useEffect(() => {
    if (tenant) {
      setFormData({ ...tenant });
    }
  }, [tenant]);

  if (!isOpen || !tenant || !formData) return null;

  const isEditMode = mode === 'edit';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSave = () => {
    if (formData) {
      onSave(formData);
    }
  };

  const statusColors: { [key in TenantStatus]: string } = {
    [TenantStatus.Active]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    [TenantStatus.Trial]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    [TenantStatus.Expired]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    [TenantStatus.Deactivated]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500";
  const labelClasses = "block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300";
  const valueClasses = "w-full px-3 py-2 text-gray-900 dark:text-white min-h-[42px]";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {isEditMode ? t('tenants.modal.editTitle') : t('tenants.modal.viewTitle')}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <Icon name="x" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>{t('tenants.table.companyName')}</label>
              {isEditMode ? (
                <input name="companyName" value={formData.companyName} onChange={handleChange} className={inputClasses} />
              ) : (
                <p className={valueClasses}>{tenant.companyName}</p>
              )}
            </div>
            <div>
              <label className={labelClasses}>{t('tenants.table.subdomain')}</label>
               {isEditMode ? (
                <input name="subdomain" value={formData.subdomain} onChange={handleChange} className={inputClasses} />
              ) : (
                <p className={valueClasses}>{tenant.subdomain}</p>
              )}
            </div>
            <div>
              <label className={labelClasses}>{t('tenants.table.currentPlan')}</label>
               {isEditMode ? (
                <select name="currentPlan" value={formData.currentPlan} onChange={handleChange} className={inputClasses}>
                  <option>المجانية</option>
                  <option>التجريبية</option>
                  <option>الفضية</option>
                  <option>الذهبية</option>
                </select>
              ) : (
                <p className={valueClasses}>{tenant.currentPlan}</p>
              )}
            </div>
            <div>
              <label className={labelClasses}>{t('tenants.table.status')}</label>
              <div className={valueClasses}>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[tenant.status]}`}>{t(`status.${tenant.status}`)}</span>
              </div>
            </div>
             <div>
              <label className={labelClasses}>{t('tenants.table.startDate')}</label>
              {isEditMode ? (
                <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} className={inputClasses} />
              ) : (
                <p className={valueClasses}>{tenant.startDate}</p>
              )}
            </div>
            <div>
              <label className={labelClasses}>{t('tenants.table.endDate')}</label>
              {isEditMode ? (
                <input name="endDate" type="date" value={formData.endDate} onChange={handleChange} className={inputClasses} />
              ) : (
                <p className={valueClasses}>{tenant.endDate}</p>
              )}
            </div>
            <div>
              <label className={labelClasses}>{t('tenants.table.users')}</label>
              {isEditMode ? (
                <input name="users" value={formData.users} onChange={handleChange} className={inputClasses} />
              ) : (
                <p className={valueClasses}>{tenant.users}</p>
              )}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4 rtl:space-x-reverse bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          <button onClick={onClose} className="px-6 py-2 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 font-medium">
            {t('tenants.modal.close')}
          </button>
          {isEditMode && (
            <button onClick={handleSave} className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium">
              {t('tenants.modal.save')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantModal;
