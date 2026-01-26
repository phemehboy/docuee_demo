import {
  BellIcon,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FilePlus2,
  CircleCheckBig,
  Megaphone,
  Calendar,
  CalendarCheck,
} from "lucide-react";
import { FaMoneyBillWave } from "react-icons/fa";

export function getNotificationIcon(type: string) {
  switch (type) {
    case "project_created":
      return <FilePlus2 className="text-blue-500 w-4 h-4 mt-1 shrink-0" />;
    case "project_updated":
      return (
        <CircleCheckBig className="text-purple-500 w-4 h-4 mt-1 shrink-0" />
      );
    case "project_approved":
    case "project_approved_reason":
    case "supervisor_accept":
      return <CheckCircle className="text-green-500 w-4 h-4 mt-1 shrink-0" />;
    case "project_rejected":
    case "project_rejected_reason":
    case "supervisor_decline":
      return <XCircle className="text-red-500 w-4 h-4 mt-1 shrink-0" />;
    case "payment_success":
      return <CheckCircle className="text-green-500 w-4 h-4 mt-1 shrink-0" />;
    case "payment_failed":
      return (
        <AlertTriangle className="text-yellow-500 w-4 h-4 mt-1 shrink-0" />
      );
    case "payment_cancelled":
      return <XCircle className="text-red-500 w-4 h-4 mt-1 shrink-0" />;
    case "stage_completed":
      return <CheckCircle className="text-green-500 w-4 h-4 mt-1 shrink-0" />;
    case "stage_deadline_reminder":
      return <BellIcon className="text-yellow-500 w-4 h-4 mt-1 shrink-0" />;
    case "stage_deadline_missed":
      return <AlertTriangle className="text-red-500 w-4 h-4 mt-1 shrink-0" />;
    case "announcement":
      return <Megaphone className="text-indigo-500 w-4 h-4 mt-1 shrink-0" />;
    case "assignment":
      return <FilePlus2 className="text-orange-500 w-4 h-4 mt-1 shrink-0" />;
    case "submission": // <-- NEW TYPE
      return <CheckCircle className="text-green-500 w-4 h-4 mt-1 shrink-0" />;
    case "grading":
      return (
        <CircleCheckBig className="text-green-500 w-4 h-4 mt-1 shrink-0" />
      );
    case "timetable_created":
      return <Calendar className="text-pink-500 w-4 h-4 mt-1 shrink-0" />;
    case "timetable_updated":
      return <CalendarCheck className="text-teal-500 w-4 h-4 mt-1 shrink-0" />;
    case "assessment_open":
      return <Megaphone className="text-blue-500 w-4 h-4 mt-1 shrink-0" />;
    case "withdrawal_paid":
    case "withdrawal_rejected":
      return (
        <FaMoneyBillWave className="text-green-500 w-4 h-4 mt-1 shrink-0" />
      );
    case "support_update":
      return <BellIcon className="text-indigo-500 w-4 h-4 mt-1 shrink-0" />;
    default:
      return <BellIcon className="text-gray-500 w-4 h-4 mt-1 shrink-0" />;
  }
}
