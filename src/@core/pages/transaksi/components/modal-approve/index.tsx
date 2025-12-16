import Modal from 'rsuite/Modal';
import React, { Dispatch, SetStateAction } from 'react';
import { HelpCircle } from '@untitled-ui/icons-react';

const ModalApprove = (props: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  content: string;
  onConfirm: () => void;
}) => {
  const { isModalOpen, setIsModalOpen, content, onConfirm } = props;

  return (
    <Modal
      size="xs"
      dialogClassName="my-modal"
      backdropClassName="my-modal-backdrop"
      backdrop="static"
      keyboard={false}
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    >
      <Modal.Body>
        <div className="flex flex-col justify-center items-center">
          <span className="my-icon icon-72px">
            <HelpCircle />
          </span>
          <h5 className="text-3xl">{content}</h5>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex gap-2 justify-center">
          <a
            className="bg-red-500 text-white flex items-center text-center justify-center w-1/2 !h-[40px] cursor-pointer rounded"
            onClick={() => setIsModalOpen(false)}
          >
            Tidak
          </a>
          <a
            className="bg-primary text-white flex items-center text-center justify-center w-1/2 !h-[40px] cursor-pointer rounded"
            onClick={onConfirm}
          >
            Ya, Proses
          </a>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalApprove;
