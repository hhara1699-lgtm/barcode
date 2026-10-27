import React, { useState } from 'react';
import { WizardSettings } from '@/types/bartender';
import { PRINTER_LIST, PREDEFINED_CATEGORIES, PREDEFINED_STOCKS, DEFAULT_WIZARD_SETTINGS } from '@/data/defaults';
import { LivePreview } from './LivePreview';
import { PrinterPropertiesModal } from '../Modals/PrinterPropertiesModal';
import { DocumentPropertiesModal } from '../Modals/DocumentPropertiesModal';
import styles from './Wizard.module.css';

interface NewDocumentWizardProps {
  onFinish: (settings: WizardSettings) => void;
  onCancel: () => void;
}

export const NewDocumentWizard: React.FC<NewDocumentWizardProps> = ({
  onFinish,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);
  const [settings, setSettings] = useState<WizardSettings>({ ...DEFAULT_WIZARD_SETTINGS });

  // Dialog popups
  const [showPrinterProps, setShowPrinterProps] = useState(false);
  const [showDocProps, setShowDocProps] = useState(false);

  // Helper to update settings
  const updateSettings = (updates: Partial<WizardSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };

      // Automatic recalculation of template size if manual is off
      if (!next.manualTemplateSize) {
        const rows = next.itemsPerPageType === 'single' ? 1 : Math.max(1, next.rows);
        const cols = next.itemsPerPageType === 'single' ? 1 : Math.max(1, next.cols);

        const left = next.hasUnusedMaterial ? next.unusedLeftMm : 0;
        const right = next.hasUnusedMaterial ? next.unusedRightMm : 0;
        const top = next.hasUnusedMaterial ? next.unusedTopMm : 0;
        const bottom = next.hasUnusedMaterial ? next.unusedBottomMm : 0;

        const totalHorizGap = (cols - 1) * next.horizGapMm;
        const totalVertGap = (rows - 1) * next.vertGapMm;

        const availW = Math.max(1, next.pageWidthMm - left - right - totalHorizGap);
        const availH = Math.max(1, next.pageHeightMm - top - bottom - totalVertGap);

        next.templateWidthMm = Number((availW / cols).toFixed(1));
        next.templateHeightMm = Number((availH / rows).toFixed(1));
      }

      return next;
    });
  };

  const handleStockSelect = (stockId: string) => {
    const found = PREDEFINED_STOCKS.find((s) => s.id === stockId);
    if (found) {
      updateSettings({
        predefinedStockId: found.id,
        pageWidthMm: found.pageWidth,
        pageHeightMm: found.pageHeight,
        itemsPerPageType: found.rows === 1 && found.cols === 1 ? 'single' : 'multiple',
        rows: found.rows,
        cols: found.cols,
        templateWidthMm: found.itemWidth,
        templateHeightMm: found.itemHeight,
        shape: found.shape,
        hasUnusedMaterial: found.leftMargin > 0 || found.rightMargin > 0,
        unusedLeftMm: found.leftMargin,
        unusedRightMm: found.rightMargin,
        unusedTopMm: found.topMargin,
        unusedBottomMm: found.bottomMargin,
        horizGapMm: found.horizGap,
        vertGapMm: found.vertGap,
      });
    }
  };

  const canGoBack = step > 1;
  const canGoNext = step < 10;

  const handleNext = () => {
    if (step < 10) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = () => {
    onFinish(settings);
  };

  // Header Title & Subtitle based on current step
  const getStepHeader = () => {
    switch (step) {
      case 1:
        return {
          title: 'Printer Selection',
          subtitle: 'Specify the printer to use with this document.',
        };
      case 2:
        return {
          title: 'Stock Selection',
          subtitle:
            'A Stock specifies the size of the page and the size, number, and position of the items on the page. You may select a predefined Stock or specify your own custom settings.',
        };
      case 3:
        return {
          title: 'Items Per Page',
          subtitle: 'Specify the characteristics of your media.',
        };
      case 4:
        return {
          title: 'Side Edges',
          subtitle: 'Specify the characteristics of the side edges of your media.',
        };
      case 5:
        return {
          title: 'Page Size',
          subtitle: 'Select a page size and orientation.',
        };
      case 6:
        return {
          title: 'Printed Item Shape',
          subtitle: 'Specify the shape of your items.',
        };
      case 7:
        return {
          title: 'Template Size',
          subtitle: 'Specify the size of your item.',
        };
      case 8:
        return {
          title: 'Printing Order',
          subtitle: 'Specify the printing order of the items.',
        };
      case 9:
        return {
          title: 'Template Background',
          subtitle: 'Select a picture or color for your background.',
        };
      case 10:
        return {
          title: 'Finished!',
          subtitle:
            'When you press Finish, a new BarTender document will be created using the settings that you specified.',
        };
      default:
        return { title: 'New Document Wizard', subtitle: '' };
    }
  };

  const header = getStepHeader();

  return (
    <div className={styles.wizardOverlay}>
      <div className={styles.wizardWindow}>
        {/* Title Bar */}
        <div className={styles.titleBar}>
          <div className={styles.titleLeft}>
            <span className={styles.titleIcon}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="14" height="14" rx="2" fill="#205088" />
                <rect x="3" y="5" width="2" height="6" fill="#fff" />
                <rect x="6" y="3" width="2" height="8" fill="#fff" />
                <rect x="9" y="6" width="2" height="5" fill="#fff" />
                <rect x="12" y="4" width="2" height="7" fill="#fff" />
              </svg>
            </span>
            <span>New Document Wizard</span>
          </div>
          <button className={styles.closeBtn} onClick={onCancel} title="Close">✕</button>
        </div>

        {/* BarTender Header Banner */}
        <div className={styles.banner}>
          <div className={styles.bannerText}>
            <div className={styles.bannerTitle}>{header.title}</div>
            <div className={styles.bannerSubtitle}>{header.subtitle}</div>
          </div>
          <div className={styles.bannerArt}>
            <svg width="68" height="46" viewBox="0 0 72 52" fill="none">
              <defs>
                <linearGradient id="artBg" x1="0" y1="0" x2="72" y2="52" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1e4a8a" />
                  <stop offset="100%" stopColor="#5b8fc9" />
                </linearGradient>
              </defs>
              <rect width="72" height="52" fill="url(#artBg)" rx="2" />
              <rect x="4" y="8" width="2" height="36" fill="rgba(255,255,255,0.8)" />
              <rect x="8" y="4" width="4" height="44" fill="rgba(255,255,255,0.9)" />
              <rect x="14" y="10" width="2" height="32" fill="rgba(255,255,255,0.7)" />
              <rect x="18" y="6" width="3" height="40" fill="rgba(255,255,255,0.85)" />
              <rect x="23" y="12" width="2" height="28" fill="rgba(255,255,255,0.6)" />
              <circle cx="52" cy="26" r="16" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
              <circle cx="52" cy="26" r="10" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
              <circle cx="52" cy="26" r="4" fill="rgba(255,255,255,0.9)" />
              <rect x="34" y="10" width="10" height="14" rx="1" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
              <rect x="36" y="12" width="6" height="2" fill="rgba(255,255,255,0.7)" />
              <rect x="36" y="15" width="6" height="2" fill="rgba(255,255,255,0.7)" />
              <rect x="36" y="18" width="4" height="2" fill="rgba(255,255,255,0.7)" />
            </svg>
          </div>
        </div>

        {/* Wizard Main Content Area */}
        <div className={styles.bodyLayout}>
          {/* ────────────────── Step 1: Printer Selection (Photo 1) ────────────────── */}
          {step === 1 && (
            <div className={styles.printerSelectionLayout}>
              <div className={styles.printerListSection}>
                <div className={styles.printerListLabel}>Printer:</div>
                <div className={styles.printerBox}>
                  {PRINTER_LIST.map((p) => (
                    <div
                      key={p}
                      className={`${styles.printerRow} ${settings.printer === p ? styles.printerRowSelected : ''}`}
                      onClick={() => updateSettings({ printer: p })}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                        <rect x="1" y="5" width="14" height="8" rx="1" fill={settings.printer === p ? '#fff' : '#555'} opacity="0.85" />
                        <rect x="4" y="1" width="8" height="5" rx="1" fill={settings.printer === p ? '#fff' : '#777'} />
                        <rect x="4" y="10" width="8" height="4" rx="1" fill={settings.printer === p ? '#c8d8f0' : '#e5e5e5'} />
                        <rect x="10" y="7" width="2" height="1" rx="0.5" fill={settings.printer === p ? '#90b0e0' : '#316ac5'} />
                      </svg>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.printerButtonsSection}>
                <button
                  className={styles.propDialogBtn}
                  onClick={() => setShowDocProps(true)}
                >
                  Document Properties...
                </button>
                <button
                  className={styles.propDialogBtn}
                  onClick={() => setShowPrinterProps(true)}
                >
                  Printer Properties...
                </button>
              </div>
            </div>
          )}

          {/* ────────────────── Step 2: Stock Selection (Photo 2) ────────────────── */}
          {step === 2 && (
            <div className={styles.bodySingleColumn}>
              <div className={styles.instructionText}>
                A Stock specifies the size of the page and the size, number, and position of the items on the page. You may select a predefined Stock or specify your own custom settings.
              </div>

              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="stockType"
                    checked={settings.stockType === 'custom'}
                    onChange={() => updateSettings({ stockType: 'custom' })}
                    className={styles.radioInput}
                  />
                  <span>Specify Custom Settings</span>
                </label>

                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="stockType"
                    checked={settings.stockType === 'predefined'}
                    onChange={() => updateSettings({ stockType: 'predefined' })}
                    className={styles.radioInput}
                  />
                  <span>Use a Predefined Stock</span>
                </label>
              </div>

              {settings.stockType === 'predefined' && (
                <div className={styles.subFieldBlock}>
                  <div className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>Category:</span>
                    <select
                      className={styles.selectInput}
                      value={settings.predefinedCategory}
                      onChange={(e) => updateSettings({ predefinedCategory: e.target.value })}
                    >
                      {PREDEFINED_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.fieldRow} style={{ alignItems: 'flex-start' }}>
                    <span className={styles.fieldLabel} style={{ paddingTop: '4px' }}>Stock Name:</span>
                    <div className={styles.printerBox} style={{ width: '380px', height: '140px' }}>
                      {PREDEFINED_STOCKS.filter(
                        (s) => settings.predefinedCategory === 'Custom' || s.category === settings.predefinedCategory
                      ).map((s) => (
                        <div
                          key={s.id}
                          className={`${styles.printerRow} ${settings.predefinedStockId === s.id ? styles.printerRowSelected : ''}`}
                          onClick={() => handleStockSelect(s.id)}
                        >
                          {s.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ────────────────── Step 3: Items Per Page (Photo 3 & 4) ────────────────── */}
          {step === 3 && (
            <div className={styles.bodySingleColumn}>
              <div className={styles.instructionText}>
                Most media has only a single item (label, card, tag, etc.) per page of stock. Some media, however, are more complex and have multiple items on a page.
              </div>

              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="itemsPerPageType"
                    checked={settings.itemsPerPageType === 'single'}
                    onChange={() => updateSettings({ itemsPerPageType: 'single', rows: 1, cols: 1 })}
                    className={styles.radioInput}
                  />
                  <span>Single item per page</span>
                </label>

                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="itemsPerPageType"
                    checked={settings.itemsPerPageType === 'multiple'}
                    onChange={() => updateSettings({ itemsPerPageType: 'multiple', rows: 4, cols: 4 })}
                    className={styles.radioInput}
                  />
                  <span>Multiple columns and/or rows of items per page</span>
                </label>
              </div>

              {settings.itemsPerPageType === 'multiple' && (
                <div className={styles.subFieldBlock}>
                  <div className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>Rows:</span>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={settings.rows}
                      onChange={(e) => updateSettings({ rows: Math.max(1, parseInt(e.target.value) || 1) })}
                      className={styles.numberInput}
                    />
                  </div>
                  <div className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>Columns:</span>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={settings.cols}
                      onChange={(e) => updateSettings({ cols: Math.max(1, parseInt(e.target.value) || 1) })}
                      className={styles.numberInput}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ────────────────── Step 4: Side Edges (Photo 5) ────────────────── */}
          {step === 4 && (
            <>
              <div className={styles.formColumn}>
                <div className={styles.instructionText}>
                  Does your stock have a small amount of unused material between the edge of the item and the edge of the page?
                </div>

                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="hasUnusedMaterial"
                      checked={settings.hasUnusedMaterial}
                      onChange={() => updateSettings({ hasUnusedMaterial: true, unusedLeftMm: 1.3, unusedRightMm: 1.3 })}
                      className={styles.radioInput}
                    />
                    <span>Yes, it does have some unused material on the sides</span>
                  </label>

                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="hasUnusedMaterial"
                      checked={!settings.hasUnusedMaterial}
                      onChange={() => updateSettings({ hasUnusedMaterial: false, unusedLeftMm: 0, unusedRightMm: 0 })}
                      className={styles.radioInput}
                    />
                    <span>No, it does not</span>
                  </label>
                </div>

                {settings.hasUnusedMaterial && (
                  <div className={styles.subFieldBlock}>
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#444', marginBottom: '4px' }}>
                      Width of Unused Area:
                    </div>
                    <div className={styles.fieldRow}>
                      <span className={styles.fieldLabel}>Left:</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={settings.unusedLeftMm}
                        onChange={(e) => updateSettings({ unusedLeftMm: parseFloat(e.target.value) || 0 })}
                        className={styles.numberInput}
                      />
                      <span className={styles.unitSpan}>mm</span>
                    </div>
                    <div className={styles.fieldRow}>
                      <span className={styles.fieldLabel}>Right:</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={settings.unusedRightMm}
                        onChange={(e) => updateSettings({ unusedRightMm: parseFloat(e.target.value) || 0 })}
                        className={styles.numberInput}
                      />
                      <span className={styles.unitSpan}>mm</span>
                    </div>
                  </div>
                )}
              </div>
              <LivePreview settings={settings} />
            </>
          )}

          {/* ────────────────── Step 5: Page Size (Photo 6) ────────────────── */}
          {step === 5 && (
            <>
              <div className={styles.formColumn}>
                <div className={styles.fieldRow} style={{ marginBottom: '10px' }}>
                  <span className={styles.fieldLabel}>Page Size:</span>
                  <select
                    className={styles.selectInput}
                    value={settings.pageSizePreset}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'A4') updateSettings({ pageSizePreset: val, pageWidthMm: 210, pageHeightMm: 297 });
                      else if (val === 'Letter') updateSettings({ pageSizePreset: val, pageWidthMm: 215.9, pageHeightMm: 279.4 });
                      else if (val === '4x6 in') updateSettings({ pageSizePreset: val, pageWidthMm: 101.6, pageHeightMm: 152.4 });
                      else updateSettings({ pageSizePreset: val });
                    }}
                  >
                    <option value="User Defined Size">User Defined Size</option>
                    <option value="A4">A4 (210 x 297 mm)</option>
                    <option value="Letter">Letter (8.5 x 11 in)</option>
                    <option value="4x6 in">4 x 6 in (101.6 x 152.4 mm)</option>
                  </select>
                </div>

                <div className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>Width:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    value={settings.pageWidthMm}
                    onChange={(e) => updateSettings({ pageWidthMm: parseFloat(e.target.value) || 10 })}
                    className={styles.numberInput}
                  />
                  <span className={styles.unitSpan}>mm</span>

                  <span className={styles.fieldLabel} style={{ width: '50px', marginLeft: '12px' }}>Height:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    value={settings.pageHeightMm}
                    onChange={(e) => updateSettings({ pageHeightMm: parseFloat(e.target.value) || 10 })}
                    className={styles.numberInput}
                  />
                  <span className={styles.unitSpan}>mm</span>
                </div>

                <div className={styles.pageOrientationLayout}>
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#444', marginBottom: '6px' }}>Orientation</div>
                    <div className={styles.orientationRadioGroup}>
                      {(['portrait', 'landscape', 'portrait180', 'landscape180'] as const).map((orient) => (
                        <label key={orient} className={styles.radioLabel}>
                          <input
                            type="radio"
                            name="orientation"
                            checked={settings.orientation === orient}
                            onChange={() => updateSettings({ orientation: orient })}
                            className={styles.radioInput}
                          />
                          <span style={{ textTransform: 'capitalize' }}>
                            {orient === 'portrait180' ? 'Portrait 180' : orient === 'landscape180' ? 'Landscape 180' : orient}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className={styles.printerFeederBox}>
                    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                      <rect x="6" y="10" width="36" height="28" rx="3" fill="#dde4ec" stroke="#7a9cb8" strokeWidth="2" />
                      <rect x="12" y="4" width="24" height="10" rx="1" fill="#fff" stroke="#90b0d0" strokeWidth="1.5" />
                      <rect x="14" y="24" width="20" height="18" rx="1" fill="#fff" stroke="#90b0d0" strokeWidth="1.5" />
                      <line x1="18" y1="28" x2="30" y2="28" stroke="#316ac5" strokeWidth="1.5" />
                      <line x1="18" y1="32" x2="26" y2="32" stroke="#316ac5" strokeWidth="1.5" />
                      <path d="M24 18l-3 4h6l-3-4z" fill="#316ac5" />
                    </svg>
                    <span style={{ fontSize: '9px', color: '#555', marginTop: '2px' }}>Label Feed</span>
                  </div>
                </div>

                <div style={{ marginTop: '14px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#444', marginBottom: '6px' }}>Effects</div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label className={styles.radioLabel}>
                      <input
                        type="checkbox"
                        checked={settings.mirrorImage}
                        onChange={(e) => updateSettings({ mirrorImage: e.target.checked })}
                      />
                      <span>Mirror Image</span>
                    </label>
                    <label className={styles.radioLabel}>
                      <input
                        type="checkbox"
                        checked={settings.negative}
                        onChange={(e) => updateSettings({ negative: e.target.checked })}
                      />
                      <span>Negative</span>
                    </label>
                  </div>
                </div>
              </div>
              <LivePreview settings={settings} />
            </>
          )}

          {/* ────────────────── Step 6: Printed Item Shape (Photo 7 & 8) ────────────────── */}
          {step === 6 && (
            <>
              <div className={styles.formColumn}>
                <div className={styles.instructionText}>
                  Specify the shape of your items.
                </div>

                <div className={styles.shapeOptionsGrid}>
                  {/* Rectangle */}
                  <div
                    className={`${styles.shapeOptionRow} ${settings.shape === 'rectangle' ? styles.shapeOptionRowActive : ''}`}
                    onClick={() => updateSettings({ shape: 'rectangle' })}
                  >
                    <input
                      type="radio"
                      name="itemShape"
                      checked={settings.shape === 'rectangle'}
                      onChange={() => updateSettings({ shape: 'rectangle' })}
                      className={styles.radioInput}
                    />
                    <div className={styles.shapeIconBox}>
                      <div style={{ width: '24px', height: '18px', border: '1.5px solid #205088', background: '#fff' }} />
                    </div>
                    <span className={styles.shapeLabelText}>Rectangle</span>
                  </div>

                  {/* Rounded Rectangle */}
                  <div
                    className={`${styles.shapeOptionRow} ${settings.shape === 'roundedRectangle' ? styles.shapeOptionRowActive : ''}`}
                    onClick={() => updateSettings({ shape: 'roundedRectangle' })}
                  >
                    <input
                      type="radio"
                      name="itemShape"
                      checked={settings.shape === 'roundedRectangle'}
                      onChange={() => updateSettings({ shape: 'roundedRectangle' })}
                      className={styles.radioInput}
                    />
                    <div className={styles.shapeIconBox}>
                      <div style={{ width: '24px', height: '18px', border: '1.5px solid #205088', borderRadius: '5px', background: '#fff' }} />
                    </div>
                    <span className={styles.shapeLabelText}>Rounded Rectangle</span>
                  </div>

                  {/* Ellipse */}
                  <div
                    className={`${styles.shapeOptionRow} ${settings.shape === 'ellipse' ? styles.shapeOptionRowActive : ''}`}
                    onClick={() => updateSettings({ shape: 'ellipse' })}
                  >
                    <input
                      type="radio"
                      name="itemShape"
                      checked={settings.shape === 'ellipse'}
                      onChange={() => updateSettings({ shape: 'ellipse' })}
                      className={styles.radioInput}
                    />
                    <div className={styles.shapeIconBox}>
                      <div style={{ width: '26px', height: '18px', border: '1.5px solid #205088', borderRadius: '50%', background: '#fff' }} />
                    </div>
                    <span className={styles.shapeLabelText}>Ellipse</span>
                  </div>

                  {/* Circle */}
                  <div
                    className={`${styles.shapeOptionRow} ${settings.shape === 'circle' ? styles.shapeOptionRowActive : ''}`}
                    onClick={() => updateSettings({ shape: 'circle' })}
                  >
                    <input
                      type="radio"
                      name="itemShape"
                      checked={settings.shape === 'circle'}
                      onChange={() => updateSettings({ shape: 'circle' })}
                      className={styles.radioInput}
                    />
                    <div className={styles.shapeIconBox}>
                      <div style={{ width: '20px', height: '20px', border: '1.5px solid #205088', borderRadius: '50%', background: '#fff' }} />
                    </div>
                    <span className={styles.shapeLabelText}>Circle</span>
                  </div>
                </div>

                {settings.shape === 'roundedRectangle' && (
                  <div className={styles.fieldRow} style={{ marginTop: '14px', marginLeft: '32px' }}>
                    <span className={styles.fieldLabel}>Corner Radius:</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="20"
                      value={settings.cornerRadiusMm}
                      onChange={(e) => updateSettings({ cornerRadiusMm: parseFloat(e.target.value) || 2 })}
                      className={styles.numberInput}
                    />
                    <span className={styles.unitSpan}>mm</span>
                  </div>
                )}
              </div>
              <LivePreview settings={settings} />
            </>
          )}

          {/* ────────────────── Step 7: Template Size (Photo 9) ────────────────── */}
          {step === 7 && (
            <>
              <div className={styles.formColumn}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Template Size</div>
                <div className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>Width:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={settings.templateWidthMm || ''}
                    disabled={!settings.manualTemplateSize}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateSettings({ templateWidthMm: v === '' ? 0 : parseFloat(v) });
                    }}
                    className={styles.numberInput}
                  />
                  <span className={styles.unitSpan}>mm</span>
                  <label className={styles.radioLabel} style={{ marginLeft: '10px' }}>
                    <input
                      type="checkbox"
                      checked={settings.manualTemplateSize}
                      onChange={(e) => updateSettings({ manualTemplateSize: e.target.checked })}
                    />
                    <span>Set Manually</span>
                  </label>
                </div>

                <div className={styles.fieldRow} style={{ marginTop: '6px' }}>
                  <span className={styles.fieldLabel}>Height:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={settings.templateHeightMm || ''}
                    disabled={!settings.manualTemplateSize}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateSettings({ templateHeightMm: v === '' ? 0 : parseFloat(v) });
                    }}
                    className={styles.numberInput}
                  />
                  <span className={styles.unitSpan}>mm</span>
                </div>

                <div style={{ fontSize: '12px', fontWeight: 600, color: '#333', marginTop: '16px', marginBottom: '8px' }}>Gap / Pitch</div>
                <div className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>Horizontal:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={settings.horizGapMm ?? ''}
                    disabled={!settings.manualGap}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateSettings({ horizGapMm: v === '' ? 0 : parseFloat(v) });
                    }}
                    className={styles.numberInput}
                  />
                  <span className={styles.unitSpan}>mm</span>
                  <label className={styles.radioLabel} style={{ marginLeft: '10px' }}>
                    <input
                      type="checkbox"
                      checked={settings.manualGap}
                      onChange={(e) => updateSettings({ manualGap: e.target.checked })}
                    />
                    <span>Set Manually</span>
                  </label>
                </div>

                <div className={styles.fieldRow} style={{ marginTop: '6px' }}>
                  <span className={styles.fieldLabel}>Vertical:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={settings.vertGapMm ?? ''}
                    disabled={!settings.manualGap}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateSettings({ vertGapMm: v === '' ? 0 : parseFloat(v) });
                    }}
                    className={styles.numberInput}
                  />
                  <span className={styles.unitSpan}>mm</span>
                </div>
              </div>
              <LivePreview settings={settings} />
            </>
          )}

          {/* ────────────────── Step 8: Printing Order (Photo 10) ────────────────── */}
          {step === 8 && (
            <>
              <div className={styles.formColumn}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#333', marginBottom: '10px' }}>Printing Order</div>

                <div className={styles.fieldRow} style={{ marginBottom: '8px' }}>
                  <span className={styles.fieldLabel}>Starting Corner:</span>
                  <select
                    className={styles.selectInput}
                    value={settings.startingCorner}
                    onChange={(e) => updateSettings({ startingCorner: e.target.value as any })}
                  >
                    <option value="top-left">Top-Left</option>
                    <option value="top-right">Top-Right</option>
                    <option value="bottom-left">Bottom-Left</option>
                    <option value="bottom-right">Bottom-Right</option>
                  </select>
                </div>

                <div className={styles.fieldRow} style={{ marginBottom: '14px' }}>
                  <span className={styles.fieldLabel}>Primary Direction:</span>
                  <select
                    className={styles.selectInput}
                    value={settings.primaryDirection}
                    onChange={(e) => updateSettings({ primaryDirection: e.target.value as any })}
                  >
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical">Vertical</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  <label className={styles.radioLabel}>
                    <input
                      type="checkbox"
                      checked={settings.selectStartingPositionAtPrint}
                      onChange={(e) => updateSettings({ selectStartingPositionAtPrint: e.target.checked })}
                    />
                    <span>Select starting position at print time</span>
                  </label>

                  <label className={styles.radioLabel} style={{ marginLeft: '20px' }}>
                    <input
                      type="checkbox"
                      checked={settings.continueFromLastPosition}
                      onChange={(e) => updateSettings({ continueFromLastPosition: e.target.checked })}
                    />
                    <span>Continue from last position of previous job</span>
                  </label>
                </div>
              </div>
              <LivePreview settings={settings} showNumbers={true} />
            </>
          )}

          {/* ────────────────── Step 9: Template Background (Photo 11) ────────────────── */}
          {step === 9 && (
            <>
              <div className={styles.formColumn}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Background Features</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Color option */}
                  <div>
                    <label className={styles.radioLabel}>
                      <input
                        type="checkbox"
                        checked={settings.useBackgroundColor}
                        onChange={(e) => updateSettings({ useBackgroundColor: e.target.checked })}
                      />
                      <span style={{ fontWeight: 600 }}>Color</span>
                    </label>
                    <div style={{ fontSize: '11px', color: '#666', marginLeft: '22px', marginTop: '2px' }}>
                      Allows you to specify a fill color to use for the background.
                    </div>
                    {settings.useBackgroundColor && (
                      <div style={{ marginLeft: '22px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="color"
                          value={settings.backgroundColor}
                          onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                          style={{ width: '32px', height: '22px', padding: 0, border: '1px solid #7f9db9', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '11px', fontFamily: 'monospace' }}>{settings.backgroundColor.toUpperCase()}</span>
                      </div>
                    )}
                  </div>

                  {/* Picture option */}
                  <div>
                    <label className={styles.radioLabel}>
                      <input
                        type="checkbox"
                        checked={settings.useBackgroundPicture}
                        onChange={(e) => updateSettings({ useBackgroundPicture: e.target.checked })}
                      />
                      <span style={{ fontWeight: 600 }}>Picture</span>
                    </label>
                    <div style={{ fontSize: '11px', color: '#666', marginLeft: '22px', marginTop: '2px' }}>
                      Allows you to use a picture for the background.
                    </div>
                  </div>

                  {/* Template Image option */}
                  <div>
                    <label className={styles.radioLabel}>
                      <input
                        type="checkbox"
                        checked={settings.useTemplateImage}
                        onChange={(e) => updateSettings({ useTemplateImage: e.target.checked })}
                      />
                      <span style={{ fontWeight: 600 }}>Template Image</span>
                    </label>
                    <div style={{ fontSize: '11px', color: '#666', marginLeft: '22px', marginTop: '2px' }}>
                      Allows you to display a picture of what you want your completed design to look like behind the design area. You can then design on top of that picture, making it easier to position and size objects.
                    </div>
                  </div>
                </div>
              </div>
              <LivePreview settings={settings} highlightSingleItem={true} />
            </>
          )}

          {/* ────────────────── Step 10: Finished! (Photo 12) ────────────────── */}
          {step === 10 && (
            <>
              <div className={styles.formColumn}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>Review:</div>
                <div className={styles.reviewBox}>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Starting Document:</span>
                    <span className={styles.reviewVal}>Blank</span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Printer:</span>
                    <span className={styles.reviewVal}>{settings.printer}</span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Page Size:</span>
                    <span className={styles.reviewVal}>{settings.pageWidthMm.toFixed(1)} x {settings.pageHeightMm.toFixed(1)} mm</span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Template Size:</span>
                    <span className={styles.reviewVal}>{settings.templateWidthMm.toFixed(1)} x {settings.templateHeightMm.toFixed(1)} mm</span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Item Shape:</span>
                    <span className={styles.reviewVal} style={{ textTransform: 'capitalize' }}>
                      {settings.shape === 'roundedRectangle' ? 'Rounded Rectangle' : settings.shape}
                    </span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Items Per Page:</span>
                    <span className={styles.reviewVal}>
                      {settings.itemsPerPageType === 'single'
                        ? 'Single Item'
                        : `${settings.rows} rows x ${settings.cols} cols (${settings.rows * settings.cols} items)`}
                    </span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Side Margins:</span>
                    <span className={styles.reviewVal}>
                      {settings.hasUnusedMaterial
                        ? `Left: ${settings.unusedLeftMm} mm, Right: ${settings.unusedRightMm} mm`
                        : 'None'}
                    </span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Printing Order:</span>
                    <span className={styles.reviewVal} style={{ textTransform: 'capitalize' }}>
                      {settings.startingCorner}, {settings.primaryDirection}
                    </span>
                  </div>
                </div>
              </div>
              <LivePreview settings={settings} />
            </>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className={styles.wizardFooter}>
          <button
            className={styles.btn}
            disabled={!canGoBack}
            onClick={handleBack}
          >
            &lt; Back
          </button>
          <button
            className={styles.btn}
            disabled={!canGoNext}
            onClick={handleNext}
          >
            Next &gt;
          </button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleFinish}
          >
            Finish
          </button>
          <button
            className={styles.btn}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Popups from Step 1 */}
      {showPrinterProps && (
        <PrinterPropertiesModal
          printerName={settings.printer}
          onClose={() => setShowPrinterProps(false)}
        />
      )}
      {showDocProps && (
        <DocumentPropertiesModal
          printerName={settings.printer}
          onClose={() => setShowDocProps(false)}
        />
      )}
    </div>
  );
};

