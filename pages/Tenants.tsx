
import React, { useState } from 'react';
import Icon from '../components/Icon';
import { Tenant, TenantStatus, Page } from '../types';
import { useI18n } from '../context/i18n';
import TenantModal from '../components/TenantModal';
import { useAuditLog } from '../context/AuditLogContext';

const statusColors: { [key in TenantStatus]: string } = {
    [TenantStatus.Active]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    [TenantStatus.Trial]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    [TenantStatus.Expired]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    [TenantStatus.Deactivated]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

interface TenantsProps {
    tenants: Tenant[];
    setActivePage: (page: Page) => void;
    onUpdateTenant: (tenant: Tenant) => void;
    isLoading?: boolean;
    onRefresh?: () => void;
}

const Tenants: React.FC<TenantsProps> = ({ tenants, setActivePage, onUpdateTenant, isLoading = false, onRefresh }) => {
    const { t, language } = useI18n();
    const { addLog } = useAuditLog();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

    const handleViewDetails = (tenant: Tenant) => {
        setSelectedTenant(tenant);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleEditTenant = (tenant: Tenant) => {
        setSelectedTenant(tenant);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTenant(null);
    };

    const handleSaveTenant = (updatedTenant: Tenant) => {
        onUpdateTenant(updatedTenant);
        handleCloseModal();
    };

    const handleToggleStatus = (tenant: Tenant) => {
        const newStatus = tenant.status === TenantStatus.Active || tenant.status === TenantStatus.Trial ? TenantStatus.Deactivated : TenantStatus.Active;
        onUpdateTenant({ ...tenant, status: newStatus });
        addLog('audit.log.tenantStatusToggled', { companyName: tenant.companyName });
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('tenants.title')}</h1>
                {onRefresh && (
                    <div className="flex gap-2 self-start md:self-auto">
                        <button 
                            onClick={onRefresh} 
                            disabled={isLoading}
                            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center disabled:opacity-50"
                        >
                            <Icon name="refresh" className="w-5 h-5 mx-2" />
                            {t('common.refresh')}
                        </button>
                    </div>
                )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <div className="mb-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input type="text" dir={language === 'ar' ? 'rtl' : 'ltr'} placeholder={t('tenants.searchPlaceholder')} className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 w-full sm:w-auto"/>
                        <select dir={language === 'ar' ? 'rtl' : 'ltr'} className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 w-full sm:w-auto">
                            <option>{t('tenants.filterByPlan')}</option>
                        </select>
                        <select dir={language === 'ar' ? 'rtl' : 'ltr'} className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 w-full sm:w-auto">
                            <option>{t('tenants.filterByStatus')}</option>
                            <option>{t('status.Active')}</option>
                            <option>{t('status.Trial')}</option>
                            <option>{t('status.Expired')}</option>
                            <option>{t('status.Deactivated')}</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'} text-gray-500 dark:text-gray-400`}>
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('tenants.table.companyName')}</th>
                                <th scope="col" className="px-6 py-3">{t('tenants.table.subdomain')}</th>
                                <th scope="col" className="px-6 py-3">{t('tenants.table.currentPlan')}</th>
                                <th scope="col" className="px-6 py-3">{t('tenants.table.status')}</th>
                                <th scope="col" className="px-6 py-3">{t('tenants.table.endDate')}</th>
                                <th scope="col" className="px-6 py-3">{t('tenants.table.users')}</th>
                                <th scope="col" className="px-6 py-3 text-center">{t('tenants.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        {t('tenants.loading')}
                                    </td>
                                </tr>
                            ) : tenants.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        {t('tenants.noTenants')}
                                    </td>
                                </tr>
                            ) : (
                                tenants.map((tenant) => (
                                <tr key={tenant.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{tenant.companyName}</td>
                                    <td className="px-6 py-4">{tenant.subdomain}</td>
                                    <td className="px-6 py-4">{tenant.currentPlan || t('dashboard.noPlan')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[tenant.status]}`}>{t(`status.${tenant.status}`)}</span>
                                    </td>
                                    <td className="px-6 py-4">{tenant.endDate}</td>
                                    <td className="px-6 py-4">{tenant.users}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button onClick={() => handleViewDetails(tenant)} className="p-1 text-blue-600 hover:text-blue-800" title={t('tenants.actions.view')}><Icon name="view" className="w-5 h-5"/></button>
                                            <button onClick={() => handleEditTenant(tenant)} className="p-1 text-yellow-600 hover:text-yellow-800" title={t('tenants.actions.edit')}><Icon name="edit" className="w-5 h-5"/></button>
                                            <label className="relative inline-flex items-center cursor-pointer" title={tenant.status === TenantStatus.Active || tenant.status === TenantStatus.Trial ? t('tenants.actions.deactivate') : t('tenants.actions.activate')}>
                                                <input type="checkbox" checked={tenant.status === TenantStatus.Active || tenant.status === TenantStatus.Trial} onChange={() => handleToggleStatus(tenant)} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                            </label>
                                        </div>
                                    </td>
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <TenantModal 
                isOpen={isModalOpen}
                tenant={selectedTenant}
                mode={modalMode}
                onClose={handleCloseModal}
                onSave={handleSaveTenant}
            />
        </div>
    );
};

export default Tenants;
