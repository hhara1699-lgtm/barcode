import React from 'react';
import { WizardSettings } from '@/types/bartender';
import styles from './Wizard.module.css';

interface LivePreviewProps {
  settings: WizardSettings;
  showNumbers?: boolean;
  highlightSingleItem?: boolean;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  settings,
  showNumbers = false,
  highlightSingleItem = false,
}) => {
  const {
    pageWidthMm,
    pageHeightMm,
    itemsPerPageType,
    rows: configuredRows,
    cols: configuredCols,
    shape,
    hasUnusedMaterial,
    unusedLeftMm,
    unusedRightMm,
    unusedTopMm,
    unusedBottomMm,
    startingCorner,
    primaryDirection,
    templateWidthMm,
    templateHeightMm,
    horizGapMm,
    vertGapMm,
    useBackgroundColor,
    backgroundColor,
    useBackgroundPicture,
    backgroundPictureUrl,
    useTemplateImage,
    templateImageUrl,
    templateImageOpacity,
    cornerRadiusMm,
  } = settings;

  const rows = itemsPerPageType === 'single' ? 1 : Math.max(1, configuredRows);
  const cols = itemsPerPageType === 'single' ? 1 : Math.max(1, configuredCols);
  const totalItems = rows * cols;

  // Calculate printing order index matrix
  const getIndexAt = (r: number, c: number): number => {
    let rowIdx = r;
    let colIdx = c;

    // Adjust for starting corner
    if (startingCorner === 'top-right' || startingCorner === 'bottom-right') {
      colIdx = cols - 1 - c;
    }
    if (startingCorner === 'bottom-left' || startingCorner === 'bottom-right') {
      rowIdx = rows - 1 - r;
    }

    if (primaryDirection === 'horizontal') {
      return rowIdx * cols + colIdx + 1;
    } else {
      return colIdx * rows + rowIdx + 1;
    }
  };

  // Preview box dimensions in pixels
  const previewBoxWidth = 190;
  const previewBoxHeight = 230;

  // Calculate aspect ratio scale to fit inside previewBox
  const scale = Math.min(
    (previewBoxWidth - 24) / Math.max(10, pageWidthMm),
    (previewBoxHeight - 24) / Math.max(10, pageHeightMm)
  );

  const renderedPageW = Math.max(20, pageWidthMm * scale);
  const renderedPageH = Math.max(20, pageHeightMm * scale);

  const leftMarginPx = hasUnusedMaterial ? (unusedLeftMm || 0) * scale : 0;
  const rightMarginPx = hasUnusedMaterial ? (unusedRightMm || 0) * scale : 0;
  const topMarginPx = hasUnusedMaterial ? (unusedTopMm || 0) * scale : 0;
  const bottomMarginPx = hasUnusedMaterial ? (unusedBottomMm || 0) * scale : 0;

  // Exact millimeter scaling for item dimensions and gaps!
  const itemWPx = Math.max(2, (templateWidthMm || 10) * scale);
  const itemHPx = Math.max(2, (templateHeightMm || 10) * scale);
  const gapXPx = Math.max(0, (horizGapMm || 0) * scale);
  const gapYPx = Math.max(0, (vertGapMm || 0) * scale);

  // Border radius based on shape and corner radius
  const getBorderRadius = () => {
    switch (shape) {
      case 'roundedRectangle':
        const r = (cornerRadiusMm || 3) * scale;
        const maxR = Math.min(itemWPx, itemHPx) * 0.45;
        return `${Math.max(1, Math.min(r, maxR))}px`;
      case 'circle':
      case 'ellipse':
        return '50%';
      case 'rectangle':
      default:
        return '0px';
    }
  };

  const borderRadius = getBorderRadius();
  const badgeFontSize = Math.max(6, Math.min(10, itemHPx * 0.55));

  // If in Background step and single item view requested:
  if (highlightSingleItem) {
    const singleScale = Math.min(
      (previewBoxWidth - 30) / Math.max(5, templateWidthMm),
      (previewBoxHeight - 30) / Math.max(5, templateHeightMm)
    );
    const singleW = templateWidthMm * singleScale;
    const singleH = templateHeightMm * singleScale;

    return (
      <div className={styles.previewContainer}>
        <div className={styles.previewTitle}>Preview:</div>
        <div className={styles.previewStage}>
          <div
            className={styles.singleItemBox}
            style={{
              width: `${singleW}px`,
              height: `${singleH}px`,
              borderRadius:
                shape === 'roundedRectangle'
                  ? `${Math.min(singleW, singleH) * 0.2}px`
                  : shape === 'circle' || shape === 'ellipse'
                  ? '50%'
                  : '0px',
              backgroundColor: useBackgroundColor ? backgroundColor : '#ffffff',
              backgroundImage: useBackgroundPicture && backgroundPictureUrl ? `url(${backgroundPictureUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {useTemplateImage && templateImageUrl && (
              <img
                src={templateImageUrl}
                alt="Template watermark"
                className={styles.watermarkImg}
                style={{ opacity: (templateImageOpacity || 40) / 100 }}
              />
            )}
          </div>
        </div>
        <div className={styles.previewInfo}>
          <div>Page Size: {pageWidthMm.toFixed(1)} x {pageHeightMm.toFixed(1)} mm</div>
          <div>Template Size: {templateWidthMm.toFixed(1)} x {templateHeightMm.toFixed(1)} mm</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewTitle}>Preview:</div>
      <div className={styles.previewStage}>
        {/* Page Sheet Container */}
        <div
          className={styles.pageSheet}
          style={{
            width: `${renderedPageW}px`,
            height: `${renderedPageH}px`,
            paddingLeft: `${leftMarginPx}px`,
            paddingRight: `${rightMarginPx}px`,
            paddingTop: `${topMarginPx}px`,
            paddingBottom: `${bottomMarginPx}px`,
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
          }}
        >
          {/* Grid of labels */}
          <div
            className={styles.labelGrid}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, ${itemWPx}px)`,
              gridTemplateRows: `repeat(${rows}, ${itemHPx}px)`,
              columnGap: `${gapXPx}px`,
              rowGap: `${gapYPx}px`,
              width: 'max-content',
              height: 'max-content',
              boxSizing: 'border-box',
            }}
          >
            {Array.from({ length: totalItems }).map((_, idx) => {
              const r = Math.floor(idx / cols);
              const c = idx % cols;
              const orderNum = getIndexAt(r, c);

              return (
                <div
                  key={idx}
                  className={styles.labelCellWrapper}
                  style={{
                    width: `${itemWPx}px`,
                    height: `${itemHPx}px`,
                    boxSizing: 'border-box',
                    padding: 0,
                  }}
                >
                  <div
                    className={styles.labelItem}
                    style={{
                      width: `${itemWPx}px`,
                      height: `${itemHPx}px`,
                      borderRadius,
                      backgroundColor: useBackgroundColor ? backgroundColor : '#ffffff',
                      backgroundImage:
                        useBackgroundPicture && backgroundPictureUrl
                          ? `url(${backgroundPictureUrl})`
                          : undefined,
                      backgroundSize: 'cover',
                      border: '1px solid #7a9ec2',
                      boxSizing: 'border-box',
                    }}
                  >
                    {showNumbers && (
                      <span
                        className={styles.labelOrderBadge}
                        style={{ fontSize: `${badgeFontSize}px` }}
                      >
                        {orderNum}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.previewInfo}>
        <div>Page Size: {pageWidthMm.toFixed(1)} x {pageHeightMm.toFixed(1)} mm</div>
        <div>Template Size: {templateWidthMm.toFixed(1)} x {templateHeightMm.toFixed(1)} mm</div>
      </div>
    </div>
  );
};
