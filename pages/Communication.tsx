
import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import { Broadcast } from '../types';
import { useI18n } from '../context/i18n';
import BroadcastViewModal from '../components/BroadcastViewModal';
import { getBroadcastsAPI, createBroadcastAPI, deleteBroadcastAPI, sendBroadcastAPI, scheduleBroadcastAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

interface NewBroadcastProps {
    onBroadcastCreated: () => void;
}

const NewBroadcast: React.FC<NewBroadcastProps> = ({ onBroadcastCreated }) => {
    const { t } = useI18n();
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [target, setTarget] = useState('all');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');

    const handleSaveDraft = async () => {
        if (!subject || !content) {
            alert('Please fill in subject and content');
            return;
        }
        setIsSubmitting(true);
        try {
            // Use API field names: subject, content, target, status
            await createBroadcastAPI({
                subject, // API field: subject
                content, // API field: content
                target, // API field: target (all, gold, trial, expired)
                status: 'draft', // API field: status
            });
            alert('Draft saved successfully');
            setSubject('');
            setContent('');
            onBroadcastCreated();
        } catch (error: any) {
            console.error('Error saving draft:', error);
            alert(error.message || 'Failed to save draft');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSchedule = async () => {
        if (!subject || !content || !scheduledDate || !scheduledTime) {
            alert('Please fill in all fields including scheduled date and time');
            return;
        }
        setIsSubmitting(true);
        try {
            const scheduledAt = `${scheduledDate}T${scheduledTime}:00`;
            const broadcast = await createBroadcastAPI({
                subject,
                content,
                target,
                status: 'scheduled',
                scheduled_at: scheduledAt,
            });
            await scheduleBroadcastAPI(broadcast.id, scheduledAt);
            alert('Broadcast scheduled successfully');
            setSubject('');
            setContent('');
            setScheduledDate('');
            setScheduledTime('');
            onBroadcastCreated();
        } catch (error: any) {
            console.error('Error scheduling broadcast:', error);
            alert(error.message || 'Failed to schedule broadcast');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendNow = async () => {
        if (!subject || !content) {
            alert('Please fill in subject and content');
            return;
        }
        setIsSubmitting(true);
        try {
            const broadcast = await createBroadcastAPI({
                subject,
                content,
                target,
                status: 'sent',
            });
            await sendBroadcastAPI(broadcast.id);
            alert('Broadcast sent successfully');
            setSubject('');
            setContent('');
            onBroadcastCreated();
        } catch (error: any) {
            console.error('Error sending broadcast:', error);
            alert(error.message || 'Failed to send broadcast');
        } finally {
            setIsSubmitting(false);
        }
    };

    return(
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">{t('communication.new.title')}</h2>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">{t('communication.new.to')}</label>
                <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                >
                    <option value="all">{t('communication.new.target.all')}</option>
                    <option value="gold">{t('communication.new.target.gold')}</option>
                    <option value="trial">{t('communication.new.target.trial')}</option>
                    <option value="expired">{t('communication.new.target.expired')}</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">{t('communication.new.subject')}</label>
                <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">{t('communication.new.content')}</label>
                <textarea 
                    rows={8} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Schedule Date & Time (for scheduling)</label>
                <div className="flex gap-2">
                    <input 
                        type="date" 
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                    />
                    <input 
                        type="time" 
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex justify-end space-x-2">
                <button 
                    onClick={handleSaveDraft} 
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md text-sm font-medium disabled:opacity-50"
                >
                    {isSubmitting ? <LoadingSpinner /> : t('communication.new.saveDraft')}
                </button>
                <button 
                    onClick={handleSchedule} 
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md text-sm font-medium disabled:opacity-50"
                >
                    {isSubmitting ? <LoadingSpinner /> : t('communication.new.schedule')}
                </button>
                <button 
                    onClick={handleSendNow} 
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium disabled:opacity-50"
                >
                    {isSubmitting ? <LoadingSpinner /> : t('communication.new.sendNow')}
                </button>
            </div>
        </div>
    </div>
)};

interface HistoryProps {
    history: Broadcast[];
    onView: (broadcast: Broadcast) => void;
    onDelete: (id: number) => void;
    isLoading?: boolean;
}

const History: React.FC<HistoryProps> = ({ history, onView, onDelete, isLoading = false }) => {
    const { t, language } = useI18n();

    const statusTranslations: { [key in Broadcast['status']]: string } = {
        'Sent': t('communication.history.status.sent'),
        'Scheduled': t('communication.history.status.scheduled'),
        'Draft': t('communication.history.status.draft') || 'Draft',
    };

    const handleDelete = (id: number) => {
        onDelete(id);
    };

    return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="overflow-x-auto">
            <table className={`w-full text-sm ${language === 'ar' ? 'text-right' : 'text-left'} text-gray-500 dark:text-gray-400`}>
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
                    {isLoading ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                Loading broadcasts...
                            </td>
                        </tr>
                    ) : history.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                No broadcasts found
                            </td>
                        </tr>
                    ) : (
                        history.map(item => (
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
                    ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
)};

const Communication: React.FC = () => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState('new');
    const [history, setHistory] = useState<Broadcast[]>([]);
    const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const tabs = [
        { id: 'new', label: t('communication.tabs.new') },
        { id: 'history', label: t('communication.tabs.history') },
    ];

    useEffect(() => {
        loadBroadcasts();
    }, []);

    const loadBroadcasts = async () => {
        setIsLoading(true);
        try {
            const response = await getBroadcastsAPI();
            // Map API broadcast fields to frontend format
            const apiBroadcasts: Broadcast[] = (response.results || []).map((broadcast: any) => ({
                id: broadcast.id, // API field: id
                subject: broadcast.subject, // API field: subject
                target: broadcast.target === 'all' ? 'All Companies' 
                    : broadcast.target === 'gold' ? 'Gold Plan Subscribers'
                    : broadcast.target === 'trial' ? 'Trial Accounts'
                    : 'Expired Subscriptions', // API field: target
                date: broadcast.sent_at 
                    ? new Date(broadcast.sent_at).toISOString().split('T')[0]
                    : broadcast.scheduled_at 
                    ? new Date(broadcast.scheduled_at).toISOString().split('T')[0]
                    : new Date(broadcast.created_at).toISOString().split('T')[0], // API fields: sent_at, scheduled_at, created_at
                status: broadcast.status === 'sent' ? 'Sent' 
                    : broadcast.status === 'scheduled' ? 'Scheduled' 
                    : 'Draft' as any, // API field: status
                content: broadcast.content, // API field: content
            }));
            setHistory(apiBroadcasts);
        } catch (error) {
            console.error('Error loading broadcasts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewBroadcast = (broadcast: Broadcast) => {
        setSelectedBroadcast(broadcast);
        setIsViewModalOpen(true);
    };

    const handleDeleteBroadcast = async (id: number) => {
        if (window.confirm(t('communication.history.deleteConfirm'))) {
            try {
                await deleteBroadcastAPI(id);
                await loadBroadcasts();
            } catch (error: any) {
                console.error('Error deleting broadcast:', error);
                alert(error.message || 'Failed to delete broadcast');
            }
        }
    };

    const handleCloseModal = () => {
        setIsViewModalOpen(false);
        setSelectedBroadcast(null);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('communication.title')}</h1>
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
            {activeTab === 'new' && <NewBroadcast onBroadcastCreated={loadBroadcasts} />}
            {activeTab === 'history' && <History history={history} onView={handleViewBroadcast} onDelete={handleDeleteBroadcast} isLoading={isLoading} />}
            <BroadcastViewModal 
                isOpen={isViewModalOpen}
                onClose={handleCloseModal}
                broadcast={selectedBroadcast}
            />
        </div>
    );
};

export default Communication;
