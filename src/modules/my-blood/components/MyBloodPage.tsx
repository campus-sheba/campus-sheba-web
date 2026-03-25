"use client";

import { useEffect, useState, useTransition } from "react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { Droplets, UserCheck, ClipboardList, Plus, AlertCircle, Check, X, Pencil } from "lucide-react";
import Button from "@/components/ui/Button";
import {
  getMyDonorProfileAction,
  registerDonorAction,
  updateDonorProfileAction,
  deactivateDonorProfileAction,
  getMyBloodRequestsAction,
  createBloodRequestAction,
  updateBloodRequestStatusAction,
  type DonorProfile,
  type BloodRequest,
  type BloodGroup,
} from "@/app/[locale]/(protected)/(dashboard)/my-blood-requests/actions";

const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY_LEVELS = ["Low", "Medium", "High", "Critical"];
const TABS = [
  { id: "profile", label: "Donor Profile", icon: UserCheck },
  { id: "requests", label: "My Requests", icon: ClipboardList },
] as const;

export default function MyBloodPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "requests">("profile");

  // Profile state
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<DonorProfile>>({});
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Requests state
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState<Partial<Omit<BloodRequest, "_id" | "status" | "createdAt" | "user">>>({
    bloodGroup: "A+",
    urgencyLevel: "High",
    requiredUnits: 1,
  });
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTab === "requests") loadRequests();
  }, [activeTab]);

  async function loadProfile() {
    setProfileLoading(true);
    const res = await getMyDonorProfileAction();
    if (res.success) {
      setProfile(res.data);
      if (res.data) {
        setProfileForm({
          bloodGroup: res.data.bloodGroup,
          phoneNumber: res.data.phoneNumber,
          email: res.data.email ?? "",
          campusLocation: res.data.campusLocation ?? "",
          department: res.data.department ?? "",
          lastDonationDate: res.data.lastDonationDate ? res.data.lastDonationDate.slice(0, 10) : "",
          emergencyContact: res.data.emergencyContact ?? "",
          notes: res.data.notes ?? "",
          isAvailable: res.data.isAvailable ?? true,
          availabilityStatus: res.data.availabilityStatus ?? "Available",
        });
      }
    }
    setProfileLoading(false);
  }

  async function loadRequests() {
    setRequestsLoading(true);
    const res = await getMyBloodRequestsAction();
    if (res.success) setRequests(res.data);
    setRequestsLoading(false);
  }

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    startTransition(async () => {
      const res = profile
        ? await updateDonorProfileAction(profileForm)
        : await registerDonorAction(profileForm as DonorProfile);
      if (res.success) {
        await loadProfile();
        setEditingProfile(false);
      } else {
        setProfileError(res.message);
      }
    });
  }

  function handleDeactivate() {
    if (!confirm("Deactivate your donor profile? You won't appear in donor searches.")) return;
    startTransition(async () => {
      await deactivateDonorProfileAction();
      await loadProfile();
    });
  }

  function handleRequestSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRequestError(null);
    if (!requestForm.bloodGroup || !requestForm.hospital || !requestForm.contactNumber || !requestForm.patientName) {
      setRequestError("Blood group, hospital, patient name, and contact number are required.");
      return;
    }
    startTransition(async () => {
      const res = await createBloodRequestAction(requestForm as any);
      if (res.success) {
        await loadRequests();
        setShowRequestForm(false);
        setRequestForm({ bloodGroup: "A+", urgencyLevel: "High", requiredUnits: 1 });
      } else {
        setRequestError(res.message);
      }
    });
  }

  function handleRequestStatusChange(id: string, status: "Fulfilled" | "Cancelled") {
    if (!confirm(`Mark this request as ${status}?`)) return;
    startTransition(async () => {
      await updateBloodRequestStatusAction(id, status);
      await loadRequests();
    });
  }

  const inputCls = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/25 focus:border-red-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition";
  const labelCls = "block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5";

  const urgencyColors: Record<string, string> = {
    Low: "bg-green-100 text-green-800 border-green-200",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    High: "bg-orange-100 text-orange-800 border-orange-200",
    Critical: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <AppBreadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Dashboard", href: "/profile" },
        { label: "Blood Requests" },
      ]} />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-red-50/60 to-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
            <Droplets className="w-28 h-28 text-red-500" />
          </div>
          <div className="relative">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Blood Requests Center</h1>
            <p className="mt-1 text-sm text-gray-600 max-w-lg leading-relaxed">
              Register as a blood donor or manage emergency blood donation requests within your campus community.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 px-2 pt-2">
          {TABS.map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all rounded-t-xl ${
                  isActive ? "border-red-500 text-red-600 bg-white shadow-sm" : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-red-500" : "text-gray-400"}`} />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-5 bg-gray-50/30 min-h-[500px]">

          {/* ── PROFILE TAB ── */}
          {activeTab === "profile" && (
            profileLoading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <span className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-4" />
                <span className="text-sm font-bold text-gray-400">Loading donor profile...</span>
              </div>
            ) : !profile && !editingProfile ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-300 max-w-lg mx-auto mt-4">
                <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Droplets className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Not Registered as Donor</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Join your campus blood donor network. Your registration could save a life.
                </p>
                <Button onClick={() => { setEditingProfile(true); setProfileForm({ bloodGroup: "A+", isAvailable: true, availabilityStatus: "Available" }); }} uppercase={false} className="bg-red-500 hover:bg-red-600 text-white border-none px-8">
                  Register as Donor
                </Button>
              </div>
            ) : editingProfile ? (
              /* Edit / Register Form */
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm  animate-in fade-in">
                <h3 className="text-lg font-bold text-gray-900 mb-5">{profile ? "Update Donor Profile" : "Register as Blood Donor"}</h3>
                {profileError && <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-600 mb-5"><AlertCircle className="w-4 h-4 shrink-0" />{profileError}</div>}
                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    <div>
                      <label className={labelCls}>Blood Group *</label>
                      <select required value={profileForm.bloodGroup || "A+"} onChange={e => setProfileForm({ ...profileForm, bloodGroup: e.target.value as BloodGroup })} className={inputCls}>
                        {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Phone Number *</label>
                      <input required value={profileForm.phoneNumber || ""} onChange={e => setProfileForm({ ...profileForm, phoneNumber: e.target.value })} className={inputCls} placeholder="+880 1XXX-XXXXXX" />
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input type="email" value={profileForm.email || ""} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className={inputCls} placeholder="donor@student.edu.bd" />
                    </div>
                    <div>
                      <label className={labelCls}>Campus Location</label>
                      <input value={profileForm.campusLocation || ""} onChange={e => setProfileForm({ ...profileForm, campusLocation: e.target.value })} className={inputCls} placeholder="Dormitory A, Room 305" />
                    </div>
                    <div>
                      <label className={labelCls}>Department</label>
                      <input value={profileForm.department || ""} onChange={e => setProfileForm({ ...profileForm, department: e.target.value })} className={inputCls} placeholder="Computer Science..." />
                    </div>
                    <div>
                      <label className={labelCls}>Last Donation Date</label>
                      <input type="date" value={profileForm.lastDonationDate?.slice(0, 10) || ""} onChange={e => setProfileForm({ ...profileForm, lastDonationDate: e.target.value })} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Emergency Contact</label>
                      <input value={profileForm.emergencyContact || ""} onChange={e => setProfileForm({ ...profileForm, emergencyContact: e.target.value })} className={inputCls} placeholder="+880 1XXX-XXXXXX" />
                    </div>
                    <div>
                      <label className={labelCls}>Availability Status</label>
                      <select value={profileForm.availabilityStatus || "Available"} onChange={e => setProfileForm({ ...profileForm, availabilityStatus: e.target.value as any })} className={inputCls}>
                        <option value="Available">Available</option>
                        <option value="Temporarily Unavailable">Temporarily Unavailable</option>
                        <option value="Unavailable">Unavailable</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Notes</label>
                    <textarea value={profileForm.notes || ""} onChange={e => setProfileForm({ ...profileForm, notes: e.target.value })} rows={3} className={`${inputCls} resize-none`} placeholder="Availability notes, preferred hospitals, any conditions..." />
                  </div>

                  <div className="flex items-center gap-3 justify-between pt-4 border-t border-gray-100">
                    <Button type="button" variant="ghost" uppercase={false} onClick={() => setEditingProfile(false)} disabled={isPending}>Cancel</Button>
                    <Button type="submit" uppercase={false} disabled={isPending} className="bg-red-500 hover:bg-red-600 text-white border-none px-8">
                      {isPending ? "Saving..." : (profile ? "Save Changes" : "Complete Registration")}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              /* Profile View */
              <div className="max-w-3xl space-y-5">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shadow-sm">
                        <span className="text-xl font-black text-red-600">{profile!.bloodGroup}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Registered Donor</h3>
                        <div className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          profile!.availabilityStatus === "Available" ? "bg-green-100 text-green-700 border-green-200"
                          : profile!.availabilityStatus === "Temporarily Unavailable" ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${profile!.availabilityStatus === "Available" ? "bg-green-500" : "bg-amber-500"} animate-pulse`} />
                          {profile!.availabilityStatus || "Available"}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" uppercase={false} onClick={() => setEditingProfile(true)} className="gap-1.5 bg-white">
                        <Pencil className="w-3.5 h-3.5" /> Edit Profile
                      </Button>
                      <Button size="sm" variant="outline" uppercase={false} onClick={handleDeactivate} disabled={isPending} className="text-red-600 border-red-200 hover:bg-red-50 bg-white">
                        Deactivate
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Phone", value: profile!.phoneNumber },
                      { label: "Email", value: profile!.email || "—" },
                      { label: "Emergency Contact", value: profile!.emergencyContact || "—" },
                      { label: "Campus Location", value: profile!.campusLocation || "—" },
                      { label: "Department", value: profile!.department || "—" },
                      { label: "Last Donation", value: profile!.lastDonationDate ? new Date(profile!.lastDonationDate).toLocaleDateString() : "Not recorded" },
                    ].map(field => (
                      <div key={field.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{field.label}</div>
                        <div className="text-sm font-semibold text-gray-900 break-all">{field.value}</div>
                      </div>
                    ))}
                  </div>

                  {profile!.notes && (
                    <div className="mt-4 bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                      <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Notes</div>
                      <p className="text-sm text-gray-700">{profile!.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          )}

          {/* ── REQUESTS TAB ── */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">My Blood Requests ({requests.length})</h3>
                <Button size="sm" onClick={() => { setShowRequestForm(true); setRequestError(null); }} uppercase={false} className="bg-red-500 hover:bg-red-600 text-white border-none gap-1.5 px-4 shadow-sm">
                  <Plus className="w-4 h-4" /> New Request
                </Button>
              </div>

              {showRequestForm && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in slide-in-from-top-2">
                  <h4 className="font-bold text-gray-900 mb-4">Create Emergency Blood Request</h4>
                  {requestError && <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-600 mb-4"><AlertCircle className="w-4 h-4 shrink-0" />{requestError}</div>}
                  <form onSubmit={handleRequestSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className={labelCls}>Blood Group *</label>
                        <select required value={requestForm.bloodGroup || "A+"} onChange={e => setRequestForm({ ...requestForm, bloodGroup: e.target.value as BloodGroup })} className={inputCls}>
                          {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Urgency Level *</label>
                        <select required value={requestForm.urgencyLevel || "High"} onChange={e => setRequestForm({ ...requestForm, urgencyLevel: e.target.value as any })} className={inputCls}>
                          {URGENCY_LEVELS.map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Required Units *</label>
                        <input type="number" min={1} required value={requestForm.requiredUnits || ""} onChange={e => setRequestForm({ ...requestForm, requiredUnits: Number(e.target.value) })} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Contact Number *</label>
                        <input required value={requestForm.contactNumber || ""} onChange={e => setRequestForm({ ...requestForm, contactNumber: e.target.value })} className={inputCls} placeholder="+880 1XXX..." />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Patient Name *</label>
                        <input required value={requestForm.patientName || ""} onChange={e => setRequestForm({ ...requestForm, patientName: e.target.value })} className={inputCls} placeholder="Full name of patient" />
                      </div>
                      <div>
                        <label className={labelCls}>Hospital *</label>
                        <input required value={requestForm.hospital || ""} onChange={e => setRequestForm({ ...requestForm, hospital: e.target.value })} className={inputCls} placeholder="e.g. Dhaka Medical College Hospital" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Exact Location</label>
                      <input value={requestForm.location || ""} onChange={e => setRequestForm({ ...requestForm, location: e.target.value })} className={inputCls} placeholder="e.g. Emergency Ward, 2nd Floor" />
                    </div>
                    <div>
                      <label className={labelCls}>Additional Information</label>
                      <textarea value={requestForm.additionalInfo || ""} onChange={e => setRequestForm({ ...requestForm, additionalInfo: e.target.value })} rows={2} className={`${inputCls} resize-none`} placeholder="Urgency context, timeline, special requirements..." />
                    </div>
                    <div className="flex gap-3 pt-2 justify-end">
                      <Button type="button" variant="ghost" uppercase={false} onClick={() => setShowRequestForm(false)}>Cancel</Button>
                      <Button type="submit" uppercase={false} disabled={isPending} className="bg-red-500 hover:bg-red-600 text-white border-none px-6">
                        {isPending ? "Submitting..." : "Submit Emergency Request"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {requestsLoading ? (
                <div className="py-16 flex flex-col items-center justify-center">
                  <span className="w-8 h-8 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-3" />
                  <span className="text-sm font-bold text-gray-400">Loading requests...</span>
                </div>
              ) : requests.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-300">
                  <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="font-bold text-gray-700 mb-1">No blood requests yet</p>
                  <p className="text-sm text-gray-400">Your created emergency requests will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map(req => (
                    <div key={req._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center font-black text-red-600 text-sm shrink-0">
                              {req.bloodGroup}
                            </div>
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${urgencyColors[req.urgencyLevel] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                              {req.urgencyLevel} Urgency
                            </span>
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${
                              req.status === "Open" ? "bg-blue-100 text-blue-800 border-blue-200"
                              : req.status === "Fulfilled" ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900">Patient: {req.patientName}</h4>
                          <p className="text-sm text-gray-600 mt-0.5">{req.hospital}</p>
                          {req.location && <p className="text-xs text-gray-400 mt-0.5">{req.location}</p>}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Units Needed: <span className="font-bold text-gray-900">{req.requiredUnits}</span></span>
                            <span>Contact: <span className="font-bold text-gray-900">{req.contactNumber}</span></span>
                          </div>
                          {req.additionalInfo && <p className="text-xs text-gray-500 mt-2 italic border-l-2 border-gray-200 pl-2">{req.additionalInfo}</p>}
                        </div>

                        {req.status === "Open" && (
                          <div className="flex gap-2 shrink-0">
                            <button disabled={isPending} onClick={() => handleRequestStatusChange(req._id, "Fulfilled")}
                              className="flex items-center gap-1.5 px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-xl hover:bg-green-100 transition">
                              <Check className="w-3.5 h-3.5" /> Fulfilled
                            </button>
                            <button disabled={isPending} onClick={() => handleRequestStatusChange(req._id, "Cancelled")}
                              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl hover:bg-red-100 transition">
                              <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
