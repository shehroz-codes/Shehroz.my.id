import { useEffect, useState } from "react";
import type { PreviewDocument } from "./types";
import Modal from "./Modal";
import Icon from "./Icon";
interface DocumentPreviewProps {
  title: string;
  document: PreviewDocument;
  sample: boolean;
  onClose: () => void;
}
export default function DocumentPreview({
  title,
  document,
  sample,
  onClose,
}: DocumentPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState(document.src);
  useEffect(() => {
    // Blob URLs support direct downloads of inline bundled assets without
    // relying on browser-specific top-level data: navigation behavior.
    if (!document.src.startsWith("data:")) {
      setPreviewUrl(document.src);
      return;
    }
    let disposed = false;
    let objectUrl: string | undefined;
    fetch(document.src)
      .then((response) => response.blob())
      .then((blob) => {
        if (disposed) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      })
      .catch(() => {
        /* Keep the original inline preview if conversion fails. */
      });
    return () => {
      disposed = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [document.src]);
  return (
    <Modal
      title={title}
      subtitle={
        sample
          ? "SAMPLE — NOT A REAL DOCUMENT. Replace with your actual file."
          : "Document preview"
      }
      onClose={onClose}
      wide
    >
      {document.kind === "pdf" ? (
        <>
          <iframe
            className="ps-pdf"
            src={previewUrl}
            title={`${title} PDF preview`}
          />
          <p className="ps-link-note">
            If your browser cannot display PDFs, download the original file
            below.
          </p>
        </>
      ) : (
        <img className="ps-document-full" src={previewUrl} alt={document.alt} />
      )}
      <a
        className="ps-button ps-button--primary ps-open-document"
        href={previewUrl}
        download={`${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}${document.kind === "pdf" ? ".pdf" : ""}`}
      >
        <Icon name="external" size={16} />
        Download document
        <Icon name="arrow" size={16} className="ps-arrow" />
      </a>
    </Modal>
  );
}
