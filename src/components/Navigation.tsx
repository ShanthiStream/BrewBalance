import React from 'react';
import { Compass, BarChart2, Plus, Settings } from 'lucide-react';

export type TabType = 'home' | 'dashboard' | 'settings';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenLogModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenLogModal
}) => {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 70,
      background: 'rgba(9, 13, 22, 0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 16px',
      zIndex: 50,
      maxWidth: 680,
      margin: '0 auto'
    }}>
      {/* Home / Recommendation Tab */}
      <button
        onClick={() => onSelectTab('home')}
        style={{
          background: 'none',
          border: 'none',
          color: activeTab === 'home' ? 'var(--color-water)' : 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
          padding: '6px 16px',
          transition: 'all 0.2s ease'
        }}
      >
        <Compass size={22} />
        <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Decide</span>
      </button>

      {/* Floating Center "+" Action Button */}
      <button
        onClick={onOpenLogModal}
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
          color: '#ffffff',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          marginTop: -22,
          boxShadow: '0 8px 20px rgba(6, 182, 212, 0.5)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        title="Log Beverage Intake"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Dashboard / Analytics Tab */}
      <button
        onClick={() => onSelectTab('dashboard')}
        style={{
          background: 'none',
          border: 'none',
          color: activeTab === 'dashboard' ? 'var(--color-water)' : 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
          padding: '6px 16px',
          transition: 'all 0.2s ease'
        }}
      >
        <BarChart2 size={22} />
        <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Analytics</span>
      </button>

      {/* Settings / Rules Tab */}
      <button
        onClick={() => onSelectTab('settings')}
        style={{
          background: 'none',
          border: 'none',
          color: activeTab === 'settings' ? 'var(--color-water)' : 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
          padding: '6px 16px',
          transition: 'all 0.2s ease'
        }}
      >
        <Settings size={22} />
        <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Limits</span>
      </button>
    </nav>
  );
};
