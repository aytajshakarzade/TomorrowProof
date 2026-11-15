// Country-level indicators are a static 2025 snapshot from the cited sources.
// City markers are approximate geographic reference points, not administrative boundaries.
export const country = {
  name: 'Azərbaycan',
  code: 'AZE',
  year: 2025,
  population: 10246996,
  urbanPopulation: 6008542,
  urbanShare: 58.64,
  ruralShare: 41.36,
  area: 86600,
  capital: 'Bakı',
  region: 'Cənubi Qafqaz',
};

export const cities = [
  { id: 'baku', name: 'Bakı', region: 'Abşeron', lat: 40.4093, lng: 49.8671, role: 'Paytaxt və əsas metropol', note: 'İctimai nəqliyyat, sahil zonası və sıx şəhər toxumasının inteqrə olunmuş planlanması.' },
  { id: 'sumgait', name: 'Sumqayıt', region: 'Abşeron', lat: 40.5855, lng: 49.6317, role: 'Sənaye və sahil şəhəri', note: 'Sənaye sahələrinin yenilənməsi, sahil əlçatanlığı və ekoloji monitorinq.' },
  { id: 'ganja', name: 'Gəncə', region: 'Qərb', lat: 40.6828, lng: 46.3606, role: 'Regional mərkəz', note: 'Regional xidmətlərin, piyada məkanlarının və ictimai nəqliyyat əlaqələrinin gücləndirilməsi.' },
  { id: 'mingachevir', name: 'Mingəçevir', region: 'Mərkəz', lat: 40.7639, lng: 47.0595, role: 'Enerji və su hövzəsi', note: 'Su hövzəsi ətrafında dayanıqlı məkan istifadəsi və iqlimə uyğunlaşma.' },
  { id: 'sheki', name: 'Şəki', region: 'Şimal-qərb', lat: 41.1919, lng: 47.1706, role: 'Tarixi və turizm mərkəzi', note: 'Tarixi irsin qorunması ilə müasir mobillik və turizm infrastrukturunun tarazlaşdırılması.' },
  { id: 'lankaran', name: 'Lənkəran', region: 'Cənub', lat: 38.7543, lng: 48.8506, role: 'Cənub regional mərkəzi', note: 'Yaşıl infrastruktur, su idarəçiliyi və iqlim dayanıqlığına diqqət.' },
  { id: 'shirvan', name: 'Şirvan', region: 'Aran', lat: 39.9320, lng: 48.9200, role: 'Aran şəhər mərkəzi', note: 'İstilik risklərinin azaldılması, kölgələnmə və ictimai məkanların yaxşılaşdırılması.' },
  { id: 'nakhchivan', name: 'Naxçıvan', region: 'Naxçıvan', lat: 39.2089, lng: 45.4122, role: 'Muxtar Respublikanın mərkəzi', note: 'Su və enerji səmərəliliyi, regional bağlantılar və kompakt şəhər inkişafı.' },
];

export const urbanSplit = [
  { name: 'Şəhər əhalisi', value: country.urbanShare, color: '#c9f36a' },
  { name: 'Kənd əhalisi', value: country.ruralShare, color: '#3f6260' },
];

export const priorities = [
  { id: 'mobility', title: 'Mobillik və əlaqəlilik', description: 'Bakı–Sumqayıt oxu və regional şəhərlər arasında ictimai nəqliyyat əlaqələrinin təhlili.', level: 'Yüksək planlama diqqəti', score: 88, color: '#c9f36a' },
  { id: 'green', title: 'Yaşıl və mavi infrastruktur', description: 'Sahil, çay və su hövzələri ilə park şəbəkələrinin vahid sistem kimi planlanması.', level: 'Yüksək planlama diqqəti', score: 82, color: '#84bda0' },
  { id: 'resilience', title: 'İqlim dayanıqlığı', description: 'İstilik adaları, yağıntı suları və sahil riskləri üzrə lokal məlumat qatlarının toplanması.', level: 'Əlavə tədqiqat', score: 74, color: '#7cb8d2' },
  { id: 'buildings', title: 'Enerji səmərəli binalar', description: 'Mövcud tikinti fondunun enerji auditi və yeni layihələrdə passiv dizayn prinsipləri.', level: 'İnkişaf istiqaməti', score: 69, color: '#d8ad75' },
];

export const sources = [
  { name: 'World Bank — Population, total (Azerbaijan)', detail: '2025: 10,246,996 nəfər', url: 'https://data.worldbank.org/indicator/SP.POP.TOTL?locations=AZ' },
  { name: 'World Bank — Urban population (Azerbaijan)', detail: '2025: 6,008,542 nəfər', url: 'https://data.worldbank.org/indicator/SP.URB.TOTL?locations=AZ' },
  { name: 'World Bank / UN DESA — Urban population share', detail: '2025: 58.64%', url: 'https://data.worldbank.org/indicator/SP.URB.TOTL.IN.ZS?locations=AZ' },
  { name: 'Azərbaycan Dövlət Statistika Komitəsi — ASIS', detail: 'Əhali statistikası üzrə rəsmi milli məlumat bazası', url: 'https://azstat.gov.az/' },
];
