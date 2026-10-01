/* Single source of truth for the legal pages, footer and consent banner.
   Anything marked TODO(owner) must be filled in by the business before the
   policy pages are relied on; the pages render the placeholder text visibly
   so a missing value cannot go unnoticed. */

export const COMPANY = {
  brand: 'Ηlektrismos.gr',
  legalName: 'TODO(owner): Επωνυμία νομικού προσώπου',
  vatId: 'TODO(owner): ΑΦΜ / ΔΟΥ',
  gemi: 'TODO(owner): Αριθμός ΓΕΜΗ',
  address: 'Ζαλοκώστα 8, Αθήνα Τ.Κ. 10671',
  phone: '+30 210 22 55 000',
  email: 'info@hlektrismos.gr',
  privacyEmail: 'TODO(owner): privacy@hlektrismos.gr',
  copyrightEmail: 'TODO(owner): copyright@hlektrismos.gr',
};

export const POLICY_UPDATED = '2026-10-01';

/* Third parties the code actually sends personal data to. Keep in sync with
   the code: add a row here in the same change that adds a new integration. */
export const PROCESSORS: Array<{ name: string; purpose: string; data: string; when: string }> = [
  {
    name: 'Supabase Inc. (βάση δεδομένων, αυθεντικοποίηση, αποθήκευση αρχείων)',
    purpose: 'Αποθήκευση αιτημάτων επικοινωνίας, πελατών, υποθέσεων, εγγράφων και λογαριασμών προσωπικού.',
    data: 'Όνομα, τηλέφωνο, email, σχόλια φόρμας, έγγραφα/φωτογραφίες/υπογραφές υποθέσεων, θέση GPS επισκέψεων πεδίου, διεύθυνση IP.',
    when: 'Υποβολή φόρμας και κάθε χρήση του CRM.',
  },
  {
    name: 'Vercel Inc. (φιλοξενία ιστοσελίδας)',
    purpose: 'Παράδοση της ιστοσελίδας.',
    data: 'Διεύθυνση IP, User-Agent, αρχεία καταγραφής αιτημάτων.',
    when: 'Κάθε επίσκεψη.',
  },
  {
    name: 'Esri (χαρτογραφικά πλακίδια δορυφόρου)',
    purpose: 'Εμφάνιση χάρτη στην αρχική σελίδα.',
    data: 'Διεύθυνση IP, User-Agent, περιοχή χάρτη που προβάλλεται.',
    when: 'Μόνο αφού δώσετε συγκατάθεση για «Εξωτερικούς χάρτες».',
  },
  {
    name: 'CARTO (χαρτογραφικά πλακίδια)',
    purpose: 'Χάρτης υποθέσεων στο εσωτερικό CRM.',
    data: 'Διεύθυνση IP και User-Agent του συνδεδεμένου υπαλλήλου, περιοχή χάρτη.',
    when: 'Μόνο για συνδεδεμένους υπαλλήλους στη σελίδα Χάρτης.',
  },
];
