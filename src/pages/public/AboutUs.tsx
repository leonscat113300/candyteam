import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SEOHead } from '../../components/shared/SEOHead';
import { Button } from '../../components/ui/Button';
import { useContent } from '../../hooks/useContent';

export const AboutUs: React.FC = () => {
  const { store } = useContent();
  if (!store) return null;

  const page = store.pages.about;
  const { studio } = store;
  const storySection = page.sections.story;
  const missionSection = page.sections.missionVision;
  const visionSection = page.sections.vision;
  const valuesSection = page.sections.values;

  return (
    <>
      <SEOHead seo={store.seo.pages.about || page.seo} />

      <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 pt-14 pb-20 space-y-14">
        <div className="max-w-3xl space-y-5">
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
          {page.hero.primaryCtaLabel ? (
            <div className="pt-2">
              <Link to={page.hero.primaryCtaPath || '/games'}>
                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={17} />}>
                  {page.hero.primaryCtaLabel}
                </Button>
              </Link>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="candy-glass-card rounded-[2rem] overflow-hidden flex flex-col">
            {storySection?.image ? (
              <div className="aspect-video w-full overflow-hidden bg-[#151123] border-b border-[#BDA7FF]/10">
                <img
                  src={storySection.image}
                  alt={storySection.heading || 'Our Studio Story'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
              </div>
            ) : null}
            <div className="p-7 space-y-3 flex-1">
              <h2 className="font-display text-2xl font-bold text-white">
                {storySection?.heading || 'Our Studio Story'}
              </h2>
              <p className="text-sm text-[#cbc3d6] leading-relaxed">
                {studio.fullStory || storySection?.body}
              </p>
            </div>
          </div>

          <div className="candy-glass-card rounded-[2rem] overflow-hidden flex flex-col">
            {missionSection?.image ? (
              <div className="aspect-video w-full overflow-hidden bg-[#151123] border-b border-[#BDA7FF]/10">
                <img
                  src={missionSection.image}
                  alt="Mission"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
              </div>
            ) : null}
            <div className="p-7 space-y-3 flex-1">
              <h2 className="font-display text-2xl font-bold text-[#cebdff]">
                Mission
              </h2>
              <p className="text-sm text-[#cbc3d6] leading-relaxed">
                {studio.mission}
              </p>
            </div>
          </div>

          <div className="candy-glass-card rounded-[2rem] overflow-hidden flex flex-col">
            {visionSection?.image ? (
              <div className="aspect-video w-full overflow-hidden bg-[#151123] border-b border-[#BDA7FF]/10">
                <img
                  src={visionSection.image}
                  alt="Vision"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
              </div>
            ) : null}
            <div className="p-7 space-y-3 flex-1">
              <h2 className="font-display text-2xl font-bold text-[#cebdff]">
                Vision
              </h2>
              <p className="text-sm text-[#cbc3d6] leading-relaxed">
                {studio.vision || visionSection?.body}
              </p>
            </div>
          </div>
        </div>

        {valuesSection ? (
          <div className="space-y-8">
            <div className="space-y-2 max-w-2xl">
              <h2 className="font-display text-3xl font-bold text-white">
                {valuesSection.heading}
              </h2>
              <p className="text-sm sm:text-base text-[#cbc3d6]">
                {valuesSection.body}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(valuesSection.items || []).map((val) => (
                <div
                  key={val.id}
                  className="candy-glass-card rounded-[2rem] overflow-hidden flex flex-col"
                >
                  {val.image ? (
                    <div className="aspect-video w-full overflow-hidden bg-[#151123] border-b border-[#BDA7FF]/10">
                      <img
                        src={val.image}
                        alt={val.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                      />
                    </div>
                  ) : null}
                  <div className="p-7 space-y-3 flex-1">
                    <h3 className="font-display text-xl font-semibold text-white">
                      {val.title}
                    </h3>
                    <p className="text-sm text-[#cbc3d6] leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
};
