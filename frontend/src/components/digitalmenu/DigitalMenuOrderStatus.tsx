interface DigitalMenuOrderStatusProps {
  orderNumber: string;
  status: "Pending" | "Preparing" | "Ready" | "Served" | "Cancelled";
}

const DigitalMenuOrderStatus = ({
  orderNumber,
  status,
}: DigitalMenuOrderStatusProps) => {
  const statuses = ["Pending", "Preparing", "Ready", "Served"] as const;

  const currentIndex = statuses.indexOf(
    status as (typeof statuses)[number],
  );

  return (
    <div className="rounded-2xl border border-[#eee7df] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[#8b8178]">Your Order</p>

          <h2 className="mt-1 text-lg font-semibold text-[#211e1b]">
            {orderNumber}
          </h2>
        </div>

        <span className="rounded-full bg-[#f3eee8] px-3 py-1 text-xs font-medium text-[#211e1b]">
          {status}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {statuses.map((item, index) => {
          const completed = index <= currentIndex;

          return (
            <div key={item} className="flex items-center gap-3">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  completed
                    ? "bg-[#211e1b] text-white"
                    : "bg-[#f3eee8] text-[#8b8178]"
                }`}
              >
                {completed ? "✓" : index + 1}
              </div>

              <span
                className={`text-sm ${
                  completed
                    ? "font-medium text-[#211e1b]"
                    : "text-[#8b8178]"
                }`}
              >
                {item}
              </span>
            </div>
          );
        })}
      </div>

      {status === "Cancelled" && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          This order has been cancelled.
        </p>
      )}
    </div>
  );
};

export default DigitalMenuOrderStatus;