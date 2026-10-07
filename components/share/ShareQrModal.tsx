"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { QrCard } from "./QrCard";

export interface ShareQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  name: string;
  avatarUrl?: string | null;
}

export function ShareQrModal({
  isOpen,
  onClose,
  username,
  name,
  avatarUrl,
}: ShareQrModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Profile"
      description="Scan with any smartphone camera to visit this profile."
      isBottomSheetOnMobile={true}
    >
      <div className="pt-2">
        <QrCard
          username={username}
          name={name}
          avatarUrl={avatarUrl}
          showPrintButton={false}
        />
      </div>
    </Modal>
  );
}
