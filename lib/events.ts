import { supabaseAdmin } from "@/lib/supabase";

export interface EventRecord {
  id: string;
  name: string;
  registration_link: string | null;
  description: string | null;
  youtube_link: string | null;
  start_time: string | null;
  end_time: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export async function getEvents(): Promise<EventRecord[]> {
  const { data, error } = await supabaseAdmin()
    .from("events")
    .select("*")
    .order("start_time", { ascending: true }); // show upcoming first based on start_time

  if (error) throw error;
  
  // Sort properly: upcoming events first, then past events
  const now = new Date().getTime();
  
  const upcoming = (data as EventRecord[]).filter(e => {
    if (!e.end_time && !e.start_time) return true; // keep unscheduled ones as upcoming? Or maybe past. Let's put them at the end.
    if (e.end_time) return new Date(e.end_time).getTime() > now;
    if (e.start_time) return new Date(e.start_time).getTime() > now;
    return false;
  });
  
  const past = (data as EventRecord[]).filter(e => {
    if (e.end_time) return new Date(e.end_time).getTime() <= now;
    if (e.start_time) return new Date(e.start_time).getTime() <= now;
    return false;
  });

  return [...upcoming, ...past];
}
