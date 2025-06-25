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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleItem {
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
  [key: string]: any; // For any other dynamic fields
}

interface ApiResponse {
  data: VehicleItem[];
}

// Mock data for fallback
const MOCK_DATA: ApiResponse = {
  data: [
    {
      homenet_model_number: "CK20743",
      homenet_dealer_address: "1000 Greenhill Blvd",
      homenet_certified: "1",
      homenet_standard_trim: "LT",
      oper_branded: "No",
      homenet_eng_liters: "6.6L",
      vom_pdf_tpw: "2025-06-09 00:00:00.000",
      oper_pt_warr_miles_left: "50000",
      upu_comment: "Excellent condition",
    },
    {
      homenet_model_number: "FD15892",
      homenet_dealer_address: "2500 Oak Street",
      homenet_certified: "0",
      homenet_standard_trim: "XLT",
      oper_branded: "Yes",
      homenet_eng_liters: "5.0L",
      vom_pdf_tpw: "2024-12-15 00:00:00.000",
      oper_pt_warr_miles_left: "NULL",
      upu_comment: "Previous accident",
    },
    {
      homenet_model_number: "TY98456",
      homenet_dealer_address: "750 Main Avenue",
      homenet_certified: "1",
      homenet_standard_trim: "Limited",
      oper_branded: "No",
      homenet_eng_liters: "3.5L",
      vom_pdf_tpw: "2025-03-20 00:00:00.000",
      oper_pt_warr_miles_left: "75000",
      upu_comment: "Like new",
    },
    {
      homenet_model_number: "HD78123",
      homenet_dealer_address: "1200 Pine Road",
      homenet_certified: "0",
      homenet_standard_trim: "Sport",
      oper_branded: "No",
      homenet_eng_liters: "2.4L",
      vom_pdf_tpw: "2024-11-08 00:00:00.000",
      oper_pt_warr_miles_left: "60000",
      upu_comment: "Well maintained",
    },
    {
      homenet_model_number: "NX45678",
      homenet_dealer_address: "500 Elm Street",
      homenet_certified: "1",
      homenet_standard_trim: "Premium",
      oper_branded: "No",
      homenet_eng_liters: "4.0L",
      vom_pdf_tpw: "2025-01-15 00:00:00.000",
      oper_pt_warr_miles_left: "100000",
      upu_comment: "Fleet vehicle",
    },
    {
      homenet_model_number: "BMW98765",
      homenet_dealer_address: "300 Luxury Lane",
      homenet_certified: "1",
      homenet_standard_trim: "M-Series",
      oper_branded: "No",
      homenet_eng_liters: "4.4L",
      vom_pdf_tpw: "2024-10-30 00:00:00.000",
      oper_pt_warr_miles_left: "80000",
      upu_comment: "Performance package",
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

        {/* Error State */}
        {error && (
          <Alert className="mb-8 border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load vehicle inventory data. Please check your
              connection and try again.
              <Button
                variant="outline"
                size="sm"
                className="ml-4"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
        {!isLoading && !error && (
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {vehicle.homenet_model_number || "Unknown Model"}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {vehicle.homenet_standard_trim &&
                          `${vehicle.homenet_standard_trim} Trim`}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {vehicle.homenet_certified === "1" && (
                      <Badge className="bg-green-100 text-green-800">
                        Certified
                      </Badge>
                    )}
                    {vehicle.oper_branded === "Yes" && (
                      <Badge variant="destructive">Branded</Badge>
                    )}
                    {vehicle.homenet_standard_trim && (
                      <Badge variant="outline">
                        {vehicle.homenet_standard_trim}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent
                  className={cn(
                    viewMode === "list" && "flex items-center space-x-6",
                  )}
                >
                  <div className="space-y-3">
                    {vehicle.homenet_eng_liters && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Fuel className="h-4 w-4" />
                          Engine:
                        </span>
                        <span className="text-sm font-medium">
                          {vehicle.homenet_eng_liters}
                        </span>
                      </div>
                    )}

                    {vehicle.oper_pt_warr_miles_left &&
                      vehicle.oper_pt_warr_miles_left !== "NULL" && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Warranty:
                          </span>
                          <span className="text-sm font-medium">
                            {vehicle.oper_pt_warr_miles_left} mi
                          </span>
                        </div>
                      )}

                    {vehicle.vom_pdf_tpw && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date:
                        </span>
                        <span className="text-sm font-medium">
                          {new Date(vehicle.vom_pdf_tpw).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {vehicle.homenet_dealer_address && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Location:
                        </span>
                        <span className="text-sm font-medium truncate max-w-[150px]">
                          {vehicle.homenet_dealer_address}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredItems.length === 0 && searchTerm && (
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
