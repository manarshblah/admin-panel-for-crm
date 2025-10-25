import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import Icon from '../components/Icon';
import Skeleton from '../components/Skeleton';
import { useI18n } from '../context/i18n';

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: string;
  colors: {
    bg: string;
    iconContainer: string;
    icon: string;
  };
  loading?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, change, changeType, icon, colors, loading }) => {
    const { language } = useI18n();
    const changeColor = changeType === 'increase' ? 'text-green-500' : 'text-red-500';

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-4" />
                        <Skeleton className="h-8 w-1/2" />
                    </div>
                    <Skeleton className="w-12 h-12 rounded-full" />
                </div>
                <Skeleton className="h-4 w-1/4 mt-4" />
            </div>
        );
    }

    return (
      <div className={`relative p-6 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl ${colors.bg}`}>
        <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{title}</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
        <p className={`mt-2 text-sm ${changeColor}`}>{change}</p>
        
        <div className={`absolute bottom-4 ${language === 'ar' ? 'left-4' : 'right-4'} p-3 rounded-full ${colors.iconContainer}`}>
            <Icon name={icon} className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
    );
};

const Dashboard: React.FC = () => {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
    }, 2000);
  };

  const kpiData = [
    {
      title: t('dashboard.kpi.mrr'),
      value: "$12,345",
      change: "+2.5%",
      changeType: "increase" as const,
      icon: "cash",
      colors: {
        bg: 'bg-blue-50 dark:bg-gray-800',
        iconContainer: 'bg-blue-100 dark:bg-blue-900/50',
        icon: 'text-blue-600 dark:text-blue-400'
      }
    },
    {
      title: t('dashboard.kpi.activeTenants'),
      value: "150",
      change: "+10",
      changeType: "increase" as const,
      icon: "tenants",
      colors: {
        bg: 'bg-green-50 dark:bg-gray-800',
        iconContainer: 'bg-green-100 dark:bg-green-900/50',
        icon: 'text-green-600 dark:text-green-400'
      }
    },
    {
      title: t('dashboard.kpi.newSubscriptions'),
      value: "25",
      change: "-2",
      changeType: "decrease" as const,
      icon: "trending-up",
      colors: {
        bg: 'bg-yellow-50 dark:bg-gray-800',
        iconContainer: 'bg-yellow-100 dark:bg-yellow-900/50',
        icon: 'text-yellow-600 dark:text-yellow-400'
      }
    },
    {
      title: t('dashboard.kpi.expiringSubscriptions'),
      value: "8",
      change: "+1",
      changeType: "increase" as const,
      icon: "clock",
      colors: {
        bg: 'bg-indigo-50 dark:bg-gray-800',
        iconContainer: 'bg-indigo-100 dark:bg-indigo-900/50',
        icon: 'text-indigo-600 dark:text-indigo-400'
      }
    },
  ];

  const revenueData = [
    { name: 'Jan', revenue: 4000, profit: 2400 }, { name: 'Feb', revenue: 3000, profit: 1800 }, { name: 'Mar', revenue: 5000, profit: 3200 },
    { name: 'Apr', revenue: 4500, profit: 2800 }, { name: 'May', revenue: 6000, profit: 4000 }, { name: 'Jun', revenue: 5500, profit: 3500 },
    { name: 'Jul', revenue: 7000, profit: 4500 }, { name: 'Aug', revenue: 6500, profit: 4200 }, { name: 'Sep', revenue: 7500, profit: 5000 },
    { name: 'Oct', revenue: 8000, profit: 5500 }, { name: 'Nov', revenue: 9000, profit: 6000 }, { name: 'Dec', revenue: 8500, profit: 5800 },
  ];

  const planData = [
    { name: 'Free', count: 50 }, { name: 'Basic', count: 45 },
    { name: 'Pro', count: 35 }, { name: 'Enterprise', count: 20 },
  ];

  const recentCompanies = [
      { name: "Tech Solutions Inc.", plan: "Pro" },
      { name: "Innovate Co.", plan: "Basic" },
      { name: "Data Systems", plan: "Enterprise" },
      { name: "Creative Minds", plan: "Free" },
      { name: "Future Forward", plan: "Pro" },
  ];

  const recentPayments = [
      { name: "Global Corp", amount: "$299" },
      { name: "Web Weavers", amount: "$99" },
      { name: "Digital Dreams", amount: "$299" },
      { name: "Alpha Tech", amount: "$499" },
      { name: "Beta Innovations", amount: "$99" },
  ];
  
  const ListSkeleton: React.FC = () => (
    <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-1/4" />
            </div>
        ))}
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
        <div className="flex items-center space-x-2">
            <input type="date" className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm"/>
            <button 
              onClick={handleRefresh}
              className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              disabled={loading}
            >
                <Icon name="refresh" className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((item, index) => <KpiCard key={index} {...item} loading={loading} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">{t('dashboard.revenueGrowth.title')}</h3>
            {loading ? <Skeleton className="w-full h-[300px]" /> : (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none' }}/>
                        <Legend />
                        <Line type="monotone" dataKey="revenue" name={t('dashboard.revenueGrowth.revenue')} stroke="hsl(var(--color-primary-500))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                        <Line type="monotone" dataKey="profit" name={t('dashboard.revenueGrowth.profit')} stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">{t('dashboard.planDistribution.title')}</h3>
             {loading ? <Skeleton className="w-full h-[300px]" /> : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={planData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={80} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: 'rgba(107, 114, 128, 0.1)'}} contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', border: 'none' }}/>
                        <Legend />
                        <Bar dataKey="count" name={t('dashboard.planDistribution.tenants')} fill="hsl(var(--color-primary-500))" barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
             )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">{t('dashboard.recentCompanies.title')}</h3>
            {loading ? <ListSkeleton /> : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentCompanies.map((company, index) => (
                        <li key={index} className="py-3 flex justify-between items-center">
                            <span className="font-medium">{company.name}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{company.plan}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">{t('dashboard.recentPayments.title')}</h3>
            {loading ? <ListSkeleton /> : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentPayments.map((payment, index) => (
                        <li key={index} className="py-3 flex justify-between items-center">
                            <span className="font-medium">{payment.name}</span>
                            <span className="text-sm font-semibold text-green-500">{payment.amount}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;