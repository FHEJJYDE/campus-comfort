import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Heart, Share, Printer, MapPin, Bed, Bath, Move,
  CheckSquare, Calendar, Home, Phone, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PropertyGallery from "@/components/properties/PropertyGallery";
import PropertyCard from "@/components/properties/PropertyCard";
import PropertyPurchase from "@/components/properties/PropertyPurchase";
import { Helmet } from "react-helmet-async";
import { fetchPropertyById, Property, isPropertyFavorite, addUserFavorite, removeUserFavorite } from "@/utils/supabaseData";
import { useQuery } from "@tanstack/react-query";
import ChatWidget from "@/components/messaging/ChatWidget";
import ViewingScheduler from "@/components/viewings/ViewingScheduler";
import PropertyInquiryForm from "@/components/inquiries/PropertyInquiryForm";
import { analyticsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ["property", id],
    queryFn: () => id ? fetchPropertyById(id) : null,
    enabled: !!id
  });

  // Check if property is already favorited
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user && id) {
        const isFav = await isPropertyFavorite(user.id, id);
        setIsFavorite(isFav);
      }
    };

    checkFavoriteStatus();
  }, [user, id]);

  // Similar properties (excluding current property)
  const { data: similarProperties = [] } = useQuery({
    queryKey: ["similar-properties", property?.id, property?.property_type],
    queryFn: async () => {
      // For now, return empty array - you can implement fetchProperties later
      return [];
    },
    enabled: !!property
  });

  // Toggle favorite status
  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Please log in to save properties");
      return;
    }

    if (!id) return;

    try {
      if (isFavorite) {
        // Remove from favorites
        const success = await removeUserFavorite(user.id, id);
        if (success) {
          setIsFavorite(false);
          toast.success("Property removed from favorites");
        } else {
          toast.error("Failed to remove property from favorites");
        }
      } else {
        // Add to favorites
        const success = await addUserFavorite(user.id, id);
        if (success) {
          setIsFavorite(true);
          toast.success("Property saved to favorites");
        } else {
          toast.error("Failed to save property to favorites");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite status");
    }
  };

  // If loading
  if (isLoading) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-heading font-semibold mb-4">
          Loading property information...
        </h2>
      </div>
    );
  }

  // If error
  if (error || !property) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-heading font-semibold mb-4">
          Property not found
        </h2>
        <p className="mb-8">The property you are looking for does not exist or has been removed.</p>
        <Link to="/properties">
          <Button>Back to Properties</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{property.title} | Tonys Estate</title>
        <meta name="description" content={property.description?.substring(0, 160) || ""} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://campuscomfort.com/properties/${property.id}`} />
        <meta property="og:title" content={`${property.title} | Tonys Estate`} />
        <meta property="og:description" content={property.description?.substring(0, 160) || ""} />
        {property.images && property.images.length > 0 && (
          <meta property="og:image" content={property.images[0]} />
        )}

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`https://campuscomfort.com/properties/${property.id}`} />
        <meta property="twitter:title" content={`${property.title} | Tonys Estate`} />
        <meta property="twitter:description" content={property.description?.substring(0, 160) || ""} />
        {property.images && property.images.length > 0 && (
          <meta property="twitter:image" content={property.images[0]} />
        )}
      </Helmet>

      <div className="bg-muted/20 py-8">
        <div className="container-custom">
          {/* Breadcrumbs */}
          <div className="flex text-sm mb-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link to="/properties" className="text-muted-foreground hover:text-foreground">
              Properties
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="text-foreground font-medium">
              {property.title}
            </span>
          </div>

          {/* Property header */}
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-semibold text-foreground mb-2">
                {property.title}
              </h1>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {property.street}, {property.city}, {property.state} {property.zip_code}
                </span>
              </div>
            </div>

            <div className="mt-4 md:mt-0 flex flex-col items-end">
              <div className="text-3xl font-heading font-semibold text-primary mb-1">
                {formatPrice(property.price, { fromCurrency: property.currency || 'NGN' })}
              </div>
              <div className="text-muted-foreground text-sm">
                {property.status}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Button
              variant="outline"
              onClick={toggleFavorite}
              className="flex items-center"
            >
              <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
              {isFavorite ? "Saved" : "Save"}
            </Button>

            <Button
              variant="outline"
              className="flex items-center"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>

            <Button
              variant="outline"
              className="flex items-center"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>

          {/* Property gallery */}
          <PropertyGallery images={property.images} title={property.title} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Property details */}
              <div className="bg-card rounded-xl shadow p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <Bed className="h-6 w-6 mx-auto text-accent mb-2" />
                    <div className="text-lg font-medium text-foreground">
                      {property.bedrooms || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Bedrooms
                    </div>
                  </div>

                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <Bath className="h-6 w-6 mx-auto text-accent mb-2" />
                    <div className="text-lg font-medium text-foreground">
                      {property.bathrooms || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Bathrooms
                    </div>
                  </div>

                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <Move className="h-6 w-6 mx-auto text-accent mb-2" />
                    <div className="text-lg font-medium text-foreground">
                      {property.square_feet || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Sq Ft
                    </div>
                  </div>

                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <Home className="h-6 w-6 mx-auto text-accent mb-2" />
                    <div className="text-lg font-medium text-foreground">
                      {property.property_type}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Property Type
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-heading font-semibold mb-4 text-foreground">
                  Description
                </h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {property.description || 'No description available'}
                </p>

                <div className="mt-6 pt-6 border-t border-border">
                  <h2 className="text-xl font-heading font-semibold mb-4 text-foreground">
                    Property Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-realty-800 dark:text-realty-300 mr-2" />
                      <span className="text-realty-600 dark:text-realty-400">
                        Year Built:
                      </span>
                      <span className="ml-1 text-realty-900 dark:text-white">
                        {property.year_built || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Home className="h-5 w-5 text-realty-800 dark:text-realty-300 mr-2" />
                      <span className="text-realty-600 dark:text-realty-400">
                        Property Type:
                      </span>
                      <span className="ml-1 text-realty-900 dark:text-white">
                        {property.property_type || 'Not specified'}
                      </span>
                    </div>
                    {property.lot_size && (
                      <div className="flex items-center">
                        <Move className="h-5 w-5 text-realty-800 dark:text-realty-300 mr-2" />
                        <span className="text-realty-600 dark:text-realty-400">
                          Lot Size:
                        </span>
                        <span className="ml-1 text-realty-900 dark:text-white">
                          {property.lot_size} sq ft
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs: Features, Location, etc. */}
              <Tabs defaultValue="features">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="features">Features & Amenities</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="floor-plan">Floor Plan</TabsTrigger>
                </TabsList>

                <TabsContent value="features" className="mt-6 bg-white dark:bg-realty-800 rounded-xl shadow p-6">
                  <h3 className="text-xl font-heading font-semibold mb-4 text-realty-900 dark:text-white">
                    Features & Amenities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {property.amenities && property.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center">
                        <CheckSquare className="h-5 w-5 text-realty-800 dark:text-realty-300 mr-2" />
                        <span className="text-realty-600 dark:text-realty-300">
                          {amenity}
                        </span>
                      </div>
                    ))}
                    {property.features && property.features.map((feature) => (
                      <div key={feature} className="flex items-center">
                        <CheckSquare className="h-5 w-5 text-realty-800 dark:text-realty-300 mr-2" />
                        <span className="text-realty-600 dark:text-realty-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="location" className="mt-6 bg-white dark:bg-realty-800 rounded-xl shadow p-6">
                  <h3 className="text-xl font-heading font-semibold mb-4 text-realty-900 dark:text-white">
                    Location
                  </h3>
                  <div className="aspect-[16/9] bg-realty-100 dark:bg-realty-700 rounded-lg mb-4 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-realty-500 dark:text-realty-300">
                      Map goes here
                    </div>
                  </div>
                  <div className="mt-4 text-realty-600 dark:text-realty-300">
                    <p>
                      {property.street}, {property.city}, {property.state} {property.zip_code}
                    </p>
                    <p className="mt-2">
                      Located in a prime neighborhood with easy access to schools, shopping centers, and public transportation.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="floor-plan" className="mt-6 bg-white dark:bg-realty-800 rounded-xl shadow p-6">
                  <h3 className="text-xl font-heading font-semibold mb-4 text-realty-900 dark:text-white">
                    Floor Plan
                  </h3>
                  <div className="aspect-[16/9] bg-realty-100 dark:bg-realty-700 rounded-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-realty-500 dark:text-realty-300">
                      Floor plan visualization would go here
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Owner info and actions */}
              <div className="bg-white dark:bg-realty-800 rounded-xl shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-realty-200 dark:bg-realty-700 flex items-center justify-center">
                    <Home className="h-8 w-8 text-realty-600 dark:text-realty-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-heading font-semibold text-realty-900 dark:text-white">
                      Property Owner
                    </h3>
                    <p className="text-sm text-realty-500 dark:text-realty-400">
                      Direct Listing
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="text-sm text-realty-600 dark:text-realty-300">
                    Connect directly with the property owner for inquiries and viewings.
                  </div>
                </div>

                <div className="space-y-3">
                  {user ? (
                    <>
                      <ViewingScheduler
                        propertyId={property.id}
                        property={{
                          title: property.title,
                          address: `${property.street}, ${property.city}, ${property.state}`,
                          price: property.price,
                          images: property.images
                        }}
                      />
                      <Button
                        className="w-full bg-realty-800 hover:bg-realty-900 text-white"
                        onClick={() => setIsChatOpen(true)}
                      >
                        Message Owner
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-realty-600 dark:text-realty-400 mb-3">
                        Sign in to schedule viewings and message the property owner
                      </p>
                      <Button asChild>
                        <Link to="/login">Sign In</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Inquiry Form */}
              <div className="bg-white dark:bg-realty-800 rounded-xl shadow p-6">
                <h3 className="text-lg font-heading font-semibold mb-4 text-realty-900 dark:text-white">
                  Interested in this Property?
                </h3>
                <p className="text-sm text-realty-600 dark:text-realty-400 mb-4">
                  Send an inquiry directly to the property owner and get a response quickly.
                </p>
                <PropertyInquiryForm
                  propertyId={property.id}
                  property={{
                    title: property.title,
                    price: property.price,
                    address: `${property.street}, ${property.city}, ${property.state}`,
                    agent_id: null
                  }}
                />
              </div>

              {/* Mortgage Calculator */}
              <div className="bg-white dark:bg-realty-800 rounded-xl shadow p-6">
                <h3 className="text-lg font-heading font-semibold mb-4 text-realty-900 dark:text-white">
                  Mortgage Calculator
                </h3>

                <div className="bg-realty-50 dark:bg-realty-700/30 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-realty-600 dark:text-realty-300">Principal & Interest</span>
                    <span className="font-medium text-realty-900 dark:text-white">
                      {formatPrice(Math.round(property.price * 0.00324), { fromCurrency: property.currency || 'NGN' })}
                    </span>
                  </div>
                  <div className="text-xs text-realty-500 dark:text-realty-400">
                    Based on 20% down payment, 30-year fixed rate mortgage at 3.25%
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Full Calculator
                </Button>
              </div>
            </div>
          </div>

          {/* Similar Properties */}
          <div className="mt-12">
            <h2 className="text-2xl font-heading font-semibold mb-6 text-realty-900 dark:text-white">
              Similar Properties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget
        propertyId={property.id}
        ownerId={property.owner_id}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
};

export default PropertyDetails;