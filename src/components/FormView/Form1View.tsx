import React, { useState } from 'react';
import { WizardSettings, CanvasObject } from '@/types/bartender';

interface Form1ViewProps {
  settings: WizardSettings;
  objects: CanvasObject[];
  onUpdateFieldValue: (objectId: string, newValue: string) => void;
  onPrint: () => void;
  onReturnToTemplate: () => void;
}

export const Form1View: React.FC<Form1ViewProps> = ({
  settings,
  objects,
  onUpdateFieldValue,
  onPrint,
  onReturnToTemplate,
}) => {
  const [copies, setCopies] = useState(1);

  // Find barcode and text objects
  const barcodeObjs = objects.filter((o) => o.type === 'barcode');
  const textObjs = objects.filter((o) => o.type === 'text');

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#7a97b2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: '560px',
          background: '#f0efe8',
          border: '1px solid #7f9db9',
          boxShadow: '1px 1px 0 #fff inset, -1px -1px 0 #707070 inset, 4px 6px 20px rgba(0,0,0,0.4)',
          borderRadius: '3px',
          overflow: 'hidden',
          fontFamily: 'Segoe UI, Tahoma, sans-serif',
        }}
      >
        {/* Title */}
        <div
          style={{
            height: '28px',
            background: 'linear-gradient(180deg, #3870b2 0%, #205088 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          <span>BarTender Data Entry Form - [Form 1]</span>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '12px', color: '#333' }}>
            Enter the values to be printed on the active label template (
            <strong>{settings.templateWidthMm} x {settings.templateHeightMm} mm</strong>).
          </div>

          <div
            style={{
              background: '#fff',
              border: '1px solid #7f9db9',
              borderRadius: '2px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {barcodeObjs.map((b: any, idx) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ width: '140px', fontSize: '12px', fontWeight: 600, color: '#333' }}>
                  Barcode {idx + 1} ({b.format}):
                </label>
                <input
                  type="text"
                  value={b.value}
                  onChange={(e) => onUpdateFieldValue(b.id, e.target.value)}
                  style={{
                    flex: 1,
                    height: '24px',
                    padding: '2px 6px',
                    border: '1px solid #7f9db9',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
              </div>
            ))}

            {textObjs.map((t: any, idx) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ width: '140px', fontSize: '12px', fontWeight: 600, color: '#333' }}>
                  Text Field {idx + 1}:
                </label>
                <input
                  type="text"
                  value={t.text}
                  onChange={(e) => onUpdateFieldValue(t.id, e.target.value)}
                  style={{
                    flex: 1,
                    height: '24px',
                    padding: '2px 6px',
                    border: '1px solid #7f9db9',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
              </div>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', borderTop: '1px dotted #ccc', paddingTop: '10px' }}>
              <label style={{ width: '140px', fontSize: '12px', fontWeight: 600, color: '#333' }}>
                Number of Copies:
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width: '70px', height: '24px', padding: '2px 6px', border: '1px solid #7f9db9' }}
              />
              <span style={{ fontSize: '11px', color: '#666' }}>labels to print</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            height: '46px',
            background: '#e8e6df',
            borderTop: '1px solid #d0cec7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 16px',
            gap: '10px',
          }}
        >
          <button
            onClick={onReturnToTemplate}
            style={{
              height: '26px',
              padding: '0 12px',
              background: 'linear-gradient(180deg, #fff 0%, #ece9d8 100%)',
              border: '1px solid #7f9db9',
              borderRadius: '2px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            ← Back to Template
          </button>

          <button
            onClick={onPrint}
            style={{
              height: '26px',
              padding: '0 16px',
              background: 'linear-gradient(180deg, #3870b2 0%, #205088 100%)',
              color: '#fff',
              border: '1px solid #1a4474',
              borderRadius: '2px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🖨️ Print Form Data
          </button>
        </div>
      </div>
    </div>
  );
};

