import React, { useState } from 'react';
import styles from './Modals.module.css';

interface PrinterPropertiesModalProps {
  printerName: string;
  onClose: () => void;
}

export const PrinterPropertiesModal: React.FC<PrinterPropertiesModalProps> = ({
  printerName,
  onClose,
}) => {
  const [resolution, setResolution] = useState('203 dpi');
  const [printMethod, setPrintMethod] = useState('Thermal Transfer (Ribbon)');
  const [printSpeed, setPrintSpeed] = useState('4.0 ips');
  const [darkness, setDarkness] = useState('15');
  const [mediaType, setMediaType] = useState('Labels with Gaps');

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.dialogWindow}>
        <div className={styles.dialogTitleBar}>
          <span>{printerName} - Printer Properties</span>
          <button className={styles.dialogCloseBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.tabHeader}>
          <div className={`${styles.tabBtn} ${styles.tabBtnActive}`}>General</div>
          <div className={styles.tabBtn}>Print Options</div>
          <div className={styles.tabBtn}>Sensors</div>
          <div className={styles.tabBtn}>About</div>
        </div>

        <div className={styles.dialogBody}>
          <div className={styles.propSection}>
            <div className={styles.sectionHeader}>Print Head Settings</div>
            <div className={styles.propRow}>
              <label>Resolution:</label>
              <select value={resolution} onChange={(e) => setResolution(e.target.value)}>
                <option value="203 dpi">203 dpi (8 dots/mm)</option>
                <option value="300 dpi">300 dpi (12 dots/mm)</option>
                <option value="600 dpi">600 dpi (24 dots/mm)</option>
              </select>
            </div>
            <div className={styles.propRow}>
              <label>Print Method:</label>
              <select value={printMethod} onChange={(e) => setPrintMethod(e.target.value)}>
                <option value="Thermal Transfer (Ribbon)">Thermal Transfer (Ribbon)</option>
                <option value="Direct Thermal (No Ribbon)">Direct Thermal (No Ribbon)</option>
              </select>
            </div>
          </div>

          <div className={styles.propSection}>
            <div className={styles.sectionHeader}>Media & Speed</div>
            <div className={styles.propRow}>
              <label>Media Type:</label>
              <select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
                <option value="Labels with Gaps">Labels with Gaps (Web Sensing)</option>
                <option value="Continuous Media">Continuous Media</option>
                <option value="Labels with Black Mark">Labels with Black Mark</option>
              </select>
            </div>
            <div className={styles.propRow}>
              <label>Print Speed:</label>
              <select value={printSpeed} onChange={(e) => setPrintSpeed(e.target.value)}>
                <option value="2.0 ips">2.0 in/sec (50 mm/sec)</option>
                <option value="4.0 ips">4.0 in/sec (102 mm/sec)</option>
                <option value="6.0 ips">6.0 in/sec (152 mm/sec)</option>
              </select>
            </div>
            <div className={styles.propRow}>
              <label>Darkness (0-30):</label>
              <input
                type="number"
                min="0"
                max="30"
                value={darkness}
                onChange={(e) => setDarkness(e.target.value)}
                style={{ width: '60px' }}
              />
            </div>
          </div>
        </div>

        <div className={styles.dialogFooter}>
          <button className={styles.btnPrimary} onClick={onClose}>OK</button>
          <button className={styles.btn} onClick={onClose}>Cancel</button>
          <button className={styles.btn} onClick={onClose}>Apply</button>
        </div>
      </div>
    </div>
  );
};

