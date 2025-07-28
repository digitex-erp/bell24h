import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

const Settings: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { t, i18n } = useTranslation();
  
  // Language state
  const [language, setLanguage] = useState(i18n.language);
  const [isLanguageSaving, setIsLanguageSaving] = useState(false);
  
  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
  });
  
  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Danger zone
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  // Load user preferences
  useEffect(() => {
    if (user?.preferences) {
      setNotifications(prev => ({
        ...prev,
        ...user.preferences.notifications
      }));
    }
  }, [user]);

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    setIsLanguageSaving(true);
    
    try {
      await i18n.changeLanguage(newLanguage);
      // In a real app, save language preference to the server
      // await updateProfile({ preferences: { language: newLanguage } });
    } catch (err) {
      console.error('Failed to change language:', err);
    } finally {
      setIsLanguageSaving(false);
    }
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const saveNotificationPreferences = async () => {
    try {
      // In a real app, save notification preferences to the server
      // await updateProfile({ preferences: { notifications } });
      alert(t('account.settings.notifications.saved'));
    } catch (err) {
      console.error('Failed to save notification preferences:', err);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError(t('account.settings.security.passwordsDontMatch'));
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError(t('account.settings.security.passwordTooShort'));
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // In a real app, call your API to change the password
      // await api.changePassword(currentPassword, newPassword);
      setPasswordSuccess(t('account.settings.security.passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(t('account.settings.security.passwordChangeError'));
      console.error('Password change error:', err);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user?.email) {
      alert(t('account.settings.danger.incorrectEmail'));
      return;
    }
    
    if (!window.confirm(t('account.settings.danger.confirmDelete'))) {
      return;
    }
    
    setIsDeletingAccount(true);
    
    try {
      // In a real app, call your API to delete the account
      // await api.deleteAccount();
      alert(t('account.settings.danger.accountDeleted'));
      logout();
    } catch (err) {
      console.error('Account deletion error:', err);
      alert(t('account.settings.danger.deletionError'));
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {t('account.settings.title')}
      </h1>
      
      {/* Language Settings */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {t('account.settings.language.title')}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {t('account.settings.language.subtitle')}
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                {t('account.settings.language.selectLanguage')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  disabled={isLanguageSaving}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="zh">中文</option>
                </select>
                {isLanguageSaving && (
                  <p className="mt-2 text-sm text-gray-500">
                    {t('common.saving')}...
                  </p>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Notification Settings */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {t('account.settings.notifications.title')}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {t('account.settings.notifications.subtitle')}
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                {t('account.settings.notifications.email')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <input
                    id="email-notifications"
                    name="email"
                    type="checkbox"
                    checked={notifications.email}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700">
                    {t('account.settings.notifications.emailDescription')}
                  </label>
                </div>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                {t('account.settings.notifications.push')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <input
                    id="push-notifications"
                    name="push"
                    type="checkbox"
                    checked={notifications.push}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="push-notifications" className="ml-2 block text-sm text-gray-700">
                    {t('account.settings.notifications.pushDescription')}
                  </label>
                </div>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                {t('account.settings.notifications.marketing')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <input
                    id="marketing-notifications"
                    name="marketing"
                    type="checkbox"
                    checked={notifications.marketing}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="marketing-notifications" className="ml-2 block text-sm text-gray-700">
                    {t('account.settings.notifications.marketingDescription')}
                  </label>
                </div>
              </dd>
            </div>
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                type="button"
                onClick={saveNotificationPreferences}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('common.save')}
              </button>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Security Settings */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {t('account.settings.security.title')}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {t('account.settings.security.subtitle')}
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <form onSubmit={handlePasswordChange}>
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  <label htmlFor="current-password" className="block">
                    {t('account.settings.security.currentPassword')}
                  </label>
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <input
                    id="current-password"
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  <label htmlFor="new-password" className="block">
                    {t('account.settings.security.newPassword')}
                  </label>
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <input
                    id="new-password"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                    minLength={8}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {t('account.settings.security.passwordRequirements')}
                  </p>
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  <label htmlFor="confirm-password" className="block">
                    {t('account.settings.security.confirmPassword')}
                  </label>
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                    minLength={8}
                  />
                </dd>
              </div>
              {passwordError && (
                <div className="px-6 py-2">
                  <p className="text-sm text-red-600">{passwordError}</p>
                </div>
              )}
              {passwordSuccess && (
                <div className="px-6 py-2">
                  <p className="text-sm text-green-600">{passwordSuccess}</p>
                </div>
              )}
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isChangingPassword ? t('common.saving') : t('account.settings.security.changePassword')}
                </button>
              </div>
            </dl>
          </form>
        </div>
      </div>
      
      {/* Danger Zone */}
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              {t('account.settings.danger.title')}
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{t('account.settings.danger.warning')}</p>
              <div className="mt-4">
                <div className="mt-2">
                  <label htmlFor="delete-confirmation" className="block text-sm font-medium text-red-800">
                    {t('account.settings.danger.typeEmailToConfirm', { email: user?.email })}
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="delete-confirmation"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-red-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount || deleteConfirmation !== user?.email}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeletingAccount ? t('common.deleting') : t('account.settings.danger.deleteAccount')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
