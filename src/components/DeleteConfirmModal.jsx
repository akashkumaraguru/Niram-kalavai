import { X } from "lucide-react";

export default function DeleteConfirmModal({ presetName, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel} data-testid="delete-modal-overlay">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} data-testid="delete-modal-card">
        <button className="modal-close-btn" onClick={onCancel} title="Close dialog" data-testid="btn-close-modal">
          <X size={16} />
        </button>
        <h3 className="modal-title">Delete Preset</h3>
        <p className="modal-text">
          Are you sure to delete <strong>"{presetName}"</strong>?
        </p>
        <div className="modal-actions">
          <button className="btn-modal cancel" onClick={onCancel} data-testid="btn-cancel-delete">
            Cancel
          </button>
          <button className="btn-modal delete" onClick={onConfirm} data-testid="btn-confirm-delete">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
