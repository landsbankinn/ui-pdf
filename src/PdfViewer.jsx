import React, { useState, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import * as PDFJS from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

/* This import is required for the pdfjs worker */
import "pdfjs-dist/webpack";

const CANVAS_NAME = "page";
const TEXT_NAME = "txt";

const base64ToByteArray = (byteData) => {
  const bytes = window.atob(byteData);
  const byteLength = bytes.length;
  const byteArray = new Uint8Array(new ArrayBuffer(byteLength));
  for (let i = 0; i < byteLength; i++) {
    byteArray[i] = bytes.charCodeAt(i);
  }
  return byteArray;
};

const renderPage = async (pdf, pageIndex, pageScale) => {
  const page = await pdf.getPage(pageIndex);

  const canvas = document.getElementById(`${CANVAS_NAME}-${pageIndex}`);
  const context = canvas.getContext("2d");

  /* 
      Getting a larger viewport for pdf rendering.
      If we don't do this, rendering on android devices is broken
  */
  const canvasViewport = page.getViewport({ scale: pageScale || 1 });
  canvas.height = canvasViewport.height;
  canvas.width = canvasViewport.width;

  /* Render the pdf page into the canvas */
  await page.render({
    canvasContext: context,
    viewport: canvasViewport,
  }).promise;

  /* Render the text context based on the smaller viewport */
  const viewportEl = document.getElementById("viewport");

  /* 
    Divide the pdf file width by the true canvas width
    This aligns the text overlay with the pdf file 
  */
  const scale = viewportEl.clientWidth / page.view[2];
  const textViewport = page.getViewport({ scale });

  const textContent = await page.getTextContent();
  const textContainer = document.getElementById(`${TEXT_NAME}-${pageIndex}`);

  PDFJS.renderTextLayer({
    textContent,
    container: textContainer,
    viewport: textViewport,
    textDivs: [],
  });
};

const pageRange = (pageCount, skipLastPage) => {
  if (skipLastPage && pageCount - 1 > 0) {
    return Array(pageCount - 1).fill();
  }
  return Array(pageCount).fill();
};

export const PdfViewer = ({ content, scale, enableZoom, skipLastPage = 0 }) => {
  const [pdfDocument, setPdfDocument] = useState(null);

  useEffect(() => {
    if (pdfDocument) return;
    const loadDocument = async (arr) => {
      const pdf = await PDFJS.getDocument({ data: arr }).promise;
      setPdfDocument(pdf);
      pageRange(pdf._pdfInfo.numPages, skipLastPage).forEach((_, i) => {
        renderPage(pdf, i + 1, scale);
      });
    };
    const typedArr = base64ToByteArray(content);
    loadDocument(typedArr);
  }, []);

  if (!pdfDocument) return null;

  return (
    <div
      id="viewport"
      style={{
        /*
          Used by the text rendering engine to get propper text scaling
        */
        width: "100%",
      }}
    >
      {pageRange(pdfDocument._pdfInfo.numPages, skipLastPage).map((a, i) => {
        return (
          <ScaleWrapper key={i} enableZoom={enableZoom}>
            <div
              style={{
                /* Required for the absolute positioning of the text layer */
                position: "relative",
              }}
            >
              <canvas
                style={{
                  /* 
                  Resize the canvas to fit the outer container so we can render the 
                  pdf document at a higher resolution. If we don't then android phones
                  only render a part of the document
                */
                  width: "100%",
                }}
                id={`${CANVAS_NAME}-${i + 1}`}
              />
              <div className="textLayer" id={`${TEXT_NAME}-${i + 1}`} />
            </div>
          </ScaleWrapper>
        );
      })}
    </div>
  );
};

const ScaleWrapper = ({ enableZoom, children }) => {
  if (enableZoom) {
    return (
      <TransformWrapper
        centerZoomedOut
        wheel={{
          wheelDisabled: true,
        }}
      >
        <TransformComponent>{children}</TransformComponent>
      </TransformWrapper>
    );
  }
  return <>{children}</>;
};
