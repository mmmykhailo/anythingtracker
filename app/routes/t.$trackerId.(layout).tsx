import { CaretLeft } from "@phosphor-icons/react";
import {
  Link,
  Outlet,
  useLoaderData,
  useParams,
  type ClientLoaderFunctionArgs,
} from "react-router";
import { Button } from "~/components/ui/button";
import TabsNavigation from "~/components/ui/tabs-navigation";
import { LogEntryDrawer } from "~/components/LogEntryDrawer";
import { getTrackerById } from "~/lib/db";
import { formatDateString } from "~/lib/dates";
import { useLogEntryDrawer } from "~/lib/hooks/useLogEntryDrawer";

export async function clientLoader({ params }: ClientLoaderFunctionArgs) {
  const trackerId = params.trackerId;
  if (!trackerId) {
    throw new Response("Tracker ID is required", { status: 400 });
  }

  try {
    const tracker = await getTrackerById(trackerId);
    if (!tracker) {
      throw new Response("Tracker not found", { status: 404 });
    }
    return { tracker };
  } catch (error) {
    throw new Response("Failed to load tracker", { status: 500 });
  }
}

export default function TrackerPageLayout() {
  const { trackerId } = useParams();
  const { tracker } = useLoaderData<typeof clientLoader>();
  const { state: logEntryDrawer, openLogEntry, closeLogEntry } = useLogEntryDrawer(
    () => `/t/${trackerId}/history`
  );

  return (
    <>
      <div className="w-full h-16 flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <Button asChild variant="ghost" size="icon">
            <Link to="/" prefetch="viewport">
              <CaretLeft weight="bold" />
            </Link>
          </Button>
          <span className="font-medium">{tracker.title}</span>
        </div>
        <Button variant="secondary" onClick={() => openLogEntry(trackerId!, formatDateString(new Date()))}>
          Log new entry
        </Button>
      </div>
      <TabsNavigation
        className="mb-4"
        links={[
          {
            label: "History",
            url: `/t/${trackerId}/history`,
          },
          {
            label: "Stats",
            url: `/t/${trackerId}/stats`,
          },
          {
            label: "Edit",
            url: `/t/${trackerId}/edit`,
          },
        ]}
      />
      <Outlet />

      {logEntryDrawer.trackerId && (
        <LogEntryDrawer
          open={logEntryDrawer.open}
          onClose={closeLogEntry}
          trackerId={logEntryDrawer.trackerId}
          date={logEntryDrawer.date}
        />
      )}
    </>
  );
}
