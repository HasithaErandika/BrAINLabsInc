import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, User, ShieldCheck, Mail, Briefcase } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';

interface Member {
  id: number;
  first_name: string;
  second_name: string;
  contact_email: string;
  role: 'admin' | 'researcher' | 'research_assistant' | 'pending';
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      const data = await api.getMembers();
      setMembers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await api.approveMember(id);
      fetchMembers();
    } catch (err: any) {
      alert(err.message || 'Failed to approve member');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.rejectMember(id);
      fetchMembers();
    } catch (err: any) {
      alert(err.message || 'Failed to reject member');
    }
  };

  const pendingMembers = members.filter(m => m.approval_status === 'PENDING');
  const otherMembers = members.filter(m => m.approval_status !== 'PENDING');

  if (loading) return <div className="pt-32 text-center text-muted-foreground animate-pulse">Loading directory...</div>;

  return (
    <div className="relative min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      <SEO title="Admin Dashboard | BrainLabs" />

      <div className="flex flex-col md:flex-row items-baseline gap-3 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">System Governance</Badge>
      </div>

      {/* Pending Approvals Section */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="text-amber-500" size={20} />
          <h2 className="text-xl font-semibold">Pending Registrations</h2>
          <Badge className="ml-2 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none">{pendingMembers.length}</Badge>
        </div>

        {pendingMembers.length === 0 ? (
          <Card className="border-dashed border-2 bg-transparent">
            <CardContent className="py-10 text-center text-muted-foreground">
              No new registration requests at this time.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingMembers.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm group hover:border-primary/30 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <User size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{member.first_name} {member.second_name}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1.5 capitalize">
                            <Briefcase size={14} />
                            {member.role.replace('_', ' ')}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Mail size={14} />
                            {member.contact_email}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:bg-destructive/10 gap-2"
                        onClick={() => handleReject(member.id)}
                      >
                        <XCircle size={16} />
                        Reject
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 px-6"
                        onClick={() => handleApprove(member.id)}
                      >
                        <CheckCircle2 size={16} />
                        Approve Access
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Directory Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="text-primary" size={20} />
          <h2 className="text-xl font-semibold">Member Directory</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherMembers.map((member) => (
            <Card key={member.id} className="bg-card/30 border-border/40 hover:bg-card/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                    <User size={20} />
                  </div>
                  <Badge variant={member.approval_status === 'APPROVED' ? 'default' : 'secondary'} 
                         className={member.approval_status === 'APPROVED' ? 'bg-green-500/10 text-green-600 border-none' : 'bg-destructive/10 text-destructive border-none'}>
                    {member.approval_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-1">{member.first_name} {member.second_name}</CardTitle>
                <CardDescription className="capitalize flex items-center gap-1.5 mb-4">
                  <Briefcase size={12} />
                  {member.role.replace('_', ' ')}
                </CardDescription>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock size={12} />
                  Joined {new Date(member.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
