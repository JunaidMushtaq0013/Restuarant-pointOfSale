import type { ReactNode } from "react";
import {
  MdAdd,
  MdBlock,
  MdCheck,
  MdClose,
  MdDelete,
  MdEdit,
  MdLogout,
  MdPrint,
  MdRemove,
  MdSearch,
  MdVisibility,
  MdPayments,
  MdSave,
  MdRefresh,
  MdRestaurant,
  MdDone,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";

interface ActionIconProps {
  label: string;
  className?: string;
}

const icons: Record<string, ReactNode> = {
  add: <MdAdd aria-hidden="true" />,
  edit: <MdEdit aria-hidden="true" />,
  delete: <MdDelete aria-hidden="true" />,
  remove: <MdRemove aria-hidden="true" />,
  close: <MdClose aria-hidden="true" />,
  cancel: <MdClose aria-hidden="true" />,
  save: <MdSave aria-hidden="true" />,
  search: <MdSearch aria-hidden="true" />,
  view: <MdVisibility aria-hidden="true" />,
  print: <MdPrint aria-hidden="true" />,
  pay: <MdPayments aria-hidden="true" />,
  logout: <MdLogout aria-hidden="true" />,
  activate: <MdCheck aria-hidden="true" />,
  deactivate: <MdBlock aria-hidden="true" />,
  release: <MdRestaurant aria-hidden="true" />,
  refresh: <MdRefresh aria-hidden="true" />,
  confirm: <MdDone aria-hidden="true" />,
  previous: <MdChevronLeft aria-hidden="true" />,
  next: <MdChevronRight aria-hidden="true" />,
};

const ActionIcon = ({ label, className = "" }: ActionIconProps) => {
  const icon = icons[label.toLowerCase()] ?? <MdDone aria-hidden="true" />;

  return (
    <span
      className={`inline-flex items-center justify-center text-lg ${className}`}
      title={label}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </span>
  );
};

export default ActionIcon;
