// --- FUNGSI FORMAT MASA & TARIKH ---
export const formatTime = (time24) => {
  if (!time24) return "";
  const [h, m] = time24.split(':');
  let hours = parseInt(h, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${m} ${ampm}`;
};

export const formatTarikh = (dateString) => {
  if (!dateString) return "Sila Pilih Tarikh";
  const [y, m, d] = dateString.split('-');
  if (!y || !m || !d) return dateString;
  const date = new Date(y, m - 1, d);
  const days = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} (${days[date.getDay()]})`;
};

export const formatDateTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const days = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr12 = h % 12 || 12;
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} (${hr12}:${m} ${ampm})`;
};

// --- FUNGSI MUAT TURUN PDF UNTUK MOBILE (BLOB CONVERSION) ---
export const handleDownloadBlob = (base64Url, fileName) => {
  try {
    const parts = base64Url.split(';');
    const mime = parts[0].split(':')[1];
    const raw = window.atob(parts[1].split(',')[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    const blob = new Blob([uInt8Array], { type: mime });
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = fileName || 'Dokumen_MSR';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 200);
  } catch (error) {
    console.error("Ralat Muat Turun: ", error);
    alert("Maaf, ralat berlaku semasa memuat turun fail. Sila cuba lagi.");
  }
};

// --- DATA STATIK: SENARAI STAF ---
export const senaraiStaf = [
  "Encik Abdul Hamid bin Sakmud @ Abdullah", "Puan Adiniah Binti Muhamad Radzai", "Puan Anamary binti Madyusah",
  "Encik Andrew Bin Arih", "Encik Anzari bin Mohd Daud", "Puan Aslinah binti Aldan", "Puan Asriyani binti Seraila",
  "Encik Azryzan bin Besri", "Encik Azwie bin Jafri", "Encik Billy Anak Rejap", "Encik Darman bin Daming",
  "Puan Enceng binti Saleng Jaga", "Cik Faten Farhana binti Wong", "Puan Haslinda binti Bohari", 
  "Encik Hazrudy bin Ahmad Nasaruddin", "Encik Ibrahim bin Lamusa", "Cik Isabella Francis Xavier", 
  "Encik Ismail Bin Muin", "Encik Jaikol bin Udar", "Encik Jamludin bin Assat", "Encik Japri Bin Patomdang",
  "Puan Juraini binti Sahid", "Encik Lynn Noell Ending", "Encik Mohamad Sali bin Saleh", "Encik Mohammad Nasir bin Awang",
  "Encik Mohd Faiz Fathullah bin Ali Hassan", "Encik Mohd Hafizul bin Ibrahim Apani", "Encik Mohd Hairi bin Mohd Shah",
  "Encik Mohd Hakimin Mohd Hussin", "Encik Mohd Nur Fitri bin Jamil", "Encik Mohd Shamin bin Ahmad",
  "Encik Muhaidi bin Mohamad", "Encik Muhammad Alinafiah bin Sabril", "Encik Muhalis bin Nonchi", 
  "Cik Nadzihah binti Ahmad", "Encik Nasri bin Kipple", "Puan Nazriati binti Nasib", "Encik Nazry bin Yusof",
  "Cik Norashikin Binti Ariffin", "Cik Norashsikin binti Mohd Arsad", "Puan Norhadzla binti Abd Halim", 
  "Cik Nur Syafiqah binti Arman", "Puan Nurulizaty binti Ibrahim", "Encik Omrei bin Okong", "Encik Peter Masawa",
  "Encik Richard Joanes", "Puan Roha binti Awang Latif", "Puan Rohana binti Ahmad", "Puan Roshayati binti Mohammad",
  "Puan Rusyieni @ Wendy Binti Payah", "Cik Sakinah binti Pitungut", "Puan Satria binti Murtala", 
  "Encik Shaharul bin Abu Talib", "Tc. Johannes Belili", "Tc. Mohd Radznan bin Malek", "Tc. Mohd Sabri bin Mohd Sarif",
  "Tc. Ng Vui Chien", "Tc. Silvester bin Lawai", "Ts. Joey Eriksen Teo", "Ts. Muhammad Haziq bin Hamzah",
  "Ts. Muhammad Hifzan bin Salimun", "Ts. Nurzharfan bin Rafei Bui", "Ts. Suhaidi bin Mustar", 
  "Ts. Syed Mohd Yusri bin Syed Yusoff", "Puan Zuliza binti Roslan"
];

// --- GAYA KAD PREMIUM / PROFESIONAL ---
export const cardStyles = {
  blue: { iconText: 'text-blue-600 dark:text-blue-400', iconBorder: 'border-blue-200 dark:border-blue-500/20', glow: 'group-hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] dark:group-hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)]', topLine: 'from-transparent via-blue-500 to-transparent', hoverBg: 'group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10' },
  emerald: { iconText: 'text-emerald-600 dark:text-emerald-400', iconBorder: 'border-emerald-200 dark:border-emerald-500/20', glow: 'group-hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] dark:group-hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)]', topLine: 'from-transparent via-emerald-500 to-transparent', hoverBg: 'group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-900/10' },
  cyan: { iconText: 'text-cyan-600 dark:text-cyan-400', iconBorder: 'border-cyan-200 dark:border-cyan-500/20', glow: 'group-hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] dark:group-hover:shadow-[0_8px_30px_rgba(6,182,212,0.2)]', topLine: 'from-transparent via-cyan-500 to-transparent', hoverBg: 'group-hover:bg-cyan-50/50 dark:group-hover:bg-cyan-900/10' },
  indigo: { iconText: 'text-indigo-600 dark:text-indigo-400', iconBorder: 'border-indigo-200 dark:border-indigo-500/20', glow: 'group-hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] dark:group-hover:shadow-[0_8px_30px_rgba(99,102,241,0.2)]', topLine: 'from-transparent via-indigo-500 to-transparent', hoverBg: 'group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/10' },
  sky: { iconText: 'text-sky-600 dark:text-sky-400', iconBorder: 'border-sky-200 dark:border-sky-500/20', glow: 'group-hover:shadow-[0_8px_30px_rgba(14,165,233,0.15)] dark:group-hover:shadow-[0_8px_30px_rgba(14,165,233,0.2)]', topLine: 'from-transparent via-sky-500 to-transparent', hoverBg: 'group-hover:bg-sky-50/50 dark:group-hover:bg-sky-900/10' },
  violet: { iconText: 'text-violet-600 dark:text-violet-400', iconBorder: 'border-violet-200 dark:border-violet-500/20', glow: 'group-hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)] dark:group-hover:shadow-[0_8px_30px_rgba(139,92,246,0.2)]', topLine: 'from-transparent via-violet-500 to-transparent', hoverBg: 'group-hover:bg-violet-50/50 dark:group-hover:bg-violet-900/10' }
};