import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Car,
  Search,
  TrendingUp,
  AlertTriangle,
  MapPin,
  DollarSign,
  RefreshCw,
  Filter,
  Grid3X3,
  List,
  Calendar,
  Gauge,
  Fuel,
  Shield,
  ExternalLink,
  Paintbrush, // Assuming exterior color might use this
  Palette, // Assuming interior color might use this
} from "lucide-react";
import { cn } from "@/lib/utils";

// Updated VehicleItem interface with new fields
interface VehicleItem {
  homenet_vehicle_title?: string;
  homenet_eng_description?: string;
  web_url?: string;
  upu_comment?: string;
  homenet_model_number?: string;
  homenet_dealer_address?: string;
  oper_pt_warr_miles_left?: string;
  homenet_certified?: string;
  homenet_standard_trim?: string;
  oper_branded?: string;
  homenet_eng_liters?: string;
  vom_pdf_tpw?: string;
  info_matrix_de?: string;
  // New fields (adjust names based on your actual API response)
  homenet_year?: string; // Assuming 'year' field
  homenet_make?: string; // Assuming 'make' field
  homenet_model?: string; // Assuming 'model' field (already have homenet_model_number)
  homenet_mileage?: string; // Assuming 'mileage' field
  homenet_exterior_color?: string; // Assuming 'exterior_color' field
  homenet_interior_color?: string; // Assuming 'interior_color' field
  homenet_price?: string; // Assuming 'price' field
  [key: string]: any; // For any other dynamic fields
}

interface ApiResponse {
  data: VehicleItem[];
}

