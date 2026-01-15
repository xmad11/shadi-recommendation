import { AdminClient } from "./AdminClient";
import { mockRestaurants } from "@/__mock__/restaurants";

// Next.js 15+: Use fetch with revalidate for PPR caching
export const revalidate = 600 // 10 minutes

export default async function AdminPage() {
  // Use mock data for now until Supabase is configured
  const restaurants = Object.freeze([...mockRestaurants]);

  return <AdminClient initialRestaurants={restaurants} />;
}
