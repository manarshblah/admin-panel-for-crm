
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
import { getPlansAPI, createPlanAPI, updatePlanAPI, deletePlanAPI, getSubscriptionsAPI, updateSubscriptionAPI, getCompaniesAPI, getInvoicesAPI } from '../services/api';
import { getPaymentsAPI } from '../services/api';


interface SubscriptionsProps {
    tenants: Tenant[];
}

const PlansTab: React.FC<SubscriptionsProps> = ({ tenants }) => {
    const { t, language } = useI18n();
    const { addLog } = useAuditLog();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        setIsLoading(true);
        try {
            const response = await getPlansAPI();
            // Map API plan fields to frontend format
            const apiPlans = (response.results || []).map((plan: any) => ({
                id: plan.id,
                name: plan.name, // API field: name
                type: 'Paid' as const, // Default to Paid, can be enhanced based on plan.type if available
                priceMonthly: parseFloat(plan.price_monthly || 0), // API field: price_monthly
                priceYearly: parseFloat(plan.price_yearly || 0), // API field: price_yearly
                trialDays: plan.trial_days || 0, // API field: trial_days
                users: plan.users || 'unlimited' as const, // API field: users
                clients: plan.clients || 'unlimited' as const, // API field: clients
                storage: plan.storage || 10, // API field: storage
                features: plan.description || '', // API field: description
                visible: plan.visible !== false, // API field: visible
            }));
            setPlans(apiPlans);
        } catch (error) {
            console.error('Error loading plans:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (plan: Plan | null) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPlan(null);
    };

    const handleSavePlan = async (planToSave: Omit<Plan, 'id'> & { id?: number }) => {
        try {
            if (planToSave.id) {
                // Use API field names
                await updatePlanAPI(planToSave.id, {
                    name: planToSave.name, // API field: name
                    description: planToSave.features, // API field: description
                    price_monthly: planToSave.priceMonthly, // API field: price_monthly
                    price_yearly: planToSave.priceYearly, // API field: price_yearly
                    trial_days: planToSave.trialDays, // API field: trial_days
                    users: planToSave.users, // API field: users
                    clients: planToSave.clients, // API field: clients
                    storage: planToSave.storage, // API field: storage
                    visible: planToSave.visible, // API field: visible
                });
                addLog('audit.log.planUpdated', { planName: planToSave.name });
            } else {
                // Use API field names
                await createPlanAPI({
                    name: planToSave.name, // API field: name
                    description: planToSave.features, // API field: description
                    price_monthly: planToSave.priceMonthly, // API field: price_monthly
                    price_yearly: planToSave.priceYearly, // API field: price_yearly
                    trial_days: planToSave.trialDays, // API field: trial_days
                    users: planToSave.users, // API field: users
                    clients: planToSave.clients, // API field: clients
                    storage: planToSave.storage, // API field: storage
                    visible: planToSave.visible !== false, // API field: visible
                });
                addLog('audit.log.planCreated', { planName: planToSave.name });
            }
            await loadPlans();
            handleCloseModal();
        } catch (error: any) {
            console.error('Error saving plan:', error);
            alert(error.message || 'Failed to save plan');
        }
    };

    const handleDeletePlan = async (planId: number) => {
        if(window.confirm('Are you sure you want to delete this plan?')) {
            try {
                await deletePlanAPI(planId);
                addLog('audit.log.planDeleted', { planId });
                await loadPlans();
            } catch (error: any) {
                console.error('Error deleting plan:', error);
                alert(error.message || 'Failed to delete plan');
            }
        }
    };

    const handleToggleVisibility = async (planId: number) => {
        const planToToggle = plans.find(p => p.id === planId);
        if (!planToToggle) return;

        try {
            // Use API field names
            await updatePlanAPI(planId, {
                visible: !planToToggle.visible, // API field: visible
            });
            await loadPlans();
            addLog('audit.log.planVisibilityToggled', { planName: planToToggle.name });
        } catch (error: any) {
            console.error('Error toggling plan visibility:', error);
            alert(error.message || 'Failed to toggle plan visibility');
        }
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
            ) : plans.length === 0 ? (
                <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">{t('subscriptions.plans.noPlans') || 'No plans found. Create your first plan to get started.'}</p>
                </div>
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

                            {plan.features && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{plan.features}</p>
                                </div>
                            )}
                            <ul className="space-y-2 text-gray-600 dark:text-gray-300 flex-grow mb-6">
                                <li className="flex items-center">
                                    <Icon name="users" className="w-4 h-4 mr-2 text-primary-600" />
                                    <span className="font-semibold">{plan.users === 'unlimited' ? t('subscriptions.plans.unlimited') || 'Unlimited' : plan.users}</span> {t('subscriptions.plans.users')}
                                </li>
                                <li className="flex items-center">
                                    <Icon name="users" className="w-4 h-4 mr-2 text-primary-600" />
                                    <span className="font-semibold">{plan.clients === 'unlimited' ? t('subscriptions.plans.unlimited') || 'Unlimited' : plan.clients}</span> {t('subscriptions.plans.clients')}
                                </li>
                                <li className="flex items-center">
                                    <Icon name="database" className="w-4 h-4 mr-2 text-primary-600" />
                                    <span className="font-semibold">{plan.storage}</span> {t('subscriptions.plans.storageGB')}
                                </li>
                                {plan.trialDays > 0 && (
                                    <li className="flex items-center">
                                        <Icon name="clock" className="w-4 h-4 mr-2 text-primary-600" />
                                        <span className="font-semibold">{plan.trialDays}</span> {t('subscriptions.plans.trialDays') || 'Trial Days'}
                                    </li>
                                )}
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
    const { t, language } = useI18n();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        setIsLoading(true);
        try {
            const response = await getPaymentsAPI();
            // Map API payment fields to frontend format
            const apiPayments: Payment[] = (response.results || []).map((payment: any) => ({
                id: payment.id.toString(), // API field: id
                companyName: payment.subscription_company_name || 'Unknown', // From subscription relation
                amount: parseFloat(payment.amount || 0), // API field: amount
                plan: payment.subscription_plan_name || 'Unknown', // From subscription relation
                status: payment.payment_status === 'successful' || payment.payment_status === 'Success' 
                    ? PaymentStatus.Successful 
                    : PaymentStatus.Failed, // API field: payment_status
                date: payment.created_at ? new Date(payment.created_at).toISOString().split('T')[0] : '', // API field: created_at
            }));
            setPayments(apiPayments);
        } catch (error) {
            console.error('Error loading payments:', error);
        } finally {
            setIsLoading(false);
        }
    };

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

        const rows = payments.map(p => 
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
                <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'} text-gray-500 dark:text-gray-400`}>
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
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    Loading payments...
                                </td>
                            </tr>
                        ) : payments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    {t('subscriptions.payments.noPayments')}
                                </td>
                            </tr>
                        ) : (
                            payments.map(p => (
                                <tr key={p.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4 font-mono">{p.id}</td>
                                    <td className="px-6 py-4">{p.companyName}</td>
                                    <td className="px-6 py-4">${p.amount}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[p.status]}`}>{t(`status.${p.status}`)}</span></td>
                                    <td className="px-6 py-4">{p.date}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
};

const InvoicesTab: React.FC = () => {
    const { t, language } = useI18n();
    const { logoUrl } = useTheme();
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        setIsLoading(true);
        try {
            const response = await getInvoicesAPI();
            // Map API invoice fields to frontend format
            const apiInvoices: Invoice[] = (response.results || []).map((invoice: any) => ({
                id: invoice.invoice_number || `inv_${invoice.id}`, // API field: invoice_number
                companyName: invoice.company_name || 'Unknown', // From subscription relation
                amount: parseFloat(invoice.amount || 0), // API field: amount
                dueDate: invoice.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : '', // API field: due_date
                status: invoice.status === 'paid' ? InvoiceStatus.Paid 
                    : invoice.status === 'overdue' ? InvoiceStatus.Overdue 
                    : InvoiceStatus.Due, // API field: status
            }));
            setInvoices(apiInvoices);
        } catch (error) {
            console.error('Error loading invoices:', error);
        } finally {
            setIsLoading(false);
        }
    };

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

        const rows = invoices.map(i => 
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
                     <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'} text-gray-500 dark:text-gray-400`}>
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
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        Loading invoices...
                                    </td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        {t('subscriptions.invoices.noInvoices')}
                                    </td>
                                </tr>
                            ) : (
                                invoices.map(i => (
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
                            ))
                            )}
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

