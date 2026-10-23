import { redirect } from "next/navigation";

// Network nodes are either devices (DEV...) or customers,
// both of which already have their own detail pages.
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entityId = decodeURIComponent(id);

  if (entityId.startsWith("DEV")) {
    redirect(`/devices/${encodeURIComponent(entityId)}`);
  }

  redirect(`/customers/${encodeURIComponent(entityId)}`);
}
