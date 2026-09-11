import React, { useState } from 'react';
import { UserLimit } from '../types';
import { saveLimits, exportDataCSV, exportDataJSON } from '../services/storage';
import { Sliders, Download, ShieldCheck, Check, Trash2, Database } from 'lucide-react';

interface SettingsViewProps {
  limits: UserLimit[];
  onLimitsUpdated: () => void;
  onDataReset: () => void;
  onLoadSampleData?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  limits,
  onLimitsUpdated,
  onDataReset,
  onLoadSampleData
}) => {
  const caffLimit = limits.find(l => l.metric === 'max_caffeine_daily')?.thresholdValue || 300;
  const waterTarget = limits.find(l => l.metric === 'min_water_daily')?.thresholdValue || 2500;
  const cutoffHour = limits.find(l => l.metric === 'caffeine_cutoff_hour')?.thresholdValue || 16;

  const [currentCaff, setCurrentCaff] = useState(caffLimit);
  const [currentWater, setCurrentWater] = useState(waterTarget);
  const [currentCutoff, setCurrentCutoff] = useState(cutoffHour);
  const [isSaved, setIsSaved] = useState(false);
  const [localOnlyMode, setLocalOnlyMode] = useState(true);

  const handleSave = () => {
    const updated: UserLimit[] = limits.map(l => {
      if (l.metric === 'max_caffeine_daily') return { ...l, thresholdValue: currentCaff };
      if (l.metric === 'min_water_daily') return { ...l, thresholdValue: currentWater };
      if (l.metric === 'caffeine_cutoff_hour') return { ...l, thresholdValue: currentCutoff };
      return l;
    });

    saveLimits(updated);
    onLimitsUpdated();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleDownloadCSV = () => {
    const csv = exportDataCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brewbalance_ai_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brewbalance_ai_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Limits & Guardrails Panel */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Sliders size={20} color="var(--color-water)" />
          <h3 style={{ fontSize: '1.2rem' }}>Personal Limits & Guardrails</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Daily Caffeine Cap */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Daily Caffeine Cap</span>
              <span style={{ fontWeight: 700, color: 'var(--color-coffee)' }}>{currentCaff} mg</span>
            </div>
            <input
              type="range"
              min="100"
              max="600"
              step="25"
              value={currentCaff}
              onChange={(e) => setCurrentCaff(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--color-coffee)', cursor: 'pointer' }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              EFSA recommended maximum is 400mg for healthy adults.
            </div>
          </div>

          {/* Daily Water Goal */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Daily Hydration Target</span>
              <span style={{ fontWeight: 700, color: 'var(--color-water)' }}>{currentWater} ml</span>
            </div>
            <input
              type="range"
              min="1000"
              max="4500"
              step="100"
              value={currentWater}
              onChange={(e) => setCurrentWater(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--color-water)', cursor: 'pointer' }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Typically 2,000ml to 3,000ml recommended based on activity level.
            </div>
          </div>

          {/* Circadian Cutoff Hour */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Circadian Caffeine Cut-off</span>
              <span style={{ fontWeight: 700, color: '#c084fc' }}>
                {currentCutoff % 12 === 0 ? 12 : currentCutoff % 12}:00 {currentCutoff >= 12 ? 'PM' : 'AM'}
              </span>
            </div>
            <input
              type="range"
              min="12"
              max="22"
              step="1"
              value={currentCutoff}
              onChange={(e) => setCurrentCutoff(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Caffeine has a 5-7 hour half life. Cut off by 3-4 PM to prevent sleep disruption.
            </div>
          </div>

          <button
            onClick={handleSave}
            className="btn btn-primary"
            style={{ marginTop: 6 }}
          >
            {isSaved ? <Check size={18} /> : null}
            <span>{isSaved ? 'Settings Saved' : 'Apply & Save Rules'}</span>
          </button>
        </div>
      </div>

      {/* Data Sovereignty & Portability */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Download size={20} color="var(--color-success)" />
          <h3 style={{ fontSize: '1.2rem' }}>Data Export & Sovereignty</h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 14 }}>
          You have full ownership of your biometrics. Download your complete history in open CSV or JSON formats.
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleDownloadCSV} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem' }}>
            <Download size={14} /> Export CSV
          </button>
          <button onClick={handleDownloadJSON} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem' }}>
            <Download size={14} /> Export JSON
          </button>
        </div>
      </div>


      {/* Security & Local Mode */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <ShieldCheck size={20} color="var(--color-water)" />
          <h3 style={{ fontSize: '1.2rem' }}>Privacy & Data Management</h3>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Air-Gapped Local-Only Mode</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All Edge-ML inference runs on-device</div>
          </div>
          <input
            type="checkbox"
            checked={localOnlyMode}
            onChange={(e) => setLocalOnlyMode(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: 'var(--color-water)', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
          <button
            onClick={onDataReset}
            className="btn"
            style={{
              width: '100%',
              background: 'rgba(244, 63, 94, 0.1)',
              color: 'var(--color-danger)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              fontSize: '0.85rem'
            }}
          >
            <Trash2 size={14} /> Clear All Intake History (Fresh 0ml Start)
          </button>

          {onLoadSampleData && (
            <button
              onClick={onLoadSampleData}
              className="btn btn-secondary"
              style={{
                width: '100%',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)'
              }}
            >
              <Database size={14} /> Load 7-Day Demo Data (Preview Charts)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
