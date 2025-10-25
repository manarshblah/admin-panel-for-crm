
import React, { useState, useMemo } from 'react';
import Icon from '../components/Icon';
import { AdminUser, AuditLog as AuditLogType, BackupLog } from '../types';
import { useI18n } from '../context/i18n';
import { useTheme } from '../context/ThemeContext';
import AdminUserModal from '../components/AdminUserModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuditLog } from '../context/AuditLogContext';

const mockAdmins: AdminUser[] = [
    { id: 1, name: 'Super Admin 1', email: 'admin1@system.com', role: 'Super Admin' },
    { id: 2, name: 'Super Admin 2', email: 'admin2@system.com', role: 'Super Admin' },
];

const mockBackupLogs: BackupLog[] = [
    { id: 'backup-1698058200000', date: new Date('2023-10-23T10:50:00'), status: 'Completed', initiator: 'Manual' },
    { id: 'backup-1697971800000', date: new Date('2023-10-22T10:50:00'), status: 'Completed', initiator: 'Scheduled' },
    { id: 'backup-1697885400000', date: new Date('2023-10-21T10:50:00'), status: 'Failed', initiator: 'Scheduled' },
    { id: 'backup-1697799000000', date: new Date('2023-10-20T10:50:00'), status: 'Completed', initiator: 'Scheduled' },
    { id: 'backup-1697712600000', date: new Date('2023-10-19T10:50:00'), status: 'Completed', initiator: 'Scheduled' },
    { id: 'backup-1697626200000', date: new Date('2023-10-18T10:50:00'), status: 'Completed', initiator: 'Manual' },
    { id: 'backup-1697539800000', date: new Date('2023-10-17T10:50:00'), status: 'Completed', initiator: 'Scheduled' },
];

