import { useState } from "react";

type LogEntryDrawerState = {
  open: boolean;
  trackerId: string;
  date: string;
};

const CLOSED: LogEntryDrawerState = { open: false, trackerId: "", date: "" };

export function useLogEntryDrawer(onCloseUrl: string | (() => string)) {
  const [state, setState] = useState<LogEntryDrawerState>(CLOSED);

  const openLogEntry = (trackerId: string, date: string) => {
    setState({ open: true, trackerId, date });
    window.history.pushState(null, "", `/t/${trackerId}/log-entry?date=${date}`);
  };

  const closeLogEntry = () => {
    setState((prev) => ({ ...prev, open: false }));
    const url = typeof onCloseUrl === "function" ? onCloseUrl() : onCloseUrl;
    window.history.replaceState(null, "", url);
  };

  return { state, openLogEntry, closeLogEntry };
}
