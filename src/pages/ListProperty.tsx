import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, User, ArrowRight, CheckCircle, TrendingUp, Shield, Zap, Home, Users, Lock } from "lucide-react";

const ListProperty = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // If user is already logged in, redirect them to the protected version
    useEffect(() => {
        if (user) {
            navigate("/list-property-protected");
        }
    }, [user, navigate]);

    // If user is logged in, don't show the public page
    if (user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-lg text-realty-600 dark:text-realty-300">
                        Redirecting to your property listing dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>List Your Property | Campus Comfort</title>
                <meta name="description" content="List your student housing with Campus Comfort and reach thousands of students looking for accommodation." />
            </Helmet>

            {/* Hero Section */}
            <section className="relative py-20 md:py-28 bg-gradient-to-r from-realty-900 to-realty-800 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
                <div className="container-custom relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Side - Registration Card */}
                        <div className="order-2 lg:order-1">
                            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-white">Register for Free</CardTitle>
                                    <CardDescription className="text-realty-200">
                                        Get started with listing your property today
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <ul className="space-y-4">
                                        <li className="flex items-start">
                                            <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                            <span className="text-white">Full access to our listing platform with no upfront costs</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                            <span className="text-white">Connect directly with verified buyers and renters</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                            <span className="text-white">Zero agent fees - keep 100% of your commission</span>
                                        </li>
                                    </ul>
                                    <div className="flex flex-col gap-3">
                                        <Button size="lg" className="bg-realty-gold hover:bg-realty-gold/90 text-realty-900 font-medium px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all" asChild>
                                            <Link to="/user-signup">Get Started Now</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Side - Hero Content */}
                        <div className="order-1 lg:order-2 text-center lg:text-left">
                            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                                List Your Property <span className="text-realty-gold">Directly</span>
                            </h1>
                            <p className="text-xl text-realty-200 mb-8 max-w-2xl">
                                Skip the middleman. Connect directly with verified buyers and renters across Nigeria's major cities.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* List Worry Free Section */}
            <section className="py-20 bg-gradient-to-r from-realty-50 to-white dark:from-realty-900/40 dark:to-realty-900/20">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-realty-900 dark:text-white mb-4">
                            List <span className="text-realty-gold">Worry Free</span>. We've got you covered
                        </h2>
                        <p className="text-realty-600 dark:text-realty-300 max-w-2xl mx-auto text-lg">
                            Experience peace of mind with our comprehensive property listing platform
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Your rental your rules */}
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-realty-gold/10 flex items-center justify-center">
                                <Home className="h-10 w-10 text-realty-gold" />
                            </div>
                            <h3 className="text-2xl font-heading font-bold text-realty-900 dark:text-white mb-4">
                                Your Rental, Your Rules
                            </h3>
                            <ul className="space-y-3 text-left max-w-xs mx-auto">
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                    <span className="text-realty-700 dark:text-realty-300">Set your own pricing and terms</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                    <span className="text-realty-700 dark:text-realty-300">Screen tenants with our verification system</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                    <span className="text-realty-700 dark:text-realty-300">Manage all communications in one place</span>
                                </li>
                            </ul>
                        </div>

                        {/* Get to know your guests */}
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-realty-gold/10 flex items-center justify-center">
                                <Users className="h-10 w-10 text-realty-gold" />
                            </div>
                            <h3 className="text-2xl font-heading font-bold text-realty-900 dark:text-white mb-4">
                                Get to Know Your Guests
                            </h3>
                            <ul className="space-y-3 text-left max-w-xs mx-auto">
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                    <span className="text-realty-700 dark:text-realty-300">Access verified tenant profiles and backgrounds</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                    <span className="text-realty-700 dark:text-realty-300">Review rental history and references</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                    <span className="text-realty-700 dark:text-realty-300">Connect directly through our secure messaging</span>
                                </li>
                            </ul>
                        </div>

                        {/* Stay Protected */}
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-realty-gold/10 flex items-center justify-center">
                                <Lock className="h-10 w-10 text-realty-gold" />
                            </div>
                            <h3 className="text-2xl font-heading font-bold text-realty-900 dark:text-white mb-4">
                                Stay Protected
                            </h3>
                            <ul className="space-y-3 text-left max-w-xs mx-auto">
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                    <span className="text-realty-700 dark:text-realty-300">Legal document templates for all agreements</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                    <span className="text-realty-700 dark:text-realty-300">Secure payment processing with escrow options</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                    <span className="text-realty-700 dark:text-realty-300">24/7 support for any issues that arise</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <Button size="lg" className="bg-realty-900 hover:bg-realty-800 text-white font-medium text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl" asChild>
                            <Link to="/user-signup">List with us Today</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Success Stories */}
            <section className="py-20 bg-realty-900 text-white">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                            Success Stories from <span className="text-realty-gold">Direct Listings</span>
                        </h2>
                        <p className="text-realty-200 max-w-2xl mx-auto text-lg">
                            See how property owners achieved their real estate goals with our platform
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <Card className="bg-realty-800 border-realty-700">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 rounded-full bg-realty-gold/20 flex items-center justify-center mr-4">
                                        <span className="font-bold text-realty-gold">AO</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Adeola Okafor</h3>
                                        <p className="text-realty-400 text-sm">Lagos Property Owner</p>
                                    </div>
                                </div>
                                <p className="text-realty-200 mb-4">
                                    "I listed my 3-bedroom apartment in Lekki and had 3 serious buyers within a week. Sold for 15% above asking price in just 10 days!"
                                </p>
                                <div className="flex items-center text-realty-gold">
                                    {[...Array(5)].map((_, i) => (
                                        <CheckCircle key={i} className="h-5 w-5 fill-current" />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-realty-800 border-realty-700">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 rounded-full bg-realty-gold/20 flex items-center justify-center mr-4">
                                        <span className="font-bold text-realty-gold">TE</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Tunde Eze</h3>
                                        <p className="text-realty-400 text-sm">Enugu Property Investor</p>
                                    </div>
                                </div>
                                <p className="text-realty-200 mb-4">
                                    "As a repeat user, I've rented 4 properties through Campus Comfort. The platform saved me so much time finding the perfect student housing!"
                                </p>
                                <div className="flex items-center text-realty-gold">
                                    {[...Array(5)].map((_, i) => (
                                        <CheckCircle key={i} className="h-5 w-5 fill-current" />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-realty-800 border-realty-700">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 rounded-full bg-realty-gold/20 flex items-center justify-center mr-4">
                                        <span className="font-bold text-realty-gold">FC</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Fiona Chukwu</h3>
                                        <p className="text-realty-400 text-sm">Calabar Property Owner</p>
                                    </div>
                                </div>
                                <p className="text-realty-200 mb-4">
                                    "The virtual tour feature helped me rent my property to tenants in Abuja without them ever visiting in person. Truly innovative!"
                                </p>
                                <div className="flex items-center text-realty-gold">
                                    {[...Array(5)].map((_, i) => (
                                        <CheckCircle key={i} className="h-5 w-5 fill-current" />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* New CTA Section as per your design */}
            <section className="py-20 bg-gradient-to-r from-realty-900 to-realty-800 text-white">
                <div className="container-custom">
                    <div className="max-w-6xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-12">
                            List <span className="text-realty-gold">Worry Free</span>. We've got you covered
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <h3 className="text-xl font-heading font-bold mb-4 text-realty-gold">Your Rental, Your Rules</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                        <span className="text-left">Set your own pricing and terms</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                        <span className="text-left">Screen tenants with our verification system</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                        <span className="text-left">Manage all communications in one place</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-heading font-bold mb-4 text-realty-gold">Get to Know Your Guests</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                        <span className="text-left">Access verified tenant profiles and backgrounds</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                        <span className="text-left">Review rental history and references</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                        <span className="text-left">Connect directly through our secure messaging</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-heading font-bold mb-4 text-realty-gold">Stay Protected</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                        <span className="text-left">Legal document templates for all agreements</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                        <span className="text-left">Secure payment processing with escrow options</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-realty-gold mt-0.5 mr-3 flex-shrink-0" />
                                        <span className="text-left">24/7 support for any issues that arise</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-12">
                            <Button size="lg" className="bg-realty-gold hover:bg-realty-gold/90 text-realty-900 font-medium text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl" asChild>
                                <Link to="/user-signup">List with us Today</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ListProperty;