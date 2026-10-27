import React from 'react';
import { WizardSettings, CanvasObject, BarcodeObject, TextObject, ShapeObject, BarcodeFormat } from '@/types/bartender';
import styles from './RightProperties.module.css';

interface RightPropertiesPanelProps {
  settings: WizardSettings;
  selectedObject: CanvasObject | null;
  onUpdateObject: (updated: CanvasObject) => void;
  onOpenBatchModal: () => void;
  onPrint: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
}

const BARCODE_FORMAT_OPTIONS: { value: BarcodeFormat; label: string }[] = [
  { value: 'CODE128', label: 'Code 128' },
  { value: 'CODE39', label: 'Code 39' },
  { value: 'EAN13', label: 'EAN-13' },
  { value: 'EAN8', label: 'EAN-8' },
  { value: 'UPC', label: 'UPC-A' },
  { value: 'ITF14', label: 'ITF-14' },
  { value: 'QR', label: 'QR Code' },
];

export const RightPropertiesPanel: React.FC<RightPropertiesPanelProps> = ({
  settings,
  selectedObject,
  onUpdateObject,
  onOpenBatchModal,
  onPrint,
  onExportPng,
  onExportSvg,
}) => {
  return (
    <div className={styles.propertiesPanel}>
      <div className={styles.panelHeader}>
        <span>⚙️</span>
        <span>{selectedObject ? `${selectedObject.type} Properties` : 'Document Properties'}</span>
      </div>

      {/* Selected Object Inspector */}
      {selectedObject && selectedObject.type === 'barcode' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Barcode Data & Format</div>
          <div className={styles.row}>
            <label className={styles.label}>Format / Symbology:</label>
            <select
              className={styles.select}
              value={(selectedObject as BarcodeObject).format}
              onChange={(e) =>
                onUpdateObject({
                  ...selectedObject,
                  format: e.target.value as BarcodeFormat,
                })
              }
            >
              {BARCODE_FORMAT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Barcode Value:</label>
            <input
              type="text"
              className={styles.input}
              value={(selectedObject as BarcodeObject).value}
              onChange={(e) =>
                onUpdateObject({
                  ...selectedObject,
                  value: e.target.value,
                })
              }
            />
          </div>

          {(selectedObject as BarcodeObject).format !== 'QR' && (
            <>
              <div className={styles.row}>
                <label className={styles.label}>Bar Width: {(selectedObject as BarcodeObject).barWidth}px</label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.2"
                  value={(selectedObject as BarcodeObject).barWidth}
                  onChange={(e) =>
                    onUpdateObject({
                      ...selectedObject,
                      barWidth: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className={styles.rowInline}>
                <label className={styles.label} style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={(selectedObject as BarcodeObject).displayValue}
                    onChange={(e) =>
                      onUpdateObject({
                        ...selectedObject,
                        displayValue: e.target.checked,
                      })
                    }
                  />
                  <span style={{ marginLeft: '6px' }}>Display Human Text</span>
                </label>
              </div>
            </>
          )}

          <div className={styles.row}>
            <label className={styles.label}>Barcode Color:</label>
            <div className={styles.colorRow}>
              <input
                type="color"
                className={styles.colorInput}
                value={(selectedObject as BarcodeObject).fgColor || '#000000'}
                onChange={(e) =>
                  onUpdateObject({
                    ...selectedObject,
                    fgColor: e.target.value,
                  })
                }
              />
              <span style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                {((selectedObject as BarcodeObject).fgColor || '#000000').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {selectedObject && selectedObject.type === 'text' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Text Content & Style</div>
          <div className={styles.row}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className={styles.label}>Text Content:</label>
              <span style={{ fontSize: '10px', color: '#205088', fontStyle: 'italic' }}>
                (Double-click text on label to edit)
              </span>
            </div>
            <textarea
              rows={2}
              className={styles.input}
              style={{ height: 'auto', minHeight: '38px', resize: 'vertical', userSelect: 'text' }}
              value={(selectedObject as TextObject).text}
              onChange={(e) =>
                onUpdateObject({
                  ...selectedObject,
                  text: e.target.value,
                })
              }
              placeholder="Type your label text..."
            />
            <button
              className={styles.actionBtn}
              style={{ marginTop: '4px', fontSize: '11px', padding: '2px 6px' }}
              onClick={() => {
                const approxCharWidth = (selectedObject as TextObject).fontSize * 0.4;
                const newW = Math.max(10, Number(((selectedObject as TextObject).text.length * approxCharWidth).toFixed(1)));
                onUpdateObject({ ...selectedObject, width: newW });
              }}
            >
              ↔️ Auto-Fit Box Width
            </button>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Font Family:</label>
            <select
              className={styles.select}
              value={(selectedObject as TextObject).fontFamily}
              onChange={(e) =>
                onUpdateObject({
                  ...selectedObject,
                  fontFamily: e.target.value,
                })
              }
            >
              <option value="Printer Sans Serif">Printer Sans Serif</option>
              <option value="Arial">Arial</option>
              <option value="Segoe UI">Segoe UI</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Consolas">Consolas</option>
            </select>
          </div>

          <div className={styles.rowInline}>
            <label className={styles.label}>Font Size:</label>
            <input
              type="number"
              min="4"
              max="72"
              value={(selectedObject as TextObject).fontSize}
              onChange={(e) =>
                onUpdateObject({
                  ...selectedObject,
                  fontSize: parseInt(e.target.value) || 10,
                })
              }
              style={{ width: '60px', height: '22px' }}
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Text Color:</label>
            <div className={styles.colorRow}>
              <input
                type="color"
                className={styles.colorInput}
                value={(selectedObject as TextObject).color || '#000000'}
                onChange={(e) =>
                  onUpdateObject({
                    ...selectedObject,
                    color: e.target.value,
                  })
                }
              />
              <span style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                {((selectedObject as TextObject).color || '#000000').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {selectedObject && selectedObject.type === 'shape' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Shape Style</div>
          <div className={styles.row}>
            <label className={styles.label}>Fill Color:</label>
            <div className={styles.colorRow}>
              <input
                type="color"
                className={styles.colorInput}
                value={(selectedObject as ShapeObject).fillColor || '#ffffff'}
                onChange={(e) =>
                  onUpdateObject({
                    ...selectedObject,
                    fillColor: e.target.value,
                  })
                }
              />
              <button
                className={styles.actionBtn}
                style={{ width: 'auto', padding: '1px 6px', margin: 0 }}
                onClick={() => onUpdateObject({ ...selectedObject, fillColor: 'transparent' })}
              >
                No Fill
              </button>
            </div>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Stroke Color:</label>
            <div className={styles.colorRow}>
              <input
                type="color"
                className={styles.colorInput}
                value={(selectedObject as ShapeObject).strokeColor || '#000000'}
                onChange={(e) =>
                  onUpdateObject({
                    ...selectedObject,
                    strokeColor: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {selectedObject && selectedObject.type === 'line' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Line Style & Orientation</div>
          <div className={styles.row}>
            <label className={styles.label}>Line Orientation:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <button
                className={`${styles.actionBtn} ${(selectedObject.rotation || 0) % 180 === 0 ? styles.actionBtnPrimary : ''}`}
                style={{ margin: 0, padding: '3px 6px' }}
                onClick={() => onUpdateObject({ ...selectedObject, rotation: 0 })}
              >
                ─ Horizontal (0°)
              </button>
              <button
                className={`${styles.actionBtn} ${(selectedObject.rotation || 0) % 180 === 90 ? styles.actionBtnPrimary : ''}`}
                style={{ margin: 0, padding: '3px 6px' }}
                onClick={() => onUpdateObject({ ...selectedObject, rotation: 90 })}
              >
                │ Vertical (90°)
              </button>
              <button
                className={`${styles.actionBtn} ${(selectedObject.rotation || 0) === 45 ? styles.actionBtnPrimary : ''}`}
                style={{ margin: 0, padding: '3px 6px' }}
                onClick={() => onUpdateObject({ ...selectedObject, rotation: 45 })}
              >
                ╱ Diagonal (45°)
              </button>
              <button
                className={`${styles.actionBtn} ${(selectedObject.rotation || 0) === 135 ? styles.actionBtnPrimary : ''}`}
                style={{ margin: 0, padding: '3px 6px' }}
                onClick={() => onUpdateObject({ ...selectedObject, rotation: 135 })}
              >
                ╲ Diagonal (135°)
              </button>
            </div>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Line Thickness:</label>
            <select
              className={styles.select}
              value={(selectedObject as any).strokeWidth || 1}
              onChange={(e) =>
                onUpdateObject({
                  ...selectedObject,
                  strokeWidth: parseFloat(e.target.value) || 1,
                })
              }
            >
              <option value="0.5">0.5 pt</option>
              <option value="1.0">1.0 pt</option>
              <option value="1.5">1.5 pt</option>
              <option value="2.0">2.0 pt</option>
              <option value="3.0">3.0 pt</option>
              <option value="4.0">4.0 pt</option>
            </select>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Line Color:</label>
            <div className={styles.colorRow}>
              <input
                type="color"
                className={styles.colorInput}
                value={(selectedObject as any).strokeColor || '#000000'}
                onChange={(e) =>
                  onUpdateObject({
                    ...selectedObject,
                    strokeColor: e.target.value,
                  })
                }
              />
              <span style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                {((selectedObject as any).strokeColor || '#000000').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Object Geometry & Rotation */}
      {selectedObject && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Position, Size & Rotation</div>
          <div className={styles.rowInline}>
            <label className={styles.label}>X:</label>
            <input
              type="number"
              step="0.5"
              value={selectedObject.x}
              onChange={(e) =>
                onUpdateObject({
                  ...selectedObject,
                  x: parseFloat(e.target.value) || 0,
                })
              }
              style={{ width: '65px', height: '22px' }}
            />
            <label className={styles.label} style={{ marginLeft: '10px' }}>Y:</label>
            <input
              type="number"
              step="0.5"
              value={selectedObject.y}
              onChange={(e) =>
                onUpdateObject({
                  ...selectedObject,
                  y: parseFloat(e.target.value) || 0,
                })
              }
              style={{ width: '65px', height: '22px' }}
            />
          </div>

          <div className={styles.rowInline}>
            <label className={styles.label}>W:</label>
            <input
              type="number"
              step="0.5"
              value={selectedObject.width}
              onChange={(e) =>
                onUpdateObject({
                  ...selectedObject,
                  width: parseFloat(e.target.value) || 1,
                })
              }
              style={{ width: '65px', height: '22px' }}
            />
            <label className={styles.label} style={{ marginLeft: '10px' }}>H:</label>
            <input
              type="number"
              step="0.5"
              value={selectedObject.height}
              onChange={(e) =>
                onUpdateObject({
                  ...selectedObject,
                  height: parseFloat(e.target.value) || 1,
                })
              }
              style={{ width: '65px', height: '22px' }}
            />
          </div>

          <div className={styles.row} style={{ marginTop: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className={styles.label}>Rotation Angle:</label>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#205088' }}>
                {selectedObject.rotation || 0}°
              </span>
            </div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              <button
                className={styles.actionBtn}
                style={{ flex: 1, margin: 0, padding: '3px 4px' }}
                onClick={() =>
                  onUpdateObject({
                    ...selectedObject,
                    rotation: (((selectedObject.rotation || 0) + 90) % 360),
                  })
                }
                title="Rotate 90 degrees clockwise"
              >
                ⟳ +90°
              </button>
              <button
                className={styles.actionBtn}
                style={{ flex: 1, margin: 0, padding: '3px 4px' }}
                onClick={() =>
                  onUpdateObject({
                    ...selectedObject,
                    rotation: (((selectedObject.rotation || 0) + 270) % 360),
                  })
                }
                title="Rotate 90 degrees counter-clockwise"
              >
                ⟲ -90°
              </button>
              <button
                className={styles.actionBtn}
                style={{ flex: 1, margin: 0, padding: '3px 4px' }}
                onClick={() =>
                  onUpdateObject({
                    ...selectedObject,
                    rotation: (((selectedObject.rotation || 0) + 180) % 360),
                  })
                }
                title="Flip 180 degrees"
              >
                180°
              </button>
              <button
                className={styles.actionBtn}
                style={{ flex: 1, margin: 0, padding: '3px 4px' }}
                onClick={() =>
                  onUpdateObject({
                    ...selectedObject,
                    rotation: 0,
                  })
                }
                title="Reset to 0 degrees"
              >
                0°
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Info Section */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Document Specs</div>
        <div style={{ fontSize: '11px', color: '#333', lineHeight: 1.6 }}>
          <div><strong>Item Size:</strong> {settings.templateWidthMm} x {settings.templateHeightMm} mm</div>
          <div><strong>Page Size:</strong> {settings.pageWidthMm} x {settings.pageHeightMm} mm</div>
          <div><strong>Layout:</strong> {settings.itemsPerPageType === 'single' ? 'Single' : `${settings.rows}x${settings.cols} (${settings.rows * settings.cols} labels)`}</div>
          <div><strong>Shape:</strong> {settings.shape}</div>
          <div><strong>Printer:</strong> {settings.printer}</div>
        </div>
      </div>

      {/* Production & Export Tools */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Production & Export</div>
        <button className={styles.actionBtnPrimary} onClick={onPrint}>
          <span>🖨️</span>
          <span>Print Label / Sheet</span>
        </button>

        <button className={styles.actionBtn} onClick={onOpenBatchModal}>
          <span>🔢</span>
          <span>Batch Generate Barcodes</span>
        </button>

        <button className={styles.actionBtn} onClick={onExportPng}>
          <span>🖼️</span>
          <span>Download High-Res PNG</span>
        </button>

        <button className={styles.actionBtn} onClick={onExportSvg}>
          <span>📐</span>
          <span>Download Vector SVG</span>
        </button>
      </div>
    </div>
  );
};

