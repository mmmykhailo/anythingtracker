export const trackerTypes = [
  "liters",
  "steps",
  "kilometers",
  "kilograms",
  "none",
  "checkbox",
  "hours",
] as const;

export type TrackerType = (typeof trackerTypes)[number];

export const trackerTypesLabels: Record<
  TrackerType,
  {
    shortest: string;
    short: string;
    long: string;
  }
> = {
  none: {
    shortest: "",
    short: "Number",
    long: "Number",
  },
  checkbox: {
    shortest: "",
    short: "Checkbox",
    long: "Checkbox",
  },
  liters: {
    shortest: "L",
    short: "Volume (L)",
    long: "Volume (L)",
  },
  steps: {
    shortest: "steps",
    short: "Steps",
    long: "Steps",
  },
  kilometers: {
    shortest: "km",
    short: "km",
    long: "Kilometers (km)",
  },
  kilograms: {
    shortest: "kg",
    short: "kg",
    long: "Kilograms (kg)",
  },
  hours: {
    shortest: "hr",
    short: "hr",
    long: "Hours",
  },
};

export type Tracker = {
  id: string;
  title: string;
  type: TrackerType;
  isNumber: boolean;
  values: {
    [dateString: string]: number;
  };
  goal?: number;
  parentId?: string;
  isHidden?: boolean;
  deletedAt?: Date;
  updatedAt?: Date; // Timestamp for when tracker metadata was last modified
};
