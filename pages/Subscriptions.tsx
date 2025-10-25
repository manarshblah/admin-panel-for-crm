
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Icon from '../components/Icon';
import { Plan, Payment, Invoice, PaymentStatus, InvoiceStatus, Tenant } from '../types';
import { useI18n } from '../context/i18n';
import PlanModal from '../components/PlanModal';
import InvoiceModal from '../components/InvoiceModal';
import InvoiceTemplate from '../components/InvoiceTemplate';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuditLog } from '../context/AuditLogContext';
import PlanCardSkeleton from '../components/PlanCardSkeleton';


const initialPlans: Plan[] = [
    { id: 1, name: 'المجانية', type: 'Free', priceMonthly: 0, priceYearly: 0, trialDays: 0, users: 2, clients: 10, storage: 1, features: 'ميزة أساسية 1\nميزة أساسية 2', visible: true },
    { id: 2, name: 'الفضية', type: 'Paid', priceMonthly: 49, priceYearly: 499, trialDays: 0, users: 10, clients: 100, storage: 10, features: 'كل الميزات الأساسية\nدعم عبر البريد الإلكتروني', visible: true },
    { id: 3, name: 'الذهبية', type: 'Paid', priceMonthly: 99, priceYearly: 999, trialDays: 0, users: 50, clients: 500, storage: 50, features: 'كل الميزات المتقدمة\nدعم فني ذو أولوية', visible: true },
    { id: 4, name: 'التجريبية', type: 'Trial', priceMonthly: 0, priceYearly: 0, trialDays: 14, users: 5, clients: 20, storage: 2, features: 'جميع ميزات الخطة الذهبية لمدة 14 يومًا', visible: true },
];

const mockPayments: Payment[] = [
    { id: 'pay_123', companyName: 'Tech Solutions Inc.', amount: 99, plan: 'الذهبية', status: PaymentStatus.Successful, date: '2023-10-15' },
    { id: 'pay_124', companyName: 'Innovate Co.', amount: 49, plan: 'الفضية', status: PaymentStatus.Successful, date: '2023-10-14' },
    { id: 'pay_125', companyName: 'Data Systems', amount: 49, plan: 'الفضية', status: PaymentStatus.Failed, date: '2023-10-13' },
];

const mockInvoices: Invoice[] = [
    { id: 'inv_001', companyName: 'Tech Solutions Inc.', amount: 99, dueDate: '2023-11-15', status: InvoiceStatus.Due },
    { id: 'inv_002', companyName: 'Innovate Co.', amount: 49, dueDate: '2023-10-14', status: InvoiceStatus.Paid },
    { id: 'inv_003', companyName: 'Alpha Corp', amount: 499, dueDate: '2023-09-01', status: InvoiceStatus.Overdue },
];

interface SubscriptionsProps {
    tenants: Tenant[];
}

