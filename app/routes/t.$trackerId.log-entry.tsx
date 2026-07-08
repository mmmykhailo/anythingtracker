import { useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router";
import type { ClientLoaderFunctionArgs } from "react-router";
import { formatDateString } from "~/lib/dates";

export async function clientLoader({ params, request }: ClientLoaderFunctionArgs) {
  const trackerId = params.trackerId;
  if (!trackerId) {
    throw new Response("Tracker ID is required", { status: 400 });
  }

  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date");
  const selectedDate = dateParam || formatDateString(new Date());

  return { trackerId, selectedDate };
}

export function meta() {
  return [
    { title: "Log Entry - AnythingTracker" },
    {
      name: "description",
      content: "Log new entries and view history for your tracker",
    },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ];
}

export default function LogEntryPage() {
  const { trackerId, selectedDate } = useLoaderData<typeof clientLoader>();
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/", {
      replace: true,
      state: { openLogEntry: { trackerId, date: selectedDate } },
    });
  }, []);

  return null;
}
