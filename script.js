(function() {
    // ======================== STATE & DATA ========================
    /** @type {Array<{nama: string, qty: number, harga: number}>} */
    let items = [];

    // ======================== UTILITIES ========================
    function formatRupiah(num) {
        if (isNaN(num) || num === null) num = 0;
        return 'Rp ' + Math.round(num).toLocaleString('id-ID');
    }

    function formatNumber(num) {
        if (isNaN(num) || num === null) num = 0;
        return Math.round(num).toLocaleString('id-ID');
    }

    function formatTanggal(dateStr) {
        if (!dateStr) return '__/__/____';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return parts[2] + '/' + parts[1] + '/' + parts[0];
        }
        return dateStr;
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ======================== DOM REFERENSI ========================
    const templateSelect = document.getElementById('templateSelect');
    const fieldsRumahMakan = document.getElementById('fieldsRumahMakan');
    const fieldsApotek = document.getElementById('fieldsApotek');
    const receiptWrapper = document.getElementById('receiptWrapper');
    const receiptContent = document.getElementById('receiptContent');
    const itemsTableBody = document.getElementById('itemsTableBody');
    const emptyItemsMsg = document.getElementById('emptyItemsMsg');
    const itemsTableWrap = document.getElementById('itemsTableWrap');
    const subtotalDisplay = document.getElementById('subtotalDisplay');
    const totalAkhirDisplay = document.getElementById('totalAkhirDisplay');
    const kembalianDisplay = document.getElementById('kembalianDisplay');

    // Input fields yang perlu memicu update real-time
    const inputNamaToko = document.getElementById('namaToko');
    const inputAlamatToko = document.getElementById('alamatToko');
    const inputTelpToko = document.getElementById('telpToko');
    const inputTanggal = document.getElementById('tanggalTransaksi');
    const inputJam = document.getElementById('jamTransaksi');
    const inputNomorStruk = document.getElementById('nomorStruk');
    const inputNamaKasir = document.getElementById('namaKasir');
    const inputNomorMeja = document.getElementById('nomorMeja');
    const inputNamaPelanggan = document.getElementById('namaPelanggan');
    const inputSipaSipb = document.getElementById('sipaSipb');
    const inputNamaApoteker = document.getElementById('namaApoteker');
    const inputDiskonTipe = document.getElementById('diskonTipe');
    const inputDiskonValue = document.getElementById('diskonValue');
    const inputPpnValue = document.getElementById('ppnValue');
    const inputUangTunai = document.getElementById('uangTunai');

    // ======================== FUNGSI PERHITUNGAN ========================
    function hitungSemua() {
        const subtotal = items.reduce((sum, item) => sum + (item.qty * item.harga), 0);

        const diskonTipe = inputDiskonTipe.value;
        const diskonValue = parseFloat(inputDiskonValue.value) || 0;
        let diskonNominal = 0;
        let diskonPersen = 0;

        if (diskonTipe === 'persen') {
            diskonPersen = Math.min(diskonValue, 100);
            diskonNominal = subtotal * (diskonPersen / 100);
        } else {
            diskonNominal = Math.min(diskonValue, subtotal);
            diskonPersen = subtotal > 0 ? (diskonNominal / subtotal) * 100 : 0;
        }

        const setelahDiskon = subtotal - diskonNominal;
        const ppnPersen = parseFloat(inputPpnValue.value) || 0;
        const ppnNominal = setelahDiskon * (ppnPersen / 100);
        const totalAkhir = setelahDiskon + ppnNominal;
        const uangTunai = parseFloat(inputUangTunai.value) || 0;
        const kembalian = uangTunai - totalAkhir;

        return { subtotal, diskonTipe, diskonPersen, diskonNominal, setelahDiskon, ppnPersen, ppnNominal, totalAkhir, uangTunai, kembalian };
    }

    // ======================== UPDATE PREVIEW STRUK ========================
    function updatePreview() {
        const template = templateSelect.value;
        const namaToko = inputNamaToko.value.trim() || 'Nama Toko';
        const alamatToko = inputAlamatToko.value.trim() || '';
        const telpToko = inputTelpToko.value.trim() || '';
        const tanggalDisplay = formatTanggal(inputTanggal.value);
        const jamDisplay = inputJam.value || '__:__:__';
        const nomorStruk = inputNomorStruk.value.trim() || '-';
        const namaKasir = inputNamaKasir.value.trim() || '-';

        const nomorMeja = inputNomorMeja ? inputNomorMeja.value.trim() : '';
        const namaPelanggan = inputNamaPelanggan ? inputNamaPelanggan.value.trim() : '';
        const sipaSipb = inputSipaSipb ? inputSipaSipb.value.trim() : '';
        const namaApoteker = inputNamaApoteker ? inputNamaApoteker.value.trim() : '';

        const calc = hitungSemua();

        // Update field readonly
        subtotalDisplay.value = formatRupiah(calc.subtotal);
        totalAkhirDisplay.value = formatRupiah(calc.totalAkhir);
        kembalianDisplay.value = calc.kembalian >= 0 ? formatRupiah(calc.kembalian) : '⚠️ Uang Kurang';
        if (calc.uangTunai > 0 && calc.kembalian < 0) {
            kembalianDisplay.style.color = '#ef4444';
            kembalianDisplay.style.fontWeight = '700';
        } else if (calc.uangTunai > 0 && calc.kembalian >= 0) {
            kembalianDisplay.style.color = '#065f46';
            kembalianDisplay.style.fontWeight = '700';
        } else {
            kembalianDisplay.style.color = '';
            kembalianDisplay.style.fontWeight = '';
        }

        // Bangun HTML struk
        let html = '';
        html += `<div class="store-name">${escapeHTML(namaToko)}</div>`;
        if (alamatToko) html += `<div class="store-addr">${escapeHTML(alamatToko)}</div>`;
        if (telpToko) html += `<div class="store-telp">Telp: ${escapeHTML(telpToko)}</div>`;

        if (template === 'rumahmakan' && (nomorMeja || namaPelanggan)) {
            html += `<div style="font-size:11px; margin-top:4px;">`;
            if (nomorMeja) html += `🪑 ${escapeHTML(nomorMeja)}`;
            if (nomorMeja && namaPelanggan) html += ` | `;
            if (namaPelanggan) html += `👤 ${escapeHTML(namaPelanggan)}`;
            html += `</div>`;
        }
        if (template === 'apotek' && (sipaSipb || namaApoteker)) {
            html += `<div style="font-size:10.5px; margin-top:4px;">`;
            if (sipaSipb) html += `SIPA/SIPB: ${escapeHTML(sipaSipb)}`;
            if (sipaSipb && namaApoteker) html += `<br>`;
            if (namaApoteker) html += `Apoteker: ${escapeHTML(namaApoteker)}`;
            html += `</div>`;
        }

        html += `<hr class="dashed-line">`;
        html += `<div style="display:flex; justify-content:space-between; font-size:11px; text-align:left; gap:8px;">`;
        html += `<span>Tgl: ${tanggalDisplay}</span><span>Jam: ${jamDisplay}</span></div>`;
        html += `<div style="display:flex; justify-content:space-between; font-size:11px; text-align:left; gap:8px; margin-top:1px;">`;
        html += `<span>No: ${escapeHTML(nomorStruk)}</span><span>Kasir: ${escapeHTML(namaKasir)}</span></div>`;
        html += `<hr class="dashed-line">`;

        if (items.length > 0) {
            html += `<table class="receipt-table"><thead><tr>
                <th class="col-item">Item</th><th class="col-qty">Qty</th><th class="col-price">Harga</th><th class="col-total">Total</th>
            </tr></thead><tbody>`;
            items.forEach(item => {
                const totalItem = item.qty * item.harga;
                html += `<tr>
                    <td class="col-item">${escapeHTML(item.nama)}</td>
                    <td class="col-qty">${item.qty}</td>
                    <td class="col-price">${formatNumber(item.harga)}</td>
                    <td class="col-total">${formatNumber(totalItem)}</td>
                </tr>`;
            });
            html += `</tbody></table>`;
        } else {
            html += `<div style="text-align:center; color:#999; font-style:italic; padding:10px 0;">(Belum ada item)</div>`;
        }

        html += `<hr class="dashed-line">`;
        html += `<div class="receipt-summary">`;
        html += `<div class="sum-row"><span>Subtotal</span><span>${formatRupiah(calc.subtotal)}</span></div>`;
        if (calc.diskonNominal > 0) {
            const diskonLabel = calc.diskonTipe === 'persen' ? `Diskon (${formatNumber(calc.diskonPersen)}%)` : `Diskon`;
            html += `<div class="sum-row diskon-row"><span>${diskonLabel}</span><span>- ${formatRupiah(calc.diskonNominal)}</span></div>`;
        }
        if (calc.ppnPersen > 0) {
            html += `<div class="sum-row"><span>PPN (${formatNumber(calc.ppnPersen)}%)</span><span>+ ${formatRupiah(calc.ppnNominal)}</span></div>`;
        }
        html += `<hr class="dotted-line">`;
        html += `<div class="sum-row total-akhir"><span>TOTAL</span><span>${formatRupiah(calc.totalAkhir)}</span></div>`;
        if (calc.uangTunai > 0) {
            html += `<div class="sum-row"><span>Tunai</span><span>${formatRupiah(calc.uangTunai)}</span></div>`;
            const kembalianClass = calc.kembalian >= 0 ? 'kembalian' : 'diskon-row';
            const kembalianText = calc.kembalian >= 0 ? formatRupiah(calc.kembalian) : '⚠️ Uang Kurang ' + formatRupiah(Math.abs(calc.kembalian));
            html += `<div class="sum-row ${kembalianClass}"><span>Kembalian</span><span>${kembalianText}</span></div>`;
        }
        html += `</div>`;

        html += `<hr class="dashed-line">`;
        html += `<div class="receipt-footer">`;
        html += `<div class="thanks">🛍️ Terima Kasih</div>`;
        html += `<div style="font-size:10px; color:#777;">Barang yang sudah dibeli tidak dapat dikembalikan</div>`;
        html += `</div>`;
        html += `<div class="cut-line">-- ✂ -- potong disini -- ✂ --</div>`;

        receiptContent.innerHTML = html;
    }

    // ======================== MANAJEMEN ITEM ========================
    function renderItemsTable() {
        itemsTableBody.innerHTML = '';
        if (items.length === 0) {
            emptyItemsMsg.style.display = 'block';
            itemsTableWrap.style.display = 'none';
        } else {
            emptyItemsMsg.style.display = 'none';
            itemsTableWrap.style.display = 'block';
            items.forEach((item, i) => {
                const totalItem = item.qty * item.harga;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="text-center">${i + 1}</td>
                    <td>${escapeHTML(item.nama)}</td>
                    <td class="text-center">${item.qty}</td>
                    <td class="text-right">${formatRupiah(item.harga)}</td>
                    <td class="text-right"><strong>${formatRupiah(totalItem)}</strong></td>
                    <td class="text-center">
                        <button class="btn btn-danger btn-hapus-item" data-index="${i}" title="Hapus item ini">✕</button>
                    </td>
                `;
                itemsTableBody.appendChild(tr);
            });

            // Event listener untuk tombol hapus di dalam tabel
            document.querySelectorAll('.btn-hapus-item').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    hapusItem(index);
                });
            });
        }
    }

    function tambahItem() {
        const namaInput = document.getElementById('itemNama');
        const qtyInput = document.getElementById('itemQty');
        const hargaInput = document.getElementById('itemHarga');

        const nama = namaInput.value.trim();
        const qty = parseInt(qtyInput.value);
        const harga = parseFloat(hargaInput.value);

        if (!nama) {
            alert('⚠️ Nama item tidak boleh kosong!');
            namaInput.focus();
            return;
        }
        if (isNaN(qty) || qty <= 0) {
            alert('⚠️ Jumlah (Qty) harus berupa angka positif!');
            qtyInput.focus();
            return;
        }
        if (isNaN(harga) || harga < 0) {
            alert('⚠️ Harga satuan harus berupa angka (minimal 0)!');
            hargaInput.focus();
            return;
        }

        items.push({ nama, qty, harga });

        // Reset input
        namaInput.value = '';
        qtyInput.value = '1';
        hargaInput.value = '';
        namaInput.focus();

        renderItemsTable();
        updatePreview();
    }

    function hapusItem(index) {
        if (index >= 0 && index < items.length) {
            items.splice(index, 1);
            renderItemsTable();
            updatePreview();
        }
    }

    // ======================== TEMPLATE & AUTO-FILL ========================
    function onTemplateChange() {
        const selected = templateSelect.value;

        fieldsRumahMakan.classList.remove('active');
        fieldsApotek.classList.remove('active');

        if (selected === 'rumahmakan') {
            fieldsRumahMakan.classList.add('active');
        } else if (selected === 'apotek') {
            fieldsApotek.classList.add('active');
        }

        receiptWrapper.classList.remove('template-minimarket', 'template-apotek', 'template-rumahmakan');
        if (selected === 'minimarket') {
            receiptWrapper.classList.add('template-minimarket');
        } else if (selected === 'apotek') {
            receiptWrapper.classList.add('template-apotek');
        } else if (selected === 'rumahmakan') {
            receiptWrapper.classList.add('template-rumahmakan');
        }

        updatePreview();
    }

    function autoFillWaktu() {
        const now = new Date();
        const tahun = now.getFullYear();
        const bulan = String(now.getMonth() + 1).padStart(2, '0');
        const hari = String(now.getDate()).padStart(2, '0');
        const jam = String(now.getHours()).padStart(2, '0');
        const menit = String(now.getMinutes()).padStart(2, '0');
        const detik = String(now.getSeconds()).padStart(2, '0');

        inputTanggal.value = `${tahun}-${bulan}-${hari}`;
        inputJam.value = `${jam}:${menit}:${detik}`;
        updatePreview();
    }

    // ======================== CETAK ========================
    function cetakStruk() {
        updatePreview();
        setTimeout(() => {
            window.print();
        }, 150);
    }

    // ======================== EVENT LISTENERS ========================
    // Template select
    templateSelect.addEventListener('change', onTemplateChange);

    // Auto-fill button
    document.getElementById('btnAutoFill').addEventListener('click', autoFillWaktu);

    // Tambah item button
    document.getElementById('btnTambahItem').addEventListener('click', tambahItem);

    // Enter key pada input item (Nama, Qty, Harga)
    const itemInputs = [
        document.getElementById('itemNama'),
        document.getElementById('itemQty'),
        document.getElementById('itemHarga')
    ];
    itemInputs.forEach(inp => {
        inp.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                tambahItem();
            }
        });
    });

    // Semua input/select yang mempengaruhi preview (kecuali item inputs)
    const previewTriggerElements = [
        inputNamaToko, inputAlamatToko, inputTelpToko,
        inputTanggal, inputJam,
        inputNomorStruk, inputNamaKasir,
        inputNomorMeja, inputNamaPelanggan,
        inputSipaSipb, inputNamaApoteker,
        inputDiskonTipe, inputDiskonValue,
        inputPpnValue, inputUangTunai
    ];

    previewTriggerElements.forEach(el => {
        if (el) {
            el.addEventListener('input', updatePreview);
            if (el.tagName === 'SELECT') {
                el.addEventListener('change', updatePreview);
            }
        }
    });

    // Cetak button
    document.getElementById('btnCetak').addEventListener('click', cetakStruk);

    // ======================== INISIALISASI ========================
    function init() {
        // Auto-fill waktu saat ini
        autoFillWaktu();

        // Tambah item default
        items.push({ nama: 'Beras Premium 5kg', qty: 2, harga: 75000 });
        items.push({ nama: 'Minyak Goreng 2L', qty: 1, harga: 38000 });
        items.push({ nama: 'Gula Pasir 1kg', qty: 3, harga: 16000 });

        renderItemsTable();
        onTemplateChange(); // set tampilan awal template
        updatePreview();

        // Set uang tunai default
        inputUangTunai.value = 300000;
        updatePreview();

        console.log('✅ Generator Struk Kasir siap! Semua event terpasang.');
    }

    init();
})();