// Mock data for fallback (added new fields to existing mock data)
const MOCK_DATA: ApiResponse = {
  data: [
    {
      homenet_vehicle_title: "2023 Chevrolet Silverado 1500 LT",
      homenet_eng_description: "6.6L V8 Turbo Diesel",
      web_url: "https://example.com/vehicle/CK20743",
      homenet_model_number: "CK20743",
      homenet_dealer_address: "1000 Greenhill Blvd",
      homenet_certified: "1",
      homenet_standard_trim: "LT",
      oper_branded: "No",
      vom_pdf_tpw: "2025-06-09 00:00:00.000",
      oper_pt_warr_miles_left: "50000",
      upu_comment: "Excellent condition",
      homenet_year: "2023",
      homenet_make: "Chevrolet",
      homenet_model: "Silverado 1500",
      homenet_mileage: "25000",
      homenet_exterior_color: "Black",
      homenet_interior_color: "Jet Black",
      homenet_price: "45000",
    },
    {
      homenet_vehicle_title: "2022 Ford F-150 XLT",
      homenet_eng_description: "5.0L V8 Coyote",
      web_url: "https://example.com/vehicle/FD15892",
      homenet_model_number: "FD15892",
      homenet_dealer_address: "2500 Oak Street",
      homenet_certified: "0",
      homenet_standard_trim: "XLT",
      oper_branded: "Yes",
      vom_pdf_tpw: "2024-12-15 00:00:00.000",
      oper_pt_warr_miles_left: "NULL",
      upu_comment: "Previous accident",
      homenet_year: "2022",
      homenet_make: "Ford",
      homenet_model: "F-150",
      homenet_mileage: "35000",
      homenet_exterior_color: "Oxford White",
      homenet_interior_color: "Medium Dark Slate",
      homenet_price: "38000",
    },
    {
      homenet_vehicle_title: "2024 Toyota Highlander Limited",
      homenet_eng_description: "3.5L V6 Hybrid",
      web_url: "https://example.com/vehicle/TY98456",
      homenet_model_number: "TY98456",
      homenet_dealer_address: "750 Main Avenue",
      homenet_certified: "1",
      homenet_standard_trim: "Limited",
      oper_branded: "No",
      vom_pdf_tpw: "2025-03-20 00:00:00.000",
      oper_pt_warr_miles_left: "75000",
      upu_comment: "Like new",
      homenet_year: "2024",
      homenet_make: "Toyota",
      homenet_model: "Highlander",
      homenet_mileage: "10000",
      homenet_exterior_color: "Blueprint",
      homenet_interior_color: "Black Leather",
      homenet_price: "52000",
    },
    {
      homenet_vehicle_title: "2023 Honda Civic Sport",
      homenet_eng_description: "2.4L VTEC Turbo",
      web_url: "https://example.com/vehicle/HD78123",
      homenet_model_number: "HD78123",
      homenet_dealer_address: "1200 Pine Road",
      homenet_certified: "0",
      homenet_standard_trim: "Sport",
      oper_branded: "No",
      vom_pdf_tpw: "2024-11-08 00:00:00.000",
      oper_pt_warr_miles_left: "60000",
      upu_comment: "Well maintained",
      homenet_year: "2023",
      homenet_make: "Honda",
      homenet_model: "Civic",
      homenet_mileage: "18000",
      homenet_exterior_color: "Rallye Red",
      homenet_interior_color: "Black Cloth",
      homenet_price: "28000",
    },
    {
      homenet_vehicle_title: "2024 Lexus NX 350 Premium",
      homenet_eng_description: "4.0L V6 Twin Turbo",
      web_url: "https://example.com/vehicle/NX45678",
      homenet_model_number: "NX45678",
      homenet_dealer_address: "500 Elm Street",
      homenet_certified: "1",
      oper_branded: "No",
      vom_pdf_tpw: "2025-01-15 00:00:00.000",
      oper_pt_warr_miles_left: "100000",
      upu_comment: "Fleet vehicle",
      homenet_year: "2024",
      homenet_make: "Lexus",
      homenet_model: "NX 350",
      homenet_mileage: "5000",
      homenet_exterior_color: "Atomic Silver",
      homenet_interior_color: "Rich Cream",
      homenet_price: "48000",
    },
    {
      homenet_vehicle_title: "2023 BMW M5 Competition",
      homenet_eng_description: "4.4L V8 Twin Turbo",
      web_url: "https://example.com/vehicle/BMW98765",
      homenet_model_number: "BMW98765",
      homenet_dealer_address: "300 Luxury Lane",
      homenet_certified: "1",
      homenet_standard_trim: "M-Series",
      oper_branded: "No",
      vom_pdf_tpw: "2024-10-30 00:00:00.000",
      oper_pt_warr_miles_left: "80000",
      upu_comment: "Performance package",
      homenet_year: "2023",
      homenet_make: "BMW",
      homenet_model: "M5",
      homenet_mileage: "12000",
      homenet_exterior_color: "Brands Hatch Grey",
      homenet_interior_color: "Black Merino Leather",
      homenet_price: "110000",
    },
  ],
};

