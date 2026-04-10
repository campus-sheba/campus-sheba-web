import AddressesPage from "@/modules/dashboard/AddressesPage";
import { getAddressesAction } from "@/services/addresses";

export default async function MyAddressesPage() {
  const result = await getAddressesAction();
  const addresses = result.success ? result.data : [];

  return <AddressesPage initialAddresses={addresses} />;
}
