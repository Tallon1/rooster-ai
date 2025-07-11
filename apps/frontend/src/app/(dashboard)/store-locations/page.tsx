import { Metadata } from "next";
import StoreLocationList from "@/components/storeLocations/StoreLocationList";

export const metadata: Metadata = {
  title: "Store Locations - Rooster AI",
  description: "Manage your company's store locations and staff assignments",
};

export default function StoreLocationsPage() {
  return (
    <div className="space-y-6">
      <StoreLocationList />
    </div>
  );
}
