// app/(admin)/dashboard/page.tsx
import { redirect } from "next/navigation"
import { createServerClient } from "@utils/supabase/server"
import { AdminDashboardClient } from "@/components/admin-dashboard-client"

export default async function AdminDashboardPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const role = user.user_metadata?.role
  if (role !== "admin") {
    redirect("/login")
  }

  return <AdminDashboardClient user={user} />
}
