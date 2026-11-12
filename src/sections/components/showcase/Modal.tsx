import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import Icon from "./Icon";
interface ModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}
export default function Modal({
  title,
  subtitle,
  onClose,
  children,
  wide = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const dialog = dialogRef.current!;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    closeRef.current?.focus();
    // Explicit loop also covers dialogs with just one enabled control.
    function trapFocus(event: globalThis.KeyboardEvent) {
      if (event.key !== "Tab") return;
      const items = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], iframe, input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.getClientRects().length > 0);
      const first = items[0],
        last = items[items.length - 1];
      if (!first) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    }
    dialog.addEventListener("keydown", trapFocus);
    return () => {
      dialog.removeEventListener("keydown", trapFocus);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previous?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className={`ps-modal ${wide ? "ps-modal--wide" : ""}`}
      aria-labelledby={titleId}
      aria-describedby={subtitle ? descriptionId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="ps-modal__header">
        <div>
          <p className="ps-eyebrow">SHEHROZ / SHOWCASE</p>
          <h2 id={titleId}>{title}</h2>
          {subtitle && <p id={descriptionId}>{subtitle}</p>}
        </div>
        <button
          ref={closeRef}
          type="button"
          className="ps-icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>
      <div className="ps-modal__body">{children}</div>
    </dialog>
  );
}
