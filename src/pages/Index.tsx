import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, Search, ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// Simplified VehicleItem interface
interface VehicleItem {
  homenet_vehicle_title?: string;
  homenet_eng_description?: string;
  web_url?: string;
  homenet_price?: string;
  [key: string]: any;
}

interface ApiResponse {
  data: VehicleItem[];
}

// Minimal mock data (only 3 items for easier debugging)
const MOCK_DATA: ApiResponse = {
  data: [
    {
      homenet_vehicle_title: "2023 Chevrolet Silverado 1500 LT",
      homenet_eng_description: "6.6L V8 Turbo Diesel",
      web_url: "https://example.com/vehicle/1",
      homenet_price: "45000",
    },
    {
      homenet_vehicle_title: "2022 Ford F-150 XLT",
      homenet_eng_description: "5.0L V8 Coyote",
      web_url: "https://example.com/vehicle/2",
      homenet_price: "38000",
    },
    {
      homenet_vehicle_title: "2024 Toyota Highlander Limited",
      homenet_eng_description: "3.5L V6 Hybrid",
      web_url: "https://example.com/vehicle/3",
      homenet_price: "52000",
    },
  ],
};

// Simplified fetch function that always returns mock data
const fetchInventory = async (): Promise<ApiResponse> => {
  // Always return mock data for easier debugging
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_DATA), 500);
  });
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["inventory"],
    queryFn: fetchInventory,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Simple search filter
  const filteredItems =
    data?.data?.filter((item) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        item.homenet_vehicle_title?.toLowerCase().includes(searchLower) ||
        item.homenet_eng_description?.toLowerCase().includes(searchLower)
      );
    }) || [];

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Simple Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Car className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Vehicle Inventory</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-2"
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefetching && "animate-spin")}
            />
            Refresh
          </Button>
        </div>

        {/* Simple Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Simple Vehicle Cards */}
      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((vehicle, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  {vehicle.homenet_vehicle_title || "Vehicle Title"}
                </CardTitle>
                <CardDescription>
                  {vehicle.homenet_eng_description || "Engine info"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vehicle.homenet_price && (
                  <p className="text-xl font-bold mb-4">
                    ${parseInt(vehicle.homenet_price).toLocaleString()}
                  </p>
                )}
                {vehicle.web_url && (
                  <Button
                    className="w-full gap-2"
                    onClick={() => window.open(vehicle.web_url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Details
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Try a different search term"
                : "No vehicles available"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Index;
