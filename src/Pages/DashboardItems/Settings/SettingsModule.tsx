import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { ArchiveRestore, Building2, CalendarDays, Clock, Database, Palette, Save, Shield, Users } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

const API = "https://autotimetable-smart-academic-timetable.onrender.com/settings-module";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`
});

const emptySettings: any = {
  instituteInfo: {},
  academicYear: {},
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  lectureDuration: 60,
  labDuration: 120,
  breaks: [],
  theme: { mode: "Light", accent: "Indigo", compactTables: false },
  userManagement: { allowInvites: true, defaultRole: "Staff" },
  security: { twoFactorRequired: false, sessionTimeoutMinutes: 60 },
  backup: { autoBackup: false, frequency: "Weekly" }
};

function SettingsModule() {
  const [settings, setSettings] = useState<any>(emptySettings);
  const [loading, setLoading] = useState(false);

  const update = (path: string, value: any) => {
    setSettings((current: any) => {
      const next = structuredClone(current);
      const parts = path.split(".");
      let cursor = next;

      for (let i = 0; i < parts.length - 1; i++) {
        cursor[parts[i]] = cursor[parts[i]] || {};
        cursor = cursor[parts[i]];
      }

      cursor[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, {
        headers: authHeaders()
      });
      setSettings({ ...emptySettings, ...res.data.settings });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Unable to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
        await loadSettings();
    };
    init();
  }, [loadSettings]);

  const saveSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.post(API, settings, { headers: authHeaders() });
      setSettings(res.data.settings);
      toast.success("Settings saved");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Unable to save settings");
    } finally {
      setLoading(false);
    }
  };

  const backupSettings = async () => {
    try {
        const res = await axios.post(`${API}/backup`, {}, { headers: authHeaders() });
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `settings-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Backup downloaded");
    } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error.response?.data?.message || "Backup failed");
    }
  };

  const toggleDay = (day: string) => {
    const selected = settings.workingDays || [];
    update("workingDays", selected.includes(day) ? selected.filter((value: string) => value !== day) : [...selected, day]);
  };

  const addBreak = () => update("breaks", [...(settings.breaks || []), { label: `Break ${(settings.breaks || []).length + 1}`, duration: 15 }]);

  return (
    <div className="p-6 min-h-screen bg-slate-50 text-slate-800 font-sans">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="bg-linear-to-r from-indigo-600 to-indigo-500 rounded-4xl p-7 shadow-2xl shadow-indigo-100">
          <div className="flex flex-col lg:flex-row justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-2xl border border-white/30">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">Settings</h1>
                <p className="text-indigo-100 text-xs font-bold uppercase tracking-[0.22em]">Institute, academic, security and backup controls</p>
              </div>
            </div>
            <button onClick={saveSettings} disabled={loading} className="bg-white text-indigo-600 px-6 py-3 rounded-xl text-xs font-black uppercase flex items-center gap-2 disabled:opacity-40">
              <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="flex items-center gap-2 font-black text-slate-900"><Building2 className="w-5 h-5 text-indigo-600" /> Institute Information Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={settings.instituteInfo?.name || ""} onChange={(e) => update("instituteInfo.name", e.target.value)} placeholder="Institute Name" className="input-box bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" />
              <input value={settings.instituteInfo?.code || ""} onChange={(e) => update("instituteInfo.code", e.target.value)} placeholder="Institute Code" className="input-box bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" />
              <input value={settings.instituteInfo?.email || ""} onChange={(e) => update("instituteInfo.email", e.target.value)} placeholder="Email" className="input-box bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" />
              <input value={settings.instituteInfo?.phone || ""} onChange={(e) => update("instituteInfo.phone", e.target.value)} placeholder="Phone" className="input-box bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" />
              <textarea value={settings.instituteInfo?.address || ""} onChange={(e) => update("instituteInfo.address", e.target.value)} placeholder="Address" className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm min-h-24" />
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="flex items-center gap-2 font-black text-slate-900"><CalendarDays className="w-5 h-5 text-indigo-600" /> Academic Year Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input value={settings.academicYear?.label || ""} onChange={(e) => update("academicYear.label", e.target.value)} placeholder="2024-25" className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" />
              <input type="date" value={settings.academicYear?.startsOn || ""} onChange={(e) => update("academicYear.startsOn", e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" />
              <input type="date" value={settings.academicYear?.endsOn || ""} onChange={(e) => update("academicYear.endsOn", e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" />
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="flex items-center gap-2 font-black text-slate-900"><Clock className="w-5 h-5 text-indigo-600" /> Working Days and Duration Settings</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {DAYS.map((day) => (
                <button key={day} onClick={() => toggleDay(day)} className={`p-3 rounded-xl text-xs font-black border ${settings.workingDays?.includes(day) ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-500 border-slate-200"}`}>{day}</button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="number" value={settings.lectureDuration || 60} onChange={(e) => update("lectureDuration", Number(e.target.value))} placeholder="Lecture Duration" className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" />
              <input type="number" value={settings.labDuration || 120} onChange={(e) => update("labDuration", Number(e.target.value))} placeholder="Lab Duration" className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" />
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="flex items-center gap-2 font-black text-slate-900"><Clock className="w-5 h-5 text-indigo-600" /> Break Settings</h2>
            {(settings.breaks as {label: string, duration: number}[] || []).map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-3">
                <input value={item.label || ""} onChange={(e) => {
                  const breaks = [...settings.breaks];
                  breaks[index] = { ...breaks[index], label: e.target.value };
                  update("breaks", breaks);
                }} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" />
                <input type="number" value={item.duration || 15} onChange={(e) => {
                  const breaks = [...settings.breaks];
                  breaks[index] = { ...breaks[index], duration: Number(e.target.value) };
                  update("breaks", breaks);
                }} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" />
              </div>
            ))}
            <button onClick={addBreak} className="bg-slate-100 text-slate-700 rounded-xl p-3 text-xs font-black uppercase">Add Break</button>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="flex items-center gap-2 font-black text-slate-900"><Palette className="w-5 h-5 text-indigo-600" /> Theme Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select value={settings.theme?.mode || "Light"} onChange={(e) => update("theme.mode", e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm">
                <option>Light</option><option>Dark</option><option>System</option>
              </select>
              <select value={settings.theme?.accent || "Indigo"} onChange={(e) => update("theme.accent", e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm">
                <option>Indigo</option><option>Emerald</option><option>Amber</option><option>Rose</option>
              </select>
              <label className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm flex items-center gap-2">
                <input type="checkbox" checked={!!settings.theme?.compactTables} onChange={(e) => update("theme.compactTables", e.target.checked)} /> Compact Tables
              </label>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="flex items-center gap-2 font-black text-slate-900"><Users className="w-5 h-5 text-indigo-600" /> User Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm flex items-center gap-2">
                <input type="checkbox" checked={!!settings.userManagement?.allowInvites} onChange={(e) => update("userManagement.allowInvites", e.target.checked)} /> Allow Invites
              </label>
              <input value={settings.userManagement?.defaultRole || "Staff"} onChange={(e) => update("userManagement.defaultRole", e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" />
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="flex items-center gap-2 font-black text-slate-900"><Shield className="w-5 h-5 text-indigo-600" /> Security Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm flex items-center gap-2">
                <input type="checkbox" checked={!!settings.security?.twoFactorRequired} onChange={(e) => update("security.twoFactorRequired", e.target.checked)} /> Require 2FA
              </label>
              <input type="number" value={settings.security?.sessionTimeoutMinutes || 60} onChange={(e) => update("security.sessionTimeoutMinutes", Number(e.target.value))} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" />
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <h2 className="flex items-center gap-2 font-black text-slate-900"><Database className="w-5 h-5 text-indigo-600" /> Backup and Restore</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm flex items-center gap-2">
                <input type="checkbox" checked={!!settings.backup?.autoBackup} onChange={(e) => update("backup.autoBackup", e.target.checked)} /> Auto Backup
              </label>
              <select value={settings.backup?.frequency || "Weekly"} onChange={(e) => update("backup.frequency", e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm">
                <option>Daily</option><option>Weekly</option><option>Monthly</option>
              </select>
              <button onClick={backupSettings} className="bg-indigo-600 text-white rounded-xl p-3 text-xs font-black uppercase flex items-center justify-center gap-2">
                <ArchiveRestore className="w-4 h-4" /> Backup
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default SettingsModule;
