import { addDays, endOfWeek, format, startOfWeek } from "date-fns";
import { ja } from "date-fns/locale";

export const getWeekRange = (date: Date) => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  return { weekStart, weekEnd };
};

export const getWeekDays = (date: Date) => {
  const { weekStart } = getWeekRange(date);
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
};

export const formatDateLabel = (date: Date) =>
  format(date, "M/d(EEE)", { locale: ja });

export const formatTime = (iso: string) =>
  format(new Date(iso), "HH:mm", { locale: ja });

export const formatDateTime = (iso: string) =>
  format(new Date(iso), "M/d HH:mm", { locale: ja });
