import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, MapPin, Users, ExternalLink, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface University {
    id: string;
    name: string;
    city: string;
    state: string;
    country: string;
    website_url?: string;
    student_population?: number;
    is_active: boolean;
    created_at: string;
}

const UniversityManagement = () => {
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        state: '',
        country: 'USA',
        website_url: '',
        student_population: '',
        is_active: true
    });

    useEffect(() => {
        fetchUniversities();
    }, []);

    const fetchUniversities = async () => {
        try {
            const { data, error } = await supabase
                .from('universities')
                .select('*')
                .order('name');

            if (error) throw error;
            setUniversities(data || []);
        } catch (error) {
            console.error('Error fetching universities:', error);
            toast.error('Failed to load universities');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const universityData = {
                ...formData,
                student_population: formData.student_population ? parseInt(formData.student_population) : null
            };

            if (editingUniversity) {
                const { error } = await supabase
                    .from('universities')
                    .update(universityData)
                    .eq('id', editingUniversity.id);

                if (error) throw error;
                toast.success('University updated successfully');
            } else {
                const { error } = await supabase
                    .from('universities')
                    .insert([universityData]);

                if (error) throw error;
                toast.success('University added successfully');
            }

            setIsAddDialogOpen(false);
            setEditingUniversity(null);
            resetForm();
            fetchUniversities();
        } catch (error) {
            console.error('Error saving university:', error);
            toast.error('Failed to save university');
        }
    };

    const handleEdit = (university: University) => {
        setEditingUniversity(university);
        setFormData({
            name: university.name,
            city: university.city,
            state: university.state,
            country: university.country,
            website_url: university.website_url || '',
            student_population: university.student_population?.toString() || '',
            is_active: university.is_active
        });
        setIsAddDialogOpen(true);
    };

    const toggleStatus = async (university: University) => {
        try {
            const { error } = await supabase
                .from('universities')
                .update({ is_active: !university.is_active })
                .eq('id', university.id);

            if (error) throw error;

            toast.success(`University ${!university.is_active ? 'activated' : 'deactivated'}`);
            fetchUniversities();
        } catch (error) {
            console.error('Error updating university status:', error);
            toast.error('Failed to update university status');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            city: '',
            state: '',
            country: 'USA',
            website_url: '',
            student_population: '',
            is_active: true
        });
    };

    const filteredUniversities = universities.filter(university =>
        university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university.state.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-realty-gold"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-realty-gold" />
                                University Management
                            </CardTitle>
                            <CardDescription>
                                Manage universities and colleges for Campus Comfort platform
                            </CardDescription>
                        </div>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => { resetForm(); setEditingUniversity(null); }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add University
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingUniversity ? 'Edit University' : 'Add New University'}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {editingUniversity ? 'Update university information' : 'Add a new university to the platform'}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">University Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., University of California, Berkeley"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="city">City *</Label>
                                            <Input
                                                id="city"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                placeholder="Berkeley"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="state">State *</Label>
                                            <Input
                                                id="state"
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                placeholder="California"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="website_url">Website URL</Label>
                                        <Input
                                            id="website_url"
                                            type="url"
                                            value={formData.website_url}
                                            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                            placeholder="https://www.berkeley.edu"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="student_population">Student Population</Label>
                                        <Input
                                            id="student_population"
                                            type="number"
                                            value={formData.student_population}
                                            onChange={(e) => setFormData({ ...formData, student_population: e.target.value })}
                                            placeholder="45000"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="is_active"
                                            checked={formData.is_active}
                                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                        />
                                        <Label htmlFor="is_active">Active</Label>
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">
                                            {editingUniversity ? 'Update' : 'Add'} University
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search universities..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>University</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Students</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUniversities.map((university) => (
                                    <TableRow key={university.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{university.name}</div>
                                                {university.website_url && (
                                                    <a
                                                        href={university.website_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-realty-600 hover:text-realty-800 flex items-center gap-1"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                        Website
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                {university.city}, {university.state}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {university.student_population && (
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4 text-gray-400" />
                                                    {university.student_population.toLocaleString()}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={university.is_active ? "default" : "secondary"}>
                                                {university.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(university)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Switch
                                                    checked={university.is_active}
                                                    onCheckedChange={() => toggleStatus(university)}
                                                    size="sm"
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredUniversities.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            {searchTerm ? 'No universities found matching your search.' : 'No universities added yet.'}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default UniversityManagement;