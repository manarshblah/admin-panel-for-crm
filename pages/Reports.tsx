
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../components/Icon';
import { useI18n } from '../context/i18n';
import { getPaymentsAPI, getSubscriptionsAPI, getCompaniesAPI } from '../services/api';
import Skeleton from '../components/Skeleton';

const COLORS = ['#3b82f6', '#ef4444'];


const RevenueReports: React.FC = () => {
    const { t, language } = useI18n();
    const [mrrData, setMrrData] = useState<Array<{month: string; MRR: number; ARR: number}>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        loadRevenueData();
    }, [language, t]);

    const loadRevenueData = async () => {
        setIsLoading(true);
        try {
            const paymentsRes = await getPaymentsAPI();
            const payments = paymentsRes.results || [];

            // Calculate MRR and ARR by month
            const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            const revenueByMonth: Array<{month: string; MRR: number; ARR: number}> = [];
            
            // Initialize last 12 months with translated names
            const now = new Date();
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthIndex = date.getMonth();
                const monthKey = monthKeys[monthIndex];
                const monthName = t(`dashboard.months.${monthKey}`);
                revenueByMonth.push({ month: monthName, MRR: 0, ARR: 0 });
            }

            // Process payments (API field: payment_status, amount, created_at)
            payments.forEach((payment: any) => {
                if (payment.payment_status === 'successful' || payment.payment_status === 'Success') {
                    const paymentDate = new Date(payment.created_at);
                    const monthIndex = paymentDate.getMonth();
                    const monthKey = monthKeys[monthIndex];
                    const monthName = t(`dashboard.months.${monthKey}`);
                    const monthData = revenueByMonth.find(m => m.month === monthName);
                    if (monthData) {
                        const amount = parseFloat(payment.amount || 0);
                        monthData.MRR += amount;
                        monthData.ARR += amount * 12; // Annualized
                    }
                }
            });

            setMrrData(revenueByMonth);
        } catch (error) {
            console.error('Error loading revenue data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        const csvContent = [
            ['Month', 'MRR', 'ARR'],
            ...mrrData.map(d => [d.month, d.MRR.toString(), d.ARR.toString()])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'revenue-report.csv';
        link.click();
    };

    return (
    <div className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <h2 className="text-2xl font-semibold">{t('reports.revenue.title')}</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <label htmlFor="revenueFromDate" className="text-sm font-medium whitespace-nowrap">{t('reports.filter.from')}</label>
                    <input 
                        id="revenueFromDate" 
                        type="date" 
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm w-full"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <label htmlFor="revenueToDate" className="text-sm font-medium whitespace-nowrap">{t('reports.filter.to')}</label>
                    <input 
                        id="revenueToDate" 
                        type="date" 
                        className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm w-full"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </div>
                <button 
                    onClick={handleExport} 
                    className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center justify-center"
                    disabled={isLoading}
                >
                    <Icon name="pdf" className="w-5 h-5 mx-2"/> {t('reports.revenue.export')}
                </button>
            </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
             <h3 className="text-lg font-semibold mb-4">{t('reports.revenue.chartTitle')}</h3>
             {isLoading ? (
                 <Skeleton className="w-full h-[300px]" />
             ) : (
             <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mrrData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
                    <XAxis 
                        dataKey="month" 
                        interval={0}
                        angle={0}
                        textAnchor="middle"
                        height={60}
                        tick={{ fontSize: 11 }}
                        dy={10}
                    />
                    <YAxis 
                        tick={{ fontSize: 11, dx: language === 'ar' ? -5 : 0 }}
                        width={language === 'ar' ? 60 : 50}
                    />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none' }}/>
                        <Legend 
                            wrapperStyle={{ [language === 'ar' ? 'paddingRight' : 'paddingLeft']: '10px' }} 
                            formatter={(value) => ` ${value}`}
                            iconSize={12}
                        />
                        <Bar dataKey="MRR" fill="#3b82f6" name={t('reports.revenue.mrr')} />
                        <Bar dataKey="ARR" fill="#818cf8" name={t('reports.revenue.arr')} />
                </BarChart>
            </ResponsiveContainer>
             )}
        </div>
    </div>
)};


