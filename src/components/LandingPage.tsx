import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Zap, Flame, Sun, Car, Phone, Mail, MapPin, ArrowRight,
  ShieldCheck, Clock, Sparkles, TrendingDown, Users, ChevronDown,
  Menu, X, CheckCircle2, Loader2, Send, Navigation, Home, Building2,
  Wrench, Leaf, Quote,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRoute } from '@/lib/router';

const PHONE = '+30 210 22 55 000';
const EMAIL = 'info@hlektrismos.gr';
const ADDRESS = 'Ζαλοκώστα 8, Αθήνα Τ.Κ. 10671';

const SATELLITE_BG = 'https://images.pexels.com/photos/33909968/pexels-photo-33909968.jpeg?auto=compress&cs=tinysrgb&w=1920';
const AERIAL_KERKIRA = 'https://images.pexels.com/photos/9213281/pexels-photo-9213281.jpeg?auto=compress&cs=tinysrgb&w=1920';

const PEOPLE = [
  { img: 'https://images.pexels.com/photos/6392968/pexels-photo-6392968.jpeg?auto=compress&cs=tinysrgb&w=600', name: 'Μαρία', role: 'Νοικοκυρά', quote: 'Έκοψα τον λογαριασμό μου κατά 30% — χωρίς κανένα κόπο.', icon: Home },
  { img: 'https://images.pexels.com/photos/17582358/pexels-photo-17582358.jpeg?auto=compress&cs=tinysrgb&w=600', name: 'Γιάννης', role: 'Επιχειρηματίας', quote: 'Η επιχείρησή μου εξοικονομεί χιλιάδες ευρώ τον χρόνο.', icon: Building2 },
  { img: 'https://images.pexels.com/photos/21812143/pexels-photo-21812143.jpeg?auto=compress&cs=tinysrgb&w=600', name: 'Νίκος', role: 'Ηλεκτρολόγος', quote: 'Εγκαθιστώ φωτοβολταϊκά σε όλη την Αττική — άριστη συνεργασία.', icon: Wrench },
];

