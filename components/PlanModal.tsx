
import React, { useState, useEffect } from 'react';
import { Plan } from '../types';
import { useI18n } from '../context/i18n';
import Icon from './Icon';

interface PlanModalProps {
  planToEdit: Plan | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: Omit<Plan, 'id'> & { id?: number }) => void;
}

const emptyPlan: Omit<Plan, 'id'> = {
  name: '',
  type: 'Paid',
  priceMonthly: 0,
  priceYearly: 0,
  trialDays: 0,
  users: 10,
  clients: 100,
  storage: 10,
  features: '',
  visible: true,
};

const PlanModal: React.FC<PlanModalProps> = ({ planToEdit, isOpen, onClose, onSave }) => {
  const { t } = useI18n();
  const [formData, setFormData] = useState(planToEdit || emptyPlan);

  useEffect(() => {
    setFormData(planToEdit ? { ...planToEdit } : { ...emptyPlan });
  }, [planToEdit, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) || 0 : value }));
  };

  const handleTypeChange = (type: Plan['type']) => {
    const newFormData = { ...formData, type };
    if (type === 'Trial') {
      newFormData.priceMonthly = 0;
      newFormData.priceYearly = 0;
      if (newFormData.trialDays === 0) newFormData.trialDays = 14;
    } else if (type === 'Paid') {
        newFormData.trialDays = 0;
    } else if (type === 'Free') {
        newFormData.priceMonthly = 0;
        newFormData.priceYearly = 0;
        newFormData.trialDays = 0;
    }
    setFormData(newFormData);
  };

  const handleUnlimitedChange = (field: 'users' | 'clients', isChecked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: isChecked ? 'unlimited' : 10, // Reset to a default number
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500";
  const labelClasses = "block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl transform transition-all" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {planToEdit ? t('subscriptions.plans.editTitle') : t('subscriptions.plans.createTitle')}
            </h2>
            <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Icon name="x" className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                  <label htmlFor="planName" className={labelClasses}>{t('subscriptions.plans.planName')}</label>
                  <input id="planName" name="name" value={formData.name} onChange={handleInputChange} className={inputClasses} required />
              </div>
              
              <div>
                <label className={labelClasses}>{t('subscriptions.plans.planType')}</label>
                <div className="flex space-x-4">
                    {(['Paid', 'Trial', 'Free'] as const).map(type => (
                        <button type="button" key={type} onClick={() => handleTypeChange(type)} className={`px-4 py-2 rounded-md border text-sm font-medium ${formData.type === type ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}>
                            {t(`subscriptions.plans.type.${type}`)}
                        </button>
                    ))}
                </div>
              </div>

              {formData.type === 'Trial' && (
                  <div>
                      <label htmlFor="trialDays" className={labelClasses}>{t('subscriptions.plans.trialDuration')}</label>
                      <div className="relative">
                          <input id="trialDays" name="trialDays" type="number" value={formData.trialDays} onChange={handleInputChange} className={inputClasses} />
                           <span className="absolute inset-y-0 right-3 flex items-center text-gray-500">{t('subscriptions.plans.days')}</span>
                      </div>
                  </div>
              )}

              {formData.type === 'Paid' && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                      <h3 className="font-medium mb-3">{t('subscriptions.plans.pricing')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label htmlFor="priceMonthly" className={labelClasses}>{t('subscriptions.plans.priceMonthly')}</label>
                              <input id="priceMonthly" name="priceMonthly" type="number" value={formData.priceMonthly} onChange={handleInputChange} className={inputClasses} />
                          </div>
                           <div>
                              <label htmlFor="priceYearly" className={labelClasses}>{t('subscriptions.plans.priceYearly')}</label>
                              <input id="priceYearly" name="priceYearly" type="number" value={formData.priceYearly} onChange={handleInputChange} className={inputClasses} />
                              <p className="text-xs text-gray-500 mt-1">{t('subscriptions.plans.yearlyDiscount')}</p>
                          </div>
                      </div>
                  </div>
              )}

               <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                    <h3 className="font-medium mb-3">{t('subscriptions.plans.resourceLimits')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                           <label htmlFor="users" className={labelClasses}>{t('subscriptions.plans.maxUsers')}</label>
                           <div className="flex items-center space-x-2">
                               <input id="users" name="users" type="number" value={formData.users === 'unlimited' ? '' : formData.users} onChange={handleInputChange} className={`${inputClasses} disabled:bg-gray-200 dark:disabled:bg-gray-600`} disabled={formData.users === 'unlimited'}/>
                               <input id="usersUnlimited" type="checkbox" checked={formData.users === 'unlimited'} onChange={(e) => handleUnlimitedChange('users', e.target.checked)} className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500" />
                               <label htmlFor="usersUnlimited">{t('subscriptions.plans.unlimited')}</label>
                           </div>
                        </div>
                        <div>
                           <label htmlFor="clients" className={labelClasses}>{t('subscriptions.plans.maxClients')}</label>
                            <div className="flex items-center space-x-2">
                               <input id="clients" name="clients" type="number" value={formData.clients === 'unlimited' ? '' : formData.clients} onChange={handleInputChange} className={`${inputClasses} disabled:bg-gray-200 dark:disabled:bg-gray-600`} disabled={formData.clients === 'unlimited'}/>
                               <input id="clientsUnlimited" type="checkbox" checked={formData.clients === 'unlimited'} onChange={(e) => handleUnlimitedChange('clients', e.target.checked)} className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500" />
                               <label htmlFor="clientsUnlimited">{t('subscriptions.plans.unlimited')}</label>
                           </div>
                        </div>
                        <div>
                           <label htmlFor="storage" className={labelClasses}>{t('subscriptions.plans.storageGB')}</label>
                           <input id="storage" name="storage" type="number" value={formData.storage} onChange={handleInputChange} className={inputClasses} />
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="features" className={labelClasses}>{t('subscriptions.plans.features')}</label>
                    <textarea id="features" name="features" value={formData.features} onChange={handleInputChange} rows={4} className={inputClasses} placeholder={t('subscriptions.plans.featuresPlaceholder')}></textarea>
                </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4 rtl:space-x-reverse bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 font-medium">
              {t('common.cancel')}
            </button>
            <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium">
              {t('common.savePlan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanModal;