const SubscriberReports: React.FC = () => {
    const { t, language } = useI18n();
    const [subscriberData, setSubscriberData] = useState<Array<{month: string; new: number; churned: number}>>([]);
    const [conversionData, setConversionData] = useState<Array<{name: string; value: number}>>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSubscriberData();
    }, [language, t]);

    const loadSubscriberData = async () => {
        setIsLoading(true);
        try {
            const [subscriptionsRes, companiesRes] = await Promise.all([
                getSubscriptionsAPI(),
                getCompaniesAPI()
            ]);

            const subscriptions = subscriptionsRes.results || [];
            const companies = companiesRes.results || [];

            // Calculate new and churned subscriptions by month
            const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            const subscriberByMonth: Array<{month: string; new: number; churned: number}> = [];
            
            // Initialize last 12 months with translated names
            const now = new Date();
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthIndex = date.getMonth();
                const monthKey = monthKeys[monthIndex];
                const monthName = t(`dashboard.months.${monthKey}`);
                subscriberByMonth.push({ month: monthName, new: 0, churned: 0 });
            }

            // Process subscriptions (API fields: created_at, is_active, end_date)
            subscriptions.forEach((sub: any) => {
                const createdDate = new Date(sub.created_at);
                const monthIndex = createdDate.getMonth();
                const monthKey = monthKeys[monthIndex];
                const monthName = t(`dashboard.months.${monthKey}`);
                const monthData = subscriberByMonth.find(m => m.month === monthName);
                if (monthData) {
                    monthData.new += 1;
                }

                // Check if churned (ended and not active)
                if (!sub.is_active && sub.end_date) {
                    const endDate = new Date(sub.end_date);
                    const endMonthIndex = endDate.getMonth();
                    const endMonthKey = monthKeys[endMonthIndex];
                    const endMonthName = t(`dashboard.months.${endMonthKey}`);
                    const endMonthData = subscriberByMonth.find(m => m.month === endMonthName);
                    if (endMonthData && endDate < now) {
                        endMonthData.churned += 1;
                    }
                }
            });

            setSubscriberData(subscriberByMonth);

            // Calculate conversion rate (active subscriptions vs total companies)
            const activeSubscriptions = subscriptions.filter((sub: any) => sub.is_active).length;
            const totalCompanies = companies.length;
            const converted = activeSubscriptions;
            const notConverted = Math.max(0, totalCompanies - activeSubscriptions);

            setConversionData([
                { name: t('reports.subscribers.converted'), value: converted },
                { name: t('reports.subscribers.notConverted'), value: notConverted }
            ]);
        } catch (error) {
            console.error('Error loading subscriber data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        const csvContent = [
            ['Month', 'New', 'Churned'],
            ...subscriberData.map(d => [d.month, d.new.toString(), d.churned.toString()])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'subscriber-report.csv';
        link.click();
    };

    return (
     <div className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <h2 className="text-2xl font-semibold">{t('reports.subscribers.title')}</h2>
             <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <button 
                    onClick={handleExport} 
                    className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center justify-center"
                    disabled={isLoading}
                >
                    <Icon name="pdf" className="w-5 h-5 mx-2"/> {t('reports.revenue.export')}
                </button>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                 <h3 className="text-lg font-semibold mb-4">{t('reports.subscribers.chart1Title')}</h3>
                 {isLoading ? (
                     <Skeleton className="w-full h-[300px]" />
                 ) : (
                 <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={subscriberData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
                            <XAxis 
                                dataKey="month" 
                                interval={0}
                                angle={0}
                                textAnchor="middle"
                                height={60}
                                tick={{ fontSize: 11 }}
                                dy={10}
                            />
                            <YAxis 
                                tick={{ fontSize: 11, dx: language === 'ar' ? -5 : 0 }}
                                width={language === 'ar' ? 60 : 50}
                            />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none' }}/>
                            <Legend 
                                wrapperStyle={{ [language === 'ar' ? 'paddingRight' : 'paddingLeft']: '10px' }} 
                                formatter={(value) => ` ${value}`}
                                iconSize={12}
                            />
                            <Line type="monotone" dataKey="new" name={t('reports.subscribers.new')} stroke="#10b981" />
                            <Line type="monotone" dataKey="churned" name={t('reports.subscribers.churned')} stroke="#ef4444" />
                        </LineChart>
                </ResponsiveContainer>
                 )}
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                 <h3 className="text-lg font-semibold mb-4">{t('reports.subscribers.chart2Title')}</h3>
                 {isLoading ? (
                     <Skeleton className="w-full h-[300px]" />
                 ) : (
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie 
                                data={conversionData} 
                                cx="50%" 
                                cy="50%" 
                                labelLine={false} 
                                outerRadius={80} 
                                fill="#8884d8" 
                                dataKey="value" 
                                label={false}
                            >
                                {conversionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                             <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none' }}/>
                             <Legend 
                                wrapperStyle={{ [language === 'ar' ? 'paddingRight' : 'paddingLeft']: '10px' }} 
                                formatter={(value) => ` ${value}`}
                                iconSize={12}
                            />
                        </PieChart>
                     </ResponsiveContainer>
                 )}
            </div>
        </div>
    </div>
)};


const Reports: React.FC = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('revenue');

  const tabs = [
    { id: 'revenue', label: t('reports.tabs.revenue') },
    { id: 'subscribers', label: t('reports.tabs.subscribers') },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('reports.title')}</h1>
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
      
      {activeTab === 'revenue' && <RevenueReports />}
      {activeTab === 'subscribers' && <SubscriberReports />}
    </div>
  );
};

export default Reports;
