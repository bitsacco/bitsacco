import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Redirect to personal savings as the default dashboard view
  redirect("/dashboard/personal");
}
