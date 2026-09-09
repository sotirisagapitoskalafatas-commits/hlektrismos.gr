import { useEffect, useState, useCallback } from 'react';
import {
  Zap, LayoutDashboard, Users, Building2, Bot, LogOut, Plus, Search,
  TrendingDown, Clock, Phone, Mail, Trash2, Edit3, X, Loader2, CheckCircle2,
  Globe, Star, ArrowRight, Activity, Target, Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useRoute } from '@/lib/router';

type Lead = {
  id: string; full_name: string; phone: string; email: string | null;
  service_type: string; property_type: string; monthly_bill: number | null;
  postal_code: string | null; notes: string | null; status: string;
  created_at: string;
};
type Provider = {
  id: string; name: string; type: string; website_url: string | null;
  phone: string | null; coverage_area: string | null; base_tariff: number | null;
  discount_pct: number | null; rating: number | null; active: boolean;
  last_updated: string;
};
type ScrapeJob = {
  id: string; target: string; status: string; records_found: number;
  result_summary: string | null; started_at: string | null;
  completed_at: string | null; created_at: string;
};

type Tab = 'overview' | 'leads' | 'providers' | 'scraper';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [, navigate] = useRoute();
  const [tab, setTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('landing');
  };

  const navItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Επισκόπηση', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'providers', label: 'Πάροχοι', icon: Building2 },
    { id: 'scraper', label: 'AI Scraper', icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-[#05070f] text-white flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 border-r border-white/5 bg-[#070b16] transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <div className="font-bold text-sm">Ηlektrismos</div>
            <div className="text-xs text-white/40">CRM Dashboard</div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                tab === item.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-400/20'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}>
              <item.icon className="w-5 h-5" /> {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-white/5">
          <div className="px-4 py-2 mb-2">
            <div className="text-xs text-white/40">Συνδεδεμένος ως</div>
            <div className="text-sm text-white/70 truncate">{user?.email}</div>
          </div>
          <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" /> Αποσύνδεση
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 border-b border-white/5 bg-[#05070f]/85 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2">
              <LayoutDashboard className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">{navItems.find(n => n.id === tab)?.label}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/40 hidden md:block">{new Date().toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold">
              {user?.email?.[0]?.toUpperCase() ?? 'A'}
            </div>
          </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto">
          {tab === 'overview' && <Overview onGoTo={setTab} />}
          {tab === 'leads' && <LeadsTab />}
          {tab === 'providers' && <ProvidersTab />}
          {tab === 'scraper' && <ScraperTab />}
        </main>
      </div>
    </div>
  );
}

/* ============================== Overview ============================== */
function Overview({ onGoTo }: { onGoTo: (t: Tab) => void }) {
  const [stats, setStats] = useState({ leads: 0, newLeads: 0, providers: 0, jobs: 0 });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!supabase) { setLoading(false); return; }
      const [{ count: leads }, { count: providers }, { count: jobs }, { data: recent }] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('providers').select('*', { count: 'exact', head: true }),
        supabase.from('scrape_jobs').select('*', { count: 'exact', head: true }),
        supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5),
      ]);
      setStats({
        leads: leads ?? 0,
        newLeads: recent?.filter(l => l.status === 'new').length ?? 0,
        providers: providers ?? 0,
        jobs: jobs ?? 0,
      });
      setRecentLeads(recent ?? []);
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: 'Σύνολο Leads', value: stats.leads, icon: Users, color: 'from-cyan-500 to-blue-600', tab: 'leads' as Tab },
    { label: 'Νέα Leads', value: stats.newLeads, icon: Sparkles, color: 'from-emerald-500 to-teal-600', tab: 'leads' as Tab },
    { label: 'Πάροχοι', value: stats.providers, icon: Building2, color: 'from-amber-500 to-orange-600', tab: 'providers' as Tab },
    { label: 'Scrape Jobs', value: stats.jobs, icon: Bot, color: 'from-violet-500 to-purple-600', tab: 'scraper' as Tab },
  ];

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <button key={i} onClick={() => onGoTo(c.tab)}
            className="group p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-cyan-400/30 transition-all text-left">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <c.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold">{loading ? '...' : c.value}</div>
            <div className="text-sm text-white/50 mt-1">{c.label}</div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2"><Activity className="w-5 h-5 text-cyan-400" /> Πρόσφατα Leads</h3>
            <button onClick={() => onGoTo('leads')} className="text-sm text-cyan-400 hover:gap-3 inline-flex items-center gap-2 transition-all">
              Όλα <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentLeads.length === 0 ? (
              <p className="text-white/40 text-sm py-8 text-center">Δεν υπάρχουν leads ακόμα.</p>
            ) : recentLeads.map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <div className="font-medium text-sm">{l.full_name}</div>
                  <div className="text-xs text-white/40">{l.phone} · {serviceLabel(l.service_type)}</div>
                </div>
                <StatusBadge status={l.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-cyan-500/5 to-transparent p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><Bot className="w-5 h-5 text-cyan-400" /> AI Scraper Agent</h3>
          <p className="text-white/60 text-sm mb-6">
            Αυτόματος scraper παρόχων ενέργειας για όλη την Ελλάδα. Ξεκινήστε μια ανάλυση αγοράς με ένα κλικ.
          </p>
          <button onClick={() => onGoTo('scraper')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
            <Bot className="w-5 h-5" /> Άνοιγμα AI Scraper
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================== Leads ============================== */
function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState<Lead | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    setLeads(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = leads.filter(l => {
    const matchesSearch = !search || l.full_name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search);
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: string, status: string) => {
    if (!supabase) return;
    await supabase.from('leads').update({ status }).eq('id', id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    if (editing?.id === id) setEditing({ ...editing, status });
  };

  const deleteLead = async (id: string) => {
    if (!supabase) return;
    await supabase.from('leads').delete().eq('id', id);
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Αναζήτηση by όνομα ή τηλέφωνο..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400/50 focus:outline-none text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400/50 focus:outline-none text-sm">
          <option value="all" className="bg-[#0a0f1f]">Όλα</option>
          <option value="new" className="bg-[#0a0f1f]">Νέα</option>
          <option value="contacted" className="bg-[#0a0f1f]">Επικοινωνήθηκε</option>
          <option value="converted" className="bg-[#0a0f1f]">Μετατράπηκε</option>
          <option value="lost" className="bg-[#0a0f1f]">Χάθηκε</option>
        </select>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/40"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-white/40">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            Δεν βρέθηκαν leads.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(l => (
              <div key={l.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{l.full_name}</span>
                    <StatusBadge status={l.status} />
                  </div>
                  <div className="text-sm text-white/40 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {l.phone}</span>
                    {l.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {l.email}</span>}
                    <span>{serviceLabel(l.service_type)} · {l.property_type === 'home' ? 'Σπίτι' : 'Επιχείρηση'}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(l.created_at).toLocaleDateString('el-GR')}</span>
                  </div>
                  {l.notes && <div className="text-xs text-white/30 mt-1">{l.notes}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <select value={l.status} onChange={e => updateStatus(l.id, e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-cyan-400/50">
                    <option value="new" className="bg-[#0a0f1f]">Νέο</option>
                    <option value="contacted" className="bg-[#0a0f1f]">Επικοινωνήθηκε</option>
                    <option value="converted" className="bg-[#0a0f1f]">Μετατράπηκε</option>
                    <option value="lost" className="bg-[#0a0f1f]">Χάθηκε</option>
                  </select>
                  <button onClick={() => setEditing(l)} className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-cyan-400 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteLead(l.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && <LeadDetailModal lead={editing} onClose={() => setEditing(null)} onUpdate={load} />}
    </div>
  );
}

function LeadDetailModal({ lead, onClose, onUpdate }: { lead: Lead; onClose: () => void; onUpdate: () => void }) {
  const [form, setForm] = useState({
    full_name: lead.full_name, phone: lead.phone, email: lead.email ?? '',
    service_type: lead.service_type, property_type: lead.property_type,
    monthly_bill: lead.monthly_bill?.toString() ?? '', postal_code: lead.postal_code ?? '',
    notes: lead.notes ?? '', status: lead.status,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    if (supabase) {
      await supabase.from('leads').update({
        full_name: form.full_name, phone: form.phone, email: form.email || null,
        service_type: form.service_type, property_type: form.property_type,
        monthly_bill: form.monthly_bill ? parseFloat(form.monthly_bill) : null,
        postal_code: form.postal_code || null, notes: form.notes || null,
        status: form.status,
      }).eq('id', lead.id);
    }
    setSaving(false);
    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0a0f1f] border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Επεξεργασία Lead</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Όνομα"><input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className={inputCls} /></Field>
          <Field label="Τηλέφωνο"><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputCls} /></Field>
          <Field label="Email"><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputCls} /></Field>
          <Field label="Τ.Κ."><input value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} className={inputCls} /></Field>
          <Field label="Υπηρεσία">
            <select value={form.service_type} onChange={e => setForm({ ...form, service_type: e.target.value })} className={inputCls}>
              <option value="electricity" className="bg-[#0a0f1f]">Ρεύμα</option>
              <option value="gas" className="bg-[#0a0f1f]">Αέριο</option>
              <option value="solar" className="bg-[#0a0f1f]">Φωτοβολταϊκά</option>
              <option value="ev" className="bg-[#0a0f1f]">Ηλεκτροκίνηση</option>
            </select>
          </Field>
          <Field label="Τύπος">
            <select value={form.property_type} onChange={e => setForm({ ...form, property_type: e.target.value })} className={inputCls}>
              <option value="home" className="bg-[#0a0f1f]">Σπίτι</option>
              <option value="business" className="bg-[#0a0f1f]">Επιχείρηση</option>
            </select>
          </Field>
          <Field label="Μηνιαίος Λογαριασμός (€)"><input value={form.monthly_bill} onChange={e => setForm({ ...form, monthly_bill: e.target.value })} className={inputCls} type="number" /></Field>
          <Field label="Κατάσταση">
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputCls}>
              <option value="new" className="bg-[#0a0f1f]">Νέο</option>
              <option value="contacted" className="bg-[#0a0f1f]">Επικοινωνήθηκε</option>
              <option value="converted" className="bg-[#0a0f1f]">Μετατράπηκε</option>
              <option value="lost" className="bg-[#0a0f1f]">Χάθηκε</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Σχόλια"><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputCls} rows={3} /></Field>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={save} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Αποθήκευση
          </button>
          <button onClick={onClose} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5">Άκυρο</button>
        </div>
      </div>
    </div>
  );
}

/* ============================== Providers ============================== */
function ProvidersTab() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase.from('providers').select('*').order('name');
    setProviders(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = providers.filter(p => typeFilter === 'all' || p.type === typeFilter);

  const toggleActive = async (id: string, active: boolean) => {
    if (!supabase) return;
    await supabase.from('providers').update({ active: !active, last_updated: new Date().toISOString() }).eq('id', id);
    setProviders(prev => prev.map(p => p.id === id ? { ...p, active: !active } : p));
  };

  const deleteProvider = async (id: string) => {
    if (!supabase) return;
    await supabase.from('providers').delete().eq('id', id);
    setProviders(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {['all', 'electricity', 'gas', 'solar', 'ev'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                typeFilter === t ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30' : 'bg-white/5 text-white/50 hover:text-white border border-transparent'
              }`}>
              {t === 'all' ? 'Όλοι' : typeLabel(t)}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
          <Plus className="w-4 h-4" /> Νέος Πάροχος
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-white/40" /></div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center text-white/40">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" /> Δεν βρέθηκαν πάροχοι.
          </div>
        ) : filtered.map(p => (
          <div key={p.id} className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-cyan-400/20 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold">{p.name}</h3>
                <span className="text-xs text-white/40">{typeLabel(p.type)}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs ${p.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                {p.active ? 'Ενεργό' : 'Ανενεργό'}
              </span>
            </div>
            <div className="space-y-1.5 text-sm text-white/50">
              {p.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {p.phone}</div>}
              {p.coverage_area && <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> {p.coverage_area}</div>}
              {p.base_tariff != null && <div className="flex items-center gap-2"><TrendingDown className="w-3.5 h-3.5" /> {p.base_tariff}€ /kWh</div>}
              {p.discount_pct != null && <div className="flex items-center gap-2"><Target className="w-3.5 h-3.5" /> {p.discount_pct}% έκπτωση</div>}
              {p.rating != null && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(p.rating!) ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} />
                  ))}
                  <span className="text-xs ml-1">{p.rating}</span>
                </div>
              )}
            </div>
            {p.website_url && (
              <a href={p.website_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-cyan-400 hover:gap-2 transition-all">
                <Globe className="w-3.5 h-3.5" /> Ιστοσελίδα
              </a>
            )}
            <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
              <button onClick={() => toggleActive(p.id, p.active)} className="flex-1 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 transition-colors">
                {p.active ? 'Απενεργοποίηση' : 'Ενεργοποίηση'}
              </button>
              <button onClick={() => deleteProvider(p.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && <AddProviderModal onClose={() => setShowAdd(false)} onAdd={load} />}
    </div>
  );
}

function AddProviderModal({ onClose, onAdd }: { onClose: () => void; onAdd: () => void }) {
  const [form, setForm] = useState({
    name: '', type: 'electricity', website_url: '', phone: '', coverage_area: 'Όλη η Ελλάδα',
    base_tariff: '', discount_pct: '', rating: '',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    if (supabase) {
      await supabase.from('providers').insert({
        name: form.name, type: form.type, website_url: form.website_url || null,
        phone: form.phone || null, coverage_area: form.coverage_area || null,
        base_tariff: form.base_tariff ? parseFloat(form.base_tariff) : null,
        discount_pct: form.discount_pct ? parseFloat(form.discount_pct) : null,
        rating: form.rating ? parseFloat(form.rating) : null,
      });
    }
    setSaving(false);
    onAdd();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0a0f1f] border border-white/10 rounded-2xl p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Νέος Πάροχος</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Όνομα *"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} /></Field>
          <Field label="Τύπος">
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputCls}>
              <option value="electricity" className="bg-[#0a0f1f]">Ρεύμα</option>
              <option value="gas" className="bg-[#0a0f1f]">Αέριο</option>
              <option value="solar" className="bg-[#0a0f1f]">Φωτοβολταϊκά</option>
              <option value="ev" className="bg-[#0a0f1f]">Ηλεκτροκίνηση</option>
            </select>
          </Field>
          <Field label="Ιστοσελίδα"><input value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} className={inputCls} /></Field>
          <Field label="Τηλέφωνο"><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputCls} /></Field>
          <Field label="Περιοχή Κάλυψης"><input value={form.coverage_area} onChange={e => setForm({ ...form, coverage_area: e.target.value })} className={inputCls} /></Field>
          <Field label="Τιμή (€/kWh)"><input value={form.base_tariff} onChange={e => setForm({ ...form, base_tariff: e.target.value })} className={inputCls} type="number" /></Field>
          <Field label="Έκπτωση (%)"><input value={form.discount_pct} onChange={e => setForm({ ...form, discount_pct: e.target.value })} className={inputCls} type="number" /></Field>
          <Field label="Αξιολόγηση (0-5)"><input value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} className={inputCls} type="number" min="0" max="5" step="0.1" /></Field>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={save} disabled={saving || !form.name} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Προσθήκη
          </button>
          <button onClick={onClose} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5">Άκυρο</button>
        </div>
      </div>
    </div>
  );
}

/* ============================== AI Scraper ============================== */
function ScraperTab() {
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState('');
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase.from('scrape_jobs').select('*').order('created_at', { ascending: false });
    setJobs(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addLog = (msg: string) => setLog(prev => [...prev, `[${new Date().toLocaleTimeString('el-GR')}] ${msg}`]);

  const runScrape = async () => {
    if (!target.trim()) return;
    setRunning(true);
    setLog([]);
    addLog(`Εκκίνηση scrape για: ${target}`);

    let jobId: string | null = null;
    if (supabase) {
      const { data } = await supabase.from('scrape_jobs').insert({
        target, status: 'running', started_at: new Date().toISOString(),
      }).select().single();
      jobId = data?.id ?? null;
    }

    // Simulated AI scraper agent — analyzes the Greek energy market.
    const steps = [
      'Σύνδεση με πηγές δεδομένων αγοράς ενέργειας...',
      'Ανάλυση τιμοκαταλόγων παρόχων...',
      'Εξαγωγή στοιχείων: τιμές, εκπτώσεις, κάλυψη...',
      'Σύγκριση δεδομένων μεταξύ παρόχων...',
      'Εντοπισς νέων προσφορών και εκπτώσεων...',
      'Αποθήκευση αποτελεσμάτων στη βάση...',
    ];

    let records = 0;
    for (const step of steps) {
      addLog(step);
      await new Promise(r => setTimeout(r, 900 + Math.random() * 700));
      records += Math.floor(Math.random() * 5) + 1;
    }

    const summary = `Βρέθηκαν ${records} εγγραφές για "${target}". Τελευταία ανάλυση: ${new Date().toLocaleString('el-GR')}`;
    addLog(`Ολοκληρώθηκε. ${summary}`);

    if (supabase && jobId) {
      await supabase.from('scrape_jobs').update({
        status: 'completed', records_found: records, result_summary: summary,
        completed_at: new Date().toISOString(),
      }).eq('id', jobId);
    }

    setRunning(false);
    load();
  };

  const deleteJob = async (id: string) => {
    if (!supabase) return;
    await supabase.from('scrape_jobs').delete().eq('id', id);
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const quickTargets = [
    'Πάροχοι ρεύματος Αττικής',
    'Φωτοβολταϊκά — Όλη η Ελλάδα',
    'Πάροχοι αερίου Θεσσαλονίκης',
    'Φόρτιση EV — Κυκλάδες',
    'Όλοι οι πάροχοι ενέργειας',
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-b from-cyan-500/10 to-transparent p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Scraper Agent</h3>
            <p className="text-sm text-white/50">Αυτόματη ανάλυση αγοράς ενέργειας για πάροχους σε όλη την Ελλάδα</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input value={target} onChange={e => setTarget(e.target.value)} onKeyDown={e => e.key === 'Enter' && !running && runScrape()}
            placeholder="π.χ. Πάροχοι ρεύματος Αττικής"
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400/50 focus:outline-none text-sm" />
          <button onClick={runScrape} disabled={running || !target.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold disabled:opacity-60 transition-all hover:shadow-lg hover:shadow-cyan-500/30">
            {running ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
            {running ? 'Εκτέλεση...' : 'Εκκίνηση Scrape'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {quickTargets.map((t, i) => (
            <button key={i} onClick={() => !running && setTarget(t)}
              className="px-3 py-1.5 rounded-full text-xs bg-white/5 border border-white/10 hover:border-cyan-400/30 hover:text-cyan-300 transition-all">
              {t}
            </button>
          ))}
        </div>
      </div>

      {log.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs space-y-1 max-h-64 overflow-y-auto">
          {log.map((line, i) => (
            <div key={i} className={line.includes('Ολοκληρώθηκε') ? 'text-emerald-400' : 'text-cyan-300/70'}>
              {line}
            </div>
          ))}
          {running && <div className="text-cyan-400 animate-pulse">▌</div>}
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-cyan-400" /> Ιστορικό Εργασιών</h3>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-white/40" /></div>
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center text-white/40">
              <Bot className="w-10 h-10 mx-auto mb-2 opacity-30" /> Δεν έχουν εκτελεστεί εργασίες ακόμα.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {jobs.map(j => (
                <div key={j.id} className="p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{j.target}</span>
                      <JobStatusBadge status={j.status} />
                    </div>
                    <div className="text-xs text-white/40 mt-1">
                      {j.records_found} εγγραφές · {new Date(j.created_at).toLocaleString('el-GR')}
                    </div>
                    {j.result_summary && <div className="text-xs text-white/50 mt-1">{j.result_summary}</div>}
                  </div>
                  <button onClick={() => deleteJob(j.id)} className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================== Helpers ============================== */
const inputCls = "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-400/50 focus:outline-none text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-white/50 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: 'bg-cyan-500/20 text-cyan-400',
    contacted: 'bg-amber-500/20 text-amber-400',
    converted: 'bg-emerald-500/20 text-emerald-400',
    lost: 'bg-red-500/20 text-red-400',
  };
  const labels: Record<string, string> = {
    new: 'Νέο', contacted: 'Επικοινωνήθηκε', converted: 'Μετατράπηκε', lost: 'Χάθηκε',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs ${styles[status] ?? styles.new}`}>{labels[status] ?? status}</span>;
}

function JobStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-white/10 text-white/50',
    running: 'bg-cyan-500/20 text-cyan-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
    failed: 'bg-red-500/20 text-red-400',
  };
  const labels: Record<string, string> = {
    pending: 'Σε αναμονή', running: 'Εκτέλεση', completed: 'Ολοκληρώθηκε', failed: 'Αποτυχία',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs ${styles[status] ?? styles.pending}`}>{labels[status] ?? status}</span>;
}

function serviceLabel(s: string): string {
  const labels: Record<string, string> = { electricity: 'Ρεύμα', gas: 'Αέριο', solar: 'Φωτοβολταϊκά', ev: 'Ηλεκτροκίνηση' };
  return labels[s] ?? s;
}

function typeLabel(t: string): string {
  return serviceLabel(t);
}

