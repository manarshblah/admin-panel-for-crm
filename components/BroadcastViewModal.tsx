
import React from 'react';
import { Broadcast } from '../types';
import { useI18n } from '../context/i18n';
import Icon from './Icon';

interface BroadcastViewModalProps {
  broadcast: Broadcast | null;
  isOpen: boolean;
  onClose: () => void;
}

const BroadcastViewModal: React.FC<BroadcastViewModalProps> = ({ broadcast, isOpen, onClose }) => {
  const { t } = useI18n();

  if (!isOpen || !broadcast) return null;

  const statusTranslations: { [key in Broadcast['status']]: string } = {
    'Sent': t('communication.history.status.sent'),
    'Scheduled': t('communication.history.status.scheduled'),
  };
  
  const statusColors: { [key in Broadcast['status']]: string } = {
    'Sent': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'Scheduled': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  };

  const labelClasses = "block text-sm font-medium mb-1 text-gray-500 dark:text-gray-400";
  const valueClasses = "w-full text-gray-900 dark:text-white min-h-[30px]";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {t('communication.viewModal.title')}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <Icon name="x" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>{t('communication.history.table.subject')}</label>
              <p className={valueClasses}>{broadcast.subject}</p>
            </div>
             <div>
              <label className={labelClasses}>{t('communication.history.table.target')}</label>
              <p className={valueClasses}>{broadcast.target}</p>
            </div>
            <div>
              <label className={labelClasses}>{t('communication.history.table.date')}</label>
              <p className={valueClasses}>{broadcast.date}</p>
            </div>
            <div>
              <label className={labelClasses}>{t('communication.history.table.status')}</label>
              <div className={valueClasses}>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[broadcast.status]}`}>{statusTranslations[broadcast.status]}</span>
              </div>
            </div>
          </div>
          <div>
            <label className={labelClasses}>{t('communication.new.content')}</label>
            <div className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-700 min-h-[150px] whitespace-pre-wrap">
              <p className="text-gray-800 dark:text-gray-200">{broadcast.content}</p>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
          <button onClick={onClose} className="px-6 py-2 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 font-medium">
            {t('tenants.modal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BroadcastViewModal;
