import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchTestimonials, Testimonial } from "@/utils/supabaseData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TestimonialsNew = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const getTestimonials = async () => {
            setIsLoading(true);
            try {
                const data = await fetchTestimonials();
                setTestimonials(data);
            } catch (error) {
                console.error("Error fetching testimonials:", error);
                setTestimonials([]);
            } finally {
                setIsLoading(false);
            }
        };

        getTestimonials();
    }, []);

    const handlePrev = () => {
        setCurrentIndex(prev => (prev === 0 ? testimonials.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? "text-accent fill-accent" : "text-muted-foreground/30"
                    }`}
            />
        ));
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6 animate-pulse">
                        <div className="h-20 bg-muted rounded mb-4"></div>
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                    </Card>
                ))}
            </div>
        );
    }

    if (testimonials.length === 0) {
        return (
            <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg">No testimonials available yet</p>
            </Card>
        );
    }

    return (
        <div className="relative">
            {/* Desktop: Show 3 cards */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
                {testimonials.slice(0, 3).map((testimonial) => (
                    <Card key={testimonial.id} className="p-6 hover:shadow-xl transition-all duration-300 group">
                        <Quote className="h-10 w-10 text-accent/20 mb-4" />

                        <p className="text-foreground mb-6 leading-relaxed line-clamp-4">
                            "{testimonial.testimonial}"
                        </p>

                        <div className="flex mb-4">{renderStars(testimonial.rating)}</div>

                        <div className="flex items-center gap-3 pt-4 border-t">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={testimonial.image} alt={testimonial.name} />
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    {testimonial.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-foreground">{testimonial.name}</p>
                                <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Mobile: Carousel */}
            <div className="md:hidden relative">
                <Card className="p-6">
                    <Quote className="h-10 w-10 text-accent/20 mb-4" />

                    <p className="text-foreground mb-6 leading-relaxed">
                        "{testimonials[currentIndex].testimonial}"
                    </p>

                    <div className="flex mb-4">{renderStars(testimonials[currentIndex].rating)}</div>

                    <div className="flex items-center gap-3 pt-4 border-t">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={testimonials[currentIndex].image} alt={testimonials[currentIndex].name} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {testimonials[currentIndex].name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-foreground">{testimonials[currentIndex].name}</p>
                            <p className="text-sm text-muted-foreground">{testimonials[currentIndex].location}</p>
                        </div>
                    </div>
                </Card>

                {/* Navigation */}
                <div className="flex justify-center items-center gap-4 mt-6">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePrev}
                        className="rounded-full"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex gap-2">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`h-2 rounded-full transition-all ${i === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted"
                                    }`}
                            />
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNext}
                        className="rounded-full"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TestimonialsNew;
