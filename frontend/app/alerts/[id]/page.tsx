import { redirect } from "next/navigation";

// An alert is a HIGH/CRITICAL transaction (ALT-123 ↔ TXN-123),
// so its details live on the transaction page.
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const transactionId = decodeURIComponent(id).replace(/^ALT-/, "");

  redirect(`/transactions/TXN-${encodeURIComponent(transactionId)}`);
}
