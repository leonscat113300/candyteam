import React from 'react';

export interface TabItem {
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div
      role="tablist"
      className="inline-flex flex-wrap items-center gap-1.5 p-1.5 rounded-full bg-[#1d192c] border border-[#BDA7FF]/15"
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              active
                ? 'bg-[#7652D6] text-white candy-glow-btn'
                : 'text-[#cbc3d6] hover:text-white hover:bg-[#2c273b]/60'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
