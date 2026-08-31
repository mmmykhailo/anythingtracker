import { useState, useEffect, useCallback } from "react";
import { CalendarBlank } from "@phosphor-icons/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { ScrollArea } from "~/components/ui/scroll-area";
import { EntryInput } from "~/components/tracker/EntryInput";
import { TrackerHistory } from "~/components/tracker/TrackerHistory";
import { Separator } from "~/components/ui/separator";
import { useIsMobile } from "~/lib/use-is-mobile";
import { debouncedDataChange } from "~/lib/data-change-events";
import {
  getTrackerById,
  getMostUsedTags,
  getTotalValueForDate,
  getEntryHistory,
  createEntry,
  deleteEntryById,
  getDB,
} from "~/lib/db";
import type { Tracker } from "~/lib/trackers";
import type { HistoryEntry } from "~/lib/history";

type LogEntryDrawerProps = {
  open: boolean;
  onClose: () => void;
  trackerId: string;
  date: string;
};

type DrawerData = {
  tracker: Tracker;
  currentValue: number;
  mostUsedTags: string[];
  history: HistoryEntry[];
};

export function LogEntryDrawer({
  open,
  onClose,
  trackerId,
  date: initialDate,
}: LogEntryDrawerProps) {
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [data, setData] = useState<DrawerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDate(initialDate);
  }, [initialDate]);

  const loadData = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const tracker = await getTrackerById(trackerId);
      if (!tracker) return;
      const [mostUsedTags, currentValue, allHistory] = await Promise.all([
        getMostUsedTags(trackerId, 5),
        getTotalValueForDate(trackerId, selectedDate),
        getEntryHistory(trackerId),
      ]);
      const history = allHistory.filter((e) => e.date === selectedDate);
      setData({ tracker, currentValue, mostUsedTags, history });
    } finally {
      setLoading(false);
    }
  }, [open, trackerId, selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleQuickAdd = async (valueToAdd: number, comment?: string) => {
    setActionLoading(true);
    try {
      await createEntry(trackerId, selectedDate, valueToAdd, false, false, comment);
      debouncedDataChange.dispatch("entry_added", {
        trackerId,
        date: selectedDate,
        value: valueToAdd,
      });
      await loadData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckboxChange = async (checked: boolean, comment?: string) => {
    setActionLoading(true);
    try {
      const db = await getDB();
      const entries = await db.getAllFromIndex("entries", "by-tracker", trackerId);
      const dateEntries = entries.filter((e) => e.date === selectedDate);
      for (const entry of dateEntries) {
        await deleteEntryById(entry.id);
      }
      if (checked) {
        await createEntry(trackerId, selectedDate, 1, false, false, comment);
      }
      debouncedDataChange.dispatch("entry_updated", {
        trackerId,
        date: selectedDate,
        value: checked ? 1 : 0,
      });
      await loadData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    setDeletingEntryId(entryId);
    try {
      await deleteEntryById(entryId);
      debouncedDataChange.dispatch("entry_deleted", { trackerId });
      await loadData();
    } finally {
      setDeletingEntryId(null);
    }
  };

  const direction = isMobile ? "bottom" : "right";

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      direction={direction}
      repositionInputs={false}
    >
      <DrawerContent>
        <DrawerHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <DrawerTitle>{data?.tracker.title ?? "Log Entry"}</DrawerTitle>
            <div className="flex items-center gap-2">
              <CalendarBlank className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border border-input rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-4 flex flex-col gap-6">
            {loading || !data ? (
              <div className="text-sm text-muted-foreground py-8 text-center">
                Loading…
              </div>
            ) : (
              <>
                <EntryInput
                  tracker={data.tracker}
                  currentValue={data.currentValue}
                  selectedDate={selectedDate}
                  onSubmit={handleQuickAdd}
                  onCheckboxChange={handleCheckboxChange}
                  mostUsedTags={data.mostUsedTags}
                  entryLoading={actionLoading}
                />

                {data.history.length > 0 && (
                  <>
                    <Separator />
                    <TrackerHistory
                      history={data.history}
                      tracker={data.tracker}
                      onDeleteEntry={handleDeleteEntry}
                      deletingEntryId={deletingEntryId}
                      entryLoading={actionLoading}
                      withoutStats
                    />
                  </>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