const SHOWCASE = [
  { img: 'https://images.pexels.com/photos/24449044/pexels-photo-24449044.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'Σπίτια', desc: 'Εξατομικευμένα προγράμματα ρεύματος για κάθε νοικοκυριό.', icon: Home, stats: 'Έως 30% εξοικονόμηση' },
  { img: 'https://images.pexels.com/photos/9875415/pexels-photo-9875415.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'Φωτοβολταϊκά', desc: 'Εγκατάσταση ηλιακών πάνελ σε στέγες και αυλές.', icon: Sun, stats: 'Άξοια απόδοση 25 χρόνια' },
  { img: 'https://images.pexels.com/photos/34674788/pexels-photo-34674788.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'Επιχειρήσεις', desc: 'Συμβόλαια προμήθειας για καταστήματα και γραφεία.', icon: Building2, stats: 'Άμεση ενεργοποίηση 7 ημέρες' },
  { img: 'https://images.pexels.com/photos/21822434/pexels-photo-21822434.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'Πράσινη Ενέργεια', desc: 'Αιολική και ηλιακή ενέργεια από ελληνικά βουνά.', icon: Leaf, stats: '100% ανανεώσιμες πηγές' },
];

const JOURNEY_STOPS = [
  { name: 'Αθήνα', subtitle: 'Η καρδιά της ελληνικής ενέργειας', lat: 37.9838, lng: 23.7275 },
  { name: 'Θεσσαλονίκη', subtitle: 'Βόρεια πύλη της καινοτομίας', lat: 40.6401, lng: 22.9444 },
  { name: 'Ιωάννινα', subtitle: 'Ήπειρος — πράσινη μετάβαση', lat: 39.6678, lng: 20.8520 },
  { name: 'Βόλος', subtitle: 'Θεσσαλία — βιομηχανική ενέργεια', lat: 39.3681, lng: 22.9426 },
  { name: 'Πάτρα', subtitle: 'Δυτική ακτή, φωτοβολταϊκή δύναμη', lat: 38.2466, lng: 21.7346 },
  { name: 'Μύκονος', subtitle: 'Κυκλάδες — έξυπνα δίκτυα', lat: 37.4467, lng: 25.3472 },
  { name: 'Ηράκλειο', subtitle: 'Κρήτη — νησί του ήλιου', lat: 35.3387, lng: 25.1442 },
  { name: 'Ρόδος', subtitle: 'Δωδεκάνησα — ακριτικά νησιά', lat: 36.4341, lng: 28.2181 },
];

const SERVICES = [
  { icon: Zap, title: 'Ρεύμα', desc: 'Φθηνά Προγράμματα Ενέργειας ειδικά για σένα.', color: 'from-sky-400 to-blue-500' },
  { icon: Flame, title: 'Αέριο', desc: 'Εξατομικευμένες λύσεις φυσικού αερίου για το σπίτι.', color: 'from-amber-400 to-orange-500' },
  { icon: Sun, title: 'Φωτοβολταϊκά', desc: 'Καινοτομία και Βιώσιμη Ανάπτυξη, τώρα στο χώρο σου.', color: 'from-yellow-400 to-amber-500' },
  { icon: Car, title: 'Ηλεκτροκίνηση', desc: 'Οδηγούμε οικολογικά, κινούμαστε ηλεκτρικά.', color: 'from-emerald-400 to-teal-500' },
];

const FAQS = [
  { q: 'Είναι δωρεάν η αλλαγή παρόχου;', a: 'Ναι, η αλλαγή παρόχου είναι μια εντελώς δωρεάν διαδικασία για όλους τους καταναλωτές, χωρίς κρυφές χρεώσεις.' },
  { q: 'Πόσος χρόνος χρειάζεται για την αλλαγή;', a: 'Από την ημέρα που θα υπογράψετε τη σύμβαση απαιτούνται 7 εργάσιμες ημέρες για να ολοκληρωθεί η διαδικασία από τον ΔΕΔΔΗΕ.' },
  { q: 'Θα διακοπεί το ρεύμα μου;', a: 'Όχι. Η αλλαγή παρόχου είναι καθαρά εμπορική/λογιστική μεταβολή. Η παροχή ρεύματος είναι εγγυημένη από τον ΔΕΔΔΗΕ.' },
  { q: 'Τι δικαιολογητικά χρειάζονται;', a: 'Απλώς υπογράφετε Σύμβαση Προμήθειας με τον νέο πάροχο και καταθέτετε τα απαραίτητα δικαιολογητικά — εμείς αναλαμβάνουμε τα πάντα.' },
];

const PROVIDER_REGIONS = [
  'Αττική', 'Θεσσαλονίκη', 'Θεσσαλία', 'Ήπειρος', 'Κρήτη',
  'Πελοπόννησος', 'Κυκλάδες', 'Δωδεκάνησα', 'Στερεά Ελλάδα',
  'Ανατολική Μακεδονία', 'Δυτική Μακεδονία', 'Ιόνια Νησιά', 'Βόρειο Αιγαίο',
];

/* ========== Scroll Hooks ========== */
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setY(window.scrollY));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return y;
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function useElementScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const start = rect.top - vh;
        const total = rect.height + vh;
        setProgress(Math.max(0, Math.min(1, -start / total)));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return { ref, progress };
}

/* ========== Main ========== */
export default function LandingPage() {
  const [, navigate] = useRoute();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollY = useScrollY();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative bg-slate-50 text-slate-900 overflow-x-hidden">
      <SatelliteBackground scrollY={scrollY} />
      <Nav scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onLogin={() => navigate('login')} />
      <Hero scrollY={scrollY} onLogin={() => navigate('login')} />
      <Stats />
      <GreeceJourney />
      <PeopleSection />
      <ShowcaseSection />
      <About />
      <Services services={SERVICES} />
      <ProviderCoverage regions={PROVIDER_REGIONS} />
      <Comparison />
      <WhyUs />
      <FAQ faqs={FAQS} />
      <LeadForm />
      <FinalCTA onLogin={() => navigate('login')} />
      <Footer onLogin={() => navigate('login')} />
    </div>
  );
}

/* ============================== Satellite Background ============================== */
function SatelliteBackground({ scrollY }: { scrollY: number }) {
  const maxScroll = 3000;
  const offset = Math.min(scrollY * 0.3, maxScroll);
  const opacity = Math.max(0, 0.08 - scrollY / 5000);
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${SATELLITE_BG}')`,
          transform: `translateY(${offset}px) scale(1.1)`,
          opacity,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-white/90 to-slate-50/80" />
    </div>
  );
}

