import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../api";
import type { Profile } from "../../types";
import { User, BookOpen, FlaskConical, Edit3, Check } from "lucide-react";
import { BasicInfoTab } from "./components/BasicInfoTab";
import { QualificationsTab } from "./components/QualificationsTab";
import { OngoingResearchTab } from "./components/OngoingResearchTab";
import { Button } from "../../components/ui/Button";

type TabId = "basic" | "qualifications" | "research";

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const TABS: TabConfig[] = [
  { id: "basic", label: "Identity & Profile", icon: User },
  { id: "research", label: "Active Research", icon: FlaskConical },
  { id: "qualifications", label: "Academic Records", icon: BookOpen },
];

export default function Account() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await api.me.get();
      setProfile(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Credential Retrieval Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const filteredTabs = TABS.filter(tab => {
    if (isAdmin()) return tab.id === "basic";
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white p-8">
        <div className="flex flex-col items-center gap-4">
           <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
           <p className="text-sm font-medium text-zinc-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white p-8">
        <div className="max-w-md w-full border border-zinc-200 rounded-xl p-8 text-center space-y-6">
           <div className="w-12 h-12 bg-zinc-100 text-zinc-500 rounded-full flex items-center justify-center mx-auto">
              <User size={24} />
           </div>
           <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-zinc-900">Profile Unavailable</h2>
              <p className="text-sm text-zinc-500">{error || "Could not resolve your profile data."}</p>
           </div>
           <Button onClick={() => window.location.reload()} className="w-full">
              Retry
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[90vh] bg-white border border-zinc-200 rounded-xl overflow-hidden mt-6 mx-6 lg:mx-10 mb-20 shadow-sm">
      {/* Sidebar Control Panel */}
      <div className="w-full lg:w-[280px] shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-200 bg-zinc-50/50 p-6 lg:p-8 flex flex-col">
        <div className="space-y-5 mb-8">
          <div className="w-20 h-20 bg-zinc-200 text-zinc-600 rounded-full flex items-center justify-center text-3xl font-medium mx-auto lg:mx-0 shadow-inner">
            {profile.first_name[0]}{profile.second_name[0]}
          </div>
          <div className="text-center lg:text-left">
            <h1 className="text-xl font-bold text-zinc-900">{profile.first_name} {profile.second_name}</h1>
            <p className="text-sm font-medium text-zinc-500 capitalize mt-0.5">
              {profile.role.replace('_', ' ')}
            </p>
          </div>
        </div>
        
        <nav className="space-y-1.5 flex-1">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 px-1">Settings</p>
          {filteredTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <tab.icon size={16} className={activeTab === tab.id ? "text-zinc-700" : "text-zinc-400"} />
              {tab.label}
            </button>
          ))}
          
          <div className="pt-6 mt-6 border-t border-zinc-200">
            <Button
              variant={isEditing ? "primary" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
              className="w-full justify-start text-sm"
            >
              {isEditing ? <><Check size={16} className="mr-2" /> Save Profile</> : <><Edit3 size={16} className="mr-2" /> Edit Profile</>}
            </Button>
          </div>
        </nav>
      </div>

      {/* Profile Content Display */}
      <div className="flex-1 bg-white p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-3xl">
          {activeTab === "basic" && <BasicInfoTab cv={profile} onUpdate={fetchProfile} isEditing={isEditing} />}
          {activeTab === "research" && <OngoingResearchTab cv={profile} onUpdate={fetchProfile} isEditing={isEditing} />}
          {activeTab === "qualifications" && <QualificationsTab cv={profile} onUpdate={fetchProfile} isEditing={isEditing} />}
        </div>
      </div>
    </div>
  );
}
