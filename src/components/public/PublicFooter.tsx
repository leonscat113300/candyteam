import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Lock, Mail } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import { BrandLogo } from '../shared/BrandLogo';
import { SocialPlatformIcon } from '../shared/SocialIcons';

export const PublicFooter: React.FC = () => {
  const { store } = useContent();
  if (!store) return null;

  const { navigation, studio, contact } = store;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#BDA7FF]/10 bg-[#0f0b1e]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="inline-block">
              <BrandLogo />
            </Link>
            <p className="text-sm text-[#cbc3d6] leading-relaxed max-w-sm">
              {navigation.footer.tagline || studio.shortBio}
            </p>
            {contact.email ? (
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2 text-sm text-[#cebdff] hover:text-white transition-colors"
              >
                <Mail size={15} />
                <span>{contact.email}</span>
              </a>
            ) : null}
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {navigation.footer.columns.map((col) => (
              <div key={col.id} className="space-y-3">
                <h3 className="font-display text-sm font-semibold text-white">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links
                    .filter((l) => l.visible)
                    .sort((a, b) => a.order - b.order)
                    .map((link) => (
                      <li key={link.id}>
                        <Link
                          to={link.path}
                          className="text-sm text-[#cbc3d6] hover:text-white transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}

            <div className="space-y-3">
              <h3 className="font-display text-sm font-semibold text-white">
                Connect
              </h3>
              <ul className="space-y-2.5">
                {contact.googlePlayDeveloperUrl ? (
                  <li>
                    <a
                      href={contact.googlePlayDeveloperUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-[#cbc3d6] hover:text-white transition-colors"
                    >
                      <span>Google Play</span>
                      <ExternalLink size={12} />
                    </a>
                  </li>
                ) : null}
                {contact.socialLinks.map((social) => (
                  <li key={social.id}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#cbc3d6] hover:text-white transition-colors"
                    >
                      <SocialPlatformIcon platform={social.platform} size={16} />
                      <span>{social.label || social.platform}</span>
                      <ExternalLink size={12} className="text-[#948e9f]" />
                    </a>
                  </li>
                ))}
                <li>
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 text-sm text-[#BDA7FF] hover:text-white transition-colors"
                  >
                    <Lock size={13} />
                    <span>Admin Panel</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[#948e9f]">
          <p>
            © {year} {navigation.footer.copyrightText}
          </p>
          <p>Android & Google Play Studio</p>
        </div>
      </div>
    </footer>
  );
};
