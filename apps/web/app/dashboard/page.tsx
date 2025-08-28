import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Redirect to membership as the default dashboard view
  redirect("/dashboard/membership");
}