/* ============================== Nav ============================== */
function Nav({ scrolled, menuOpen, setMenuOpen, onLogin }: {
  scrolled: boolean; menuOpen: boolean; setMenuOpen: (v: boolean) => void; onLogin: () => void;
}) {
  const links = [
    { label: 'Αρχική', href: '#top' },
    { label: 'Ποιοι Είμαστε', href: '#about' },
    { label: 'Λύσεις', href: '#services' },
    { label: 'Πάροχοι', href: '#providers' },
    { label: 'Ενέργεια Σήμερα', href: '#compare' },
    { label: 'FAQ', href: '#faq' },
  ];
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-white/70 backdrop-blur-xl border-b border-slate-200/60 py-3 shadow-sm' : 'py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Ηlektrismos<span className="text-sky-500">.gr</span></span>
        </a>
        <nav className="hidden lg:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-sm text-slate-600 hover:text-sky-600 transition-colors relative group">
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href={`tel:${PHONE.replace(/\s/g, '')}`} className="hidden md:flex items-center gap-2 text-sm text-slate-600 hover:text-sky-600 transition-colors">
            <Phone className="w-4 h-4" /> {PHONE}
          </a>
          <button onClick={onLogin} className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-sky-500/30 transition-all">
            CRM Είσοδος <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-slate-700">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="lg:hidden absolute top-full inset-x-0 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 py-6 px-6 flex flex-col gap-4">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-slate-700 hover:text-sky-600 text-lg">{l.label}</a>
          ))}
          <button onClick={() => { setMenuOpen(false); onLogin(); }} className="mt-2 px-5 py-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold">CRM Είσοδος</button>
        </div>
      )}
    </header>
  );
}

