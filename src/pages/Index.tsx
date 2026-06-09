import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Building, Home, TrendingUp, Users, ChevronRight, Gift, Percent, Star, Award } from "lucide-react";

// Home page components
import HeroSearch from "@/components/home/HeroSearch";
import FeaturedListings from "@/components/home/FeaturedListings";
import PropertyTypes from "@/components/home/PropertyTypes";
import TestimonialsNew from "@/components/home/TestimonialsNew";
import Newsletter from "@/components/home/Newsletter";
import ScrollToTop from "@/components/ui/scroll-to-top";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// Add carousel components
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { useLocationStats } from "@/hooks/useLocationStats";
import { useLocations } from "@/hooks/useLocations";

const Index = () => {
  const { getCountForCity, loading: statsLoading } = useLocationStats();
  const { locations: dbLocations, loading: locationsLoading } = useLocations();

  // Smooth scroll effect for the page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Use locations from database, fallback to hardcoded if empty
  const fallbackLocations = [
    {
      id: '1',
      name: "Enugu",
      state: "Enugu",
      country: "Nigeria",
      image_url: "/locations/location-1.jpg",
      is_active: true,
      display_order: 1
    },
    {
      id: '2',
      name: "Calabar",
      state: "Cross River",
      country: "Nigeria",
      image_url: "/locations/location-2.jpg",
      is_active: true,
      display_order: 2
    },
    {
      id: '3',
      name: "Lagos",
      state: "Lagos",
      country: "Nigeria",
      image_url: "/locations/location-3.jpg",
      is_active: true,
      display_order: 3
    },
    {
      id: '4',
      name: "Abuja",
      state: "FCT",
      country: "Nigeria",
      image_url: "/locations/location-4.jpg",
      is_active: true,
      display_order: 4
    },
    {
      id: '5',
      name: "Akwa Ibom",
      state: "Akwa Ibom",
      country: "Nigeria",
      image_url: "/locations/location-5.jpg",
      is_active: true,
      display_order: 5
    },
    {
      id: '6',
      name: "Anambra",
      state: "Anambra",
      country: "Nigeria",
      image_url: "/locations/location-6.jpg",
      is_active: true,
      display_order: 6
    }
  ];

  const locations = dbLocations.length > 0 ? dbLocations : fallbackLocations;

  return (
    <>
      <Helmet>
        <title>Tonys Estate | Find Your Perfect Home</title>
        <meta name="description" content="Find your perfect property with Tonys Estate. Browse thousands of properties across Nigeria." />
        <meta name="keywords" content="real estate, properties, houses, apartments, Nigeria, rentals, for sale" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tonysestate.com/" />
        <meta property="og:title" content="Tonys Estate | Find Your Perfect Home" />
        <meta property="og:description" content="Find your perfect property with Tonys Estate. Browse thousands of properties across Nigeria." />
        <meta property="og:image" content="https://tonysestate.com/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://tonysestate.com/" />
        <meta property="twitter:title" content="Tonys Estate | Find Your Perfect Home" />
        <meta property="twitter:description" content="Find your perfect property with Tonys Estate. Browse thousands of properties across Nigeria." />
        <meta property="twitter:image" content="https://tonysestate.com/og-image.jpg" />
      </Helmet>

      {/* Main hero section with search */}
      <HeroSearch />

      {/* Move Featured property listings to this position */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container-custom">
          <div className="text-center mb-12 animate-fade-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              Featured <span className="text-accent relative inline-block">
                <span className="relative z-10">Properties</span>
                <span className="absolute bottom-0 left-0 w-full h-3 bg-accent/20 -rotate-1"></span>
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Discover our handpicked selection of premium properties across Nigeria.
            </p>
          </div>
          <FeaturedListings />
        </div>
      </section>

      {/* Featured Locations */}
      <section className="py-20 md:py-24 bg-muted/30">
        <div className="container-custom">
          <div className="text-center mb-12 animate-fade-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              Explore <span className="text-accent relative inline-block">
                <span className="relative z-10">Prime Locations</span>
                <span className="absolute bottom-0 left-0 w-full h-3 bg-accent/20 -rotate-1"></span>
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Discover exceptional properties in Nigeria's most sought-after locations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {locationsLoading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading locations...</p>
              </div>
            ) : locations.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No locations available at the moment.</p>
              </div>
            ) : (
              locations.map((location) => {
                const count = getCountForCity(location.name);
                const imageUrl = location.image_url || `/locations/location-${location.display_order}.jpg`;
                const locationLink = `/properties?location=${encodeURIComponent(location.name)}`;

                return (
                  <div key={location.id} className="group relative overflow-hidden rounded-xl shadow-lg transition-all duration-500 hover:shadow-xl">
                    <div className="absolute inset-0 z-0">
                      <img
                        src={imageUrl}
                        alt={location.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          // Show gradient fallback
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="absolute inset-0 bg-gradient-to-br from-primary to-accent"></div>';
                          }
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/20 z-10"></div>
                    <div className="w-full h-80 relative"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <div className="flex items-center text-white mb-4">
                        <MapPin className="h-5 w-5 mr-2 text-accent" />
                        <h3 className="text-xl font-semibold">{location.name}</h3>
                      </div>
                      {location.description && (
                        <p className="text-white/80 text-sm mb-3 line-clamp-2">{location.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mb-4">
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                          {statsLoading ? '...' : `${count} Properties`}
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                          {location.state}
                        </span>
                      </div>
                      <Button asChild variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 w-full">
                        <Link to={locationLink} className="flex items-center justify-center">
                          Explore {location.name}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Remove the duplicate Featured property listings section that was here */}

      {/* Property types */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container-custom">
          <div className="text-center mb-12 animate-fade-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              Browse by <span className="text-accent relative inline-block">
                <span className="relative z-10">Property Type</span>
                <span className="absolute bottom-0 left-0 w-full h-3 bg-accent/20 -rotate-1"></span>
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Find the perfect property that fits your specific needs and preferences.
            </p>
          </div>
          <PropertyTypes />
        </div>
      </section>

      {/* Testimonials - Modern Clean Design */}
      <section className="py-20 md:py-28 bg-muted/20">
        <div className="container-custom">
          <div className="text-center mb-16 animate-fade-up">
            <div className="inline-block mb-4">
              <span className="text-sm font-semibold text-accent uppercase tracking-wider">Testimonials</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
              What Our <span className="text-accent">Clients</span> Say
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Real experiences from clients who found their perfect home with Tonys Estate
            </p>
          </div>
          <TestimonialsNew />
        </div>
      </section>

      {/* Call to Action - Modern Clean Design */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl"></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary-foreground mb-6">
                Ready to Find Your Perfect <span className="text-accent">Student Home</span>?
              </h2>
              <p className="text-primary-foreground/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Join thousands of students who have found their ideal accommodation. Start your search today and discover housing that feels like home.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all">
                <Link to="/properties">
                  Browse Properties
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-primary-foreground border-2 border-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all">
                <Link to="/list-property">List Your Property</Link>
              </Button>
            </div>

            {/* Stats or Trust Indicators */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-12 border-t border-primary-foreground/20">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-accent mb-2">5000+</div>
                <div className="text-primary-foreground/80 text-sm md:text-base">Happy Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-accent mb-2">1200+</div>
                <div className="text-primary-foreground/80 text-sm md:text-base">Properties Listed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-accent mb-2">50+</div>
                <div className="text-primary-foreground/80 text-sm md:text-base">Universities</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-b from-realty-50 to-white dark:from-realty-900/30 dark:to-realty-900/10">
        <div className="container-custom">
          <Newsletter />
        </div>
      </section>

      {/* Scroll to top button */}
      <ScrollToTop />
    </>
  );
};

export default Index;