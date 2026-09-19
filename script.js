// 1. Inisialisasi Peta
const map = L.map('map').setView([-7.035, 113.640], 12);

// 2. Tambahkan Basemap OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 3. Data GeoJSON Desa (Pastikan ada properti 'jumlah_titik' di setiap feature.properties)
const dataPasongsongan = {
    "type": "FeatureCollection",
    "features": [
        // Contoh struktur data dengan properti jumlah_titik
        /*
        {
            "type": "Feature",
            "properties": { 
                "namObj": "Campaka", 
                "jumlah_titik": 6 // Contoh > 4 (akan jadi Merah)
            },
            "geometry": { ... }
        }
        */
    ]
};

// 4. Render GeoJSON dengan Kondisi Warna Berdasarkan Jumlah Titik
L.geoJSON(dataPasongsongan, {
    style: function (feature) {
        // Ambil data jumlah titik dari properti (default 0 jika tidak ada)
        const jumlahTitik = feature.properties.jumlah_titik || 0;
        
        // Logika: Merah jika > 4 titik, Hijau jika <= 4 titik
        const warnaFill = jumlahTitik > 4 ? "#e74c3c" : "#2ecc71"; // Merah vs Hijau

        return {
            color: "#34495e",      // Warna garis batas wilayah
            weight: 2,             // Ketebalan garis
            fillColor: warnaFill,  // Warna isi berdasarkan kondisi
            fillOpacity: 0.6       // Transparansi
        };
    },
    onEachFeature: function (feature, layer) {
        const jumlahTitik = feature.properties.jumlah_titik || 0;
        const statusDesa = jumlahTitik > 4 ? "Merah (Bahaya/Rawan)" : "Hijau (Aman)";

        // Tambahkan informasi pada Pop-up saat desa diklik
        layer.bindPopup(`
            <strong>Desa:</strong> ${feature.properties.namObj || 'Tidak diketahui'}<br>
            <strong>Jumlah Titik:</strong> ${jumlahTitik}<br>
            <strong>Status Wilayah:</strong> <span style="color: ${jumlahTitik > 4 ? 'red' : 'green'}; font-weight: bold;">${statusDesa}</span>
        `);

        // Efek interaktif saat kursor mendekati wilayah (Hover)
        layer.on({
            mouseover: function (e) {
                const layer = e.target;
                layer.setStyle({
                    fillOpacity: 0.8,
                    weight: 3
                });
            },
            mouseout: function (e) {
                const layer = e.target;
                layer.setStyle({
                    fillOpacity: 0.6,
                    weight: 2
                });
            }
        });
    }
}).addTo(map);