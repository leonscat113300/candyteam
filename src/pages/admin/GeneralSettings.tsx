import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { KeyRound, RotateCcw, Save } from 'lucide-react';
import { AdminOutletContext } from '../../app/layouts/AdminLayout';
import { Button } from '../../components/ui/Button';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { FormInput } from '../../components/ui/FormInput';
import { FormSelect } from '../../components/ui/FormSelect';
import { Toast } from '../../components/ui/Toast';
import { useContent } from '../../hooks/useContent';
import { changeAdminPassword } from '../../services/gmailAuth';
import { GeneralSettings as GeneralSettingsType } from '../../types/content';

export const GeneralSettings: React.FC = () => {
  const { adminUsername, setHeaderMeta } = useOutletContext<AdminOutletContext>();
  const { store, updateSettings, resetToDefaults } = useContent();

  const [draft, setDraft] = useState<GeneralSettingsType | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credError, setCredError] = useState('');
  const [savingCreds, setSavingCreds] = useState(false);

  useEffect(() => {
    setHeaderMeta({
      title: 'General Settings',
      subtitle: 'Configure site defaults, catalog pagination, and data reset options',
    });
  }, [setHeaderMeta]);

  useEffect(() => {
    if (!store) return;
    setDraft(structuredClone(store.settings));
  }, [store]);

  if (!store || !draft) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(draft);
    setToast('General settings saved.');
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError('');

    if (!currentPassword) {
      setCredError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setCredError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setCredError('New password and confirmation do not match.');
      return;
    }

    setSavingCreds(true);
    try {
      await changeAdminPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToast('Password updated in Firebase Authentication.');
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setCredError('Current password is incorrect.');
      } else if (code === 'auth/weak-password') {
        setCredError('Please choose a stronger password (at least 6 characters).');
      } else if (code === 'auth/requires-recent-login') {
        setCredError('Please sign out and sign back in before changing your password.');
      } else {
        setCredError('Unable to update password right now.');
      }
    } finally {
      setSavingCreds(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <form
        onSubmit={handleSave}
        className="candy-glass-card rounded-[2rem] p-6 sm:p-8 space-y-5"
      >
        <h2 className="font-display text-xl font-bold text-white">
          Website Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Site Title"
            value={draft.siteTitle}
            onChange={(e) => setDraft({ ...draft, siteTitle: e.target.value })}
          />
          <FormSelect
            label="Website Language"
            value={draft.siteLanguage}
            onChange={(e) => setDraft({ ...draft, siteLanguage: e.target.value })}
            options={[{ value: 'en', label: 'English (en)' }]}
          />
          <FormInput
            label="Primary Brand Color"
            value={draft.primaryColor}
            onChange={(e) => setDraft({ ...draft, primaryColor: e.target.value })}
          />
          <FormInput
            label="Admin Table Page Size"
            type="number"
            min={2}
            max={50}
            value={draft.gamesPerPage}
            onChange={(e) =>
              setDraft({
                ...draft,
                gamesPerPage: Math.max(2, Number(e.target.value) || 8),
              })
            }
          />
        </div>

        <FormInput
          label="Google Analytics Measurement ID"
          value={draft.googleAnalyticsId || ''}
          onChange={(e) =>
            setDraft({ ...draft, googleAnalyticsId: e.target.value })
          }
          placeholder="G-XXXXXXXXXX (optional)"
        />

        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.enableContactForm}
              onChange={(e) =>
                setDraft({ ...draft, enableContactForm: e.target.checked })
              }
              className="w-4 h-4 accent-[#7652D6] rounded"
            />
            <span className="text-sm text-[#e7defa]">
              Enable public Contact page submission form
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.showDraftGamesInAdminOnly}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  showDraftGamesInAdminOnly: e.target.checked,
                })
              }
              className="w-4 h-4 accent-[#7652D6] rounded"
            />
            <span className="text-sm text-[#e7defa]">
              Hide Draft games from public Games catalog
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.maintenanceMode}
              onChange={(e) =>
                setDraft({ ...draft, maintenanceMode: e.target.checked })
              }
              className="w-4 h-4 accent-[#7652D6] rounded"
            />
            <span className="text-sm text-[#e7defa]">
              Show Maintenance Mode notice banner on public website
            </span>
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="lg" leftIcon={<Save size={16} />}>
            Save Settings
          </Button>
        </div>
      </form>

      <form
        onSubmit={handleUpdateCredentials}
        className="candy-glass-card rounded-[2rem] p-6 sm:p-8 space-y-5"
      >
        <div className="flex items-center gap-2.5">
          <KeyRound size={18} className="text-[#cebdff]" />
          <h2 className="font-display text-xl font-bold text-white">
            Account Password ({adminUsername || 'Admin'})
          </h2>
        </div>
        <p className="text-sm text-[#cbc3d6]">
          Update your Firebase Authentication password for this admin account.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            required
          />
          <FormInput
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min 6 characters"
            required
          />
          <FormInput
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            required
          />
        </div>

        {credError ? <p className="text-sm text-[#ffb4ab]">{credError}</p> : null}

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={savingCreds}
            leftIcon={<Save size={15} />}
          >
            {savingCreds ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </form>

      <div className="candy-glass-card rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-display text-lg font-bold text-white">
            Reset Local Studio Data
          </h2>
          <p className="text-sm text-[#cbc3d6]">
            Restore all games, pages, SEO, and studio details to initial CandyGame defaults.
          </p>
        </div>
        <Button
          variant="danger"
          size="md"
          leftIcon={<RotateCcw size={15} />}
          onClick={() => setConfirmReset(true)}
        >
          Reset to Defaults
        </Button>
      </div>

      <ConfirmationDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={async () => {
          await resetToDefaults();
          setToast('All local content restored to initial CandyGame defaults.');
        }}
        title="Reset Studio Data"
        message="This will overwrite all edits saved in localStorage and restore the initial CandyGame content. Continue?"
        confirmLabel="Reset Data"
      />

      {toast ? <Toast message={toast} onDismiss={() => setToast('')} /> : null}
    </div>
  );
};
