import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import PropertyListingForm from "@/components/properties/PropertyListingForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User, Building, CheckCircle, TrendingUp, Shield, Zap, Award } from "lucide-react";

const ListPropertyProtected = () => {
    const { user } = useAuth();

    return (
        <>
            <Helmet>
                <title>List Your Property | Campus Comfort</title>
                <meta name="description" content="List your student housing with Campus Comfort and reach thousands of students looking for accommodation." />
            </Helmet>

            {/* Header Section */}
            <section className="py-16 md:py-20 bg-primary text-primary-foreground">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-3xl md:text-5xl font-heading font-bold mb-6">
                            List Your Property <span className="text-accent">Directly</span>
                        </h1>
                        <p className="text-xl text-primary-foreground/90 mb-8">
                            Welcome back, {user?.email?.split('@')[0] || 'Property Owner'}! Take control of your property listing.
                        </p>
                    </div>
                </div>
            </section>

            {/* Dashboard Navigation */}
            <section className="py-6 bg-muted/30 border-b border-border">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-foreground">Property Owner Dashboard</h2>
                                <p className="text-sm text-muted-foreground">Signed in as: {user?.email}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" asChild size="sm">
                                <Link to="/dashboard/user">
                                    <User className="h-4 w-4 mr-2" />
                                    My Dashboard
                                </Link>
                            </Button>
                            <Button variant="ghost" asChild size="sm">
                                <Link to="/properties">
                                    <Building className="h-4 w-4 mr-2" />
                                    Browse Properties
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container-custom py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Area */}
                    <div className="lg:col-span-2">
                        <div className="mb-8">
                            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                                Create Your Property Listing
                            </h2>
                            <p className="text-muted-foreground">
                                Fill out the form below to list your property directly on our platform
                            </p>
                        </div>

                        {/* Property Listing Form */}
                        <PropertyListingForm />
                    </div>

                    {/* Sidebar with Benefits and Tips */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center">
                                    <Award className="h-5 w-5 text-accent mr-2" />
                                    Your Listing Benefits
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-accent mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-medium text-foreground">Zero Agent Fees</h3>
                                        <p className="text-sm text-muted-foreground">Keep 100% of your commission</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-accent mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-medium text-foreground">40% Faster Sales</h3>
                                        <p className="text-sm text-muted-foreground">Direct connection with buyers</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-accent mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-medium text-foreground">Full Control</h3>
                                        <p className="text-sm text-muted-foreground">Manage pricing and negotiations</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tips for Success */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Tips for a Great Listing
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-medium text-foreground mb-2">High-Quality Photos</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Use natural light and show all rooms from multiple angles
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground mb-2">Detailed Description</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Highlight unique features and nearby amenities
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground mb-2">Competitive Pricing</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Research similar properties in your area
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Platform Features */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Platform Features
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center">
                                    <TrendingUp className="h-5 w-5 text-accent mr-3" />
                                    <span className="text-foreground">Advanced Analytics</span>
                                </div>
                                <div className="flex items-center">
                                    <Shield className="h-5 w-5 text-accent mr-3" />
                                    <span className="text-foreground">Secure Messaging</span>
                                </div>
                                <div className="flex items-center">
                                    <Zap className="h-5 w-5 text-accent mr-3" />
                                    <span className="text-foreground">Instant Visibility</span>
                                </div>
                                <div className="flex items-center">
                                    <User className="h-5 w-5 text-accent mr-3" />
                                    <span className="text-foreground">Direct Communication</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Success Section */}
            <section className="py-16 bg-muted/20">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                            Why <span className="text-accent">Thousands</span> Choose Direct Listing
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Experience the future of real estate transactions with our innovative platform
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="text-center p-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                                <TrendingUp className="h-8 w-8 text-accent" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">40% Faster Sales</h3>
                            <p className="text-muted-foreground text-sm">
                                Properties sell significantly faster when owners connect directly with buyers
                            </p>
                        </Card>

                        <Card className="text-center p-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                                <Shield className="h-8 w-8 text-accent" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Zero Agent Fees</h3>
                            <p className="text-muted-foreground text-sm">
                                Keep 100% of your commission by eliminating middleman costs
                            </p>
                        </Card>

                        <Card className="text-center p-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                                <Zap className="h-8 w-8 text-accent" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Instant Visibility</h3>
                            <p className="text-muted-foreground text-sm">
                                Your listing goes live immediately with premium placement
                            </p>
                        </Card>

                        <Card className="text-center p-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                                <User className="h-8 w-8 text-accent" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Full Control</h3>
                            <p className="text-muted-foreground text-sm">
                                You control pricing, negotiations, and all communication
                            </p>
                        </Card>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ListPropertyProtected;
