
import React, { useState } from 'react';
import Icon from '../components/Icon';
import { Broadcast } from '../types';
import { useI18n } from '../context/i18n';
import BroadcastViewModal from '../components/BroadcastViewModal';

const initialHistory: Broadcast[] = [
    { id: 1, subject: 'تحديثات جديدة للمنصة', target: 'كل الشركات', date: '2023-10-10', status: 'Sent', content: 'يسعدنا أن نعلن عن إطلاق ميزات جديدة ومثيرة في المنصة. قم بتسجيل الدخول الآن لاستكشافها. شكراً لكونك جزءاً من مجتمعنا.' },
    { id: 2, subject: 'صيانة مجدولة', target: 'مشتركي الخطة الذهبية', date: '2023-10-15', status: 'Scheduled', content: 'سنقوم بإجراء صيانة مجدولة للنظام يوم السبت القادم الساعة 2 صباحًا. من المتوقع أن يستمر التوقف لمدة 30 دقيقة. نعتذر عن أي إزعاج.' },
    { id: 3, subject: 'عرض خاص', target: 'الحسابات التجريبية', date: '2023-09-25', status: 'Sent', content: 'هل تستمتع بتجربتك؟ قم بالترقية إلى خطة مدفوعة هذا الأسبوع واحصل على خصم 20% على أول 3 أشهر. لا تفوت الفرصة!' },
];

const NewBroadcast: React.FC = () => {
    const { t } = useI18n();
    return(
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">{t('communication.new.title')}</h2>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">{t('communication.new.to')}</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600">
                    <option>{t('communication.new.target.all')}</option>
                    <option>{t('communication.new.target.gold')}</option>
                    <option>{t('communication.new.target.trial')}</option>
                    <option>{t('communication.new.target.expired')}</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">{t('communication.new.subject')}</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">{t('communication.new.content')}</label>
                <textarea rows={8} className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"></textarea>
            </div>
            <div className="flex justify-end space-x-2">
                <button className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md text-sm font-medium">{t('communication.new.saveDraft')}</button>
                <button className="px-4 py-2 bg-yellow-500 text-white rounded-md text-sm font-medium">{t('communication.new.schedule')}</button>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium">{t('communication.new.sendNow')}</button>
            </div>
        </div>
    </div>
)};

interface HistoryProps {
    history: Broadcast[];
    onView: (broadcast: Broadcast) => void;
    onDelete: (id: number) => void;
}

const History: React.FC<HistoryProps> = ({ history, onView, onDelete }) => {
    const { t } = useI18n();

    const statusTranslations: { [key in Broadcast['status']]: string } = {
        'Sent': t('communication.history.status.sent'),
        'Scheduled': t('communication.history.status.scheduled'),
    };

    const handleDelete = (id: number) => {
        if (window.confirm(t('communication.history.deleteConfirm'))) {
            onDelete(id);
        }
    };

    return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th className="px-6 py-3">{t('communication.history.table.subject')}</th>
                        <th className="px-6 py-3">{t('communication.history.table.target')}</th>
                        <th className="px-6 py-3">{t('communication.history.table.date')}</th>
                        <th className="px-6 py-3">{t('communication.history.table.status')}</th>
                        <th className="px-6 py-3">{t('communication.history.table.actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map(item => (
                        <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td className="px-6 py-4">{item.subject}</td>
                            <td className="px-6 py-4">{item.target}</td>
                            <td className="px-6 py-4">{item.date}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.status === 'Sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{statusTranslations[item.status]}</span>
                            </td>
                            <td className="px-6 py-4 space-x-2">
                                <button onClick={() => onView(item)} className="p-1 text-blue-600 hover:text-blue-800" title={t('communication.history.actions.view')}><Icon name="view" className="w-5 h-5"/></button>
                                {item.status === 'Scheduled' && <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:text-red-800" title={t('communication.history.actions.delete')}><Icon name="trash" className="w-5 h-5"/></button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
)};

const Communication: React.FC = () => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState('new');
    const [history, setHistory] = useState<Broadcast[]>(initialHistory);
    const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    
    const tabs = [
        { id: 'new', label: t('communication.tabs.new') },
        { id: 'history', label: t('communication.tabs.history') },
    ];

    const handleViewBroadcast = (broadcast: Broadcast) => {
        setSelectedBroadcast(broadcast);
        setIsViewModalOpen(true);
    };

    const handleDeleteBroadcast = (id: number) => {
        setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
    };

    const handleCloseModal = () => {
        setIsViewModalOpen(false);
        setSelectedBroadcast(null);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('communication.title')}</h1>
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
            {activeTab === 'new' && <NewBroadcast />}
            {activeTab === 'history' && <History history={history} onView={handleViewBroadcast} onDelete={handleDeleteBroadcast} />}
            <BroadcastViewModal 
                isOpen={isViewModalOpen}
                onClose={handleCloseModal}
                broadcast={selectedBroadcast}
            />
        </div>
    );
};

export default Communication;
