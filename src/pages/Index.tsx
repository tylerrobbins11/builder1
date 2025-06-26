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
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Search,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Vehicle interface for actual API data
interface VehicleItem {
  homenet_vehicle_title?: string;
  homenet_eng_description?: string;
  web_url?: string;
  homenet_price?: string;
  homenet_model_number?: string;
  homenet_year?: string;
  homenet_make?: string;
  homenet_model?: string;
  homenet_mileage?: string;
  homenet_exterior_color?: string;
  homenet_interior_color?: string;
  [key: string]: any;
}

interface ApiResponse {
  data: VehicleItem[];
}

// Fallback data in case API fails
const FALLBACK_DATA: ApiResponse = {
  data: [
    {
      homenet_vehicle_title: "2023 Chevrolet Silverado 1500 LT",
      homenet_eng_description: "6.6L V8 Turbo Diesel",
      web_url: "https://example.com/vehicle/1",
      homenet_price: "45000",
      homenet_model_number: "CK20743",
    },
    {
      homenet_vehicle_title: "2022 Ford F-150 XLT",
      homenet_eng_description: "5.0L V8 Coyote",
      web_url: "https://example.com/vehicle/2",
      homenet_price: "38000",
      homenet_model_number: "FD15892",
    },
    {
      homenet_vehicle_title: "2024 Toyota Highlander Limited",
      homenet_eng_description: "3.5L V6 Hybrid",
      web_url: "https://example.com/vehicle/3",
      homenet_price: "52000",
      homenet_model_number: "TY98456",
    },
  ],
};

// Fetch actual inventory data with fallback
const fetchInventory = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(
      "/api/inventory?token=175grzjKeAfg1OYRKpAmcJ3ebaYZYi9Cn%2FNg2Ht8pDQ",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return { ...data, _dataSource: "api" };
  } catch (error) {
    console.log("Using fallback data due to API error:", error);
    return new Promise((resolve) => {
      setTimeout(
        () => resolve({ ...FALLBACK_DATA, _dataSource: "fallback" }),
        300,
      );
    });
  }
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6; // Limit to 6 vehicles per page

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["inventory"],
    queryFn: fetchInventory,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Search filter
  const filteredItems =
    data?.data?.filter((item) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();

      // Search through multiple fields
      return Object.values(item).some((value) => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchLower);
      });
    }) || [];

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Simple Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Car className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Vehicle Inventory</h1>
          {data && (
            <Badge
              variant={
                (data as any)._dataSource === "api" ? "default" : "secondary"
              }
            >
              {(data as any)._dataSource === "api" ? "Live Data" : "Demo Mode"}
            </Badge>
          )}
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

        {!isLoading && (
          <p className="text-sm text-muted-foreground mb-4">
            Showing {paginatedItems.length} of {filteredItems.length} vehicles
            {searchTerm && ` matching "${searchTerm}"`}
            {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </p>
        )}

        {/* Simple Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all vehicle data..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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

      {/* Vehicle Cards */}
      {!isLoading && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedItems.map((vehicle, index) => (
              <Card
                key={vehicle.homenet_model_number || index}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    {vehicle.homenet_vehicle_title ||
                      `${vehicle.homenet_year || ""} ${vehicle.homenet_make || ""} ${vehicle.homenet_model || ""}`.trim() ||
                      "Vehicle Title"}
                  </CardTitle>
                  <CardDescription>
                    {vehicle.homenet_eng_description ||
                      "Engine info not available"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {vehicle.homenet_price && (
                    <p className="text-xl font-bold">
                      ${parseInt(vehicle.homenet_price).toLocaleString()}
                    </p>
                  )}

                  {vehicle.homenet_mileage && (
                    <p className="text-sm text-muted-foreground">
                      {parseInt(vehicle.homenet_mileage).toLocaleString()} miles
                    </p>
                  )}

                  {(vehicle.homenet_exterior_color ||
                    vehicle.homenet_interior_color) && (
                    <p className="text-sm text-muted-foreground">
                      {vehicle.homenet_exterior_color &&
                        `Exterior: ${vehicle.homenet_exterior_color}`}
                      {vehicle.homenet_exterior_color &&
                        vehicle.homenet_interior_color &&
                        " • "}
                      {vehicle.homenet_interior_color &&
                        `Interior: ${vehicle.homenet_interior_color}`}
                    </p>
                  )}

                  {vehicle.web_url && (
                    <Button
                      className="w-full gap-2 mt-4"
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  ),
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && filteredItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? `No vehicles match "${searchTerm}"`
                : "No vehicles available"}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => handleSearch("")}>
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Index;
