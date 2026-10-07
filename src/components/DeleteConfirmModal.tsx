"use client";

import { useDialog } from "@/hooks/useDialog";
import { X } from "lucide-react";

interface DeleteConfirmModalProps {
  presetName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  presetName,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const dialogRef = useDialog(true, onCancel);
  return (
    <div className="modal-overlay" onClick={onCancel} data-testid="delete-modal-overlay">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="delete-preset-title" tabIndex={-1} className="modal-card" onClick={(e) => e.stopPropagation()} data-testid="delete-modal-card">
        <button className="modal-close-btn" onClick={onCancel} title="Close dialog" data-testid="btn-close-modal">
          <X size={16} />
        </button>
        <h3 id="delete-preset-title" className="modal-title">Delete Preset</h3>
        <p className="modal-text">
          Are you sure to delete <strong>&quot;{presetName}&quot;</strong>?
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
