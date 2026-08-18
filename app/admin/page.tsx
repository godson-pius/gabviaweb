import type { Metadata } from "next";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Admin analytics — Gabvia",
  description: "Private Gabvia product, engagement, and revenue analytics.",
};

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return <AdminDashboard firebaseApiKey={process.env.FIREBASE_API_KEY ?? ""} />;
}
