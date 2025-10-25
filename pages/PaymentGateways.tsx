
import React, { useState, useEffect } from 'react';
import { PaymentGateway, PaymentGatewayStatus } from '../types';
import { useI18n } from '../context/i18n';
import Icon from '../components/Icon';
import GatewaySettingsModal from '../components/GatewaySettingsModal';
import AddGatewayModal from '../components/AddGatewayModal';
import { useAuditLog } from '../context/AuditLogContext';
import GatewayCardSkeleton from '../components/GatewayCardSkeleton';

const initialGateways: PaymentGateway[] = [
    {
        id: 'stripe',
        name: 'Stripe',
        description: 'To accept credit and debit cards globally.',
        status: PaymentGatewayStatus.SetupRequired,
        enabled: false,
        config: {},
    },
    {
        id: 'paypal',
        name: 'PayPal',
        description: 'To offer a trusted and widely used payment method.',
        status: PaymentGatewayStatus.SetupRequired,
        enabled: false,
        config: {},
    }
];

const GatewayCard: React.FC<{ gateway: PaymentGateway, onManage: () => void, onToggle: (enabled: boolean) => void }> = ({ gateway, onManage, onToggle }) => {
    const { t } = useI18n();

    const statusMap: { [key in PaymentGatewayStatus]: { text: string; bg: string; text_color: string } } = {
        [PaymentGatewayStatus.Active]: { text: t('status.Active'), bg: 'bg-green-100 dark:bg-green-900', text_color: 'text-green-800 dark:text-green-300' },
        [PaymentGatewayStatus.Disabled]: { text: t('status.Disabled'), bg: 'bg-gray-100 dark:bg-gray-700', text_color: 'text-gray-800 dark:text-gray-300' },
        [PaymentGatewayStatus.SetupRequired]: { text: t('status.SetupRequired'), bg: 'bg-yellow-100 dark:bg-yellow-900', text_color: 'text-yellow-800 dark:text-yellow-300' },
    };
    
    const currentStatus = statusMap[gateway.status];
    const isToggleDisabled = gateway.status === PaymentGatewayStatus.SetupRequired;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border dark:border-gray-700 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="h-10 flex items-center text-gray-700 dark:text-gray-300">
                         <i className={`pf pf-${gateway.id.toLowerCase()} pf-3x`}></i>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer" title={isToggleDisabled ? "Setup required to enable" : (gateway.enabled ? "Deactivate" : "Activate")}>
                        <input type="checkbox" checked={gateway.enabled} onChange={(e) => onToggle(e.target.checked)} className="sr-only peer" disabled={isToggleDisabled} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                    </label>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{gateway.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 min-h-[40px]">{gateway.description}</p>
            </div>
            <div className="mt-6 flex justify-between items-center">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${currentStatus.bg} ${currentStatus.text_color}`}>
                    {currentStatus.text}
                </span>
                <button onClick={onManage} className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">
                    <Icon name="settings" className="w-4 h-4" />
                    <span>{t('paymentGateways.manage')}</span>
                </button>
            </div>
        </div>
    );
};


const PaymentGateways: React.FC = () => {
    const { t } = useI18n();
    const { addLog } = useAuditLog();
    const [gateways, setGateways] = useState<PaymentGateway[]>(initialGateways);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
    const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleManage = (gateway: PaymentGateway) => {
        setSelectedGateway(gateway);
        setIsSettingsModalOpen(true);
    };

    const handleToggle = (gatewayId: string, enabled: boolean) => {
        let gatewayName = '';
        setGateways(prev => prev.map(gw => {
            if (gw.id === gatewayId) {
                gatewayName = gw.name;
                const newStatus = enabled ? PaymentGatewayStatus.Active : PaymentGatewayStatus.Disabled;
                return { ...gw, enabled, status: newStatus };
            }
            return gw;
        }));
        const action = enabled ? t('audit.log.activated') : t('audit.log.deactivated');
        addLog('audit.log.gatewayToggled', { action, gatewayName });
    };
    
    const handleSaveSettings = (updatedGateway: PaymentGateway) => {
        setGateways(prev => prev.map(gw => gw.id === updatedGateway.id ? updatedGateway : gw));
        addLog('audit.log.gatewaySettingsUpdated', { gatewayName: updatedGateway.name });
        setIsSettingsModalOpen(false);
        setSelectedGateway(null);
    };

    const handleAddGateway = ({ name, description }: { name: string; description: string }) => {
        const newGateway: PaymentGateway = {
            id: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            name,
            description,
            status: PaymentGatewayStatus.SetupRequired,
            enabled: false,
            config: {}
        };
        setGateways(prev => [...prev, newGateway]);
        addLog('audit.log.gatewayAdded', { gatewayName: name });
        setIsAddModalOpen(false);
    };


    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('paymentGateways.title')}</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{t('paymentGateways.subtitle')}</p>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center justify-center space-x-2 rtl:space-x-reverse self-start md:self-center">
                    <Icon name="plus" className="w-5 h-5" />
                    <span>{t('paymentGateways.addGateway')}</span>
                </button>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {isLoading ? (
                    [...Array(3)].map((_, i) => <GatewayCardSkeleton key={i} />)
                ) : (
                    gateways.map(gw => (
                        <GatewayCard 
                            key={gw.id} 
                            gateway={gw}
                            onManage={() => handleManage(gw)}
                            onToggle={(enabled) => handleToggle(gw.id, enabled)}
                        />
                    ))
                )}
            </div>
            
            <GatewaySettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                gateway={selectedGateway}
                onSave={handleSaveSettings}
            />

            <AddGatewayModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddGateway}
            />
        </div>
    );
};

export default PaymentGateways;