const PlansTab: React.FC<SubscriptionsProps> = ({ tenants }) => {
    const { t } = useI18n();
    const { addLog } = useAuditLog();
    const [plans, setPlans] = useState<Plan[]>(initialPlans);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const handleOpenModal = (plan: Plan | null) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPlan(null);
    };

    const handleSavePlan = (planToSave: Omit<Plan, 'id'> & { id?: number }) => {
        if (planToSave.id) {
            setPlans(plans.map(p => p.id === planToSave.id ? planToSave as Plan : p));
            addLog('audit.log.planUpdated', { planName: planToSave.name });
        } else {
            const newPlan: Plan = {
                id: plans.length > 0 ? Math.max(...plans.map(p => p.id)) + 1 : 1,
                ...planToSave
            } as Plan;
            setPlans([newPlan, ...plans]);
            addLog('audit.log.planCreated', { planName: newPlan.name });
        }
        handleCloseModal();
    };

    const handleDeletePlan = (planId: number) => {
        if(window.confirm('Are you sure you want to delete this plan?')) {
            setPlans(plans.filter(p => p.id !== planId));
            addLog('audit.log.planDeleted', { planId });
        }
    };

    const handleToggleVisibility = (planId: number) => {
        let planName = '';
        const updatedPlans = plans.map(p => {
            if (p.id === planId) {
                planName = p.name;
                return { ...p, visible: !p.visible };
            }
            return p;
        });
        setPlans(updatedPlans);
        addLog('audit.log.planVisibilityToggled', { planName });
    };

    return (
    <div>
        <div className="flex justify-end mb-6">
            <button onClick={() => handleOpenModal(null)} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center shadow-md transition-transform transform hover:scale-105">
                <Icon name="plus" className="w-5 h-5 mx-2" />
                {t('subscriptions.plans.createPlan')}
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
                [...Array(4)].map((_, i) => <PlanCardSkeleton key={i} />)
            ) : (
                plans.map(plan => {
                    const isDeletable = !tenants.some(tenant => tenant.currentPlan === plan.name);
                    return (
                        <div key={plan.id} className="bg-primary-50 dark:bg-gray-800 rounded-lg shadow-md p-6 border-t-4 border-primary-500 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                            
                            <div className="my-4">
                                {plan.type === 'Paid' ? (
                                    <p className="text-4xl font-extrabold text-gray-900 dark:text-white">${plan.priceMonthly}<span className="text-base font-normal text-gray-500 dark:text-gray-400">/{t('common.month')}</span></p>
                                ) : (
                                    <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{t(`subscriptions.plans.type.${plan.type}`)}</p>
                                )}
                                {plan.type === 'Paid' && <p className="text-sm text-gray-500 dark:text-gray-400">${plan.priceYearly}/{t('common.year')}</p>}
                            </div>

                            <ul className="space-y-2 text-gray-600 dark:text-gray-300 flex-grow mb-6">
                                <li><span className="font-semibold">{plan.users}</span> {t('subscriptions.plans.users')}</li>
                                <li><span className="font-semibold">{plan.clients}</span> {t('subscriptions.plans.clients')}</li>
                                <li><span className="font-semibold">{plan.storage}</span> {t('subscriptions.plans.storageGB')}</li>
                            </ul>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={plan.visible} onChange={() => handleToggleVisibility(plan.id)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                        <span className="mx-3 text-sm font-medium text-gray-700 dark:text-gray-300">{t('subscriptions.plans.show')}</span>
                                    </label>
                                </div>
                                <div className="flex items-center justify-end space-x-2">
                                    <button onClick={() => handleOpenModal(plan)} className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title={t('subscriptions.plans.editPlan')}><Icon name="edit" className="w-5 h-5"/></button>
                                    <button 
                                        onClick={() => handleDeletePlan(plan.id)} 
                                        disabled={!isDeletable}
                                        className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-500"
                                        title={isDeletable ? t('subscriptions.plans.deletePlan') : t('subscriptions.plans.deleteDisabledTooltip')}
                                    >
                                        <Icon name="trash" className="w-5 h-5"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })
            )}
        </div>
        <PlanModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSavePlan}
            planToEdit={editingPlan}
        />
    </div>
)};

