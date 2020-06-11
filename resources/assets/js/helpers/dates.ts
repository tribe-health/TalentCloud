import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/fr";
import { Locales } from "./localize";

dayjs.extend(LocalizedFormat);

export const readableDateTime = (locale: Locales, date: Date): string => {
  return dayjs(date).locale(locale).format("LLLL");
};
export const readableDate = (locale: Locales, date: Date): string => {
  return dayjs(date).locale(locale).format("LL");
};

export const toInputDateString = (date: Date): string => {
  return dayjs(date).format("YYYY-MM-DD");
};

export const fromInputDateString = (dateStr: string): Date => {
  return dayjs(dateStr).toDate();
};
