import { CloseIcon } from '@krgaa/react-developer-burger-ui-components';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { ModalOverlay } from '@components/modal-overlay/modal-overlay';
import { MODALS_ROOT_ID } from '@utils/constants';

import styles from './modal.module.css';

type TModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
};

const getModalRoot = (): HTMLElement | null => document.getElementById(MODALS_ROOT_ID);

export const Modal = ({
  children,
  onClose,
  title,
}: TModalProps): React.JSX.Element | null => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return (): void => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const modalRoot = getModalRoot();

  if (!modalRoot) {
    return null;
  }

  return createPortal(
    <>
      <ModalOverlay onClose={onClose} />
      <div
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-modal="true"
        className={styles.modal}
        role="dialog"
      >
        <div className={`${styles.header} pt-10 pr-10 pl-10`}>
          {title ? (
            <h2 className="text text_type_main-large" id="modal-title">
              {title}
            </h2>
          ) : null}
          <button
            aria-label="Закрыть"
            className={styles.close}
            onClick={onClose}
            type="button"
          >
            <CloseIcon type="primary" />
          </button>
        </div>
        <div className={`${styles.content} pb-15 pl-10 pr-10`}>{children}</div>
      </div>
    </>,
    modalRoot
  );
};
