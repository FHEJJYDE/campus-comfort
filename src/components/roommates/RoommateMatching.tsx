import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Users, Plus, Search, MapPin, GraduationCap, DollarSign, Calendar, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RoommateRequest {
    id: string;
    user_id: string;
    university: string;
    graduation_year?: number;
    major?: string;
    gender?: string;
    smoking_preference?: string;
    pet_preference?: string;
    cleanliness_level?: number;
    noise_level?: number;
    budget_min?: number;
    budget_max?: number;
    move_in_date?: string;
    semester?: string;
    bio?: string;
    interests?: string[];
    status: string;
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url?: string;
    };
}

const RoommateMatching = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<RoommateRequest[]>([]);
    const [myRequest, setMyRequest] = useState<RoommateRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        university: '',
        graduation_year: '',
        major: '',
        gender: '',
        smoking_preference: 'no_preference',
        pet_preference: 'no_preference',
        cleanliness_level: [3],
        noise_level: [3],
        budget_min: '',
        budget_max: '',
        move_in_date: '',
        semester: '',
        bio: '',
        interests: ''
    });

    useEffect(() => {
        if (user) {
            fetchRoommateRequests();
            fetchMyRequest();
        }
    }, [user]);

    const fetchRoommateRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('roommate_requests')
                .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
                .eq('status', 'active')
                .neq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching roommate requests:', error);
            toast.error('Failed to load roommate requests');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyRequest = async () => {
        try {
            const { data, error } = await supabase
                .from('roommate_requests')
                .select('*')
                .eq('user_id', user?.id)
                .eq('status', 'active')
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            setMyRequest(data);
        } catch (error) {
            console.error('Error fetching my request:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const requestData = {
                user_id: user?.id,
                university: formData.university,
                graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
                major: formData.major || null,
                gender: formData.gender || null,
                smoking_preference: formData.smoking_preference,
                pet_preference: formData.pet_preference,
                cleanliness_level: formData.cleanliness_level[0],
                noise_level: formData.noise_level[0],
                budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
                budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
                move_in_date: formData.move_in_date || null,
                semester: formData.semester || null,
                bio: formData.bio || null,
                interests: formData.interests ? formData.interests.split(',').map(i => i.trim()) : null,
                status: 'active'
            };

            if (myRequest) {
                const { error } = await supabase
                    .from('roommate_requests')
                    .update(requestData)
                    .eq('id', myRequest.id);

                if (error) throw error;
                toast.success('Roommate request updated successfully');
            } else {
                const { error } = await supabase
                    .from('roommate_requests')
                    .insert([requestData]);

                if (error) throw error;
                toast.success('Roommate request created successfully');
            }

            setIsCreateDialogOpen(false);
            fetchMyRequest();
            fetchRoommateRequests();
        } catch (error) {
            console.error('Error saving roommate request:', error);
            toast.error('Failed to save roommate request');
        }
    };

    const handleEdit = () => {
        if (myRequest) {
            setFormData({
                university: myRequest.university,
                graduation_year: myRequest.graduation_year?.toString() || '',
                major: myRequest.major || '',
                gender: myRequest.gender || '',
                smoking_preference: myRequest.smoking_preference || 'no_preference',
                pet_preference: myRequest.pet_preference || 'no_preference',
                cleanliness_level: [myRequest.cleanliness_level || 3],
                noise_level: [myRequest.noise_level || 3],
                budget_min: myRequest.budget_min?.toString() || '',
                budget_max: myRequest.budget_max?.toString() || '',
                move_in_date: myRequest.move_in_date || '',
                semester: myRequest.semester || '',
                bio: myRequest.bio || '',
                interests: myRequest.interests?.join(', ') || ''
            });
            setIsCreateDialogOpen(true);
        }
    };

    const deactivateRequest = async () => {
        if (!myRequest) return;

        try {
            const { error } = await supabase
                .from('roommate_requests')
                .update({ status: 'inactive' })
                .eq('id', myRequest.id);

            if (error) throw error;

            toast.success('Roommate request deactivated');
            setMyRequest(null);
        } catch (error) {
            console.error('Error deactivating request:', error);
            toast.error('Failed to deactivate request');
        }
    };

    const filteredRequests = requests.filter(request =>
        request.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.major?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCompatibilityScore = (request: RoommateRequest) => {
        if (!myRequest) return 0;

        let score = 0;
        let factors = 0;

        // University match
        if (request.university === myRequest.university) {
            score += 30;
        }
        factors += 30;

        // Budget compatibility
        if (request.budget_min && request.budget_max && myRequest.budget_min && myRequest.budget_max) {
            const overlap = Math.min(request.budget_max, myRequest.budget_max) - Math.max(request.budget_min, myRequest.budget_min);
            if (overlap > 0) {
                score += 25;
            }
        }
        factors += 25;

        // Cleanliness compatibility
        if (request.cleanliness_level && myRequest.cleanliness_level) {
            const diff = Math.abs(request.cleanliness_level - myRequest.cleanliness_level);
            score += Math.max(0, 20 - (diff * 5));
        }
        factors += 20;

        // Noise level compatibility
        if (request.noise_level && myRequest.noise_level) {
            const diff = Math.abs(request.noise_level - myRequest.noise_level);
            score += Math.max(0, 15 - (diff * 3));
        }
        factors += 15;

        // Smoking preference
        if (request.smoking_preference === myRequest.smoking_preference ||
            request.smoking_preference === 'no_preference' ||
            myRequest.smoking_preference === 'no_preference') {
            score += 10;
        }
        factors += 10;

        return Math.round((score / factors) * 100);
    };

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
            {/* My Request Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-realty-gold" />
                                My Roommate Request
                            </CardTitle>
                            <CardDescription>
                                {myRequest ? 'Your active roommate request' : 'Create a roommate request to find compatible roommates'}
                            </CardDescription>
                        </div>
                        {myRequest ? (
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleEdit}>
                                    Edit Request
                                </Button>
                                <Button variant="destructive" onClick={deactivateRequest}>
                                    Deactivate
                                </Button>
                            </div>
                        ) : (
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Request
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>
                                            {myRequest ? 'Edit Roommate Request' : 'Create Roommate Request'}
                                        </DialogTitle>
                                        <DialogDescription>
                                            Fill out your preferences to find compatible roommates
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="university">University *</Label>
                                                <Input
                                                    id="university"
                                                    value={formData.university}
                                                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                                    placeholder="University of California, Berkeley"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="graduation_year">Graduation Year</Label>
                                                <Input
                                                    id="graduation_year"
                                                    type="number"
                                                    value={formData.graduation_year}
                                                    onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                                                    placeholder="2025"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="major">Major</Label>
                                                <Input
                                                    id="major"
                                                    value={formData.major}
                                                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                                                    placeholder="Computer Science"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="gender">Gender</Label>
                                                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                        <SelectItem value="non_binary">Non-binary</SelectItem>
                                                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="smoking_preference">Smoking Preference</Label>
                                                <Select value={formData.smoking_preference} onValueChange={(value) => setFormData({ ...formData, smoking_preference: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="smoker">Smoker</SelectItem>
                                                        <SelectItem value="non_smoker">Non-smoker</SelectItem>
                                                        <SelectItem value="no_preference">No preference</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="pet_preference">Pet Preference</Label>
                                                <Select value={formData.pet_preference} onValueChange={(value) => setFormData({ ...formData, pet_preference: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="has_pets">Has pets</SelectItem>
                                                        <SelectItem value="no_pets">No pets</SelectItem>
                                                        <SelectItem value="no_preference">No preference</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Cleanliness Level: {formData.cleanliness_level[0]}/5</Label>
                                                <Slider
                                                    value={formData.cleanliness_level}
                                                    onValueChange={(value) => setFormData({ ...formData, cleanliness_level: value })}
                                                    max={5}
                                                    min={1}
                                                    step={1}
                                                    className="mt-2"
                                                />
                                                <div className="text-xs text-gray-500 mt-1">1 = Very messy, 5 = Very clean</div>
                                            </div>
                                            <div>
                                                <Label>Noise Level: {formData.noise_level[0]}/5</Label>
                                                <Slider
                                                    value={formData.noise_level}
                                                    onValueChange={(value) => setFormData({ ...formData, noise_level: value })}
                                                    max={5}
                                                    min={1}
                                                    step={1}
                                                    className="mt-2"
                                                />
                                                <div className="text-xs text-gray-500 mt-1">1 = Very quiet, 5 = Very loud</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="budget_min">Min Budget ($)</Label>
                                                <Input
                                                    id="budget_min"
                                                    type="number"
                                                    value={formData.budget_min}
                                                    onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                                                    placeholder="500"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="budget_max">Max Budget ($)</Label>
                                                <Input
                                                    id="budget_max"
                                                    type="number"
                                                    value={formData.budget_max}
                                                    onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                                                    placeholder="1200"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="move_in_date">Move-in Date</Label>
                                                <Input
                                                    id="move_in_date"
                                                    type="date"
                                                    value={formData.move_in_date}
                                                    onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="semester">Semester</Label>
                                                <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select semester" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Fall">Fall</SelectItem>
                                                        <SelectItem value="Spring">Spring</SelectItem>
                                                        <SelectItem value="Summer">Summer</SelectItem>
                                                        <SelectItem value="Full Year">Full Year</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="interests">Interests (comma-separated)</Label>
                                            <Input
                                                id="interests"
                                                value={formData.interests}
                                                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                                                placeholder="reading, gaming, sports, music"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="bio">Bio</Label>
                                            <Textarea
                                                id="bio"
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                placeholder="Tell potential roommates about yourself..."
                                                rows={3}
                                            />
                                        </div>

                                        <div className="flex justify-end space-x-2">
                                            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit">
                                                {myRequest ? 'Update' : 'Create'} Request
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </CardHeader>
                {myRequest && (
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{myRequest.university}</span>
                            </div>
                            {myRequest.budget_min && myRequest.budget_max && (
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">${myRequest.budget_min} - ${myRequest.budget_max}</span>
                                </div>
                            )}
                            {myRequest.move_in_date && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">{new Date(myRequest.move_in_date).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                        {myRequest.bio && (
                            <p className="text-sm text-gray-600 mt-3">{myRequest.bio}</p>
                        )}
                    </CardContent>
                )}
            </Card>

            {/* Available Roommates */}
            <Card>
                <CardHeader>
                    <CardTitle>Available Roommates</CardTitle>
                    <CardDescription>
                        Find compatible roommates based on your preferences
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search by university, major, or name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredRequests.map((request) => {
                            const compatibility = getCompatibilityScore(request);
                            return (
                                <Card key={request.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-medium">{request.profiles?.full_name || 'Anonymous'}</h3>
                                                <p className="text-sm text-gray-600">{request.major}</p>
                                            </div>
                                            {myRequest && (
                                                <Badge variant={compatibility >= 70 ? "default" : compatibility >= 50 ? "secondary" : "outline"}>
                                                    <Heart className="h-3 w-3 mr-1" />
                                                    {compatibility}%
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-3 w-3 text-gray-400" />
                                                <span>{request.university}</span>
                                            </div>
                                            {request.budget_min && request.budget_max && (
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-3 w-3 text-gray-400" />
                                                    <span>${request.budget_min} - ${request.budget_max}</span>
                                                </div>
                                            )}
                                            {request.move_in_date && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3 w-3 text-gray-400" />
                                                    <span>{new Date(request.move_in_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        {request.bio && (
                                            <p className="text-xs text-gray-600 mt-3 line-clamp-2">{request.bio}</p>
                                        )}

                                        {request.interests && request.interests.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-3">
                                                {request.interests.slice(0, 3).map((interest, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {interest}
                                                    </Badge>
                                                ))}
                                                {request.interests.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{request.interests.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        <Button className="w-full mt-4" size="sm">
                                            Contact
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {filteredRequests.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            {searchTerm ? 'No roommate requests found matching your search.' : 'No roommate requests available.'}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RoommateMatching;