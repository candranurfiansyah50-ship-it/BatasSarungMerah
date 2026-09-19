// Import Firebase SDK dari CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBaljRnifVqGBvM00thWpkorY3VM-owF8g",
    authDomain: "batas-sarung-merah.firebaseapp.com",
    databaseURL: "https://batas-sarung-merah-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "batas-sarung-merah",
    storageBucket: "batas-sarung-merah.firebasestorage.app",
    messagingSenderId: "243467238033",
    appId: "1:243467238033:web:ef6849be3de989c7771d30",
    measurementId: "G-SNVQ1SB461"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async function() {
    const pasongsonganCenter = [-6.930, 113.660];
    
    // Inisialisasi Peta Zona Wilayah Desa
    const mapDesa = L.map('map-desa').setView(pasongsonganCenter, 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapDesa);

    try {
        let kasusPerDesa = {}; 
        let points = [];

        // 1. Ambil data dari Firebase
        const querySnapshot = await getDocs(collection(db, "laporan_dbd"));

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            let namaDesaRaw = (data.desa || "").trim();
            let namaDesa = namaDesaRaw.replace(/^desa\s+/i, "").toLowerCase();

            if (namaDesa) {
                kasusPerDesa[namaDesa] = (kasusPerDesa[namaDesa] || 0) + 1;
            }

            const lat = parseFloat(data.latitude || data.lat);
            const lng = parseFloat(data.longitude || data.lng);

            if (!isNaN(lat) && !isNaN(lng)) {
                points.push({ lat, lng, data });
            }
        });

        // 2. Muat file GeoJSON dan render peta poligon
        const response = await fetch('pasongsongan.geojson');
        const geojsonData = await response.json();

        L.geoJson(geojsonData, {
            style: function(feature) {
                const propDesa = (feature.properties.nama_desa || feature.properties.name || "").trim();
                const namaDesaGeo = propDesa.replace(/^desa\s+/i, "").toLowerCase();
                
                const totalKasus = kasusPerDesa[namaDesaGeo] || 0;
                const isZonaMerah = totalKasus >= 5;

                return {
                    fillColor: isZonaMerah ? '#DC2626' : '#10B981',
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.55
                };
            },
            onEachFeature: function(feature, layer) {
                const propDesa = (feature.properties.nama_desa || feature.properties.name || "").trim();
                const namaDesaGeo = propDesa.replace(/^desa\s+/i, "").toLowerCase();
                
                const totalKasus = kasusPerDesa[namaDesaGeo] || 0;
                const isZonaMerah = totalKasus >= 5;
                const statusTeks = isZonaMerah ? '<span style="color: #DC2626; font-weight: bold;">ZONA MERAH</span>' : '<span style="color: #10B981; font-weight: bold;">Zona Aman</span>';

                layer.bindPopup(`
                    <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 6px;">
                        <b style="font-size: 14px; color: #0F172A;">Desa: ${propDesa}</b><br>
                        <span style="font-size: 12px; color: #64748B;">Total Kasus: <b>${totalKasus} Kasus</b></span><br>
                        <span style="font-size: 12px; margin-top: 4px; display: block;">Status: ${statusTeks}</span>
                    </div>
                `);
            }
        }).addTo(mapDesa);

        // 3. Render Titik Koordinat Kasus (Marker)
        points.forEach((p) => {
            const marker = L.circleMarker([p.lat, p.lng], {
                radius: 8,
                color: '#ffffff',
                weight: 2,
                fillColor: '#E11D48', 
                fillOpacity: 1
            }).addTo(mapDesa);

            marker.bindPopup(`
                <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; min-width: 180px;">
                    <b style="font-size: 13px; color: #0F172A;"><i class="fa-solid fa-bed-pulse" style="color:#E11D48;"></i> Titik Kasus DBD</b><br>
                    <hr style="margin: 4px 0; border:0; border-top:1px solid #eee;">
                    <span style="font-size: 11px; color: #334155;"><b>Pasien:</b> ${p.data.namaPasien || '-'}</span><br>
                    <span style="font-size: 11px; color: #334155;"><b>Desa:</b> ${p.data.desa || '-'}</span><br>
                    <span style="font-size: 11px; color: #64748B;"><b>Info:</b> ${p.data.catatan || p.data.keterangan || 'Tidak ada catatan'}</span><br>
                    <div style="margin-top: 8px;">
                        <a href="jadwal.html?cari=${encodeURIComponent(p.data.namaPasien || '')}" target="_blank" style="background: #E11D48; color: white; padding: 5px 10px; font-size: 10px; font-weight: bold; border-radius: 6px; text-decoration: none; display: inline-block; text-align: center; width: 100%;">
                            <i class="fa-solid fa-user-shield"></i> Lihat Data Lengkap di Admin
                        </a>
                    </div>
                </div>
            `);
        });

    } catch (error) {
        console.error("Gagal memuat data dari Firebase atau GeoJSON:", error);
    }
});

window.toggleMobileMenu = function() {
    document.getElementById('mobile-menu').classList.toggle('hidden');
}