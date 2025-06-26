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
  homenet_selling_price?: string;
  homenet_msrp?: string;
  homenet_model_number?: string;
  homenet_year?: string;
  homenet_make?: string;
  homenet_model?: string;
  homenet_mileage?: string;
  homenet_ext_color?: string;
  homenet_int_color?: string;
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
      homenet_year: "2023",
      homenet_make: "Chevrolet",
      homenet_model: "Silverado 1500",
      homenet_standard_trim: "LT",
      homenet_eng_description: "6.6L V8 Turbo Diesel",
      homenet_ext_color: "Summit White",
      homenet_int_color: "Jet Black",
      web_url: "https://example.com/vehicle/1",
      homenet_selling_price: "45000",
      homenet_msrp: "48000",
      homenet_model_number: "CK20743",
    },
    {
      homenet_vehicle_title: "2022 Ford F-150 XLT",
      homenet_year: "2022",
      homenet_make: "Ford",
      homenet_model: "F-150",
      homenet_standard_trim: "XLT",
      homenet_eng_description: "5.0L V8 Coyote",
      homenet_ext_color: "Oxford White",
      homenet_int_color: "Medium Earth Gray",
      web_url: "https://example.com/vehicle/2",
      homenet_selling_price: "38000",
      homenet_msrp: "41000",
      homenet_model_number: "FD15892",
    },
    {
      homenet_vehicle_title: "2024 Toyota Highlander Limited",
      homenet_year: "2024",
      homenet_make: "Toyota",
      homenet_model: "Highlander",
      homenet_standard_trim: "Limited",
      homenet_eng_description: "3.5L V6 Hybrid",
      homenet_ext_color: "Blueprint",
      homenet_int_color: "Black Leather",
      web_url: "https://example.com/vehicle/3",
      homenet_selling_price: "52000",
      homenet_msrp: "55000",
      homenet_model_number: "TY98456",
    },
    {
      homenet_vehicle_title: "2023 Honda Civic Sport",
      homenet_year: "2023",
      homenet_make: "Honda",
      homenet_model: "Civic",
      homenet_standard_trim: "Sport",
      homenet_eng_description: "2.0L VTEC Turbo",
      homenet_ext_color: "Rallye Red",
      homenet_int_color: "Black Sport Cloth",
      web_url: "https://example.com/vehicle/4",
      homenet_selling_price: "28000",
      homenet_msrp: "30000",
      homenet_model_number: "HD78123",
    },
    {
      homenet_vehicle_title: "2024 BMW X5 xDrive40i",
      homenet_year: "2024",
      homenet_make: "BMW",
      homenet_model: "X5",
      homenet_standard_trim: "xDrive40i",
      homenet_eng_description: "3.0L Turbo Inline-6",
      homenet_ext_color: "Alpine White",
      homenet_int_color: "Black Vernasca Leather",
      web_url: "https://example.com/vehicle/5",
      homenet_selling_price: "65000",
      homenet_msrp: "68000",
      homenet_model_number: "BMW12345",
    },
    {
      homenet_vehicle_title: "2023 Tesla Model Y Performance",
      homenet_year: "2023",
      homenet_make: "Tesla",
      homenet_model: "Model Y",
      homenet_standard_trim: "Performance",
      homenet_eng_description: "Dual Motor All-Wheel Drive",
      homenet_ext_color: "Pearl White Multi-Coat",
      homenet_int_color: "All Black Premium Interior",
      // No web_url to test button hiding
      homenet_selling_price: "58000",
      homenet_msrp: "60000",
      homenet_model_number: "TESLA001",
    },
  ],
};

// Fetch actual inventory data with fallback
const fetchInventory = async (): Promise<ApiResponse> => {
  try {
    console.log("Attempting to fetch inventory data...");
    const response = await fetch(
      "/api/inventory?token=175grzjKeAfg1OYRKpAmcJ3ebaYZYi9Cn%2FNg2Ht8pDQ",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout for API
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log("API data received:", data);
    return { ...data, _dataSource: "api" };
  } catch (error) {
    console.log("API failed, using fallback data:", error);
    return Promise.resolve({ ...FALLBACK_DATA, _dataSource: "fallback" });
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Debug logging
  console.log("Component state:", {
    isLoading,
    data: data?.data?.length,
    dataSource: (data as any)?._dataSource,
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
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedItems.length} of {filteredItems.length} vehicles
              {searchTerm && ` matching "${searchTerm}"`}
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </p>
            <p className="text-xs text-muted-foreground">
              Data loaded: {data?.data?.length || 0} total vehicles
            </p>
          </div>
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
            {paginatedItems.map((vehicle, index) => {
              // Create a unique key by combining multiple fields
              const uniqueKey = `${vehicle.homenet_model_number || "unknown"}-${vehicle.homenet_vehicle_title || "no-title"}-${startIndex + index}`;

              return (
                <Card
                  key={uniqueKey}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {vehicle.homenet_vehicle_title || "Vehicle Information"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Engine */}
                    {vehicle.homenet_eng_description && (
                      <div>
                        <p className="text-sm text-muted-foreground">Engine</p>
                        <p className="font-medium">
                          {vehicle.homenet_eng_description}
                        </p>
                      </div>
                    )}

                    {/* Exterior Color */}
                    {vehicle.homenet_ext_color && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Exterior Color
                        </p>
                        <p className="font-medium">
                          {vehicle.homenet_ext_color}
                        </p>
                      </div>
                    )}

                    {/* Interior Color */}
                    {vehicle.homenet_int_color && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Interior Color
                        </p>
                        <p className="font-medium">
                          {vehicle.homenet_int_color}
                        </p>
                      </div>
                    )}

                    {/* MSRP */}
                    {vehicle.homenet_msrp && (
                      <div>
                        <p className="text-sm text-muted-foreground">MSRP</p>
                        <p className="font-medium text-lg">
                          ${parseInt(vehicle.homenet_msrp).toLocaleString()}
                        </p>
                      </div>
                    )}

                    {/* Price */}
                    {vehicle.homenet_selling_price && (
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-bold text-xl text-green-600">
                          $
                          {parseInt(
                            vehicle.homenet_selling_price,
                          ).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {/* Link Button - Only show if web_url exists */}
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
              );
            })}
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
