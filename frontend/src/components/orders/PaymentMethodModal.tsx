interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCash: () => void;
  onOnline: () => void;
}

const PaymentMethodModal = ({
  isOpen,
  onClose,
  onCash,
  onOnline,
}: PaymentMethodModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Select Payment Method
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onCash}
            className="rounded-xl border border-gray-200 p-5 text-center transition hover:border-green-500 hover:bg-green-50"
          >
            <div className="mb-2 text-3xl">💵</div>

            <p className="font-semibold text-gray-900">Cash</p>

            <p className="mt-1 text-sm text-gray-500">Pay with cash</p>
          </button>

          <button
            type="button"
            onClick={onOnline}
            className="rounded-xl border border-gray-200 p-5 text-center transition hover:border-blue-500 hover:bg-blue-50"
          >
            <div className="mb-2 text-3xl">💳</div>

            <p className="font-semibold text-gray-900">Online</p>

            <p className="mt-1 text-sm text-gray-500">Pay online</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;