const PaymentsTab: React.FC = () => {
    const { t } = useI18n();
    const statusColors: { [key in PaymentStatus]: string } = {
        [PaymentStatus.Successful]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        [PaymentStatus.Failed]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };

    const handleExport = () => {
        const headers = [
            `"${t('subscriptions.payments.table.transactionId')}"`,
            `"${t('subscriptions.payments.table.companyName')}"`,
            `"${t('subscriptions.payments.table.amount')}"`,
            `"${t('subscriptions.payments.table.status')}"`,
            `"${t('subscriptions.payments.table.date')}"`
        ];

        const rows = mockPayments.map(p => 
            [
                `"${p.id}"`,
                `"${p.companyName}"`,
                `"${p.amount}"`,
                `"${t(`status.${p.status}`)}"`,
                `"${p.date}"`
            ].join(',')
        );

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "payments-history.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
             <div className="flex justify-end mb-4">
                <button onClick={handleExport} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center">
                    <Icon name="export" className="w-5 h-5 mx-2"/>
                    {t('subscriptions.payments.export')}
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                     <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">{t('subscriptions.payments.table.transactionId')}</th>
                            <th className="px-6 py-3">{t('subscriptions.payments.table.companyName')}</th>
                            <th className="px-6 py-3">{t('subscriptions.payments.table.amount')}</th>
                            <th className="px-6 py-3">{t('subscriptions.payments.table.status')}</th>
                            <th className="px-6 py-3">{t('subscriptions.payments.table.date')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockPayments.map(p => (
                            <tr key={p.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td className="px-6 py-4 font-mono">{p.id}</td>
                                <td className="px-6 py-4">{p.companyName}</td>
                                <td className="px-6 py-4">${p.amount}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[p.status]}`}>{t(`status.${p.status}`)}</span></td>
                                <td className="px-6 py-4">{p.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
};

const InvoicesTab: React.FC = () => {
    const { t } = useI18n();
    const { logoUrl } = useTheme();
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const downloadRef = useRef<HTMLDivElement>(null);
    const downloadRootRef = useRef<any>(null);

    const statusColors: { [key in InvoiceStatus]: string } = {
        [InvoiceStatus.Paid]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        [InvoiceStatus.Due]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        [InvoiceStatus.Overdue]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };

    const handleViewInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedInvoice(null);
    };

    const handleDownloadImage = async (invoice: Invoice) => {
        setDownloadingId(invoice.id);
        const downloadContainer = downloadRef.current;
        if (downloadContainer) {
            if (!downloadRootRef.current) {
                downloadRootRef.current = ReactDOM.createRoot(downloadContainer);
            }

            downloadRootRef.current.render(
                <React.StrictMode>
                    <InvoiceTemplate invoice={invoice} logoUrl={logoUrl} t={t} />
                </React.StrictMode>
            );

            await new Promise(resolve => setTimeout(resolve, 500));

            const elementToCapture = downloadContainer.firstChild as HTMLElement;

            if (!elementToCapture) {
                console.error('Failed to find the rendered invoice element for download.');
                setDownloadingId(null);
                return;
            }

            try {
                // @ts-ignore
                const canvas = await html2canvas(elementToCapture, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: null,
                });
                const link = document.createElement('a');
                link.download = `invoice-${invoice.id}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) {
                console.error('Failed to download invoice:', error);
            } finally {
                downloadRootRef.current.render(null);
            }
        }
        setDownloadingId(null);
    };


    const handleExport = () => {
        const headers = [
            `"${t('subscriptions.invoices.table.invoiceNo')}"`,
            `"${t('subscriptions.invoices.table.companyName')}"`,
            `"${t('subscriptions.invoices.table.amount')}"`,
            `"${t('subscriptions.invoices.table.status')}"`,
            `"${t('subscriptions.invoices.table.dueDate')}"`
        ];

        const rows = mockInvoices.map(i => 
            [
                `"${i.id}"`,
                `"${i.companyName}"`,
                `"${i.amount}"`,
                `"${t(`status.${i.status}`)}"`,
                `"${i.dueDate}"`
            ].join(',')
        );

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "invoices.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <div className="flex justify-end mb-4">
                    <button onClick={handleExport} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center">
                        <Icon name="export" className="w-5 h-5 mx-2"/>
                        {t('subscriptions.payments.export')}
                    </button>
                </div>
                 <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">{t('subscriptions.invoices.table.invoiceNo')}</th>
                                <th className="px-6 py-3">{t('subscriptions.invoices.table.companyName')}</th>
                                <th className="px-6 py-3">{t('subscriptions.invoices.table.amount')}</th>
                                <th className="px-6 py-3">{t('subscriptions.invoices.table.status')}</th>
                                <th className="px-6 py-3">{t('subscriptions.invoices.table.dueDate')}</th>
                                <th className="px-6 py-3 text-center">{t('tenants.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockInvoices.map(i => (
                                <tr key={i.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4 font-mono">{i.id}</td>
                                    <td className="px-6 py-4">{i.companyName}</td>
                                    <td className="px-6 py-4">${i.amount}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[i.status]}`}>{t(`status.${i.status}`)}</span></td>
                                    <td className="px-6 py-4">{i.dueDate}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button onClick={() => handleViewInvoice(i)} className="p-1 text-blue-600 hover:text-blue-800" title={t('subscriptions.invoices.viewInvoice')}><Icon name="view" className="w-5 h-5"/></button>
                                            <button onClick={() => handleDownloadImage(i)} disabled={!!downloadingId} className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-wait" title={t('subscriptions.invoices.downloadInvoice')}>
                                                {downloadingId === i.id ? <div className="w-5 h-5"><LoadingSpinner/></div> : <Icon name="download" className="w-5 h-5"/>}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <InvoiceModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                invoice={selectedInvoice}
                logoUrl={logoUrl}
            />
            <div ref={downloadRef} style={{ position: 'fixed', top: 0, left: '-9999px', zIndex: -10 }} />
        </>
    )
};

const Subscriptions: React.FC<SubscriptionsProps> = ({ tenants }) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('plans');

  const tabs = [
    { id: 'plans', label: t('subscriptions.tabs.plans') },
    { id: 'payments', label: t('subscriptions.tabs.payments') },
    { id: 'invoices', label: t('subscriptions.tabs.invoices') },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('subscriptions.title')}</h1>
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {activeTab === 'plans' && <PlansTab tenants={tenants} />}
      {activeTab === 'payments' && <PaymentsTab />}
      {activeTab === 'invoices' && <InvoicesTab />}
    </div>
  );
};

export default Subscriptions;
