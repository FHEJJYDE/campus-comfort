import { useState, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { Heart, Bed, Bath, Move, MapPin, ArrowRight, Home } from "lucide-react";
import { Property } from "@/types/database";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";
import { isPropertyFavorite, addUserFavorite, removeUserFavorite } from "@/utils/supabaseData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Force show image after timeout if it hasn't loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!imageLoaded && !imageError) {
        setImageLoaded(true);
      }
    }, 3000); // Show after 3 seconds even if onLoad didn't fire

    return () => clearTimeout(timer);
  }, [imageLoaded, imageError]);

  // Check if property is already favorited
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user && property.id) {
        const isFav = await isPropertyFavorite(user.id, property.id);
        setIsFavorite(isFav);
      }
    };

    checkFavoriteStatus();
  }, [user, property.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please log in to save properties");
      return;
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        const success = await removeUserFavorite(user.id, property.id);
        if (success) {
          setIsFavorite(false);
          toast.success("Property removed from favorites");
        } else {
          toast.error("Failed to remove property from favorites");
        }
      } else {
        // Add to favorites
        const success = await addUserFavorite(user.id, property.id);
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

  // Get property image with fallback
  const getPropertyImage = () => {
    if (property.images && property.images.length > 0 && property.images[0]) {
      return property.images[0];
    }
    return "/placeholder.svg";
  };

  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log('Image failed to load for property:', property.id);
    setImageError(true);
    setImageLoaded(true); // Show the fallback
  };

  // Default property image as inline SVG
  const DefaultPropertyImage = () => (
    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
      <div className="text-center">
        <Home className="h-16 w-16 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No Image Available</p>
      </div>
    </div>
  );

  return (
    <Link
      to={`/properties/${property.id}`}
      className="group block property-card-shadow rounded-xl overflow-hidden bg-card transition-all duration-300"
    >
      {/* Image container */}
      <div className="relative w-full h-64 overflow-hidden bg-muted">
        {imageError ? (
          <DefaultPropertyImage />
        ) : (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                <div className="text-muted-foreground text-sm">Loading...</div>
              </div>
            )}
            <img
              src={getPropertyImage()}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ display: imageLoaded ? 'block' : 'none' }}
              onLoad={() => {
                console.log('Image loaded for:', property.title);
                setImageLoaded(true);
              }}
              onError={handleImageError}
              loading="lazy"
            />
          </>
        )}
        {imageLoaded && (
          <>
            <div
              onClick={toggleFavorite}
              className={cn(
                "absolute top-4 right-4 p-2 rounded-full transition-all",
                isFavorite
                  ? "bg-white/90 text-rose-500"
                  : "bg-black/20 text-white hover:bg-white/90 hover:text-rose-500"
              )}
            >
              <Heart className={cn("h-5 w-5", isFavorite && "fill-rose-500")} />
            </div>

            {/* Property status badge */}
            <div className="absolute bottom-4 left-4">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-card text-foreground">
                {property.status}
              </span>
            </div>

            {/* Featured badge */}
            {property.is_featured && (
              <div className="absolute top-4 left-4">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent text-accent-foreground">
                  Featured
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-2">
          <h3 className="text-xl font-heading font-semibold text-foreground truncate">
            {property.title}
          </h3>
          <div className="flex items-center text-muted-foreground text-sm mt-1">
            <MapPin className="h-4 w-4 flex-shrink-0 mr-1" />
            <span className="truncate">
              {property.city}, {property.state}
            </span>
          </div>
        </div>

        <div className="text-2xl font-heading font-semibold text-primary mb-4">
          {formatPrice(property.price, { fromCurrency: property.currency || 'NGN' })}
        </div>

        {/* Property details */}
        <div className="flex space-x-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            <span>{property.bedrooms || 0} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            <span>{property.bathrooms || 0} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
          </div>
          <div className="flex items-center">
            <Move className="h-4 w-4 mr-1" />
            <span>{property.square_feet || 0} sqft</span>
          </div>
        </div>

        {/* View details */}
        <div className="pt-4 border-t border-border">
          <div className="group-hover:text-accent flex items-center justify-end text-sm font-medium text-muted-foreground">
            View Details
            <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(PropertyCard);