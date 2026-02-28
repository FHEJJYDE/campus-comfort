import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Search, Crown, Users, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billing_cycle: string;
  features?: string[];
  max_properties?: number;
  max_featured_properties?: number;
  max_images_per_property?: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  subscription_plans: SubscriptionPlan;
  profiles: {
    full_name: string;
    email: string;
  };
}

const SubscriptionManagement = () => {
  const [plans, setPlans] = useState<