import React, { useCallback, useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import type { User } from 'firebase/auth';
import {
  Check,
  Inbox,
  LogOut,
  Mail,
  Plus,
  RefreshCw,
  Save,
  Send,
  Trash2,
} from 'lucide-react';
import { AdminOutletContext } from '../../app/layouts/AdminLayout';
import { BrandLogo } from '../../components/shared/BrandLogo';
import { Button } from '../../components/ui/Button';
import { FormInput } from '../../components/ui/FormInput';
import { FormTextarea } from '../../components/ui/FormTextarea';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Tabs } from '../../components/ui/Tabs';
import { Toast } from '../../components/ui/Toast';
import { useContent } from '../../hooks/useContent';
import {
  clearGmailAccessToken,
  disconnectGmail,
  fetchGmailInboxDirect,
  getGmailAccessToken,
  initGmailAuth,
  signInWithGmail,
} from '../../services/gmailAuth';
import { ContactInfo, ContactSubmission, StudioInfo } from '../../types/content';
import { API_BASE, apiUrl } from '../../utils/api';

type StudioTab = 'studio' | 'contact' | 'inbox';

export const StudioContact: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { adminToken, authenticated, staticMode, setHeaderMeta } =
    useOutletContext<AdminOutletContext>();
  const {
    store,
    updateStudioInfo,
    updateContactInfo,
    updateContactSubmissionStatus,
    deleteContactSubmission,
    mergeExternalSubmissions,
  } = useContent();

  const initialTabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<StudioTab>(
    initialTabParam === 'inbox' || initialTabParam === 'contact'
      ? initialTabParam
      : 'studio'
  );
  const [studioDraft, setStudioDraft] = useState<StudioInfo | null>(null);
  const [contactDraft, setContactDraft] = useState<ContactInfo | null>(null);
  const [inboxMessages, setInboxMessages] = useState<ContactSubmission[]>([]);
  const [mailboxAddress, setMailboxAddress] = useState('candyteam@info.com');
  const [webhookConfigured, setWebhookConfigured] = useState(false);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [testFrom, setTestFrom] = useState('');
  const [testSubject, setTestSubject] = useState('');
  const [testBody, setTestBody] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [gmailUser, setGmailUser] = useState<User | null>(null);
  const [needsGmailAuth, setNeedsGmailAuth] = useState(true);
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [syncingGmail, setSyncingGmail] = useState(false);
  const [lastGmailSync, setLastGmailSync] = useState<string | null>(null);
  const [gmailError, setGmailError] = useState('');
  const [toast, setToast] = useState('');

  const buildAuthHeaders = useCallback(
    (withJson = false): Record<string, string> => {
      const headers: Record<string, string> = {
        'X-Requested-With': 'CandyGameAdmin',
      };
      if (withJson) {
        headers['Content-Type'] = 'application/json';
      }
      if (adminToken) {
        headers.Authorization = `Bearer ${adminToken}`;
      }
      return headers;
    },
    [adminToken]
  );

  const loadInbox = useCallback(async () => {
    if (!authenticated) return;
    if (staticMode) {
      setInboxMessages(store?.contactSubmissions || []);
      if (store?.contact.email) {
        setMailboxAddress(store.contact.email);
      }
      return;
    }
    setLoadingInbox(true);
    try {
      const response = await fetch(apiUrl('/api/inbox'), {
        credentials: API_BASE ? 'omit' : 'same-origin',
        headers: buildAuthHeaders(false),
      });
      if (!response.ok) return;
      const data = (await response.json()) as {
        mailbox?: string;
        webhookConfigured?: boolean;
        messages?: ContactSubmission[];
      };
      if (data.mailbox) setMailboxAddress(data.mailbox);
      setWebhookConfigured(Boolean(data.webhookConfigured));
      if (Array.isArray(data.messages)) {
        setInboxMessages(data.messages);
      }
    } catch {
      // Keep current list on transient failure
    } finally {
      setLoadingInbox(false);
    }
  }, [authenticated, buildAuthHeaders, staticMode, store?.contact.email, store?.contactSubmissions]);

  const syncGmailInbox = useCallback(
    async (explicitToken?: string, silent = false) => {
      if (!authenticated) return;
      const accessToken = explicitToken || getGmailAccessToken();
      if (!accessToken) {
        setNeedsGmailAuth(true);
        return;
      }

      setSyncingGmail(true);
      if (!silent) setGmailError('');
      try {
        if (staticMode) {
          const current = store?.contactSubmissions || [];
          const existingIds = new Set(
            current
              .map((m) => m.externalId || (m.id.startsWith('gmail-') ? m.id.slice(6) : ''))
              .filter(Boolean)
          );
          const { entries } = await fetchGmailInboxDirect(accessToken, existingIds);
          const updated = await mergeExternalSubmissions(entries);
          setInboxMessages(updated);
          setLastGmailSync(new Date().toLocaleTimeString());
          if (!silent) {
            setToast(
              entries.length > 0
                ? `Synced ${entries.length} new message${entries.length === 1 ? '' : 's'} from Gmail.`
                : 'Gmail inbox is up to date.'
            );
          }
          return;
        }

        const headers = buildAuthHeaders(true);
        headers['x-gmail-token'] = accessToken;
        const response = await fetch(apiUrl('/api/gmail/sync'), {
          method: 'POST',
          credentials: API_BASE ? 'omit' : 'same-origin',
          headers,
        });
        const payload = (await response.json().catch(() => ({}))) as {
          ok?: boolean;
          connectedEmail?: string;
          importedCount?: number;
          messages?: ContactSubmission[];
          error?: string;
        };

        if (response.status === 401) {
          clearGmailAccessToken();
          setNeedsGmailAuth(true);
          if (!silent) {
            setGmailError(
              payload.error || 'Gmail access expired. Please sign in with Google again.'
            );
          }
          return;
        }

        if (!response.ok) {
          if (!silent) {
            setGmailError(payload.error || 'Failed to sync Gmail messages.');
          }
          return;
        }

        if (Array.isArray(payload.messages)) {
          setInboxMessages(payload.messages);
        }
        setLastGmailSync(new Date().toLocaleTimeString());
        if (!silent) {
          const count = payload.importedCount || 0;
          setToast(
            count > 0
              ? `Synced ${count} new message${count === 1 ? '' : 's'} from Gmail.`
              : 'Gmail inbox is up to date.'
          );
        }
      } catch (err) {
        const status = (err as { status?: number })?.status;
        if (status === 401) {
          clearGmailAccessToken();
          setNeedsGmailAuth(true);
        }
        if (!silent) {
          setGmailError(
            err instanceof Error && err.message
              ? err.message
              : 'Network error while syncing Gmail inbox.'
          );
        }
      } finally {
        setSyncingGmail(false);
      }
    },
    [
      authenticated,
      buildAuthHeaders,
      mergeExternalSubmissions,
      staticMode,
      store?.contactSubmissions,
    ]
  );

  useEffect(() => {
    const unsubscribe = initGmailAuth(
      (user) => {
        setGmailUser(user);
        setNeedsGmailAuth(false);
      },
      (user) => {
        setGmailUser(user);
        setNeedsGmailAuth(true);
      }
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'inbox' || tabParam === 'contact' || tabParam === 'studio') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    setHeaderMeta({
      title: 'Studio & Contact Management',
      subtitle: 'Manage CandyGame identity, contact channels, social links, and studio inbox',
    });
  }, [setHeaderMeta]);

  useEffect(() => {
    void loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    if (activeTab !== 'inbox' || needsGmailAuth || !authenticated) return;
    const timer = window.setInterval(() => {
      void syncGmailInbox(undefined, true);
    }, 30000);
    return () => window.clearInterval(timer);
  }, [activeTab, authenticated, needsGmailAuth, syncGmailInbox]);

  useEffect(() => {
    if (!store) return;
    setStudioDraft(structuredClone(store.studio));
    setContactDraft(structuredClone(store.contact));
  }, [store]);

  if (!store || !studioDraft || !contactDraft) return null;

  const handleSave = async () => {
    if (activeTab === 'studio') {
      await updateStudioInfo(studioDraft);
      setToast('Studio profile updated.');
    } else if (activeTab === 'contact') {
      await updateContactInfo({
        ...contactDraft,
        socialLinks: contactDraft.socialLinks.filter((s) => s.url.trim()),
      });
      setToast('Contact details updated.');
    }
  };

  const handleMarkReviewed = async (id: string) => {
    if (staticMode) {
      await updateContactSubmissionStatus(id, 'reviewed');
      setInboxMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'reviewed' } : m))
      );
      setToast('Message marked as reviewed.');
      return;
    }
    const response = await fetch(apiUrl(`/api/inbox/${encodeURIComponent(id)}`), {
      method: 'PATCH',
      credentials: API_BASE ? 'omit' : 'same-origin',
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ status: 'reviewed' }),
    });
    if (response.ok) {
      setInboxMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'reviewed' } : m))
      );
      setToast('Message marked as reviewed.');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (staticMode) {
      await deleteContactSubmission(id);
      setInboxMessages((prev) => prev.filter((m) => m.id !== id));
      setToast('Message deleted.');
      return;
    }
    const response = await fetch(apiUrl(`/api/inbox/${encodeURIComponent(id)}`), {
      method: 'DELETE',
      credentials: API_BASE ? 'omit' : 'same-origin',
      headers: buildAuthHeaders(false),
    });
    if (response.ok) {
      setInboxMessages((prev) => prev.filter((m) => m.id !== id));
      setToast('Message deleted.');
    }
  };

  const handleConnectGmail = async () => {
    setConnectingGmail(true);
    setGmailError('');
    try {
      const { user, accessToken } = await signInWithGmail();
      setGmailUser(user);
      setNeedsGmailAuth(false);
      await syncGmailInbox(accessToken, false);
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : 'Google sign-in was cancelled or failed.';
      setGmailError(msg);
    } finally {
      setConnectingGmail(false);
    }
  };

  const handleDisconnectGmail = async () => {
    await disconnectGmail();
    setGmailUser(null);
    setNeedsGmailAuth(true);
    setLastGmailSync(null);
    setToast('Gmail account disconnected.');
  };

  const handleTestInboundEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testFrom.trim() || !testBody.trim()) return;
    setSendingTest(true);
    try {
      const response = await fetch(apiUrl('/api/inbound-email'), {
        method: 'POST',
        credentials: API_BASE ? 'omit' : 'same-origin',
        headers: buildAuthHeaders(true),
        body: JSON.stringify({
          from: testFrom.trim(),
          to: mailboxAddress,
          subject: testSubject.trim() || 'Test Inbound Email',
          text: testBody.trim(),
        }),
      });
      if (response.ok) {
        setTestFrom('');
        setTestSubject('');
        setTestBody('');
        await loadInbox();
        setToast('Test inbound email delivered to studio inbox.');
      }
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          tabs={[
            { id: 'studio', label: 'Studio Profile' },
            { id: 'contact', label: 'Contact & Social' },
            {
              id: 'inbox',
              label: `Messages (${inboxMessages.length})`,
            },
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as StudioTab)}
        />

        {activeTab !== 'inbox' ? (
          <Button
            variant="primary"
            size="md"
            leftIcon={<Save size={15} />}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="md"
            leftIcon={<RefreshCw size={15} />}
            onClick={() => void loadInbox()}
            disabled={loadingInbox}
          >
            {loadingInbox ? 'Refreshing...' : 'Refresh Inbox'}
          </Button>
        )}
      </div>

      {activeTab === 'studio' ? (
        <div className="candy-glass-card rounded-[2rem] p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Studio Name"
              value={studioDraft.studioName}
              onChange={(e) =>
                setStudioDraft({ ...studioDraft, studioName: e.target.value })
              }
            />
            <FormInput
              label="Studio Tagline"
              value={studioDraft.tagline}
              onChange={(e) =>
                setStudioDraft({ ...studioDraft, tagline: e.target.value })
              }
            />
            <FormInput
              label="Location"
              value={studioDraft.location || ''}
              onChange={(e) =>
                setStudioDraft({ ...studioDraft, location: e.target.value })
              }
              placeholder="Optional city / country"
            />
            <FormInput
              label="Founded Year"
              value={studioDraft.foundedYear || ''}
              onChange={(e) =>
                setStudioDraft({ ...studioDraft, foundedYear: e.target.value })
              }
              placeholder="Optional"
            />
          </div>

          <ImageUploader
            label="CandyGame Logo"
            value={studioDraft.logo}
            onChange={(logo) => setStudioDraft({ ...studioDraft, logo })}
            helperText="Upload the official CandyGame logo file or keep the default emblem."
            fallbackPreview={<BrandLogo compact />}
          />

          <FormTextarea
            label="Short Studio Bio"
            rows={2}
            value={studioDraft.shortBio}
            onChange={(e) =>
              setStudioDraft({ ...studioDraft, shortBio: e.target.value })
            }
          />
          <FormTextarea
            label="Full Studio Story"
            rows={4}
            value={studioDraft.fullStory}
            onChange={(e) =>
              setStudioDraft({ ...studioDraft, fullStory: e.target.value })
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormTextarea
              label="Mission"
              rows={3}
              value={studioDraft.mission}
              onChange={(e) =>
                setStudioDraft({ ...studioDraft, mission: e.target.value })
              }
            />
            <FormTextarea
              label="Vision"
              rows={3}
              value={studioDraft.vision}
              onChange={(e) =>
                setStudioDraft({ ...studioDraft, vision: e.target.value })
              }
            />
          </div>
        </div>
      ) : null}

      {activeTab === 'contact' ? (
        <div className="space-y-6">
          <div className="candy-glass-card rounded-[2rem] p-6 sm:p-8 space-y-5">
            <h2 className="font-display text-xl font-bold text-white">
              Direct Contact Channels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Primary Studio Email"
                type="email"
                value={contactDraft.email}
                onChange={(e) =>
                  setContactDraft({ ...contactDraft, email: e.target.value })
                }
                placeholder="Enter studio email"
              />
              <FormInput
                label="Player Support Email"
                type="email"
                value={contactDraft.supportEmail || ''}
                onChange={(e) =>
                  setContactDraft({
                    ...contactDraft,
                    supportEmail: e.target.value,
                  })
                }
                placeholder="Enter support email"
              />
              <FormInput
                label="Phone"
                value={contactDraft.phone || ''}
                onChange={(e) =>
                  setContactDraft({ ...contactDraft, phone: e.target.value })
                }
              />
              <FormInput
                label="Business Hours"
                value={contactDraft.businessHours || ''}
                onChange={(e) =>
                  setContactDraft({
                    ...contactDraft,
                    businessHours: e.target.value,
                  })
                }
              />
              <FormInput
                label="Studio Address"
                value={contactDraft.address || ''}
                onChange={(e) =>
                  setContactDraft({ ...contactDraft, address: e.target.value })
                }
              />
              <FormInput
                label="Google Play Developer Page URL"
                type="url"
                value={contactDraft.googlePlayDeveloperUrl || ''}
                onChange={(e) =>
                  setContactDraft({
                    ...contactDraft,
                    googlePlayDeveloperUrl: e.target.value,
                  })
                }
                placeholder="https://play.google.com/store/apps/dev?id=..."
              />
            </div>
          </div>

          <div className="candy-glass-card rounded-[2rem] p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-xl font-bold text-white">
                Social Media Links
              </h2>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Plus size={14} />}
                onClick={() =>
                  setContactDraft({
                    ...contactDraft,
                    socialLinks: [
                      ...contactDraft.socialLinks,
                      {
                        id: `soc-${Date.now()}`,
                        platform: '',
                        label: '',
                        url: '',
                      },
                    ],
                  })
                }
              >
                Add Social Link
              </Button>
            </div>

            {contactDraft.socialLinks.length === 0 ? (
              <p className="text-sm text-[#948e9f]">
                No social media accounts configured yet.
              </p>
            ) : (
              <div className="space-y-3">
                {contactDraft.socialLinks.map((social, idx) => (
                  <div
                    key={social.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 rounded-2xl bg-[#151123] border border-[#BDA7FF]/12"
                  >
                    <div className="md:col-span-3">
                      <FormInput
                        label="Platform"
                        value={social.platform}
                        onChange={(e) => {
                          const next = [...contactDraft.socialLinks];
                          next[idx] = { ...social, platform: e.target.value };
                          setContactDraft({ ...contactDraft, socialLinks: next });
                        }}
                        placeholder="YouTube / X / Discord"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <FormInput
                        label="Display Label"
                        value={social.label}
                        onChange={(e) => {
                          const next = [...contactDraft.socialLinks];
                          next[idx] = { ...social, label: e.target.value };
                          setContactDraft({ ...contactDraft, socialLinks: next });
                        }}
                        placeholder="Official Channel"
                      />
                    </div>
                    <div className="md:col-span-5">
                      <FormInput
                        label="URL"
                        type="url"
                        value={social.url}
                        onChange={(e) => {
                          const next = [...contactDraft.socialLinks];
                          next[idx] = { ...social, url: e.target.value };
                          setContactDraft({ ...contactDraft, socialLinks: next });
                        }}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <button
                        type="button"
                        aria-label="Remove social link"
                        onClick={() =>
                          setContactDraft({
                            ...contactDraft,
                            socialLinks: contactDraft.socialLinks.filter(
                              (_, i) => i !== idx
                            ),
                          })
                        }
                        className="p-2.5 rounded-2xl bg-[#1F1A35] border border-white/10 text-[#ffb4ab] hover:bg-[#93000a]/50 cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {activeTab === 'inbox' ? (
        <div className="space-y-6">
          <div className="candy-glass-card rounded-[2rem] p-6 sm:p-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#7652D6]/20 text-[#cebdff]">
                  <Mail size={18} />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    Direct External Email Sync (Gmail)
                  </h2>
                  <p className="text-xs text-[#cbc3d6]">
                    Connect your Gmail inbox to pull real external emails directly into the Admin Panel Messages list automatically.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151123] border border-[#BDA7FF]/20 text-xs font-medium text-[#cebdff]">
                <Inbox size={13} />
                <span>{inboxMessages.length} Total</span>
              </span>
            </div>

            <div className="rounded-2xl bg-[#151123] border border-[#BDA7FF]/20 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {needsGmailAuth ? (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      {gmailUser?.email
                        ? `Reconnect Gmail (${gmailUser.email})`
                        : 'Connect Your Gmail Inbox'}
                    </p>
                    <p className="text-xs text-[#cbc3d6] leading-relaxed">
                      Sign in with Google to sync incoming external emails directly into this Messages tab. Once connected, new inbox emails sync automatically every 30 seconds.
                    </p>
                    {gmailError ? (
                      <p className="text-xs text-[#ffb4ab] pt-1">{gmailError}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleConnectGmail()}
                    disabled={connectingGmail}
                    className="gsi-material-button shrink-0"
                  >
                    <div className="gsi-material-button-state" />
                    <div className="gsi-material-button-content-wrapper">
                      <div className="gsi-material-button-icon">
                        <svg
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 48 48"
                          style={{ display: 'block' }}
                        >
                          <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                          />
                          <path
                            fill="#34A853"
                            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                          />
                          <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents">
                        {connectingGmail ? 'Connecting...' : 'Sign in with Google'}
                      </span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                      <p className="text-sm font-semibold text-white">
                        Connected: {gmailUser?.email || 'Gmail Account'}
                      </p>
                      {lastGmailSync ? (
                        <span className="text-[11px] text-[#948e9f]">
                          Last synced at {lastGmailSync}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-[#cbc3d6]">
                      External emails arriving in this Gmail inbox are synced automatically every 30 seconds.
                    </p>
                    {gmailError ? (
                      <p className="text-xs text-[#ffb4ab] pt-1">{gmailError}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<RefreshCw size={14} />}
                      onClick={() => void syncGmailInbox(undefined, false)}
                      disabled={syncingGmail}
                    >
                      {syncingGmail ? 'Syncing...' : 'Sync Gmail Now'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<LogOut size={14} />}
                      onClick={() => void handleDisconnectGmail()}
                    >
                      Disconnect
                    </Button>
                  </div>
                </>
              )}
            </div>

            {staticMode ? (
              <div className="rounded-2xl bg-[#151123] border border-[#BDA7FF]/15 p-4 text-xs text-[#cbc3d6]">
                Static hosting mode: Connect your Gmail account above to sync external emails directly in the browser, and view messages submitted through the Contact form below.
              </div>
            ) : (
              <>
                <div className="rounded-2xl bg-[#151123] border border-[#BDA7FF]/15 p-4 text-xs text-[#cbc3d6] space-y-2">
                  <p className="font-semibold text-white">
                    About Studio Contact Email & Webhook ({webhookConfigured ? 'Secret Configured' : 'Admin/Secret Protected'})
                  </p>
                  <p>
                    Messages sent via the website Contact page always arrive directly below. Because <span className="text-white">{mailboxAddress}</span> uses the external <code className="px-1 py-0.5 rounded bg-[#1F1A35] text-[#cebdff]">info.com</code> domain, external emails sent to <code className="px-1 py-0.5 rounded bg-[#1F1A35] text-[#cebdff]">{mailboxAddress}</code> cannot reach this server unless you own that domain. To receive external emails directly, connect your real Gmail inbox above (and optionally update your public Contact Email in the &ldquo;Contact &amp; Social&rdquo; tab to match it), or forward mail from a domain you own to{' '}
                    <code className="px-1.5 py-0.5 rounded bg-[#1F1A35] text-[#cebdff]">
                      {typeof window !== 'undefined' ? `${window.location.origin}/api/inbound-email` : '/api/inbound-email'}
                    </code>{' '}
                    with header <code className="px-1.5 py-0.5 rounded bg-[#1F1A35] text-[#cebdff]">x-inbound-secret</code>.
                  </p>
                </div>

                <form
                  onSubmit={handleTestInboundEmail}
                  className="rounded-2xl bg-[#151123] border border-[#BDA7FF]/15 p-4 space-y-3"
                >
                  <p className="text-xs font-semibold text-white">
                    Test Inbound Email Delivery (Admin Simulation)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormInput
                      placeholder="Sender email (e.g. player@gmail.com)"
                      type="email"
                      value={testFrom}
                      onChange={(e) => setTestFrom(e.target.value)}
                      required
                    />
                    <FormInput
                      placeholder="Email subject"
                      value={testSubject}
                      onChange={(e) => setTestSubject(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                    <div className="flex-1">
                      <FormInput
                        placeholder="Message body..."
                        value={testBody}
                        onChange={(e) => setTestBody(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      disabled={sendingTest}
                      leftIcon={<Send size={14} />}
                    >
                      {sendingTest ? 'Delivering...' : 'Deliver Test Email'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>

          <div className="candy-glass-card rounded-[2rem] p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-xl font-bold text-white">
              Received Messages
            </h2>
            {inboxMessages.length === 0 ? (
              <p className="text-sm text-[#948e9f]">
                No messages have arrived in the {mailboxAddress} inbox yet.
              </p>
            ) : (
              <div className="divide-y divide-white/10">
                {inboxMessages.map((msg) => (
                  <div key={msg.id} className="py-4 first:pt-1 last:pb-1 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-white">
                            {msg.subject}
                          </p>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#7652D6]/20 text-[#cebdff] border border-[#BDA7FF]/20">
                            {msg.source === 'gmail'
                              ? 'Gmail'
                              : msg.source === 'inbound-email'
                                ? 'Inbound Email'
                                : 'Website Contact'}
                          </span>
                        </div>
                        <p className="text-xs text-[#cbc3d6]">
                          From: <span className="text-white">{msg.name}</span> ({msg.email}) &rarr; To: {msg.to || mailboxAddress}
                        </p>
                        <p className="text-xs text-[#948e9f] tabular-nums">
                          {new Date(msg.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <StatusBadge status={msg.status} />
                        {msg.status === 'new' ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Check size={14} />}
                            onClick={() => void handleMarkReviewed(msg.id)}
                          >
                            Mark Reviewed
                          </Button>
                        ) : null}
                        <button
                          type="button"
                          aria-label={`Delete message ${msg.subject}`}
                          onClick={() => void handleDeleteMessage(msg.id)}
                          className="p-2 rounded-full bg-[#151123] border border-[#ffb4ab]/20 text-[#ffb4ab] hover:bg-[#93000a]/50 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-[#e7defa] whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {toast ? <Toast message={toast} onDismiss={() => setToast('')} /> : null}
    </div>
  );
};
