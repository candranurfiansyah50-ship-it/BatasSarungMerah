// 1. Inisialisasi peta berpusat di wilayah Pasongsongan, Sumenep
var map = L.map('map').setView([-6.87, 113.62], 12);

// Tambahkan basemap latar belakang peta (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// 2. Fungsi untuk menentukan warna poligon berdasarkan jumlah kasus
function getColor(jumlahKasus) {
    // Jika jumlah kasus >= 5, ubah jadi merah. Jika di bawah 5, jadi hijau.
    return jumlahKasus >= 5 ? '#FF0000' : '#008000'; 
}

// 3. Fungsi styling untuk mengatur tampilan garis dan warna isi poligon desa
function style(feature) {
    return {
        fillColor: getColor(feature.properties.jumlah_kasus), // Membaca properti jumlah_kasus dari geojson
        weight: 1.5,
        opacity: 1,
        color: 'white',       // Warna garis batas antar desa
        dashArray: '3',
        fillOpacity: 0.7      // Tingkat transparansi warna isi desa
    };
}

// 4. Memuat file pasongsongan.geojson dan menerapkannya ke peta
$.getJSON("pasongsongan.geojson", function(data) {
    L.geoJson(data, {
        style: style,
        onEachFeature: function(feature, layer) {
            // Menambahkan popup informasi saat desa diklik
            if (feature.properties) {
                layer.bindPopup(
                    "<b>Desa: </b>" + (feature.properties.nama || "-") + "<br>" +
                    "<b>Kode: </b>" + (feature.properties.kode || "-") + "<br>" +
                    "<b>Jumlah Kasus: </b>" + (feature.properties.jumlah_kasus || 0)
                );
            }
        }
    }).addTo(map);
});