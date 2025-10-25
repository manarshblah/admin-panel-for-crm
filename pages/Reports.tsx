
import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../components/Icon';
import { useI18n } from '../context/i18n';

const mrrData = [
    { month: 'Jan', MRR: 4000, ARR: 48000 },
    { month: 'Feb', MRR: 4200, ARR: 50400 },
    { month: 'Mar', MRR: 4500, ARR: 54000 },
    { month: 'Apr', MRR: 4800, ARR: 57600 },
    { month: 'May', MRR: 5100, ARR: 61200 },
    { month: 'Jun', MRR: 5500, ARR: 66000 },
];

const subscriberData = [
    { month: 'Jan', new: 10, churned: 2 },
    { month: 'Feb', new: 12, churned: 1 },
    { month: 'Mar', new: 15, churned: 3 },
    { month: 'Apr', new: 14, churned: 2 },
    { month: 'May', new: 18, churned: 1 },
    { month: 'Jun', new: 20, churned: 4 },
];

const conversionData = [{ name: 'Converted', value: 75 }, { name: 'Not Converted', value: 25 }];
const COLORS = ['#3b82f6', '#ef4444'];


const RevenueReports: React.FC = () => {
    const { t } = useI18n();
    return (
    <div className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <h2 className="text-2xl font-semibold">{t('reports.revenue.title')}</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <label htmlFor="revenueFromDate" className="text-sm font-medium whitespace-nowrap">{t('reports.filter.from')}</label>
                    <input id="revenueFromDate" type="date" className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm w-full"/>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <label htmlFor="revenueToDate" className="text-sm font-medium whitespace-nowrap">{t('reports.filter.to')}</label>
                    <input id="revenueToDate" type="date" className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm w-full"/>
                </div>
                <button className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center justify-center">
                    <Icon name="pdf" className="w-5 h-5 mx-2"/> {t('reports.revenue.export')}
                </button>
            </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
             <h3 className="text-lg font-semibold mb-4">{t('reports.revenue.chartTitle')}</h3>
             <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mrrData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none' }}/>
                    <Legend />
                    <Bar dataKey="MRR" fill="#3b82f6" name="MRR" />
                    <Bar dataKey="ARR" fill="#818cf8" name="ARR" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
)};


const SubscriberReports: React.FC = () => {
    const { t } = useI18n();

    const translatedConversionData = [
        { name: t('reports.subscribers.converted'), value: 75 }, 
        { name: t('reports.subscribers.notConverted'), value: 25 }
    ];

    return (
     <div className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <h2 className="text-2xl font-semibold">{t('reports.subscribers.title')}</h2>
             <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <label htmlFor="subscriberFromDate" className="text-sm font-medium whitespace-nowrap">{t('reports.filter.from')}</label>
                    <input id="subscriberFromDate" type="date" className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm w-full"/>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <label htmlFor="subscriberToDate" className="text-sm font-medium whitespace-nowrap">{t('reports.filter.to')}</label>
                    <input id="subscriberToDate" type="date" className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm w-full"/>
                </div>
                <button className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center justify-center">
                    <Icon name="pdf" className="w-5 h-5 mx-2"/> {t('reports.revenue.export')}
                </button>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                 <h3 className="text-lg font-semibold mb-4">{t('reports.subscribers.chart1Title')}</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={subscriberData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none' }}/>
                        <Legend />
                        <Line type="monotone" dataKey="new" name={t('reports.subscribers.new')} stroke="#10b981" />
                        <Line type="monotone" dataKey="churned" name={t('reports.subscribers.churned')} stroke="#ef4444" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                 <h3 className="text-lg font-semibold mb-4">{t('reports.subscribers.chart2Title')}</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={translatedConversionData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {translatedConversionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                         <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none' }}/>
                         <Legend />
                    </PieChart>
                 </ResponsiveContainer>
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
      
      {activeTab === 'revenue' && <RevenueReports />}
      {activeTab === 'subscribers' && <SubscriberReports />}
    </div>
  );
};

export default Reports;
