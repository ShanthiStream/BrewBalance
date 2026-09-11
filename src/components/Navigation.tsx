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
    <div style={{
      position: 'fixed',
      bottom: 18,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      zIndex: 60,
      pointerEvents: 'none',
      padding: '0 16px'
    }}>
      {/* Floating Luxury Dock */}
      <nav style={{
        pointerEvents: 'auto',
        width: '100%',
        maxWidth: 480,
        height: 66,
        background: 'rgba(10, 15, 26, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 'var(--radius-full)',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 1px 1px rgba(255, 255, 255, 0.15) inset',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 18px',
        position: 'relative'
      }}>
        {/* Top Specular Sheen */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '15%',
          right: '15%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
        }} />

        {/* 1. Decide Tab */}
        <button
          onClick={() => onSelectTab('home')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'home' ? '#00d2ff' : '#64748b',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            padding: '6px 14px',
            position: 'relative',
            transition: 'all 0.2s ease'
          }}
        >
          <Compass size={22} strokeWidth={activeTab === 'home' ? 2.5 : 1.8} />
          <span style={{ fontSize: '0.72rem', fontWeight: activeTab === 'home' ? 800 : 500 }}>
            Decide
          </span>
          {activeTab === 'home' && (
            <span style={{
              position: 'absolute',
              bottom: 0,
              width: 14,
              height: 3,
              borderRadius: 2,
              background: '#00d2ff',
              boxShadow: '0 0 8px #00d2ff'
            }} />
          )}
        </button>

        {/* 2. Floating Radiant Center "+" Button */}
        <button
          onClick={onOpenLogModal}
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00d2ff 0%, #0284c7 50%, #0369a1 100%)',
            color: '#ffffff',
            border: '2px solid rgba(255, 255, 255, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginTop: -22,
            boxShadow: '0 10px 25px rgba(0, 210, 255, 0.5), 0 1px 2px rgba(255, 255, 255, 0.5) inset',
            transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 14px 32px rgba(0, 210, 255, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 210, 255, 0.5)';
          }}
          title="Log Beverage Intake"
        >
          <Plus size={26} strokeWidth={2.8} />
        </button>

        {/* 3. Analytics Tab */}
        <button
          onClick={() => onSelectTab('dashboard')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'dashboard' ? '#00d2ff' : '#64748b',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            padding: '6px 14px',
            position: 'relative',
            transition: 'all 0.2s ease'
          }}
        >
          <BarChart2 size={22} strokeWidth={activeTab === 'dashboard' ? 2.5 : 1.8} />
          <span style={{ fontSize: '0.72rem', fontWeight: activeTab === 'dashboard' ? 800 : 500 }}>
            Analytics
          </span>
          {activeTab === 'dashboard' && (
            <span style={{
              position: 'absolute',
              bottom: 0,
              width: 14,
              height: 3,
              borderRadius: 2,
              background: '#00d2ff',
              boxShadow: '0 0 8px #00d2ff'
            }} />
          )}
        </button>

        {/* 4. Settings / Limits Tab */}
        <button
          onClick={() => onSelectTab('settings')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'settings' ? '#00d2ff' : '#64748b',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            padding: '6px 14px',
            position: 'relative',
            transition: 'all 0.2s ease'
          }}
        >
          <Settings size={22} strokeWidth={activeTab === 'settings' ? 2.5 : 1.8} />
          <span style={{ fontSize: '0.72rem', fontWeight: activeTab === 'settings' ? 800 : 500 }}>
            Limits
          </span>
          {activeTab === 'settings' && (
            <span style={{
              position: 'absolute',
              bottom: 0,
              width: 14,
              height: 3,
              borderRadius: 2,
              background: '#00d2ff',
              boxShadow: '0 0 8px #00d2ff'
            }} />
          )}
        </button>
      </nav>
    </div>
  );
};
