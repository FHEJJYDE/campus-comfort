import { supabase } from "@/integrations/supabase/client";

export interface AgentBankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  registrationFee: number;
  instructions: string;
}

export interface AgentApplication {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone: string;
  campus_location: string;
  state?: string;
  institution?: string;
  code_of_conduct_agreed: boolean;
  payment_amount: number;
  payment_reference: string;
  payment_sender_name?: string;
  payment_proof_url?: string;
  payment_status: 'submitted' | 'verified' | 'rejected';
  status: 'pending_approval' | 'approved' | 'rejected';
  rejection_reason?: string;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface DailyReportClientRecord {
  name: string;
  phone: string;
  amount: number;
  location: string;
}

export interface AgentDailyReport {
  id: string;
  agent_id: string;
  agent_name: string;
  phone: string;
  campus_area: string;
  report_date: string;
  people_approached: number;
  successful_clients_count: number;
  total_money_collected: number;
  client_records: DailyReportClientRecord[];
  notes?: string;
  created_at: string;
}

const DEFAULT_BANK_DETAILS: AgentBankDetails = {
  bankName: "Moniepoint MFB",
  accountNumber: "8032145678",
  accountName: "Campus Comfort Real Estate Ltd",
  registrationFee: 2000,
  instructions: "Transfer the ₦2,000 registration fee to the official account above. Ensure your transfer narration or reference matches your full name."
};

const LOCAL_STORAGE_KEY_BANK = "campus_comfort_agent_bank_details";
const LOCAL_STORAGE_KEY_APPLICATIONS = "campus_comfort_agent_applications";
const LOCAL_STORAGE_KEY_DAILY_REPORTS = "campus_comfort_agent_daily_reports";

export const agentsApi = {
  /**
   * Get official bank details for agent registration
   */
  async getBankDetails(): Promise<AgentBankDetails> {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'agent_registration_bank_details')
        .maybeSingle();

      if (!error && data?.setting_value) {
        try {
          const parsed = JSON.parse(data.setting_value);
          return {
            ...DEFAULT_BANK_DETAILS,
            ...parsed
          };
        } catch {
          // fallback if not valid JSON
        }
      }

      // Check local storage backup
      const local = localStorage.getItem(LOCAL_STORAGE_KEY_BANK);
      if (local) {
        try {
          return { ...DEFAULT_BANK_DETAILS, ...JSON.parse(local) };
        } catch {
          // fallback
        }
      }

      return DEFAULT_BANK_DETAILS;
    } catch (err) {
      console.warn("Could not fetch bank details from DB, using defaults:", err);
      return DEFAULT_BANK_DETAILS;
    }
  },

  /**
   * Admin updates bank details for agent registration
   */
  async updateBankDetails(details: AgentBankDetails): Promise<void> {
    const jsonString = JSON.stringify(details);

    // Persist locally for immediate availability
    localStorage.setItem(LOCAL_STORAGE_KEY_BANK, jsonString);

    try {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('setting_key', 'agent_registration_bank_details')
        .maybeSingle();

      if (existing) {
        await supabase
          .from('admin_settings')
          .update({
            setting_value: jsonString,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', 'agent_registration_bank_details');
      } else {
        await supabase
          .from('admin_settings')
          .insert({
            setting_key: 'agent_registration_bank_details',
            setting_value: jsonString,
            description: 'Official bank details presented to prospective agents for registration fee payment'
          });
      }
    } catch (err) {
      console.error("Failed to update bank details in Supabase:", err);
    }
  },

  /**
   * Submit a new agent application
   */
  async submitApplication(application: Omit<AgentApplication, 'id' | 'created_at' | 'status' | 'payment_status'>): Promise<AgentApplication> {
    const newApp: AgentApplication = {
      ...application,
      id: crypto.randomUUID ? crypto.randomUUID() : `app_${Date.now()}`,
      status: 'pending_approval',
      payment_status: 'submitted',
      created_at: new Date().toISOString()
    };

    // Store in localStorage as backup
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_APPLICATIONS) || '[]');
      existing.unshift(newApp);
      localStorage.setItem(LOCAL_STORAGE_KEY_APPLICATIONS, JSON.stringify(existing));
    } catch {
      // ignore
    }

    // Try storing in Supabase agent_applications table
    try {
      const { data, error } = await supabase
        .from('agent_applications')
        .insert({
          user_id: newApp.user_id,
          full_name: newApp.full_name,
          email: newApp.email,
          phone: newApp.phone,
          campus_location: newApp.campus_location,
          state: newApp.state,
          institution: newApp.institution,
          code_of_conduct_agreed: newApp.code_of_conduct_agreed,
          payment_amount: newApp.payment_amount,
          payment_reference: newApp.payment_reference,
          payment_sender_name: newApp.payment_sender_name,
          payment_proof_url: newApp.payment_proof_url,
          status: 'pending_approval',
          payment_status: 'submitted'
        })
        .select()
        .single();

      if (!error && data) {
        return data as AgentApplication;
      }
    } catch (err) {
      console.warn("Could not insert into agent_applications table, using fallback:", err);
    }

    return newApp;
  },

  /**
   * Get application status by email or user_id
   */
  async getApplicationStatus(email?: string, userId?: string): Promise<AgentApplication | null> {
    try {
      let query = supabase.from('agent_applications').select('*');
      if (userId) {
        query = query.eq('user_id', userId);
      } else if (email) {
        query = query.eq('email', email);
      } else {
        return null;
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (!error && data) {
        return data as AgentApplication;
      }
    } catch (err) {
      console.warn("Error fetching application from DB:", err);
    }

    // Fallback to local storage
    try {
      const existing: AgentApplication[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_APPLICATIONS) || '[]');
      const found = existing.find(a => (userId && a.user_id === userId) || (email && a.email.toLowerCase() === email.toLowerCase()));
      return found || null;
    } catch {
      return null;
    }
  },

  /**
   * Admin: Get all agent applications
   */
  async getAllApplications(): Promise<AgentApplication[]> {
    let dbApps: AgentApplication[] = [];
    try {
      const { data, error } = await supabase
        .from('agent_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbApps = data as AgentApplication[];
      }
    } catch (err) {
      console.warn("Error fetching agent applications from DB:", err);
    }

    // Merge with local storage fallback
    try {
      const localApps: AgentApplication[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_APPLICATIONS) || '[]');
      const ids = new Set(dbApps.map(a => a.id));
      for (const item of localApps) {
        if (!ids.has(item.id)) {
          dbApps.push(item);
        }
      }
    } catch {
      // ignore
    }

    return dbApps;
  },

  /**
   * Admin approves an agent application
   */
  async approveApplication(applicationId: string, userId?: string): Promise<void> {
    // Update DB
    try {
      await supabase
        .from('agent_applications')
        .update({
          status: 'approved',
          payment_status: 'verified',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      // If user_id exists, promote their profile user_type to 'agent'
      if (userId) {
        await supabase
          .from('profiles')
          .update({
            user_type: 'agent',
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
      }
    } catch (err) {
      console.error("Error approving in DB:", err);
    }

    // Update local storage fallback
    try {
      const localApps: AgentApplication[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_APPLICATIONS) || '[]');
      const updated = localApps.map(a => {
        if (a.id === applicationId) {
          return { ...a, status: 'approved' as const, payment_status: 'verified' as const };
        }
        return a;
      });
      localStorage.setItem(LOCAL_STORAGE_KEY_APPLICATIONS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  },

  /**
   * Admin rejects an agent application
   */
  async rejectApplication(applicationId: string, reason: string): Promise<void> {
    try {
      await supabase
        .from('agent_applications')
        .update({
          status: 'rejected',
          payment_status: 'rejected',
          rejection_reason: reason,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);
    } catch (err) {
      console.error("Error rejecting in DB:", err);
    }

    // Update local storage fallback
    try {
      const localApps: AgentApplication[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_APPLICATIONS) || '[]');
      const updated = localApps.map(a => {
        if (a.id === applicationId) {
          return { ...a, status: 'rejected' as const, rejection_reason: reason };
        }
        return a;
      });
      localStorage.setItem(LOCAL_STORAGE_KEY_APPLICATIONS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  },

  /**
   * Submit Daily Report by Agent (Campus Comfort Daily Report Template)
   */
  async submitDailyReport(report: Omit<AgentDailyReport, 'id' | 'created_at'>): Promise<AgentDailyReport> {
    const newReport: AgentDailyReport = {
      ...report,
      id: crypto.randomUUID ? crypto.randomUUID() : `rep_${Date.now()}`,
      created_at: new Date().toISOString()
    };

    // Save to local storage
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_DAILY_REPORTS) || '[]');
      existing.unshift(newReport);
      localStorage.setItem(LOCAL_STORAGE_KEY_DAILY_REPORTS, JSON.stringify(existing));
    } catch {
      // ignore
    }

    // Save to DB
    try {
      const { data, error } = await supabase
        .from('agent_daily_reports')
        .insert({
          agent_id: newReport.agent_id,
          agent_name: newReport.agent_name,
          phone: newReport.phone,
          campus_area: newReport.campus_area,
          report_date: newReport.report_date,
          people_approached: newReport.people_approached,
          successful_clients_count: newReport.successful_clients_count,
          total_money_collected: newReport.total_money_collected,
          client_records: newReport.client_records,
          notes: newReport.notes
        })
        .select()
        .single();

      if (!error && data) {
        return data as AgentDailyReport;
      }
    } catch (err) {
      console.warn("Could not insert daily report into DB, saved locally:", err);
    }

    return newReport;
  },

  /**
   * Get daily reports for an agent
   */
  async getDailyReports(agentId?: string): Promise<AgentDailyReport[]> {
    let reports: AgentDailyReport[] = [];
    try {
      let query = supabase.from('agent_daily_reports').select('*');
      if (agentId) {
        query = query.eq('agent_id', agentId);
      }
      const { data, error } = await query.order('report_date', { ascending: false });
      if (!error && data) {
        reports = data as AgentDailyReport[];
      }
    } catch (err) {
      console.warn("Error fetching daily reports from DB:", err);
    }

    try {
      const localReports: AgentDailyReport[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_DAILY_REPORTS) || '[]');
      const filtered = agentId ? localReports.filter(r => r.agent_id === agentId) : localReports;
      const ids = new Set(reports.map(r => r.id));
      for (const item of filtered) {
        if (!ids.has(item.id)) {
          reports.push(item);
        }
      }
    } catch {
      // ignore
    }

    return reports;
  }
};
