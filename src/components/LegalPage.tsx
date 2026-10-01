import { ArrowLeft } from 'lucide-react';
import { useRoute } from '@/lib/router';
import { COMPANY, POLICY_UPDATED, PROCESSORS } from '@/lib/legal';
import { usingRemoteImages } from '@/lib/media';
import { openConsentSettings } from '@/lib/consent';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-slate-900 mb-3">{title}</h2>
      <div className="space-y-3 text-slate-600 leading-relaxed">{children}</div>
    </section>
  );
}

function Privacy() {
  const processors = usingRemoteImages
    ? [...PROCESSORS, {
        name: 'Pexels (φωτογραφίες αρχικής σελίδας)',
        purpose: 'Φόρτωση εικόνων της αρχικής σελίδας.',
        data: 'Διεύθυνση IP, User-Agent.',
        when: 'Κάθε επίσκεψη στην αρχική σελίδα.',
      }]
    : PROCESSORS;
  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Πολιτική Απορρήτου</h1>
      <p className="text-sm text-slate-400 mb-8">Τελευταία ενημέρωση: {POLICY_UPDATED}</p>

      <Section title="1. Υπεύθυνος επεξεργασίας">
        <p>{COMPANY.legalName} ({COMPANY.brand}), {COMPANY.address}. {COMPANY.vatId}. {COMPANY.gemi}.</p>
        <p>Επικοινωνία για θέματα προσωπικών δεδομένων: {COMPANY.privacyEmail}</p>
      </Section>

      <Section title="2. Ποια δεδομένα συλλέγουμε και γιατί">
        <p><strong>Φόρμα «Ζητήστε να σας καλέσουμε»:</strong> ονοματεπώνυμο, τηλέφωνο, προαιρετικά email, υπηρεσία, τύπος ακινήτου και σχόλια. Τα χρησιμοποιούμε μόνο για να επικοινωνήσουμε μαζί σας σχετικά με το αίτημά σας (προσυμβατικά μέτρα κατόπιν αιτήματός σας, άρθρο 6(1)(β) ΓΚΠΔ). Δεν σας στέλνουμε διαφημιστικά μηνύματα χωρίς χωριστή, ρητή συγκατάθεσή σας.</p>
        <p><strong>Πελάτες σε εξέλιξη υπόθεσης:</strong> στοιχεία επικοινωνίας, λογαριασμοί ενέργειας, έγγραφα ταυτοποίησης, υπογραφές και φωτογραφίες που απαιτούνται για τη σύμβαση προμήθειας (άρθρο 6(1)(β) και (γ) ΓΚΠΔ).</p>
        <p><strong>Προσωπικό (χρήστες CRM):</strong> email, όνομα, ρόλος και, κατά τις επισκέψεις πεδίου, η θέση GPS τη στιγμή του check-in/check-out.</p>
        <p>Η υπηρεσία απευθύνεται σε ενήλικες. Η φόρμα δεν δέχεται υποβολές από άτομα κάτω των 18 ετών και δεν συλλέγουμε εν γνώσει μας δεδομένα παιδιών.</p>
      </Section>

      <Section title="3. Αποδέκτες / εκτελούντες την επεξεργασία">
        <p>Τα δεδομένα αποστέλλονται μόνο στους παρακάτω παρόχους:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-slate-200">
            <thead className="bg-slate-50 text-left">
              <tr><th className="p-2">Πάροχος</th><th className="p-2">Σκοπός</th><th className="p-2">Δεδομένα</th><th className="p-2">Πότε</th></tr>
            </thead>
            <tbody>
              {processors.map(p => (
                <tr key={p.name} className="border-t border-slate-200 align-top">
                  <td className="p-2 font-medium text-slate-800">{p.name}</td>
                  <td className="p-2">{p.purpose}</td>
                  <td className="p-2">{p.data}</td>
                  <td className="p-2">{p.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>Όταν ένας πάροχος βρίσκεται εκτός ΕΟΧ, η διαβίβαση γίνεται με Τυποποιημένες Συμβατικές Ρήτρες ή απόφαση επάρκειας (EU-US Data Privacy Framework). Δεν πουλάμε δεδομένα. Δεν χρησιμοποιούμε εργαλεία στατιστικών, καταγραφής συνεδρίας (session replay) ή heatmaps.</p>
      </Section>

      <Section title="4. Cookies και τοπική αποθήκευση">
        <p>Χρησιμοποιούμε μόνο τοπική αποθήκευση απολύτως απαραίτητη για τη λειτουργία (σύνδεση στο CRM, προτιμήσεις εμφάνισης, η επιλογή σας για τη συγκατάθεση). Ο δορυφορικός χάρτης της αρχικής σελίδας φορτώνεται από την Esri μόνο αν το επιτρέψετε.</p>
        <p><button onClick={openConsentSettings} className="text-sky-600 underline">Αλλαγή ή ανάκληση συγκατάθεσης</button></p>
      </Section>

      <Section title="5. Διάρκεια διατήρησης">
        <p>TODO(owner): Αιτήματα επικοινωνίας που δεν οδήγησαν σε σύμβαση διαγράφονται μετά από [__] μήνες. Φάκελοι πελατών διατηρούνται για όσο απαιτεί η φορολογική/εμπορική νομοθεσία ([__] έτη).</p>
      </Section>

      <Section title="6. Τα δικαιώματά σας">
        <p>Έχετε δικαίωμα πρόσβασης, διόρθωσης, διαγραφής, περιορισμού, φορητότητας και εναντίωσης. Στείλτε αίτημα στο {COMPANY.privacyEmail}. Μπορείτε επίσης να υποβάλετε καταγγελία στην Αρχή Προστασίας Δεδομένων Προσωπικού Χαρακτήρα (www.dpa.gr).</p>
      </Section>
    </>
  );
}

function Terms() {
  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Όροι Χρήσης</h1>
      <p className="text-sm text-slate-400 mb-8">Τελευταία ενημέρωση: {POLICY_UPDATED}</p>

      <Section title="1. Πάροχος">
        <p>{COMPANY.legalName} ({COMPANY.brand}), {COMPANY.address}, {COMPANY.email}, {COMPANY.phone}.</p>
      </Section>
      <Section title="2. Η υπηρεσία">
        <p>Η {COMPANY.brand} παρέχει δωρεάν συμβουλευτική σύγκρισης παρόχων ενέργειας. Οι τιμές της σελίδας είναι ενδεικτικές. Δεσμευτικοί είναι μόνο οι όροι της σύμβασης προμήθειας που υπογράφετε απευθείας με τον πάροχο ενέργειας, η οποία περιλαμβάνει διάρκεια, ανανέωση και τρόπο καταγγελίας.</p>
        <p>Δεν χρεώνουμε συνδρομή και δεν πραγματοποιούμε πληρωμές μέσω της ιστοσελίδας.</p>
      </Section>
      <Section title="3. Ηλικία">
        <p>Η φόρμα επικοινωνίας και οι υπηρεσίες απευθύνονται αποκλειστικά σε ενήλικες (18+).</p>
      </Section>
      <Section title="4. Εσωτερικό σύστημα CRM">
        <p>Η πρόσβαση στο CRM επιτρέπεται μόνο σε εξουσιοδοτημένο προσωπικό με λογαριασμό που δημιουργείται από τον διαχειριστή. Δεν υπάρχει δημόσια εγγραφή.</p>
      </Section>
      <Section title="5. Πνευματικά δικαιώματα και ειδοποιήσεις παραβίασης">
        <p>Το περιεχόμενο της ιστοσελίδας ανήκει στην {COMPANY.brand} ή χρησιμοποιείται με άδεια. Αν πιστεύετε ότι περιεχόμενο της ιστοσελίδας παραβιάζει δικαιώματά σας, στείλτε ειδοποίηση στο {COMPANY.copyrightEmail} με: (α) στοιχεία σας, (β) το έργο που προστατεύεται, (γ) τη διεύθυνση URL του περιεχομένου, (δ) δήλωση καλής πίστης ότι η χρήση δεν είναι εξουσιοδοτημένη και (ε) δήλωση ότι τα στοιχεία είναι ακριβή. Αφαιρούμε ή απενεργοποιούμε άμεσα το επίμαχο περιεχόμενο και ενημερώνουμε όποιον το ανάρτησε, ο οποίος μπορεί να υποβάλει αντι-ειδοποίηση. Λογαριασμοί που παραβιάζουν επανειλημμένα δικαιώματα τρίτων απενεργοποιούνται.</p>
      </Section>
      <Section title="6. Εφαρμοστέο δίκαιο">
        <p>Ελληνικό δίκαιο. Αρμόδια τα δικαστήρια Αθηνών, με την επιφύλαξη των αναγκαστικών διατάξεων προστασίας καταναλωτή.</p>
      </Section>
    </>
  );
}

export default function LegalPage({ page }: { page: 'privacy' | 'terms' }) {
  const [, navigate] = useRoute();
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <button onClick={() => navigate('landing')} className="flex items-center gap-2 text-slate-400 hover:text-slate-700 mb-8">
          <ArrowLeft className="w-4 h-4" /> Επιστροφή στην αρχική
        </button>
        {page === 'privacy' ? <Privacy /> : <Terms />}
        <div className="mt-12 pt-6 border-t border-slate-200 text-sm text-slate-500 flex gap-4">
          <a href="#/privacy" className="hover:text-sky-600">Πολιτική Απορρήτου</a>
          <a href="#/terms" className="hover:text-sky-600">Όροι Χρήσης</a>
        </div>
      </div>
    </div>
  );
}
