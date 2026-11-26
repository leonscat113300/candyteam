import React, { useEffect } from 'react';
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { AboutUs } from '../pages/public/AboutUs';
import { BrainChallenge } from '../pages/public/BrainChallenge';
import { ColorWorld } from '../pages/public/ColorWorld';
import { Contact } from '../pages/public/Contact';
import { GameDetailView } from '../pages/public/GameDetailView';
import { Games } from '../pages/public/Games';
import { Home } from '../pages/public/Home';
import { CategoriesManagement } from '../pages/admin/CategoriesManagement';
import { Dashboard } from '../pages/admin/Dashboard';
import { DownloadsManagement } from '../pages/admin/DownloadsManagement';
import { GameEditor } from '../pages/admin/GameEditor';
import { GamesManagement } from '../pages/admin/GamesManagement';
import { GeneralSettings } from '../pages/admin/GeneralSettings';
import { SEOSettings } from '../pages/admin/SEOSettings';
import { StudioContact } from '../pages/admin/StudioContact';
import { WebsiteContent } from '../pages/admin/WebsiteContent';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const DynamicGameRoute: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return <GameDetailView slug={slug || ''} />;
};

export const AppRouter: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Website Routes (6 approved screens + dynamic game slug support) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/brain-challenge" element={<BrainChallenge />} />
          <Route path="/games/color-world" element={<ColorWorld />} />
          <Route path="/games/:slug" element={<DynamicGameRoute />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Admin Panel Routes (9 approved screens) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="games" element={<GamesManagement />} />
          <Route path="games/new" element={<GameEditor />} />
          <Route path="games/:id/edit" element={<GameEditor />} />
          <Route path="categories" element={<CategoriesManagement />} />
          <Route path="downloads" element={<DownloadsManagement />} />
          <Route path="content" element={<WebsiteContent />} />
          <Route path="studio-contact" element={<StudioContact />} />
          <Route path="seo" element={<SEOSettings />} />
          <Route path="settings" element={<GeneralSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};