const SubscriptionsTab: React.FC<SubscriptionsProps> = ({ tenants }) => {
  const { t, language } = useI18n();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const [subscriptionsRes, companiesRes, plansRes] = await Promise.all([
        getSubscriptionsAPI(),
        getCompaniesAPI(),
        getPlansAPI()
      ]);

      const subs = subscriptionsRes.results || [];
      const companies = companiesRes.results || [];
      const plans = plansRes.results || [];

      // Map subscriptions with company and plan names
      const mappedSubs = subs.map((sub: any) => {
        const company = companies.find((c: any) => c.id === sub.company);
        const plan = plans.find((p: any) => p.id === sub.plan);
        return {
          ...sub,
          company_name: company?.name || 'Unknown',
          plan_name: plan?.name || 'Unknown',
        };
      });

      setSubscriptions(mappedSubs);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (subscription: any) => {
    try {
      await updateSubscriptionAPI(subscription.id, {
        ...subscription,
        is_active: !subscription.is_active
      });
      await loadSubscriptions();
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      alert(error.message || 'Failed to update subscription');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">{t('subscriptions.subscriptions.table.companyName')}</th>
              <th className="px-6 py-3">{t('subscriptions.subscriptions.table.plan')}</th>
              <th className="px-6 py-3">{t('subscriptions.subscriptions.table.startDate')}</th>
              <th className="px-6 py-3">{t('subscriptions.subscriptions.table.endDate')}</th>
              <th className="px-6 py-3">{t('subscriptions.subscriptions.table.status')}</th>
              <th className="px-6 py-3 text-center">{t('subscriptions.subscriptions.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Loading subscriptions...
                </td>
              </tr>
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  {t('subscriptions.subscriptions.noSubscriptions') || 'No subscriptions found'}
                </td>
              </tr>
            ) : (
              subscriptions.map((sub: any) => {
                const statusColor = sub.is_active 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
                return (
                <tr key={sub.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {sub.company_name}
                  </td>
                  <td className="px-6 py-4">{sub.plan_name}</td>
                  <td className="px-6 py-4">
                    {sub.start_date ? new Date(sub.start_date).toISOString().split('T')[0] : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {sub.end_date ? new Date(sub.end_date).toISOString().split('T')[0] : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      sub.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {sub.is_active ? t('status.Active') : t('status.Inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={sub.is_active} 
                          onChange={() => handleToggleActive(sub)} 
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Subscriptions: React.FC<SubscriptionsProps> = ({ tenants }) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('plans');

  const tabs = [
    { id: 'plans', label: t('subscriptions.tabs.plans') },
    { id: 'subscriptions', label: t('subscriptions.tabs.subscriptions') || 'Subscriptions' },
    { id: 'payments', label: t('subscriptions.tabs.payments') },
    { id: 'invoices', label: t('subscriptions.tabs.invoices') },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('subscriptions.title')}</h1>
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex gap-8" aria-label="Tabs">
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
      {activeTab === 'subscriptions' && <SubscriptionsTab tenants={tenants} />}
      {activeTab === 'payments' && <PaymentsTab />}
      {activeTab === 'invoices' && <InvoicesTab />}
    </div>
  );
};

export default Subscriptions;
