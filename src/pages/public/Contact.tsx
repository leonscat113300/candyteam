import React, { useState } from 'react';
import { CheckCircle2, Clock, ExternalLink, Mail, MapPin, Phone, Send } from 'lucide-react';
import { SEOHead } from '../../components/shared/SEOHead';
import { SocialPlatformIcon } from '../../components/shared/SocialIcons';
import { Button } from '../../components/ui/Button';
import { FormInput } from '../../components/ui/FormInput';
import { FormTextarea } from '../../components/ui/FormTextarea';
import { useContent } from '../../hooks/useContent';

export const Contact: React.FC = () => {
  const { store, addContactSubmission } = useContent();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!store) return null;

  const page = store.pages.contact;
  const { contact, settings } = store;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please complete your name, email, and message.');
      return;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) {
      setError('Please enter a valid email address.');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim() || 'General Inquiry',
          message: message.trim(),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(payload.error || 'Unable to send your message right now.');
        return;
      }

      await addContactSubmission({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || 'General Inquiry',
        message: message.trim(),
      });

      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSubmitted(true);
    } catch {
      setError('Network error while sending message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <SEOHead seo={store.seo.pages.contact || page.seo} />

      <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 pt-14 pb-20 space-y-12">
        <div className="max-w-3xl space-y-4">
          {page.hero.subheading ? (
            <p className="text-xs font-semibold text-[#BDA7FF]">
              {page.hero.subheading}
            </p>
          ) : null}
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
            {page.hero.heading}
          </h1>
          <p className="text-base sm:text-lg text-[#cbc3d6] leading-relaxed">
            {page.hero.body}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 candy-glass-card rounded-[2rem] p-7 sm:p-9 space-y-6">
            <div className="space-y-1.5">
              <h2 className="font-display text-2xl font-bold text-white">
                {page.sections.formIntro?.heading || 'Send a Message'}
              </h2>
              <p className="text-sm text-[#cbc3d6]">
                {page.sections.formIntro?.body}
              </p>
            </div>

            {!settings.enableContactForm ? (
              <div className="rounded-2xl bg-[#151123] border border-[#BDA7FF]/15 p-6 text-sm text-[#cbc3d6]">
                The contact form is currently disabled in General Settings.
              </div>
            ) : submitted ? (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-400/25 p-6 space-y-3">
                <div className="flex items-center gap-2.5 text-emerald-300 font-semibold">
                  <CheckCircle2 size={20} />
                  <span>Message Received</span>
                </div>
                <p className="text-sm text-[#e7defa]">
                  Thank you for contacting CandyGame. Your message has been sent to
                  our studio inbox ({contact.email || 'candyteam@info.com'}).
                </p>
                <Button variant="secondary" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    required
                  />
                  <FormInput
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <FormInput
                  label="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Player feedback, press, or partnership"
                />

                <FormTextarea
                  label="Message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our studio help you?"
                  required
                />

                {error ? (
                  <p className="text-sm text-[#ffb4ab]">{error}</p>
                ) : null}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={sending}
                  rightIcon={<Send size={16} />}
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>

          <div className="lg:col-span-5 candy-glass-card rounded-[2rem] p-7 sm:p-9 space-y-6">
            <div className="space-y-1.5">
              <h2 className="font-display text-2xl font-bold text-white">
                {page.sections.directDetails?.heading || 'Studio Contact Information'}
              </h2>
              <p className="text-sm text-[#cbc3d6]">
                {page.sections.directDetails?.body}
              </p>
            </div>

            <div className="space-y-4 text-sm">
              {contact.email ? (
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-[#BDA7FF] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#948e9f]">Studio Email</p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-white hover:text-[#cebdff] transition-colors font-medium"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>
              ) : null}

              {contact.supportEmail && contact.supportEmail !== contact.email ? (
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-[#BDA7FF] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#948e9f]">Player Support</p>
                    <a
                      href={`mailto:${contact.supportEmail}`}
                      className="text-white hover:text-[#cebdff] transition-colors"
                    >
                      {contact.supportEmail}
                    </a>
                  </div>
                </div>
              ) : null}

              {contact.phone ? (
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-[#BDA7FF] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#948e9f]">Phone</p>
                    <p className="text-white">{contact.phone}</p>
                  </div>
                </div>
              ) : null}

              {contact.address ? (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[#BDA7FF] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#948e9f]">Location</p>
                    <p className="text-white">{contact.address}</p>
                  </div>
                </div>
              ) : null}

              {contact.businessHours ? (
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-[#BDA7FF] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#948e9f]">Hours</p>
                    <p className="text-white">{contact.businessHours}</p>
                  </div>
                </div>
              ) : null}

              {contact.socialLinks.length > 0 ? (
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <p className="text-xs font-semibold text-[#BDA7FF]">
                    Social Channels
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {contact.socialLinks.map((social) => (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#151123] border border-[#BDA7FF]/25 text-xs sm:text-sm font-medium text-[#e7defa] hover:border-[#BDA7FF]/60 hover:text-white transition-all"
                      >
                        <SocialPlatformIcon platform={social.platform} size={18} />
                        <span>{social.label || social.platform}</span>
                        <ExternalLink size={13} className="text-[#948e9f]" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