/* ============================== Hero ============================== */
function Hero({ scrollY }: { scrollY: number; onLogin: () => void }) {
  const parallax = (f: number) => `translateY(${scrollY * f}px)`;
  const rotate3d = `perspective(1000px) rotateX(${scrollY * 0.02}deg) rotateY(${scrollY * 0.01}deg)`;
  const heroOpacity = Math.max(0, 1 - scrollY / 600);

  return (
    <section id="top" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 z-10">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-300/30 rounded-full blur-3xl" style={{ transform: parallax(0.3) }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/25 rounded-full blur-3xl" style={{ transform: parallax(-0.2) }} />
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl" style={{ transform: parallax(0.15) }} />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center" style={{ transform: parallax(-0.1), opacity: heroOpacity }}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-[fadeIn_0.8s_ease]">
          <Sparkles className="w-4 h-4 text-sky-500" />
          <span className="text-sm text-slate-700 font-medium">Εξειδικευμένοι Σύμβουλοι Ενέργειας</span>
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.05] text-slate-900" style={{ transform: rotate3d }}>
          Ο προσωπικός σου
          <br />
          <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">σύμβουλος ενέργειας</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Δίπλα σας με όλες τις ενεργειακές λύσεις για το σπίτι και την επιχείρησή σας.
          Συγκρίνουμε και βρίσκουμε μαζί τον φθηνότερο πάροχο — για όλη την Ελλάδα.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a href="#lead" className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-lg hover:shadow-xl hover:shadow-sky-500/30 transition-all hover:scale-105">
            Δες τις Λύσεις <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href={`tel:${PHONE.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full glass-card text-slate-800 font-semibold text-lg hover:bg-white/80 transition-all">
            <Phone className="w-5 h-5 text-sky-500" /> {PHONE}
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-slate-500">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-500" /> 100% Δωρεάν Υπηρεσία</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-sky-500" /> 7 Εργάσιμες για Αλλαγή</span>
          <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-sky-500" /> 24/7 Υποστήριξη</span>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400">
        <span className="text-xs uppercase tracking-widest">Κύλιση για ταξίδι στην Ελλάδα</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </div>
    </section>
  );
}

/* ============================== Stats ============================== */
function Stats() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const stats = [
    { value: '100%', label: 'Δωρεάν Υπηρεσία' },
    { value: '7', label: 'Εργάσιμες για Αλλαγή' },
    { value: '24/7', label: 'Υποστήριξη' },
    { value: '18+', label: 'Πάροχοι σε όλη την Ελλάδα' },
  ];
  return (
    <section className="relative py-16 z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={ref} className={`glass-card rounded-3xl p-8 md:p-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center group">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-sky-500 to-blue-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">{s.value}</div>
                <div className="text-sm text-slate-500 mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== Greece Journey with Satellite Map ============================== */
function GreeceJourney() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [activeStop, setActiveStop] = useState(0);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const customIcon = useMemo(() => L.divIcon({ className: 'custom-marker', html: '<div class="marker-pulse"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), []);
  const activeIcon = useMemo(() => L.divIcon({ className: 'custom-marker', html: '<div class="marker-pulse marker-active"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [39.5, 23.5], zoom: 6, zoomControl: true, attributionControl: true,
      scrollWheelZoom: false, dragging: true, doubleClickZoom: true, boxZoom: false, keyboard: false,
    });
    // Esri World Imagery — real satellite tiles
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
      maxZoom: 18,
    }).addTo(map);
    JOURNEY_STOPS.forEach((stop) => {
      const marker = L.marker([stop.lat, stop.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<div style="font-weight:600;color:#fff;background:rgba(15,23,42,0.8);padding:6px 10px;border-radius:8px;backdrop-filter:blur(8px);">${stop.name}</div><div style="color:#94a3b8;font-size:12px;margin-top:4px;">${stop.subtitle}</div>`);
      markersRef.current.push(marker);
    });
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);
    return () => { map.remove(); mapRef.current = null; markersRef.current = []; };
  }, [customIcon]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = sectionRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const start = rect.top - window.innerHeight;
        const total = rect.height + window.innerHeight;
        const p = Math.max(0, Math.min(1, -start / total));
        setProgress(p);
        const newActive = Math.min(JOURNEY_STOPS.length - 1, Math.floor(p * JOURNEY_STOPS.length));
        setActiveStop(newActive);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    markersRef.current.forEach((marker, i) => marker.setIcon(i === activeStop ? activeIcon : customIcon));
    const stop = JOURNEY_STOPS[activeStop];
    if (stop) map.flyTo([stop.lat, stop.lng], 7, { duration: 1.2, easeLinearity: 0.25 });
  }, [activeStop, activeIcon, customIcon]);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-4">
            <Navigation className="w-4 h-4 text-sky-500" />
            <span className="text-sm text-slate-700 font-medium">Το ταξίδι μας σε όλη την Ελλάδα</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-slate-900">
            Κύλιση · <span className="bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">Ταξίδι στην Ελλάδα</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Καθώς κυλάτε προς τα κάτω, ταξιδεύουμε σε κάθε γωνιά της Ελλάδας — δορυφορική ζωντανή εικόνα.
          </p>
        </div>
        <div className="relative grid lg:grid-cols-[1fr_380px] gap-8 items-start perspective-container">
          <div className="relative rounded-3xl glass-card overflow-hidden" style={{ minHeight: '500px' }}>
            <div ref={mapContainerRef} className="w-full h-[500px] lg:h-[600px] rounded-3xl" />
            <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
              transform: `perspective(1000px) rotateX(${Math.min(progress * 8, 4)}deg)`,
              transformOrigin: 'center bottom',
              boxShadow: progress > 0.1 ? 'inset 0 60px 80px -40px rgba(255,255,255,0.2)' : 'none',
            }} />
            <div className="absolute bottom-4 left-4 right-4 glass-card rounded-2xl p-3 flex items-center gap-3 z-[1000]">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">Πρόοδος</span>
              <div className="flex-1 h-2 rounded-full bg-slate-200/60 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300 rounded-full" style={{ width: `${progress * 100}%` }} />
              </div>
              <span className="text-xs text-sky-600 font-mono font-bold">{Math.round(progress * 100)}%</span>
            </div>
          </div>
          <div className="lg:sticky lg:top-28 space-y-3">
            {JOURNEY_STOPS.map((stop, i) => (
              <div key={i} className={`p-4 rounded-2xl border transition-all duration-500 ${
                i === activeStop ? 'glass-card border-sky-400/50 scale-105 shadow-lg shadow-sky-500/10'
                  : i < activeStop ? 'bg-white/40 border-slate-200/60 opacity-60'
                  : 'bg-transparent border-slate-200/40 opacity-40'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i <= activeStop ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30' : 'bg-slate-200 text-slate-400'
                  }`}>{i + 1}</div>
                  <div>
                    <div className="font-semibold text-slate-900">{stop.name}</div>
                    <div className="text-sm text-slate-500">{stop.subtitle}</div>
                  </div>
                  {i < activeStop && <CheckCircle2 className="w-4 h-4 text-sky-500 ml-auto" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== People Section ============================== */
function PeopleSection() {
  const { ref, progress } = useElementScrollProgress();
  return (
    <section className="relative py-24 md:py-32 z-10">
      <div ref={ref} className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-4">
            <Users className="w-4 h-4 text-sky-500" />
            <span className="text-sm text-slate-700 font-medium">Ζωντανή Ενέργεια</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-slate-900">
            Πραγματικοί άνθρωποι, <span className="bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">πραγματική εξοικονόμηση</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Δίπλα σε κάθε νοικοκυριό, κάθε επιχείρηση, κάθε επαγγελματία — σε όλη την Ελλάδα.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {PEOPLE.map((p, i) => {
            const dir = i === 0 ? -1 : i === 2 ? 1 : 0;
            const slideIn = dir !== 0 ? `translateX(${dir * (1 - progress) * 80}px)` : `translateY(${(1 - progress) * 40}px)`;
            const cardOpacity = Math.min(1, progress * 2 - i * 0.2);
            return (
              <div key={i} className="group relative rounded-3xl glass-card overflow-hidden transition-all duration-700 hover:-translate-y-2"
                style={{ transform: `perspective(1000px) rotateY(${dir * 2}deg) ${slideIn}`, opacity: cardOpacity }}>
                <div className="relative h-80 overflow-hidden">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/80 backdrop-blur-md flex items-center justify-center shadow-lg">
                    <p.icon className="w-5 h-5 text-sky-600" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-white font-bold text-lg">{p.name}</div>
                    <div className="text-sky-300 text-sm">{p.role}</div>
                  </div>
                </div>
                <div className="p-6">
                  <Quote className="w-8 h-8 text-sky-200 mb-3" />
                  <p className="text-slate-600 leading-relaxed italic">{p.quote}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================== Showcase: Homes & Businesses ============================== */
function ShowcaseSection() {
  const { ref, progress } = useElementScrollProgress();
  return (
    <section className="relative py-24 md:py-32 z-10 bg-gradient-to-b from-transparent via-sky-50/30 to-transparent">
      <div ref={ref} className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-4">
            <Home className="w-4 h-4 text-sky-500" />
            <span className="text-sm text-slate-700 font-medium">Σπίτια · Επιχειρήσεις · Ανανεώσιμες</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-slate-900">
            Για κάθε <span className="bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">χώρο ζωής</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Από το ελληνικό σπίτι με τα μπλε στόρια μέχρι την επιχείρηση και τα φωτοβολταϊκά — παντούpresent.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-8">
          {SHOWCASE.map((s, i) => {
            const isLeft = i % 2 === 0;
            const slide = isLeft ? -(1 - progress) * 60 : (1 - progress) * 60;
            const cardOpacity = Math.min(1, progress * 2.5 - i * 0.3);
            const tilt = isLeft ? -3 : 3;
            return (
              <div key={i} className="group relative rounded-3xl glass-card overflow-hidden transition-all duration-700 hover:shadow-2xl hover:shadow-sky-500/10"
                style={{ transform: `perspective(1000px) rotateY(${tilt}deg) translateX(${slide}px)`, opacity: cardOpacity }}>
                <div className="relative h-72 overflow-hidden">
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-md flex items-center justify-center shadow-lg">
                    <s.icon className="w-6 h-6 text-sky-600" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-slate-900">{s.title}</h3>
                  <p className="text-slate-500 mb-4">{s.desc}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200/50 text-sky-600 text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> {s.stats}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================== About ============================== */
function About() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section id="about" className="relative py-24 md:py-32 z-10">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-6">
            <Users className="w-4 h-4 text-sky-500" />
            <span className="text-sm text-slate-700 font-medium">Ποιοι Είμαστε</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-slate-900">
            Ο προσωπικός σου <span className="bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">σύμβουλος ενέργειας</span>
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Είμαστε μια ομάδα εξειδικευμένων ενεργειακών συμβούλων, αφοσιωμένοι στη δημιουργία αξίας
            και ασφάλειας για τους πελάτες μας. Στόχος μας είναι η παροχή ολοκληρωμένων ενεργειακών
            λύσεων που θα ικανοποιούν πλήρως τις ανάγκες και τις προσδοκίες σας.
          </p>
          <p className="text-slate-500 leading-relaxed mb-8">
            Διασφαλίζουμε ότι κάθε πελάτης έχει τον δικό του ατομικό σύμβουλο ενέργειας, ο οποίος
            παρέχει εξατομικευμένες υπηρεσίες καθ' όλη τη διάρκεια της συνεργασίας.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'Εξατομικευμένη Φροντίδα', desc: 'Ατομικός σύμβουλος για κάθε πελάτη.' },
              { icon: ShieldCheck, title: 'Αξιοπιστία & Σιγουριά', desc: 'Σταθερή έκπτωση από την πρώτη μέρα.' },
              { icon: TrendingDown, title: 'Άμεση Εξοικονόμηση', desc: 'Αποφυγή Ρήτρας Αναπροσαρμογής.' },
            ].map((v, i) => (
              <div key={i} className="group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 border border-sky-200/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <v.icon className="w-6 h-6 text-sky-600" />
                </div>
                <h4 className="font-semibold mb-1 text-slate-900">{v.title}</h4>
                <p className="text-sm text-slate-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={`relative perspective-container transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-200/40 to-blue-200/30 blur-3xl rounded-full" />
          <div className="relative glass-card rounded-3xl p-8 perspective-card" style={{ transform: 'perspective(1000px) rotateY(-5deg)' }}>
            <div className="aspect-square rounded-2xl overflow-hidden relative">
              <img src={AERIAL_KERKIRA} alt="Ελληνικά νησιά από ψηλά" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-900/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-4 shadow-2xl shadow-sky-500/30">
                  <Zap className="w-10 h-10 text-white" fill="white" />
                </div>
                <div className="text-5xl font-bold text-white drop-shadow-lg">100%</div>
                <div className="text-sky-200 text-sm mt-2 uppercase tracking-widest font-semibold drop-shadow">Δωρεάν Συμβουλευτική</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== Services ============================== */
function Services({ services }: { services: typeof SERVICES }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section id="services" className="relative py-24 md:py-32 z-10 bg-gradient-to-b from-transparent via-sky-50/40 to-transparent">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-4">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span className="text-sm text-slate-700 font-medium">Ολοκληρωμένες Λύσεις</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-slate-900">
            Για το σπίτι και την <span className="bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">επιχείρηση</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Ολοκληρωμένες ενεργειακές λύσεις προσαρμοσμένες στις δικές σου ανάγκες.</p>
        </div>
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <div key={i} className={`group relative p-8 rounded-2xl glass-card hover:border-sky-300/60 transition-all duration-700 hover:-translate-y-2 overflow-hidden perspective-card ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`} style={{ transitionDelay: `${i * 100}ms` }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-lg`}>
                <s.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="relative text-2xl font-bold mb-3 text-slate-900">{s.title}</h3>
              <p className="relative text-slate-500 mb-6">{s.desc}</p>
              <a href="#lead" className="relative inline-flex items-center gap-2 text-sky-600 text-sm font-semibold group-hover:gap-3 transition-all">
                Δες περισσότερα <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== Provider Coverage ============================== */
function ProviderCoverage({ regions }: { regions: string[] }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section id="providers" className="relative py-24 md:py-32 z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-4">
            <MapPin className="w-4 h-4 text-sky-500" />
            <span className="text-sm text-slate-700 font-medium">Κάλυψη σε όλη την Ελλάδα</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-slate-900">
            Πάροχοι για <span className="bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">όλη την χώρα</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Συνεργαζόμαστε με όλους τους μεγάλους παρόχους ενέργειας στην Ελλάδα.
          </p>
        </div>
        <div ref={ref} className={`flex flex-wrap justify-center gap-3 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          {regions.map((r, i) => (
            <div key={i} className="px-5 py-3 rounded-full glass-card hover:border-sky-300/60 transition-all text-sm font-medium group cursor-default text-slate-700"
              style={{ transitionDelay: `${i * 50}ms` }}>
              <MapPin className="w-4 h-4 inline mr-2 text-sky-500/70 group-hover:text-sky-500" />{r}
            </div>
          ))}
        </div>
        <div className="mt-16 grid md:grid-cols-4 gap-4">
          {[
            { label: 'Πάροχοι Ρεύματος', value: '8+' },
            { label: 'Πάροχοι Αερίου', value: '4+' },
            { label: 'Φωτοβολταϊκά', value: '3+' },
            { label: 'Φόρτιση EV', value: '3+' },
          ].map((s, i) => (
            <div key={i} className="text-center p-6 rounded-2xl glass-card">
              <div className="text-3xl font-bold text-sky-600">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== Comparison ============================== */
function Comparison() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section id="compare" className="relative py-24 md:py-32 z-10 bg-gradient-to-b from-transparent via-sky-50/40 to-transparent">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-4">
            <TrendingDown className="w-4 h-4 text-sky-500" />
            <span className="text-sm text-slate-700 font-medium">Ενέργεια Σήμερα</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-slate-900">
            Βρες τον <span className="bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">φθηνότερο πάροχο</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Συγκρίνουμε τιμές, εκπτώσεις και ρήτρες από όλους τους παρόχους της ελληνικής αγοράς.</p>
        </div>
        <div ref={ref} className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Βασικό Πλάνο', price: '0,143€', unit: '/kWh', features: ['Σταθερή τιμή', 'Χωρίς ρήτρα', '7 ημέρες ενεργοποίηση'], highlight: false },
            { name: 'Έξυπνο Πλάνο', price: '0,128€', unit: '/kWh', features: ['Έκπτωση έως 20%', 'Εξατομίκευση κατανάλωσης', 'Δωρεάν συμβουλευτική', '24/7 υποστήριξη'], highlight: true },
            { name: 'Επιχειρηματικό', price: 'Προσφορά', unit: '', features: ['Αποφυγή ρήτρας', 'Σταθερή έκπτωση', 'Εξωτερικός συνεργάτης'], highlight: false },
          ].map((p, i) => (
            <div key={i} className={`relative p-8 rounded-2xl transition-all duration-700 perspective-card ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            } ${p.highlight ? 'glass-card border-sky-400/50 scale-105 shadow-xl shadow-sky-500/15' : 'glass-card'}`}
              style={{ transitionDelay: `${i * 120}ms` }}>
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-xs font-semibold text-white shadow-lg">Πιο δημοφιλές</div>
              )}
              <h3 className="text-xl font-bold mb-2 text-slate-900">{p.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold bg-gradient-to-b from-slate-900 to-slate-500 bg-clip-text text-transparent">{p.price}</span>
                <span className="text-slate-400 text-sm ml-1">{p.unit}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <a href="#lead" className={`block w-full py-3 rounded-full text-center font-semibold transition-all ${
                p.highlight ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:shadow-lg hover:shadow-sky-500/30' : 'border border-slate-200 hover:bg-sky-50 text-slate-700'
              }`}>Ξεκίνα Δωρεάν</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== Why Us ============================== */
function WhyUs() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section className="relative py-24 md:py-32 z-10">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-slate-900">
          Γιατί να μας <span className="bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">επιλέξεις</span>
        </h2>
        <div ref={ref} className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Users, title: 'Εξατομικευμένη Φροντίδα', desc: 'Κάθε πελάτης έχει τον δικό του ατομικό σύμβουλο ενέργειας, με υπηρεσίες προσαρμοσμένες στις δικές του ανάγκες.' },
            { icon: ShieldCheck, title: 'Αξιοπιστία και Σιγουριά', desc: 'Επιλέγουμε προμηθευτές που προσφέρουν σταθερή έκπτωση και αξιοπιστία από την πρώτη μέρα της συνεργασίας.' },
            { icon: TrendingDown, title: 'Άμεση Εξοικονόμηση', desc: 'Από εκπτώσεις στο φυσικό αέριο μέχρι αποφυγή Ρήτρας Αναπροσαρμογής, σε βοηθάμε να εξοικονομήσεις άμεσα.' },
          ].map((v, i) => (
            <div key={i} className={`group p-8 rounded-2xl glass-card hover:border-sky-300/40 transition-all duration-700 perspective-card ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`} style={{ transitionDelay: `${i * 120}ms` }}>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 border border-sky-200/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <v.icon className="w-8 h-8 text-sky-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{v.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== FAQ ============================== */
function FAQ({ faqs }: { faqs: typeof FAQS }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-24 md:py-32 z-10 bg-gradient-to-b from-transparent via-sky-50/40 to-transparent">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-slate-900">
            Συχνές <span className="bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">Ερωτήσεις</span>
          </h2>
          <p className="text-slate-500">Όλα όσα χρειάζεται να γνωρίζεις για την αλλαγή παρόχου ενέργειας.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-2xl glass-card overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left">
                <span className="font-semibold text-lg text-slate-900">{f.q}</span>
                <ChevronDown className={`w-5 h-5 text-sky-500 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <div className={`grid transition-all duration-300 ${open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden"><p className="px-6 pb-6 text-slate-600 leading-relaxed">{f.a}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== Lead Form ============================== */
function LeadForm() {
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', service_type: 'electricity', property_type: 'home', notes: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { ref, visible } = useReveal<HTMLDivElement>();

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.phone) { setStatus('error'); setErrorMsg('Συμπλήρωσε όνομα και τηλέφωνο.'); return; }
    setStatus('loading');
    if (supabase) {
      const { error } = await supabase.from('leads').insert({
        full_name: form.full_name, phone: form.phone, email: form.email || null,
        service_type: form.service_type, property_type: form.property_type, notes: form.notes || null,
      });
      if (error) { setStatus('error'); setErrorMsg('Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.'); return; }
    }
    setStatus('success');
    setForm({ full_name: '', phone: '', email: '', service_type: 'electricity', property_type: 'home', notes: '' });
  }, [form]);

  return (
    <section id="lead" className="relative py-24 md:py-32 z-10">
      <div className="max-w-3xl mx-auto px-6">
        <div ref={ref} className={`relative glass-card rounded-3xl p-8 md:p-12 overflow-hidden transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-sky-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-200/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100/60 border border-sky-200/50 mb-4">
                <Send className="w-4 h-4 text-sky-500" />
                <span className="text-sm text-slate-700 font-medium">Ζητήστε να σας καλέσουμε</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900">
                Έτοιμος να <span className="bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">εξοικονομήσεις</span>?
              </h2>
              <p className="text-slate-500">Συμπλήρωσε τη φόρμα και ένας εξειδικευμένος σύμβουλος θα επικοινωνήσει άμεσα. 100% δωρεάν.</p>
            </div>
            {status === 'success' ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-sky-500/30">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-900">Ευχαριστούμε!</h3>
                <p className="text-slate-600 mb-6">Ένας σύμβουλος ενέργειας θα επικοινωνήσει μαζί σου άμεσα.</p>
                <button onClick={() => setStatus('idle')} className="px-6 py-3 rounded-full border border-slate-200 hover:bg-sky-50 transition-all text-slate-700">Νέα Υποβολή</button>
              </div>
            ) : (
              <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-sm text-slate-600 mb-2 font-medium">Ονοματεπώνυμο *</label>
                  <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all text-slate-900"
                    placeholder="π.χ. Γιάννης Παπαδόπουλος" />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm text-slate-600 mb-2 font-medium">Τηλέφωνο *</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all text-slate-900"
                    placeholder="π.χ. 69XXXXXXXX" />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm text-slate-600 mb-2 font-medium">Email</label>
                  <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all text-slate-900"
                    placeholder="email@example.com" />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm text-slate-600 mb-2 font-medium">Υπηρεσία</label>
                  <select value={form.service_type} onChange={e => setForm({ ...form, service_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all text-slate-900">
                    <option value="electricity">Ρεύμα</option>
                    <option value="gas">Αέριο</option>
                    <option value="solar">Φωτοβολταϊκά</option>
                    <option value="ev">Ηλεκτροκίνηση</option>
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm text-slate-600 mb-2 font-medium">Τύπος Ακινήτου</label>
                  <select value={form.property_type} onChange={e => setForm({ ...form, property_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all text-slate-900">
                    <option value="home">Σπίτι</option>
                    <option value="business">Επιχείρηση</option>
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm text-slate-600 mb-2 font-medium">Σχόλια</label>
                  <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-slate-200 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all text-slate-900"
                    placeholder="Μηνιαία κατανάλωση, Τ.Κ., κλπ." />
                </div>
                {status === 'error' && <div className="sm:col-span-2 text-red-500 text-sm">{errorMsg}</div>}
                <button type="submit" disabled={status === 'loading'}
                  className="sm:col-span-2 mt-2 flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-lg hover:shadow-xl hover:shadow-sky-500/30 transition-all disabled:opacity-60">
                  {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {status === 'loading' ? 'Αποστολή...' : 'Στείλε το αίτημα'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== Final CTA ============================== */
function FinalCTA({ onLogin }: { onLogin: () => void }) {
  return (
    <section className="relative py-24 md:py-32 z-10 bg-gradient-to-b from-transparent via-sky-50/40 to-transparent">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900">
          Έτοιμος να <span className="bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">ξεκινήσεις</span>?
        </h2>
        <p className="text-slate-500 text-lg mb-10 max-w-2xl mx-auto">
          Επικοινώνησε σήμερα με τον προσωπικό σου σύμβουλο ενέργειας και ξεκίνα να εξοικονομείς από τον πρώτο μήνα.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href={`tel:${PHONE.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-lg hover:shadow-xl hover:shadow-sky-500/30 transition-all hover:scale-105">
            <Phone className="w-5 h-5" /> {PHONE}
          </a>
          <a href="#lead" className="inline-flex items-center gap-2 px-8 py-4 rounded-full glass-card text-slate-800 font-semibold text-lg hover:bg-white/80 transition-all">
            Επικοινωνία <ArrowRight className="w-5 h-5" />
          </a>
          <button onClick={onLogin} className="text-sm text-slate-400 hover:text-sky-600 transition-colors mt-2 sm:mt-0">Σύνδεση CRM →</button>
        </div>
      </div>
    </section>
  );
}

/* ============================== Footer ============================== */
function Footer({ onLogin }: { onLogin: () => void }) {
  return (
    <footer className="relative py-16 border-t border-slate-200/60 z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Ηlektrismos<span className="text-sky-500">.gr</span></span>
            </div>
            <p className="text-slate-500 max-w-md leading-relaxed">
              Εξειδικευμένοι Σύμβουλοι Ενέργειας. Συγκρίνουμε και βρίσκουμε μαζί τον φθηνότερο πάροχο
              ενέργειας για το σπίτι και την επιχείρησή σου — σε όλη την Ελλάδα.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-slate-900">Υπηρεσίες</h4>
            <ul className="space-y-2 text-slate-500 text-sm">
              <li><a href="#services" className="hover:text-sky-600 transition-colors">Ρεύμα</a></li>
              <li><a href="#services" className="hover:text-sky-600 transition-colors">Αέριο</a></li>
              <li><a href="#services" className="hover:text-sky-600 transition-colors">Φωτοβολταϊκά</a></li>
              <li><a href="#services" className="hover:text-sky-600 transition-colors">Ηλεκτροκίνηση</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-slate-900">Επικοινωνία</h4>
            <ul className="space-y-3 text-slate-500 text-sm">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-sky-500" /> {ADDRESS}</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-sky-500" /> {PHONE}</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-sky-500" /> {EMAIL}</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <span>© {new Date().getFullYear()} Ηlektrismos.gr — Όλα τα δικαιώματα διατηρούνται.</span>
          <button onClick={onLogin} className="hover:text-sky-600 transition-colors">Σύνδεση CRM</button>
        </div>
      </div>
    </footer>
  );
}
