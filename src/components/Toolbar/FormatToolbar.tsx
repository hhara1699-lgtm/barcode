import React from 'react';
import styles from './Toolbar.module.css';

interface FormatToolbarProps {
  fontFamily: string;
  setFontFamily: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  bold: boolean;
  setBold: (b: boolean) => void;
  italic: boolean;
  setItalic: (i: boolean) => void;
  underline: boolean;
  setUnderline: (u: boolean) => void;
  strike: boolean;
  setStrike: (s: boolean) => void;
  color: string;
  setColor: (c: string) => void;
  bgColor: string;
  setBgColor: (c: string) => void;
  align: 'left' | 'center' | 'right' | 'justify';
  setAlign: (a: 'left' | 'center' | 'right' | 'justify') => void;
  lineWidth: number;
  setLineWidth: (w: number) => void;
}

export const FormatToolbar: React.FC<FormatToolbarProps> = ({
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  bold,
  setBold,
  italic,
  setItalic,
  underline,
  setUnderline,
  strike,
  setStrike,
  color,
  setColor,
  bgColor,
  setBgColor,
  align,
  setAlign,
  lineWidth,
  setLineWidth,
}) => {
  return (
    <div className={styles.formatRow}>
      {/* Font Family selector */}
      <select
        className={styles.fontSelect}
        value={fontFamily}
        onChange={(e) => setFontFamily(e.target.value)}
      >
        <option value="Printer Sans Serif">Printer Sans Serif</option>
        <option value="Arial">Arial</option>
        <option value="Segoe UI">Segoe UI</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
        <option value="Consolas">Consolas</option>
      </select>

      {/* Font Size selector */}
      <select
        className={styles.sizeSelect}
        value={fontSize}
        onChange={(e) => setFontSize(parseInt(e.target.value) || 12)}
      >
        {[6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div className={styles.toolSep} />

      {/* Bold */}
      <button
        className={`${styles.toolBtn} ${bold ? styles.toolBtnActive : ''}`}
        onClick={() => setBold(!bold)}
        title="Bold"
      >
        <span style={{ fontWeight: 800, fontSize: '12px' }}>B</span>
      </button>

      {/* Italic */}
      <button
        className={`${styles.toolBtn} ${italic ? styles.toolBtnActive : ''}`}
        onClick={() => setItalic(!italic)}
        title="Italic"
      >
        <span style={{ fontStyle: 'italic', fontWeight: 600, fontSize: '12px' }}>I</span>
      </button>

      {/* Underline */}
      <button
        className={`${styles.toolBtn} ${underline ? styles.toolBtnActive : ''}`}
        onClick={() => setUnderline(!underline)}
        title="Underline"
      >
        <span style={{ textDecoration: 'underline', fontSize: '12px' }}>U</span>
      </button>

      {/* Strikethrough (shown as 'W' or strike in BarTender) */}
      <button
        className={`${styles.toolBtn} ${strike ? styles.toolBtnActive : ''}`}
        onClick={() => setStrike(!strike)}
        title="Strikethrough"
      >
        <span style={{ textDecoration: 'line-through', fontSize: '12px' }}>S</span>
      </button>

      <div className={styles.toolSep} />

      {/* Font Color */}
      <div className={styles.colorPickerWrap} title="Text Color">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'serif' }}>A</span>
          <div style={{ width: '14px', height: '3px', background: color, marginTop: '-2px' }} />
        </div>
        <input
          type="color"
          className={styles.hiddenColorInput}
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>

      {/* Fill Color */}
      <div className={styles.colorPickerWrap} title="Fill / Background Color">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '12px' }}>🎨</span>
          <div style={{ width: '14px', height: '3px', background: bgColor, marginTop: '-2px' }} />
        </div>
        <input
          type="color"
          className={styles.hiddenColorInput}
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
        />
      </div>

      <div className={styles.toolSep} />

      {/* Text Alignment */}
      <button
        className={`${styles.toolBtn} ${align === 'left' ? styles.toolBtnActive : ''}`}
        onClick={() => setAlign('left')}
        title="Align Left"
      >
        <svg width="14" height="12" viewBox="0 0 14 12">
          <line x1="0" y1="2" x2="14" y2="2" stroke="currentColor" strokeWidth="1.5" />
          <line x1="0" y1="6" x2="9" y2="6" stroke="currentColor" strokeWidth="1.5" />
          <line x1="0" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      <button
        className={`${styles.toolBtn} ${align === 'center' ? styles.toolBtnActive : ''}`}
        onClick={() => setAlign('center')}
        title="Center"
      >
        <svg width="14" height="12" viewBox="0 0 14 12">
          <line x1="0" y1="2" x2="14" y2="2" stroke="currentColor" strokeWidth="1.5" />
          <line x1="2.5" y1="6" x2="11.5" y2="6" stroke="currentColor" strokeWidth="1.5" />
          <line x1="0" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      <button
        className={`${styles.toolBtn} ${align === 'right' ? styles.toolBtnActive : ''}`}
        onClick={() => setAlign('right')}
        title="Align Right"
      >
        <svg width="14" height="12" viewBox="0 0 14 12">
          <line x1="0" y1="2" x2="14" y2="2" stroke="currentColor" strokeWidth="1.5" />
          <line x1="5" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="1.5" />
          <line x1="0" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      <button
        className={`${styles.toolBtn} ${align === 'justify' ? styles.toolBtnActive : ''}`}
        onClick={() => setAlign('justify')}
        title="Justify"
      >
        <svg width="14" height="12" viewBox="0 0 14 12">
          <line x1="0" y1="2" x2="14" y2="2" stroke="currentColor" strokeWidth="1.5" />
          <line x1="0" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1.5" />
          <line x1="0" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" />
          <line x1="0" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      <div className={styles.toolSep} />

      {/* Border / Line Width matching Photo 13 '1.0 pt' */}
      <span style={{ fontSize: '11px', color: '#555', marginLeft: '4px' }}>Line:</span>
      <select
        className={styles.lineWidthSelect}
        value={lineWidth}
        onChange={(e) => setLineWidth(parseFloat(e.target.value) || 1)}
      >
        <option value="0.5">0.5 pt</option>
        <option value="1.0">1.0 pt</option>
        <option value="1.5">1.5 pt</option>
        <option value="2.0">2.0 pt</option>
        <option value="3.0">3.0 pt</option>
        <option value="4.0">4.0 pt</option>
      </select>
    </div>
  );
};

