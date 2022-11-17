// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: [~THE PROJECT NAME~]
// Definitions by: [~YOUR NAME~] <[~A URL FOR YOU~]>

/**
 * Pdf viewer
 * @param content Base64 encoded pdf string
 * @param scale Number representing the initial pdf render scale, the higher the scale, the sharper the pdf
 * @param enableZoom Enables both pinch and mouse zoom
 * @param skipLastPage Renders everything except for the last page
 */
export function PdfViewer({
  content,
  scale,
  enableZoom,
  skipLastPage,
}: {
  // Base64 encoded string
  content: string;
  scale: number;
  enableZoom: boolean;
  skipLastPage: boolean;
}): void;
