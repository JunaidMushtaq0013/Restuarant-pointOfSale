import { useState } from "react";

interface CartItem {
  menu: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

interface DigitalMenuCartModalProps {
  cart: CartItem[];
  onClose: () => void;
  onIncrease: (menuId: string) => void;
  onDecrease: (menuId: string) => void;
  onRemove: (menuId: string) => void;
  onUpdateNote: (menuId: string, note: string) => void;
  onCheckout: () => void;
}

const DigitalMenuCartModal = ({
  cart,
  onClose,
  onIncrease,
  onDecrease,
  onRemove,
  onUpdateNote,
  onCheckout,
}: DigitalMenuCartModalProps) => {
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const startEditingNote = (item: CartItem) => {
    setEditingNote(item.menu);
    setNoteText(item.note || "");
  };

  const saveNote = (menuId: string) => {
    onUpdateNote(menuId, noteText.trim());
    setEditingNote(null);
    setNoteText("");
  };

  const cancelNote = () => {
    setEditingNote(null);
    setNoteText("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eee7df] pb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#211e1b]">Your Cart</h2>

            <p className="mt-1 text-xs text-[#8b8178]">
              {cart.reduce((total, item) => total + item.quantity, 0)} items
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-[#211e1b] hover:bg-[#f3eee8]"
          >
            ×
          </button>
        </div>

        {/* Cart Items */}
        <div className="max-h-[55vh] space-y-4 overflow-y-auto py-5">
          {cart.map((item) => (
            <div
              key={item.menu}
              className="rounded-2xl border border-[#eee7df] p-4"
            >
              {/* Item information */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#211e1b]">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-xs text-[#8b8178]">
                    ₹{item.price.toFixed(2)} each
                  </p>
                </div>

                <p className="text-sm font-semibold text-[#211e1b]">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>

              {/* Quantity */}
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onDecrease(item.menu)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd5ca]"
                >
                  −
                </button>

                <span className="min-w-5 text-center text-sm font-medium">
                  {item.quantity}
                </span>

                <button
                  type="button"
                  onClick={() => onIncrease(item.menu)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd5ca]"
                >
                  +
                </button>
              </div>

              {/* Note */}
              {editingNote === item.menu ? (
                <div className="mt-3">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="e.g. Less spicy, no onion..."
                    rows={2}
                    className="w-full resize-none rounded-xl border border-[#ddd5ca] px-3 py-2 text-xs text-[#211e1b] outline-none focus:border-[#211e1b]"
                  />

                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveNote(item.menu)}
                      className="rounded-full bg-[#211e1b] px-4 py-1.5 text-xs font-medium text-white"
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={cancelNote}
                      className="rounded-full border border-[#ddd5ca] px-4 py-1.5 text-xs font-medium text-[#211e1b]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => startEditingNote(item)}
                  className="mt-3 text-xs font-medium text-[#6f6258] underline underline-offset-2"
                >
                  {item.note ? "Edit Note" : "+ Add Note"}
                </button>
              )}

              {/* Existing note */}
              {item.note && editingNote !== item.menu && (
                <p className="mt-2 rounded-xl bg-[#f7f3ee] px-3 py-2 text-xs text-[#6f6258]">
                  Note: {item.note}
                </p>
              )}

              {/* Remove */}
              <button
                type="button"
                onClick={() => onRemove(item.menu)}
                className="mt-3 block text-xs font-medium text-red-600 underline underline-offset-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-[#eee7df] pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#8b8178]">Subtotal</span>

            <span className="text-lg font-semibold text-[#211e1b]">
              ₹{subtotal.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={onCheckout}
            className="mt-4 w-full rounded-full bg-[#211e1b] py-3 text-sm font-medium text-white transition hover:bg-[#3a342f]"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalMenuCartModal;
