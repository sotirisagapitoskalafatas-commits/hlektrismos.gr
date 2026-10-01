import { useEffect, useState } from 'react';
import { saveConsent, useConsent } from '@/lib/consent';

/* Opt-in banner: nothing optional loads until the visitor clicks "Αποδοχή".
   "Απόρριψη" is equally prominent, and the footer link reopens this panel
   so the choice can be withdrawn at any time. */
export default function ConsentBanner() {
  const { decided, choices } = useConsent();
  const [open, setOpen] = useState(false);
  const [maps, setMaps] = useState(choices.externalMedia);

  useEffect(() => {
    const show = () => { setMaps(choices.externalMedia); setOpen(true); };
    window.addEventListener('atlas:consent-open', show);
    return () => window.removeEventListener('atlas:consent-open', show);
  }, [choices.externalMedia]);

  if (decided && !open) return null;

  const done = (externalMedia: boolean) => { saveConsent({ externalMedia }); setOpen(false); };

  return (
    <div role="dialog" aria-label="Ρυθμίσεις απορρήτου" className="fixed inset-x-0 bottom-0 z-[1000] p-4">
      <div className="max-w-3xl mx-auto rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 text-sm text-slate-700">
        <p className="font-semibold text-slate-900 mb-1">Το απόρρητό σας</p>
        <p className="mb-3">
          Δεν χρησιμοποιούμε cookies παρακολούθησης ούτε εργαλεία στατιστικών. Ο δορυφορικός χάρτης της αρχικής σελίδας
          φορτώνεται από την Esri, που λαμβάνει τη διεύθυνση IP σας. Φορτώνεται μόνο αν το επιτρέψετε.{' '}
          <a href="#/privacy" className="text-sky-600 underline">Πολιτική Απορρήτου</a>
        </p>
        <label className="flex items-center gap-2 mb-4">
          <input type="checkbox" checked={maps} onChange={e => setMaps(e.target.checked)} />
          Εξωτερικοί χάρτες (Esri)
        </label>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => done(false)} className="px-4 py-2 rounded-full border border-slate-300 font-semibold hover:bg-slate-50">Απόρριψη</button>
          <button onClick={() => done(maps)} className="px-4 py-2 rounded-full border border-slate-300 font-semibold hover:bg-slate-50">Αποθήκευση επιλογών</button>
          <button onClick={() => done(true)} className="px-4 py-2 rounded-full border border-slate-300 font-semibold hover:bg-slate-50">Αποδοχή</button>
        </div>
      </div>
    </div>
  );
}
