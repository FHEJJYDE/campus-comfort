import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

// Define property type data structure
interface PropertyTypeData {
  title: string;
  image: string;
  count: number;
  url: string;
  type: string;
  key: number; // Added key instead of id for identification
}

const PropertyTypes = () => {
  // Fetch properties to count by type
  const { data: properties, isLoading } = useQuery({
    queryKey: ["property-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("property_type");

      if (error) {
        throw error;
      }

      return data;
    }
  });

  // Count properties by type and prepare data
  const getPropertyTypes = (): PropertyTypeData[] => {
    if (!properties || properties.length === 0) {
      // Return default property types with local images when no data is available
      return [
        {
          key: 1,
          title: "Single Family Homes",
          image: "/property-types/type-1.jpg",
          count: 0,
          url: "/properties?type=house",
          type: "house"
        },
        {
          key: 2,
          title: "Condos & Apartments",
          image: "/property-types/type-2.jpg",
          count: 0,
          url: "/properties?type=condo,apartment",
          type: "condo"
        },
        {
          key: 3,
          title: "Luxury Properties",
          image: "/property-types/type-3.jpg",
          count: 0,
          url: "/properties?luxury=true",
          type: "luxury"
        },
        {
          key: 4,
          title: "Self Contain",
          image: "/property-types/type-4.jpg",
          count: 0,
          url: "/properties?type=commercial",
          type: "Self Contain"
        }
      ];
    }

    // Count properties by type
    const typeCounts: Record<string, number> = {};
    properties.forEach(prop => {
      const type = prop.property_type;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    // Map to our UI format
    return [
      {
        key: 1,
        title: "Single Family Homes",
        image: "/property-types/type-1.jpg",
        count: typeCounts["house"] || 0,
        url: "/properties?type=house",
        type: "house"
      },
      {
        key: 2,
        title: "Condos & Apartments",
        image: "/property-types/type-2.jpg",
        count: (typeCounts["condo"] || 0) + (typeCounts["apartment"] || 0),
        url: "/properties?type=condo,apartment",
        type: "condo"
      },
      {
        key: 3,
        title: "Luxury Properties",
        image: "/property-types/type-3.jpg",
        count: properties.length > 5 ? Math.floor(properties.length / 5) : 0, // Estimate luxury properties
        url: "/properties?luxury=true",
        type: "luxury"
      },
      {
        key: 4,
        title: "Commercial Spaces",
        image: "/property-types/type-4.jpg",
        count: typeCounts["commercial"] || 0,
        url: "/properties?type=commercial",
        type: "commercial"
      }
    ].filter(type => type.count > 0); // Only show types with actual properties
  };

  // Property types will be generated from Supabase data only

  const propertyTypes = getPropertyTypes();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {isLoading ? (
        // Loading states
        Array(4).fill(null).map((_, index) => (
          <div key={index} className="relative h-80 rounded-xl overflow-hidden">
            <Skeleton className="h-full w-full" />
          </div>
        ))
      ) : (
        // Property type cards
        propertyTypes.map((type) => (
          <Link
            key={type.key}
            to={type.url}
            className="group relative h-80 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url(${type.image})` }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <h3 className="text-xl font-heading font-semibold text-white mb-1">
                {type.title}
              </h3>
              <p className="text-white/80 text-sm">
                {type.count.toLocaleString()} Properties
              </p>
            </div>
          </Link>
        ))
      )}
    </div>
  );
};

export default PropertyTypes;