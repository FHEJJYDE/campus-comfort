import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, LayoutList, ArrowUpDown, Home, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PropertyCard from "@/components/properties/PropertyCard";
import PropertyFilters from "@/components/properties/PropertyFilters";
import { Property, fetchProperties } from "@/utils/supabaseData";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { searchHistoryApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface FilterState {
  searchTerm?: string;
  propertyTypes?: string[];
  amenities?: string[];
  priceRange?: [number, number];
  bedrooms?: number | null;
  bathrooms?: number | null;
}

const PropertyListings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 9; // Show 9 properties per page
  const [initialFilters, setInitialFilters] = useState<Partial<FilterState>>({});

  // New state for the property type selection
  const [selectedPropertyCategory, setSelectedPropertyCategory] = useState<string | null>(null);

  // Fetch properties from Supabase with optimized query settings
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: fetchProperties,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Apply filters using useMemo for better performance
  const filteredProperties = useMemo(() => {
    if (!properties || properties.length === 0) return [];

    // Parse URL query params
    const params = new URLSearchParams(location.search);
    const locationFilter = params.get("location");
    const typeFilter = params.get("type");
    const priceMin = params.get("price_min");
    const priceMax = params.get("price_max");
    const bedroomsFilter = params.get("bedrooms");
    const bathroomsFilter = params.get("bathrooms");
    const amenitiesFilter = params.get("amenities");

    let results = [...properties];

    // Apply property category filter (Land vs Houses)
    if (selectedPropertyCategory) {
      if (selectedPropertyCategory === "land") {
        results = results.filter(property =>
          property.property_type.toLowerCase() === "land"
        );
      } else if (selectedPropertyCategory === "houses") {
        results = results.filter(property =>
          ["house", "apartment", "condo", "townhouse"].includes(property.property_type.toLowerCase())
        );
      }
    }

    // Filter by search term (location)
    if (locationFilter) {
      const term = locationFilter.toLowerCase();
      results = results.filter(
        (property) =>
          property.city.toLowerCase().includes(term) ||
          property.state.toLowerCase().includes(term) ||
          property.zip_code?.toLowerCase().includes(term) ||
          property.title.toLowerCase().includes(term) ||
          property.street?.toLowerCase().includes(term)
      );
    }

    // Filter by property type
    if (typeFilter) {
      const types = typeFilter.split(",").map(type => type.trim());
      results = results.filter((property) =>
        types.some(type =>
          property.property_type.toLowerCase().includes(type.toLowerCase())
        )
      );
    }

    // Filter by bedrooms
    if (bedroomsFilter) {
      const bedrooms = parseInt(bedroomsFilter, 10);
      results = results.filter(
        (property) => property.bedrooms && property.bedrooms >= bedrooms
      );
    }

    // Filter by bathrooms
    if (bathroomsFilter) {
      const bathrooms = parseInt(bathroomsFilter, 10);
      results = results.filter(
        (property) => property.bathrooms && property.bathrooms >= bathrooms
      );
    }

    // Filter by price range
    if (priceMin && priceMax) {
      const minPrice = parseInt(priceMin, 10);
      const maxPrice = parseInt(priceMax, 10);
      results = results.filter(
        (property) =>
          property.price >= minPrice &&
          property.price <= maxPrice
      );
    }

    // Filter by amenities
    if (amenitiesFilter) {
      const amenities = amenitiesFilter.split(",").map(amenity => amenity.trim());
      results = results.filter((property) =>
        amenities.some((amenity: string) =>
          property.amenities && Array.isArray(property.amenities) && property.amenities.includes(amenity)
        )
      );
    }

    return results;
  }, [properties, location.search, selectedPropertyCategory]);

  const handleApplyFilters = (filters: FilterState) => {
    // Update URL with filter parameters
    const params = new URLSearchParams();

    if (filters.searchTerm) {
      params.set("location", filters.searchTerm);
    }

    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      params.set("type", filters.propertyTypes.join(","));
    }

    if (filters.priceRange) {
      params.set("price_min", filters.priceRange[0].toString());
      params.set("price_max", filters.priceRange[1].toString());
    }

    if (filters.bedrooms !== null) {
      params.set("bedrooms", filters.bedrooms.toString());
    }

    if (filters.bathrooms !== null) {
      params.set("bathrooms", filters.bathrooms.toString());
    }

    if (filters.amenities && filters.amenities.length > 0) {
      params.set("amenities", filters.amenities.join(","));
    }

    // Reset to first page when filters change
    setCurrentPage(1);

    // Update browser history
    const newUrl = `/properties${params.toString() ? `?${params.toString()}` : ''}`;
    navigate(newUrl, { replace: true });

    // Save search to history if user is logged in
    if (user) {
      const searchQuery = filters.searchTerm || "";
      const searchFilters = {
        property_type: filters.propertyTypes?.[0],
        min_price: filters.priceRange?.[0],
        max_price: filters.priceRange?.[1],
        bedrooms: filters.bedrooms,
        bathrooms: filters.bathrooms,
        amenities: filters.amenities
      };

      // Save to search history (non-blocking)
      searchHistoryApi.saveSearchToHistory(searchQuery, searchFilters, filteredProperties.length);
    }
  };

  // Sort properties using useMemo
  const sortedProperties = useMemo(() => {
    switch (sortBy) {
      case "price_asc":
        return [...filteredProperties].sort((a, b) => a.price - b.price);
      case "price_desc":
        return [...filteredProperties].sort((a, b) => b.price - a.price);
      case "newest":
        return [...filteredProperties].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      default:
        return filteredProperties;
    }
  }, [filteredProperties, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedProperties.length / propertiesPerPage);
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * propertiesPerPage;
    const endIndex = startIndex + propertiesPerPage;
    return sortedProperties.slice(startIndex, endIndex);
  }, [sortedProperties, currentPage]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of property listings
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-heading font-semibold mb-4">
          Loading properties...
        </h2>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Browse Housing | Tonys Estate</title>
        <meta name="description" content="Browse our extensive collection of student housing near universities. Find apartments, dorms, shared rooms, and more." />
      </Helmet>

      <div className="bg-muted/20 py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-heading font-semibold text-foreground mb-2">
            Browse Properties
          </h1>
          <p className="text-muted-foreground mb-8">
            Find your next home from our carefully curated property listings.
          </p>

          {/* Property Category Selection */}
          <div className="mb-8 bg-card rounded-lg border border-border p-6 shadow-sm">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
              What are you looking for?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant={selectedPropertyCategory === "houses" ? "default" : "outline"}
                className={`py-6 h-auto flex flex-col items-center justify-center ${selectedPropertyCategory === "houses"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-muted"
                  }`}
                onClick={() => setSelectedPropertyCategory(selectedPropertyCategory === "houses" ? null : "houses")}
              >
                <Home className="h-8 w-8 mb-2" />
                <span className="text-lg font-medium">Houses & Apartments</span>
                <span className="text-sm text-muted-foreground mt-1">
                  Residential properties
                </span>
              </Button>
              <Button
                variant={selectedPropertyCategory === "land" ? "default" : "outline"}
                className={`py-6 h-auto flex flex-col items-center justify-center ${selectedPropertyCategory === "land"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-muted"
                  }`}
                onClick={() => setSelectedPropertyCategory(selectedPropertyCategory === "land" ? null : "land")}
              >
                <Map className="h-8 w-8 mb-2" />
                <span className="text-lg font-medium">Land</span>
                <span className="text-sm text-muted-foreground mt-1">
                  Plots and acreage
                </span>
              </Button>
            </div>
            {selectedPropertyCategory && (
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedPropertyCategory(null)}
                >
                  Clear selection
                </Button>
              </div>
            )}
          </div>

          <PropertyFilters
            onApplyFilters={handleApplyFilters}
            initialFilters={initialFilters}
          />

          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <p className="text-muted-foreground mb-4 sm:mb-0">
              Showing <span className="font-medium text-foreground">{sortedProperties.length}</span> properties
            </p>

            <div className="flex space-x-3">
              <div className="flex items-center">
                <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex rounded-md overflow-hidden">
                <Button
                  variant={view === "grid" ? "default" : "outline"}
                  className={`px-3 ${view === "grid" ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={() => setView("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="sr-only">Grid view</span>
                </Button>
                <Button
                  variant={view === "list" ? "default" : "outline"}
                  className={`px-3 ${view === "list" ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={() => setView("list")}
                >
                  <LayoutList className="h-4 w-4" />
                  <span className="sr-only">List view</span>
                </Button>
              </div>
            </div>
          </div>

          {paginatedProperties.length > 0 ? (
            <>
              <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col space-y-6"}>
                {paginatedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        className={page === currentPage ? "bg-primary text-primary-foreground" : ""}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg shadow">
              <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                No properties found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your filters to find the perfect property.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PropertyListings;