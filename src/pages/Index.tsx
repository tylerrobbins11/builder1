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
  Package,
  Search,
  TrendingUp,
  AlertTriangle,
  Box,
  DollarSign,
  RefreshCw,
  Filter,
  Grid3X3,
  List,
  Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InventoryItem {
  pk: number;
  name: string;
  description: string;
  category?: string;
  in_stock: number;
  minimum_stock?: number;
  location?: string;
  units?: string;
  price?: number;
  image?: string;
  active: boolean;
  assembly: boolean;
  component: boolean;
  purchaseable: boolean;
  salable: boolean;
  virtual: boolean;
}

interface ApiResponse {
  count: number;
  next?: string;
  previous?: string;
  results: InventoryItem[];
}

const fetchInventory = async (): Promise<ApiResponse> => {
  try {
    // Try proxy first
    const response = await fetch(
      "/api/inventory?token=175grzjKeAfg1OYRKpAmcJ3ebaYZYi9Cn%2FNg2Ht8pDQ",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // If proxy fails, try direct request with mode: 'cors'
    console.warn("Proxy request failed, trying direct CORS request:", error);

    try {
      const response = await fetch(
        "https://donohoo.easytree.io/inventory?token=175grzjKeAfg1OYRKpAmcJ3ebaYZYi9Cn%2FNg2Ht8pDQ",
        {
          method: "GET",
          mode: "cors",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (corsError) {
      console.error("Both proxy and CORS requests failed:", corsError);
      throw new Error(
        "Unable to fetch inventory data. Please check your network connection or contact support.",
      );
    }
  }
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["inventory"],
    queryFn: fetchInventory,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const filteredItems =
    data?.results?.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const stats = data?.results
    ? {
        totalItems: data.results.length,
        lowStock: data.results.filter(
          (item) => item.minimum_stock && item.in_stock <= item.minimum_stock,
        ).length,
        outOfStock: data.results.filter((item) => item.in_stock === 0).length,
        totalValue: data.results.reduce(
          (sum, item) => sum + (item.price || 0) * item.in_stock,
          0,
        ),
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
                  <Boxes className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Inventory Hub
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Real-time inventory management
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
                  Total Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.totalItems}</div>
                  <Package className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-accent to-accent/80 text-accent-foreground">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium opacity-90">
                  Low Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.lowStock}</div>
                  <AlertTriangle className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium opacity-90">
                  Out of Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.outOfStock}</div>
                  <Box className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium opacity-90">
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    ${stats.totalValue.toLocaleString()}
                  </div>
                  <DollarSign className="h-8 w-8 opacity-80" />
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
                <CardTitle>Inventory Items</CardTitle>
                <CardDescription>
                  {data?.count
                    ? `${data.count} total items`
                    : "Loading inventory..."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
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
              Failed to load inventory data. Please check your connection and
              try again.
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

        {/* Inventory Grid/List */}
        {!isLoading && !error && (
          <div
            className={cn(
              "grid gap-6",
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1",
            )}
          >
            {filteredItems.map((item) => (
              <Card
                key={item.pk}
                className={cn(
                  "border-0 shadow-lg hover:shadow-xl transition-all duration-300 group",
                  item.in_stock === 0 && "opacity-75",
                  viewMode === "list" && "flex-row",
                )}
              >
                <CardHeader className={cn(viewMode === "list" && "flex-1")}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {item.name}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.assembly && (
                      <Badge variant="secondary">Assembly</Badge>
                    )}
                    {item.component && (
                      <Badge variant="outline">Component</Badge>
                    )}
                    {item.purchaseable && (
                      <Badge className="bg-green-100 text-green-800">
                        Purchaseable
                      </Badge>
                    )}
                    {item.salable && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Salable
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Stock:
                      </span>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            item.in_stock === 0
                              ? "destructive"
                              : item.minimum_stock &&
                                  item.in_stock <= item.minimum_stock
                                ? "outline"
                                : "secondary"
                          }
                        >
                          {item.in_stock} {item.units || "units"}
                        </Badge>
                      </div>
                    </div>

                    {item.minimum_stock && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Min Stock:
                        </span>
                        <span className="text-sm font-medium">
                          {item.minimum_stock}
                        </span>
                      </div>
                    )}

                    {item.price && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Price:
                        </span>
                        <span className="text-sm font-medium">
                          ${item.price}
                        </span>
                      </div>
                    )}

                    {item.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Location:
                        </span>
                        <span className="text-sm font-medium">
                          {item.location}
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
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground mb-4">
                No inventory items match your search criteria.
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
