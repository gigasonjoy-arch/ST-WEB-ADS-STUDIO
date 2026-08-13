import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = 'ডিলিট নিশ্চিতকরণ',
  message = 'আপনি কি নিশ্চিত যে এটি চিরতরে মুছে ফেলতে চান? এই অ্যাকশন বাতিল করা যাবে না।',
  itemName,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#FDFCF8] w-full max-w-md rounded-3xl border border-red-200 p-6 sm:p-7 space-y-5 shadow-2xl relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-[#8A957F] hover:text-[#2C3327] rounded-xl hover:bg-[#E8EAE2] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#2C3327]">{title}</h3>
            <p className="text-xs text-[#8A957F]">নিরাপদ ডাটা রিমুভাল সিস্টেম</p>
          </div>
        </div>

        <div className="space-y-2">
          {itemName && (
            <div className="p-3 bg-red-50/80 rounded-2xl border border-red-100 text-xs font-bold text-red-900 break-words">
              "{itemName}"
            </div>
          )}
          <p className="text-xs text-[#5C6652] leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#D9DED1]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 border border-[#D9DED1] text-xs font-bold rounded-xl text-[#5C6652] hover:bg-[#E8EAE2] transition-colors"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>হ্যাঁ, মুছে ফেলুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