const GeneralSettings: React.FC = () => {
    const { t } = useI18n();
    const { primaryColor, setPrimaryColor, logoUrl, setLogoUrl } = useTheme();
    const { addLog } = useAuditLog();

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSaveChanges = () => {
        // In a real app, this would save all settings.
        // For now, it just logs the action.
        addLog('audit.log.generalSettingsSaved');
        alert('Changes saved (simulation)!');
    }

    return(
    <div className="space-y-6">
        <h3 className="text-xl font-semibold">{t('settings.general.title')}</h3>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">{t('settings.general.platformName')}</label>
                <input type="text" defaultValue="MySaaS Platform" className="w-full max-w-lg px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"/>
            </div>
             <div>
                <label className="block text-sm font-medium mb-1">{t('settings.general.primaryColor')}</label>
                <div className="flex items-center space-x-2 max-w-lg">
                    <input 
                        type="color" 
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 border border-gray-300 rounded-md cursor-pointer dark:border-gray-600 p-0"
                        style={{ appearance: 'none', padding: 0 }}
                    />
                    <input 
                        type="text" 
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">{t('settings.general.platformLogo')}</label>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    {logoUrl && <img src={logoUrl} alt="Logo Preview" className="h-16 w-auto bg-gray-100 dark:bg-gray-700 p-1 rounded-md border border-gray-300 dark:border-gray-600 object-contain" />}
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="block w-full max-w-xs text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/40 dark:file:text-primary-300 dark:hover:file:bg-primary-900/60"/>
                    {logoUrl && <button onClick={() => setLogoUrl(null)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-500">{t('settings.general.removeLogo')}</button>}
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium mb-1">{t('settings.general.smtpHost')}</label>
                <input type="text" placeholder="smtp.example.com" className="w-full max-w-lg px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            <button onClick={handleSaveChanges} className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium">{t('settings.general.save')}</button>
        </div>
    </div>
)};

const SecurityBackups: React.FC = () => {
    const { t, language } = useI18n();
    const { addLog } = useAuditLog();
    const [backupStatus, setBackupStatus] = useState<'idle' | 'in-progress' | 'completed'>('idle');
    const [lastBackupDate, setLastBackupDate] = useState<Date | null>(mockBackupLogs.find(l => l.status === 'Completed')?.date || null);
    const [backupLogs, setBackupLogs] = useState<BackupLog[]>(mockBackupLogs);
    const [currentPage, setCurrentPage] = useState(1);
    const [restoringId, setRestoringId] = useState<string | null>(null);
    const ITEMS_PER_PAGE = 5;

    const handleBackupNow = () => {
        setBackupStatus('in-progress');
        setTimeout(() => {
            const newBackup: BackupLog = {
                id: `backup-${Date.now()}`,
                date: new Date(),
                status: Math.random() > 0.1 ? 'Completed' : 'Failed',
                initiator: 'Manual'
            };

            setBackupLogs(prev => [newBackup, ...prev]);
            addLog('audit.log.backupManual', { backupId: newBackup.id });
            
            if (newBackup.status === 'Completed') {
                setLastBackupDate(newBackup.date);
                setBackupStatus('completed');
                setTimeout(() => {
                    setBackupStatus('idle');
                }, 4000);
            } else {
                setBackupStatus('idle');
                alert('Backup Failed!');
            }
        }, 3000);
    };

    const handleDeleteBackup = (id: string) => {
        if (window.confirm(t('settings.security.deleteConfirm'))) {
            setBackupLogs(prev => prev.filter(log => log.id !== id));
            addLog('audit.log.backupDeleted', { backupId: id });
        }
    };

    const handleDownloadBackup = (log: BackupLog) => {
        const fileContent = JSON.stringify({
            id: log.id,
            date: log.date.toISOString(),
            status: log.status,
            initiator: log.initiator,
            data: "This is a dummy backup file. In a real application, this would contain the actual backup data.",
        }, null, 2);

        const blob = new Blob([fileContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${log.id}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleRestoreBackup = (log: BackupLog) => {
        if (restoringId || backupStatus === 'in-progress') return;

        if (window.confirm(t('settings.security.restoreConfirm'))) {
            setRestoringId(log.id);
            addLog('audit.log.backupRestored', { backupId: log.id });
            setTimeout(() => {
                alert(`${t('settings.security.restoreSuccess')} ${log.id}`);
                setRestoringId(null);
            }, 4000);
        }
    };

    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return backupLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [backupLogs, currentPage]);

    const totalPages = Math.ceil(backupLogs.length / ITEMS_PER_PAGE);

    const statusColors: { [key in BackupLog['status']]: string } = {
        'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'Failed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">{t('settings.security.title')}</h3>
            <div>
                <label className="block text-sm font-medium mb-1">{t('settings.security.schedule')}</label>
                <select className="max-w-lg px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600">
                    <option>{t('settings.security.schedule.daily')}</option>
                    <option>{t('settings.security.schedule.weekly')}</option>
                    <option>{t('settings.security.schedule.monthly')}</option>
                </select>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <button 
                        onClick={handleBackupNow}
                        disabled={backupStatus === 'in-progress'}
                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium flex items-center justify-center w-44 transition-colors hover:bg-green-700 disabled:bg-green-400 dark:disabled:bg-green-800 disabled:cursor-wait"
                    >
                        {backupStatus === 'in-progress' ? (
                            <>
                                <LoadingSpinner />
                                <span className="mx-2">{t('settings.security.backingUp')}</span>
                            </>
                        ) : (
                            t('settings.security.backupNow')
                        )}
                    </button>
                    {backupStatus === 'completed' && (
                         <p className="text-sm text-green-600 dark:text-green-400 flex items-center animate-pulse">
                            <Icon name="check" className="w-5 h-5 mx-1" />
                            {t('settings.security.backupCompleted')}
                         </p>
                    )}
                </div>
                 <div>
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('settings.security.lastBackup')}:</h4>
                    <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 font-mono">
                        {lastBackupDate ? lastBackupDate.toLocaleString(language) : t('settings.security.noBackup')}
                    </p>
                </div>
            </div>

             <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                <h4 className="text-lg font-semibold">{t('settings.security.historyTitle')}</h4>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('settings.security.table.id')}</th>
                                <th scope="col" className="px-6 py-3">{t('settings.security.table.date')}</th>
                                <th scope="col" className="px-6 py-3">{t('settings.security.table.status')}</th>
                                <th scope="col" className="px-6 py-3">{t('settings.security.table.initiator')}</th>
                                <th scope="col" className="px-6 py-3 text-center">{t('settings.security.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLogs.map((log) => (
                                <tr key={log.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-mono">{log.id}</td>
                                    <td className="px-6 py-4">{log.date.toLocaleString(language)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[log.status]}`}>{t(`settings.security.status.${log.status.toLowerCase()}`)}</span>
                                    </td>
                                    <td className="px-6 py-4">{t(`settings.security.initiator.${log.initiator.toLowerCase()}`)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button onClick={() => handleDownloadBackup(log)} disabled={restoringId === log.id} className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed" title={t('settings.security.actions.download')}><Icon name="download" className="w-5 h-5"/></button>
                                            <button onClick={() => handleRestoreBackup(log)} disabled={restoringId === log.id} className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-wait" title={restoringId === log.id ? t('settings.security.restoring') : t('settings.security.actions.restore')}>
                                                {restoringId === log.id ? <div className="w-5 h-5"><LoadingSpinner/></div> : <Icon name="restore" className="w-5 h-5"/>}
                                            </button>
                                            <button onClick={() => handleDeleteBackup(log.id)} disabled={restoringId === log.id} className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed" title={t('settings.security.actions.delete')}><Icon name="trash" className="w-5 h-5"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                 {totalPages > 1 && (
                    <nav className="flex items-center justify-between pt-4" aria-label="Table navigation">
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{t('settings.security.pagination.page')} <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> {t('settings.security.pagination.of')} <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span></span>
                        <div className="flex space-x-2 rtl:space-x-reverse">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                                {t('settings.security.pagination.previous')}
                            </button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                                {t('settings.security.pagination.next')}
                            </button>
                        </div>
                    </nav>
                )}
            </div>
        </div>
    );
};

interface AdminUsersProps {
    admins: AdminUser[];
    onAdd: () => void;
    onDelete: (id: number) => void;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ admins, onAdd, onDelete }) => {
    const { t } = useI18n();

    const handleDelete = (id: number) => {
        if (window.confirm(t('settings.admins.deleteConfirm'))) {
            onDelete(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">{t('settings.admins.title')}</h3>
                <button onClick={onAdd} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center">
                    <Icon name="plus" className="w-5 h-5 mx-2" />
                    {t('settings.admins.add')}
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">{t('settings.admins.table.name')}</th>
                            <th className="px-6 py-3">{t('settings.admins.table.email')}</th>
                            <th className="px-6 py-3">{t('settings.admins.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map(admin => (
                            <tr key={admin.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td className="px-6 py-4">{admin.name}</td>
                                <td className="px-6 py-4">{admin.email}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleDelete(admin.id)}
                                        className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={admins.length <= 1}
                                        title={admins.length <= 1 ? "Cannot delete the only admin" : "Delete"}
                                    >
                                        <Icon name="trash" className="w-5 h-5"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const AuditLog: React.FC = () => {
    const { t, language } = useI18n();
    const { logs } = useAuditLog();
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return logs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [logs, currentPage]);

    const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
    
    const formatAction = (action: { key: string; params: Record<string, string | number> }) => {
        let message = t(action.key);
        if (!message) return action.key;

        for (const key in action.params) {
            message = message.replace(`{${key}}`, String(action.params[key]));
        }
        return message;
    };

    return(
    <div className="space-y-6">
        <h3 className="text-xl font-semibold">{t('settings.audit.title')}</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th className="px-6 py-3">{t('settings.audit.table.user')}</th>
                        <th className="px-6 py-3">{t('settings.audit.table.action')}</th>
                        <th className="px-6 py-3">{t('settings.audit.table.timestamp')}</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedLogs.map(log => (
                        <tr key={log.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td className="px-6 py-4 font-mono">{log.user}</td>
                            <td className="px-6 py-4">{formatAction(log.action)}</td>
                            <td className="px-6 py-4">{new Date(log.timestamp).toLocaleString(language)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {totalPages > 1 && (
            <nav className="flex items-center justify-between pt-4" aria-label="Table navigation">
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{t('settings.security.pagination.page')} <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> {t('settings.security.pagination.of')} <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span></span>
                <div className="flex space-x-2 rtl:space-x-reverse">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                        {t('settings.security.pagination.previous')}
                    </button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                        {t('settings.security.pagination.next')}
                    </button>
                </div>
            </nav>
        )}
    </div>
)};

const SystemSettings: React.FC = () => {
    const { t } = useI18n();
    const { addLog } = useAuditLog();
    const [activeSetting, setActiveSetting] = useState('general');
    const [admins, setAdmins] = useState<AdminUser[]>(mockAdmins);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

    const handleAddAdmin = ({ name, email }: { name: string; email: string }) => {
        const newAdmin: AdminUser = {
            id: admins.length > 0 ? Math.max(...admins.map(a => a.id)) + 1 : 1,
            name,
            email,
            role: 'Super Admin',
        };
        setAdmins(prevAdmins => [...prevAdmins, newAdmin]);
        addLog('audit.log.adminAdded', { email });
        setIsAdminModalOpen(false);
    };

    const handleDeleteAdmin = (adminId: number) => {
        setAdmins(prevAdmins => prevAdmins.filter(admin => admin.id !== adminId));
        addLog('audit.log.adminDeleted', { adminId });
    };

    const settingsMenu = [
        { id: 'general', label: t('settings.menu.general') },
        { id: 'security', label: t('settings.menu.security') },
        { id: 'admins', label: t('settings.menu.admins') },
        { id: 'audit', label: t('settings.menu.audit') },
    ];
    
    const renderSetting = () => {
        switch (activeSetting) {
            case 'general': return <GeneralSettings />;
            case 'security': return <SecurityBackups />;
            case 'admins': return <AdminUsers admins={admins} onAdd={() => setIsAdminModalOpen(true)} onDelete={handleDeleteAdmin} />;
            case 'audit': return <AuditLog />;
            default: return <GeneralSettings />;
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('settings.title')}</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-1/4">
                    <nav className="space-y-1">
                        {settingsMenu.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSetting(item.id)}
                                className={`w-full text-right px-3 py-2 rounded-md text-sm font-medium ${
                                    activeSetting === item.id 
                                    ? 'bg-primary-600 text-white dark:bg-primary-700 dark:text-white' 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`
                                }
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>
                <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                   {renderSetting()}
                </div>
            </div>
             <AdminUserModal 
                isOpen={isAdminModalOpen}
                onClose={() => setIsAdminModalOpen(false)}
                onSave={handleAddAdmin}
            />
        </div>
    );
};

export default SystemSettings;
