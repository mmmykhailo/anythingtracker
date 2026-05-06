import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatClockTick = (value: number) => value.toString().padStart(2, "0");

export const toRadians = (deg: number) => (deg * Math.PI) / 180;
