import React, { useState } from 'react';
import { X, QrCode, Radio, Check } from 'lucide-react';
import { BeverageType, IntakeSource } from '../types';
import confetti from 'canvas-confetti';

interface IntakeLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveIntake: (intake: {
    beverageType: BeverageType;
    volumeMl: number;
    caffeineMg: number;
    source: IntakeSource;
    label?: string;
  }) => void;
}

export const IntakeLoggerModal: React.FC<IntakeLoggerModalProps> = ({
  isOpen,
  onClose,
  onSaveIntake
}) => {
  if (!isOpen) return null;

  const [beverageType, setBeverageType] = useState<BeverageType>('water');
  const [volumeMl, setVolumeMl] = useState<number>(250);
  const [source, setSource] = useState<IntakeSource>('manual');
  const [activeTab, setActiveTab] = useState<'manual' | 'nfc' | 'qr'>('manual');
  const [customLabel, setCustomLabel] = useState<string>('');
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);

  // Volume Presets by beverage
  const presets: Record<BeverageType, { label: string; ml: number }[]> = {
    water: [
      { label: 'Glass', ml: 250 },
      { label: 'Mug', ml: 350 },
      { label: 'Bottle', ml: 500 },
      { label: 'Flask', ml: 750 }
    ],
    tea: [
      { label: 'Teacup', ml: 200 },
      { label: 'Mug', ml: 250 },
      { label: 'Large Mug', ml: 350 },
      { label: 'Teapot', ml: 500 }
    ],
    coffee: [
      { label: 'Espresso', ml: 60 },
      { label: 'Flat White', ml: 180 },
      { label: 'Standard Mug', ml: 250 },
      { label: 'Large Roast', ml: 350 }
    ]
  };

  // Compute caffeine based on standard ratios
  const calculateCaffeine = (type: BeverageType, ml: number): number => {
    if (type === 'water') return 0;
    if (type === 'tea') return Math.round((ml / 250) * 45); // ~45mg per 250ml
    if (type === 'coffee') {
      if (ml <= 60) return 65; // Double shot espresso
      return Math.round((ml / 250) * 95); // ~95mg per 250ml standard drip
    }
    return 0;
  };

  const currentCaffeine = calculateCaffeine(beverageType, volumeMl);

  const handleSubmit = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });

    onSaveIntake({
      beverageType,
      volumeMl,
      caffeineMg: currentCaffeine,
      source,
      label: customLabel || undefined
    });

    onClose();
  };

  const handleSimulateScan = (scanType: 'nfc' | 'qr') => {
    setIsSimulatingScan(true);
    setTimeout(() => {
      setIsSimulatingScan(false);
      setSource(scanType);
      if (scanType === 'nfc') {
        setBeverageType('water');
        setVolumeMl(500);
        setCustomLabel('Smart Hydro Flask');
      } else {
        setBeverageType('coffee');
        setVolumeMl(250);
        setCustomLabel('Roastery Ceramic Mug');
      }
      setActiveTab('manual');
    }, 700);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '18px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Log Beverage Intake</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Capture fluid volume & caffeine telemetry</p>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Input Mode Selector */}
        <div style={{
          display: 'flex',
          padding: '12px 20px 0 20px',
          gap: 8,
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveTab('manual')}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'manual' ? '2px solid var(--color-water)' : '2px solid transparent',
              color: activeTab === 'manual' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setActiveTab('nfc')}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'nfc' ? '2px solid var(--color-water)' : '2px solid transparent',
              color: activeTab === 'nfc' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <Radio size={14} /> NFC Scan
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'qr' ? '2px solid var(--color-water)' : '2px solid transparent',
              color: activeTab === 'qr' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <QrCode size={14} /> QR Mug
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {activeTab === 'manual' ? (
            <>
              {/* Beverage Type Selection Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {/* Water Card */}
                <div
                  onClick={() => setBeverageType('water')}
                  style={{
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-lg)',
                    border: beverageType === 'water' ? '2px solid var(--color-water)' : '1px solid var(--border-subtle)',
                    background: beverageType === 'water' ? 'linear-gradient(180deg, rgba(0, 210, 255, 0.16) 0%, rgba(15, 23, 42, 0.9) 100%)' : 'rgba(255, 255, 255, 0.03)',
                    padding: '14px 8px',
                    textAlign: 'center',
                    transition: 'all var(--transition-bounce)',
                    boxShadow: beverageType === 'water' ? '0 8px 24px rgba(0, 210, 255, 0.35)' : 'none',
                    transform: beverageType === 'water' ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  <div style={{ position: 'relative', width: 48, height: 48, margin: '0 auto 8px' }}>
                    <img
                      src="/assets/water-thumb.webp"
                      alt="Water"
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: beverageType === 'water' ? '2px solid var(--color-water)' : '1px solid var(--border-subtle)',
                        boxShadow: beverageType === 'water' ? '0 0 14px rgba(0, 210, 255, 0.5)' : 'none'
                      }}
                    />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: beverageType === 'water' ? 'var(--color-water)' : 'var(--text-primary)' }}>
                    Water
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>0 mg caff</div>
                </div>

                {/* Tea Card */}
                <div
                  onClick={() => setBeverageType('tea')}
                  style={{
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-lg)',
                    border: beverageType === 'tea' ? '2px solid var(--color-tea)' : '1px solid var(--border-subtle)',
                    background: beverageType === 'tea' ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.16) 0%, rgba(15, 23, 42, 0.9) 100%)' : 'rgba(255, 255, 255, 0.03)',
                    padding: '14px 8px',
                    textAlign: 'center',
                    transition: 'all var(--transition-bounce)',
                    boxShadow: beverageType === 'tea' ? '0 8px 24px rgba(16, 185, 129, 0.35)' : 'none',
                    transform: beverageType === 'tea' ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  <div style={{ position: 'relative', width: 48, height: 48, margin: '0 auto 8px' }}>
                    <img
                      src="/assets/tea-thumb.webp"
                      alt="Tea"
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: beverageType === 'tea' ? '2px solid var(--color-tea)' : '1px solid var(--border-subtle)',
                        boxShadow: beverageType === 'tea' ? '0 0 14px rgba(16, 185, 129, 0.5)' : 'none'
                      }}
                    />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: beverageType === 'tea' ? 'var(--color-tea)' : 'var(--text-primary)' }}>
                    Tea
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>~45 mg caff</div>
                </div>

                {/* Coffee Card */}
                <div
                  onClick={() => setBeverageType('coffee')}
                  style={{
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-lg)',
                    border: beverageType === 'coffee' ? '2px solid var(--color-coffee)' : '1px solid var(--border-subtle)',
                    background: beverageType === 'coffee' ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.16) 0%, rgba(15, 23, 42, 0.9) 100%)' : 'rgba(255, 255, 255, 0.03)',
                    padding: '14px 8px',
                    textAlign: 'center',
                    transition: 'all var(--transition-bounce)',
                    boxShadow: beverageType === 'coffee' ? '0 8px 24px rgba(245, 158, 11, 0.35)' : 'none',
                    transform: beverageType === 'coffee' ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  <div style={{ position: 'relative', width: 48, height: 48, margin: '0 auto 8px' }}>
                    <img
                      src="/assets/coffee-thumb.webp"
                      alt="Coffee"
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: beverageType === 'coffee' ? '2px solid var(--color-coffee)' : '1px solid var(--border-subtle)',
                        boxShadow: beverageType === 'coffee' ? '0 0 14px rgba(245, 158, 11, 0.5)' : 'none'
                      }}
                    />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: beverageType === 'coffee' ? 'var(--color-coffee)' : 'var(--text-primary)' }}>
                    Coffee
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>~95 mg caff</div>
                </div>
              </div>

              {/* Portion Presets */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                  Portion Preset
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {presets[beverageType].map((p) => (
                    <button
                      key={p.ml}
                      type="button"
                      onClick={() => setVolumeMl(p.ml)}
                      style={{
                        padding: '10px 6px',
                        borderRadius: 'var(--radius-sm)',
                        background: volumeMl === p.ml ? 'rgba(255, 255, 255, 0.15)' : 'var(--bg-glass)',
                        border: volumeMl === p.ml ? '1px solid #fff' : '1px solid var(--border-subtle)',
                        color: volumeMl === p.ml ? '#fff' : 'var(--text-secondary)',
                        fontWeight: volumeMl === p.ml ? 700 : 500,
                        cursor: 'pointer',
                        fontSize: '0.82rem'
                      }}
                    >
                      <div>{p.ml}ml</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.75 }}>{p.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Volume Slider</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{volumeMl} ml</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={volumeMl}
                  onChange={(e) => setVolumeMl(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--color-water)', cursor: 'pointer' }}
                />
              </div>

              {/* Summary Stats Banner */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Caffeine</div>
                  <div style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: currentCaffeine > 0 ? 'var(--color-coffee)' : 'var(--color-water)'
                  }}>
                    {currentCaffeine} mg
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Source</div>
                  <span className="glass-pill" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    {source}
                  </span>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
              >
                <Check size={18} />
                <span>Confirm & Log Intake</span>
              </button>
            </>
          ) : activeTab === 'nfc' ? (
            /* NFC Scanner Simulator */
            <div style={{ textAlign: 'center', padding: '30px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: 'rgba(6, 182, 212, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-water)',
                animation: isSimulatingScan ? 'pulseGlow 0.8s infinite' : 'none'
              }}>
                <Radio size={36} />
              </div>
              <h4>NFC Smart Drinkware Scan</h4>
              <p style={{ fontSize: '0.85rem', maxWidth: 320 }}>
                Hold your phone near an NFC-enabled Smart Tumbler or hydro-flask to automatically log your hydration.
              </p>
              <button
                onClick={() => handleSimulateScan('nfc')}
                disabled={isSimulatingScan}
                className="btn btn-primary"
                style={{ marginTop: 10 }}
              >
                {isSimulatingScan ? 'Reading Tag...' : 'Simulate NFC Cup Tap'}
              </button>
            </div>
          ) : (
            /* QR Mug Scanner Simulator */
            <div style={{ textAlign: 'center', padding: '30px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-coffee)',
                animation: isSimulatingScan ? 'pulseGlow 0.8s infinite' : 'none'
              }}>
                <QrCode size={36} />
              </div>
              <h4>QR Code Mug Scanner</h4>
              <p style={{ fontSize: '0.85rem', maxWidth: 320 }}>
                Scan the QR code printed on your workplace cafe mug to pull exact volume and roast specs.
              </p>
              <button
                onClick={() => handleSimulateScan('qr')}
                disabled={isSimulatingScan}
                className="btn btn-primary"
                style={{ marginTop: 10, background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
              >
                {isSimulatingScan ? 'Scanning Code...' : 'Simulate QR Code Scan'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
