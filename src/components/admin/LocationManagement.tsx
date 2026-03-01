import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    MapPin,
    Plus,
    Edit,
    Trash2,
    Star,
    Upload,
    Image as ImageIcon,
    Eye,
    EyeOff,
} from "lucide-react";

interface Location {
    id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    country: string;
    description: string | null;
    image_url: string | null;
    is_prime: boolean;
    display_order: number;
    property_count: number;
    average_price: number | null;
    latitude: number | null;
    longitude: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface LocationFormData {
    name: string;
    city: string;
    state: string;
    country: string;
    description: string;
    is_prime: boolean;
    display_order: number;
    latitude: string;
    longitude: string;
    is_active: boolean;
}

export function LocationManagement() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState<LocationFormData>({
        name: "",
        city: "",
        state: "",
        country: "Nigeria",
        description: "",
        is_prime: false,
        display_order: 0,
        latitude: "",
        longitude: "",
        is_active: true,
    });

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("locations")
                .select("*")
                .order("display_order", { ascending: true });

            if (error) throw error;
            setLocations(data || []);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            setUploading(true);
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("location-images")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("location-images")
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error: any) {
            toast({
                title: "Upload Error",
                description: error.message,
                variant: "destructive",
            });
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let imageUrl = editingLocation?.image_url || null;

            // Upload new image if selected
            if (imageFile) {
                const uploadedUrl = await uploadImage(imageFile);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                }
            }

            const locationData = {
                name: formData.name,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                description: formData.description || null,
                is_prime: formData.is_prime,
                display_order: formData.display_order,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                is_active: formData.is_active,
                image_url: imageUrl,
            };

            if (editingLocation) {
                // Update existing location
                const { error } = await supabase
                    .from("locations")
                    .update(locationData)
                    .eq("id", editingLocation.id);

                if (error) throw error;

                toast({
                    title: "Success",
                    description: "Location updated successfully",
                });
            } else {
                // Create new location
                const { error } = await supabase
                    .from("locations")
                    .insert([locationData]);

                if (error) throw error;

                toast({
                    title: "Success",
                    description: "Location created successfully",
                });
            }

            setDialogOpen(false);
            resetForm();
            fetchLocations();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleEdit = (location: Location) => {
        setEditingLocation(location);
        setFormData({
            name: location.name,
            city: location.city,
            state: location.state,
            country: location.country,
            description: location.description || "",
            is_prime: location.is_prime,
            display_order: location.display_order,
            latitude: location.latitude?.toString() || "",
            longitude: location.longitude?.toString() || "",
            is_active: location.is_active,
        });
        setImagePreview(location.image_url);
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this location?")) return;

        try {
            const { error } = await supabase
                .from("locations")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast({
                title: "Success",
                description: "Location deleted successfully",
            });
            fetchLocations();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const togglePrime = async (location: Location) => {
        try {
            const { error } = await supabase
                .from("locations")
                .update({ is_prime: !location.is_prime })
                .eq("id", location.id);

            if (error) throw error;

            toast({
                title: "Success",
                description: `Location ${!location.is_prime ? "marked as" : "removed from"} prime`,
            });
            fetchLocations();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const toggleActive = async (location: Location) => {
        try {
            const { error } = await supabase
                .from("locations")
                .update({ is_active: !location.is_active })
                .eq("id", location.id);

            if (error) throw error;

            toast({
                title: "Success",
                description: `Location ${!location.is_active ? "activated" : "deactivated"}`,
            });
            fetchLocations();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            city: "",
            state: "",
            country: "Nigeria",
            description: "",
            is_prime: false,
            display_order: 0,
            latitude: "",
            longitude: "",
            is_active: true,
        });
        setEditingLocation(null);
        setImageFile(null);
        setImagePreview(null);
    };

    const formatPrice = (price: number | null) => {
        if (!price) return "N/A";
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                <MapPin className="h-6 w-6 text-accent" />
                                Location Management
                            </CardTitle>
                            <CardDescription>
                                Manage locations and prime locations with images
                            </CardDescription>
                        </div>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={resetForm} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Location
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingLocation ? "Edit Location" : "Add New Location"}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {editingLocation
                                            ? "Update location details and settings"
                                            : "Create a new location with details and image"}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Location Name *</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, name: e.target.value })
                                                }
                                                placeholder="e.g., Lekki"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City *</Label>
                                            <Input
                                                id="city"
                                                value={formData.city}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, city: e.target.value })
                                                }
                                                placeholder="e.g., Lagos"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="state">State *</Label>
                                            <Input
                                                id="state"
                                                value={formData.state}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, state: e.target.value })
                                                }
                                                placeholder="e.g., Lagos"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="country">Country</Label>
                                            <Input
                                                id="country"
                                                value={formData.country}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, country: e.target.value })
                                                }
                                                placeholder="Nigeria"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData({ ...formData, description: e.target.value })
                                            }
                                            placeholder="Brief description of the location"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="latitude">Latitude</Label>
                                            <Input
                                                id="latitude"
                                                type="number"
                                                step="any"
                                                value={formData.latitude}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, latitude: e.target.value })
                                                }
                                                placeholder="6.5244"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="longitude">Longitude</Label>
                                            <Input
                                                id="longitude"
                                                type="number"
                                                step="any"
                                                value={formData.longitude}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, longitude: e.target.value })
                                                }
                                                placeholder="3.3792"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="display_order">Display Order</Label>
                                        <Input
                                            id="display_order"
                                            type="number"
                                            value={formData.display_order}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    display_order: parseInt(e.target.value) || 0,
                                                })
                                            }
                                            placeholder="0"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Lower numbers appear first
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="image">Location Image</Label>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                id="image"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="flex-1"
                                            />
                                            <Upload className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        {imagePreview && (
                                            <div className="mt-2">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                        <div className="space-y-1">
                                            <Label htmlFor="is_prime" className="flex items-center gap-2">
                                                <Star className="h-4 w-4 text-accent" />
                                                Prime Location
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Featured on homepage
                                            </p>
                                        </div>
                                        <Switch
                                            id="is_prime"
                                            checked={formData.is_prime}
                                            onCheckedChange={(checked) =>
                                                setFormData({ ...formData, is_prime: checked })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                        <div className="space-y-1">
                                            <Label htmlFor="is_active" className="flex items-center gap-2">
                                                <Eye className="h-4 w-4 text-accent" />
                                                Active
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Visible to users
                                            </p>
                                        </div>
                                        <Switch
                                            id="is_active"
                                            checked={formData.is_active}
                                            onCheckedChange={(checked) =>
                                                setFormData({ ...formData, is_active: checked })
                                            }
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setDialogOpen(false);
                                                resetForm();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={uploading}>
                                            {uploading
                                                ? "Uploading..."
                                                : editingLocation
                                                    ? "Update Location"
                                                    : "Create Location"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Loading locations...</p>
                        </div>
                    ) : locations.length === 0 ? (
                        <div className="text-center py-8">
                            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No locations found</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Click "Add Location" to create your first location
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>City/State</TableHead>
                                        <TableHead>Properties</TableHead>
                                        <TableHead>Avg Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Order</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {locations.map((location) => (
                                        <TableRow key={location.id}>
                                            <TableCell>
                                                {location.image_url ? (
                                                    <img
                                                        src={location.image_url}
                                                        alt={location.name}
                                                        className="w-16 h-16 object-cover rounded-md"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                                                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{location.name}</span>
                                                    {location.is_prime && (
                                                        <Star className="h-4 w-4 text-accent fill-accent" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {location.city}, {location.state}
                                            </TableCell>
                                            <TableCell>{location.property_count}</TableCell>
                                            <TableCell>{formatPrice(location.average_price)}</TableCell>
                                            <TableCell>
                                                <Badge variant={location.is_active ? "default" : "secondary"}>
                                                    {location.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{location.display_order}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => togglePrime(location)}
                                                        title={location.is_prime ? "Remove from prime" : "Mark as prime"}
                                                    >
                                                        <Star
                                                            className={`h-4 w-4 ${location.is_prime ? "fill-accent text-accent" : ""
                                                                }`}
                                                        />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => toggleActive(location)}
                                                        title={location.is_active ? "Deactivate" : "Activate"}
                                                    >
                                                        {location.is_active ? (
                                                            <Eye className="h-4 w-4" />
                                                        ) : (
                                                            <EyeOff className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(location)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(location.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
