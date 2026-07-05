import { SellerShell } from "@/components/seller/SellerShell";
import { SellerChatScreen } from "@/components/seller/SellerChatScreen";

export default function ProducatorPage() {
  return (
    <SellerShell>
      <SellerChatScreen />
    </SellerShell>
  );
}
