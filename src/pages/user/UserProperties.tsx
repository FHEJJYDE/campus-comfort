import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Search, Filter, Heart, MapPin } from "lucide-react";
import { CustomLoader } from "@/components/ui/custom-loader";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserProperties } from "@/utils/supabaseData";
import { toast } from "sonner";
import { Property } from "@/types/database";
import { Link } from "react-router-dom";

export default function UserProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserProperties();
    }
  }, [user]);

  const loadUserProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserProperties(user!.id);
      setProperties(data);
    } catch (err) {
      console.error("Error loading user properties:", err);
      setError(err.message || "Failed to load properties");
      toast.error("Failed to load properties: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to view your properties</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold flex flex-wrap items-center gap-2">
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            <span className="break-words">My Properties</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your property listings
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="whitespace-nowrap">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button className="bg-gradient-to-r from-primary to-primary-glow whitespace-nowrap">
            <Search className="mr-2 h-4 w-4" />
            Advanced Search
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <Button onClick={loadUserProperties}>Retry</Button>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Properties Listed</h3>
          <p className="text-muted-foreground mb-4">
            You haven't listed any properties yet. Start by creating your first listing!
          </p>
          <Button variant="outline" asChild>
            <Link to="/list-property-protected">
              <Heart className="mr-2 h-4 w-4" />
              List a Property
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="relative">
                {property.images?.[0] ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <Badge className="absolute top-2 right-2" variant="secondary">
                  {property.status}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  {property.city}, {property.state}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary">
                    ₦{property.price?.toLocaleString()}
                  </span>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}