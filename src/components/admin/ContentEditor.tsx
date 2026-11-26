import React from 'react';
import { PageContent } from '../../types/content';
import { FormInput } from '../ui/FormInput';
import { FormTextarea } from '../ui/FormTextarea';

export interface ContentEditorProps {
  page: PageContent;
  onChange: (next: PageContent) => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  page,
  onChange,
}) => {
  const sectionKeys = Object.keys(page.sections);

  return (
    <div className="space-y-6">
      <div className="candy-glass-card rounded-[2rem] p-6 space-y-4">
        <h3 className="font-display text-lg font-semibold text-white">
          Page Hero Section
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Page Title"
            value={page.title}
            onChange={(e) => onChange({ ...page, title: e.target.value })}
          />
          <FormInput
            label="Hero Eyebrow / Subheading"
            value={page.hero.subheading || ''}
            onChange={(e) =>
              onChange({
                ...page,
                hero: { ...page.hero, subheading: e.target.value },
              })
            }
          />
        </div>

        <FormInput
          label="Hero Heading"
          value={page.hero.heading}
          onChange={(e) =>
            onChange({
              ...page,
              hero: { ...page.hero, heading: e.target.value },
            })
          }
        />

        <FormTextarea
          label="Hero Description"
          rows={3}
          value={page.hero.body}
          onChange={(e) =>
            onChange({
              ...page,
              hero: { ...page.hero, body: e.target.value },
            })
          }
        />

        <FormInput
          label="Hero Image URL (Optional)"
          value={page.hero.image || ''}
          onChange={(e) =>
            onChange({
              ...page,
              hero: { ...page.hero, image: e.target.value },
            })
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Primary CTA Label"
            value={page.hero.primaryCtaLabel || ''}
            onChange={(e) =>
              onChange({
                ...page,
                hero: { ...page.hero, primaryCtaLabel: e.target.value },
              })
            }
          />
          <FormInput
            label="Primary CTA Route / URL"
            value={page.hero.primaryCtaPath || ''}
            onChange={(e) =>
              onChange({
                ...page,
                hero: { ...page.hero, primaryCtaPath: e.target.value },
              })
            }
          />
          <FormInput
            label="Secondary CTA Label"
            value={page.hero.secondaryCtaLabel || ''}
            onChange={(e) =>
              onChange({
                ...page,
                hero: { ...page.hero, secondaryCtaLabel: e.target.value },
              })
            }
          />
          <FormInput
            label="Secondary CTA Route / URL"
            value={page.hero.secondaryCtaPath || ''}
            onChange={(e) =>
              onChange({
                ...page,
                hero: { ...page.hero, secondaryCtaPath: e.target.value },
              })
            }
          />
        </div>
      </div>

      {sectionKeys.map((key) => {
        const sec = page.sections[key];
        return (
          <div key={key} className="candy-glass-card rounded-[2rem] p-6 space-y-4">
            <h3 className="font-display text-lg font-semibold text-white">
              Section: {sec.heading || key}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Section Heading"
                value={sec.heading}
                onChange={(e) =>
                  onChange({
                    ...page,
                    sections: {
                      ...page.sections,
                      [key]: { ...sec, heading: e.target.value },
                    },
                  })
                }
              />
              <FormInput
                label="Section Subheading"
                value={sec.subheading || ''}
                onChange={(e) =>
                  onChange({
                    ...page,
                    sections: {
                      ...page.sections,
                      [key]: { ...sec, subheading: e.target.value },
                    },
                  })
                }
              />
            </div>

            <FormTextarea
              label="Section Body"
              rows={3}
              value={sec.body}
              onChange={(e) =>
                onChange({
                  ...page,
                  sections: {
                    ...page.sections,
                    [key]: { ...sec, body: e.target.value },
                  },
                })
              }
            />

            {sec.items && sec.items.length > 0 ? (
              <div className="space-y-3 pt-2 border-t border-white/10">
                <p className="text-xs font-semibold text-[#BDA7FF]">
                  Section Items
                </p>
                {sec.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#151123] border border-[#BDA7FF]/10"
                  >
                    <FormInput
                      label={`Item ${idx + 1} Title`}
                      value={item.title}
                      onChange={(e) => {
                        const updatedItems = [...(sec.items || [])];
                        updatedItems[idx] = { ...item, title: e.target.value };
                        onChange({
                          ...page,
                          sections: {
                            ...page.sections,
                            [key]: { ...sec, items: updatedItems },
                          },
                        });
                      }}
                    />
                    <FormInput
                      label={`Item ${idx + 1} Description`}
                      value={item.description}
                      onChange={(e) => {
                        const updatedItems = [...(sec.items || [])];
                        updatedItems[idx] = {
                          ...item,
                          description: e.target.value,
                        };
                        onChange({
                          ...page,
                          sections: {
                            ...page.sections,
                            [key]: { ...sec, items: updatedItems },
                          },
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