const fetchInventory = async (): Promise<ApiResponse> => {
  try {
    // Try to fetch from API with shorter timeout for faster fallback
    const response = await fetch(
      "/api/inventory?token=175grzjKeAfg1OYRKpAmcJ3ebaYZYi9Cn%2FNg2Ht8pDQ",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(3000), // Reduced to 3 seconds for faster fallback
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Non-JSON response");
    }

    const data = await response.json();
    return { ...data, _dataSource: "api" };
  } catch (error) {
    // Silently fall back to mock data - no console errors
    // This provides a seamless experience when API is unavailable
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ...MOCK_DATA, _dataSource: "mock" }), 300);
    });
  }
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dataSource, setDataSource] = useState<"api" | "mock" | "loading">(
    "loading",
  );

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["inventory"],
    queryFn: fetchInventory,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false, // Don't retry failed requests since we have fallback
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Helper function to find which fields match the search
  const getMatchingFields = (item: VehicleItem, searchTerm: string) => {
    if (!searchTerm) return [];

    const searchLower = searchTerm.toLowerCase();
    const matchingFields: string[] = [];

    Object.entries(item).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        const stringValue = String(value).toLowerCase();
        if (stringValue.includes(searchLower)) {
          matchingFields.push(key);
        }
      }
    });

    return matchingFields;
  };

  const filteredItems =
    data?.data?.filter((item) => {
      if (!searchTerm) return true;

      const searchLower = searchTerm.toLowerCase();

      // Search through ALL fields in the item object
      return Object.values(item).some((value) => {
        if (value === null || value === undefined) return false;

        // Convert value to string and search
        const stringValue = String(value).toLowerCase();
        return stringValue.includes(searchLower);
      });
    }) || [];

  const stats = data?.data
    ? {
        totalVehicles: data.data.length,
        certified: data.data.filter((item) => item.homenet_certified === "1")
          .length,
        branded: data.data.filter((item) => item.oper_branded === "Yes").length,
        withWarranty: data.data.filter(
          (item) =>
            item.oper_pt_warr_miles_left &&
            item.oper_pt_warr_miles_left !== "NULL",
        ).length,
      }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-muted">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary rounded-xl">
                  <Car className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    Vehicle Inventory
                    {data && (
                      <Badge
                        variant={
                          (data as any)._dataSource === "api"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {(data as any)._dataSource === "api"
                          ? "Live Data"
                          : "Demo Mode"}
                      </Badge>
                    )}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {(data as any)?._dataSource === "api"
                      ? "Real-time automotive inventory management"
                      : "Demo with sample data - API connection unavailable"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
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

              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium opacity-90">
                  Total Vehicles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    {stats.totalVehicles}
                  </div>
                  <Car className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-accent to-accent/80 text-accent-foreground">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium opacity-90">
                  Certified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.certified}</div>
                  <Shield className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium opacity-90">
                  Branded
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.branded}</div>
                  <AlertTriangle className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium opacity-90">
                  With Warranty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.withWarranty}</div>
                  <Calendar className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Vehicle Inventory</CardTitle>
                <CardDescription>
                  {searchTerm ? (
                    <>
                      {filteredItems.length} of {data?.data?.length || 0}{" "}
                      vehicles match "{searchTerm}"
                      {filteredItems.length > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          (searched all fields)
                        </span>
                      )}
                    </>
                  ) : data?.data?.length ? (
                    `${data.data.length} vehicles in inventory`
                  ) : (
                    "Loading inventory..."
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search across all vehicle data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error handling removed - fallback data ensures app always works */}

        {/* Loading State */}
        {isLoading && (
          <div
            className={cn(
              "grid gap-6",
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1",
            )}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Vehicle Grid/List */}
        {!isLoading && (
          <div
            className={cn(
              "grid gap-6",
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1",
            )}
          >
            {filteredItems.map((vehicle, index) => (
              <Card
                key={index}
                className={cn(
                  "border-0 shadow-lg hover:shadow-xl transition-all duration-300 group",
                  viewMode === "list" && "flex-row",
                )}
              >
                <CardHeader className={cn(viewMode === "list" && "flex-1")}>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {vehicle.homenet_year} {vehicle.homenet_make}{" "}
                    {vehicle.homenet_model ||
                      vehicle.homenet_model_number ||
                      "Vehicle Title Not Available"}
                    {vehicle.homenet_standard_trim && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}
                        {vehicle.homenet_standard_trim}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm text-muted-foreground">
                    {vehicle.homenet_eng_description ||
                      "Engine description not available"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Gauge className="h-4 w-4" />
                    <span>
                      {vehicle.homenet_mileage
                        ? `${parseInt(vehicle.homenet_mileage).toLocaleString()} miles`
                        : "Mileage N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Paintbrush className="h-4 w-4" />
                    <span>
                      Exterior: {vehicle.homenet_exterior_color || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Palette className="h-4 w-4" />
                    <span>
                      Interior: {vehicle.homenet_interior_color || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <DollarSign className="h-5 w-5" />
                    <span>
                      {vehicle.homenet_price
                        ? `$${parseInt(vehicle.homenet_price).toLocaleString()}`
                        : "Price N/A"}
                    </span>
                  </div>

                  {vehicle.web_url && (
                    <Button
                      className="w-full gap-2 mt-4"
                      variant="default"
                      onClick={() =>
                        window.open(
                          vehicle.web_url,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
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
        {!isLoading && filteredItems.length === 0 && searchTerm && (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
              <p className="text-muted-foreground mb-4">
                No vehicles match your search criteria.
              </p>
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear search
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
