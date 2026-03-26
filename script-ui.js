// 1. Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB61v8FCk4pUVWY61W-35OBk_7mgEQWsBA",
    authDomain: "fc-hgf.firebaseapp.com",
    databaseURL: "https://fc-hgf-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fc-hgf",
    storageBucket: "fc-hgf.firebasestorage.app",
    messagingSenderId: "1057951855896",
    appId: "1:1057951855896:web:6a50e64266f8ebaf339a6d"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ==========================================
// 2. CÁC HÀM LẮNG NGHE (ĐỂ MÁY TÍNH HIỆN ẢNH)
// ==========================================

// Lắng nghe Thành Viên
database.ref('members').on('value', (s) => {
    const data = s.val();
    const grid = document.getElementById('memberGrid');
    if (!grid) return;
    if (!data) { grid.innerHTML = "<p style='color:yellow;'>Trống.</p>"; return; }
    const list = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    grid.innerHTML = list.map(m => `
        <div class="member-card" style="position:relative;">
            <button onclick="deleteData('members/${m.id}')" style="position:absolute;top:5px;right:5px;background:red;color:white;border:none;border-radius:50%;cursor:pointer;">×</button>
            <img src="${m.img}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;">
            <h3>${m.name}</h3><p>Số: ${m.number}</p>
        </div>
    `).join('');
});

// Lắng nghe Album
database.ref('albums').on('value', (s) => {
    const data = s.val();
    const container = document.getElementById('albumContainer');
    if (!container) return;
    if (!data) { container.innerHTML = "<p style='color:white;'>Chưa có album.</p>"; return; }
    const list = Object.values(data);
    container.innerHTML = list.map(a => `
        <div class="album-card" style="margin:10px;background:rgba(0,0,0,0.5);padding:10px;border-radius:10px;display:inline-block;width:250px;">
            <img src="${a.img}" style="width:100%;border-radius:5px;">
            <h4 style="color:#ffcc00;margin:5px 0;">${a.title}</h4>
            <p style="color:#ccc;font-size:12px;">${a.date}</p>
        </div>
    `).reverse().join('');
});

// Lắng nghe Áo Đấu
database.ref('jerseys').on('value', (s) => {
    const data = s.val();
    const container = document.getElementById('jerseyContainer');
    if (!container) return;
    const list = data ? Object.values(data) : [];
    container.innerHTML = list.map(item => `
        <div style="display:inline-block;margin:10px;">
            <img src="${item.img}" style="width:160px;border:3px solid #6CABDD;border-radius:12px;background:white;padding:5px;">
        </div>
    `).reverse().join('');
});
// Lắng nghe Video Kỷ Niệm
database.ref('videos').on('value', (s) => {
    const data = s.val();
    const container = document.getElementById('videoContainer');
    if (!container) return;
    if (!data) { 
        container.innerHTML = "<p style='color:white; text-align:center; width:100%;'>Chưa có video nào.</p>"; 
        return; 
    }
    const list = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    container.innerHTML = list.map(v => {
        // Tự động tách ID từ link Youtube
        let videoId = v.url.includes('v=') ? v.url.split('v=')[1].split('&')[0] : v.url.split('/').pop();
        return `
            <div style="margin-bottom:20px; position:relative;">
                <button onclick="deleteData('videos/${v.id}')" style="position:absolute; top:-10px; right:0; background:red; color:white; border:none; border-radius:50%; z-index:10; cursor:pointer;">×</button>
                <iframe width="100%" height="200" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="border-radius:10px;"></iframe>
            </div>
        `;
    }).reverse().join('');
});
// ==========================================
// 3. CÁC HÀM GỬI DỮ LIỆU (TỪ ĐIỆN THOẠI)
// ==========================================

function addMember() {
    const name = document.getElementById('memName').value;
    const number = document.getElementById('memNumber').value;
    const file = document.getElementById('memImg').files[0];
    if (!file || !name) return alert("Thiếu thông tin!");
    const r = new FileReader();
    r.onload = (e) => {
        database.ref('members').push({ name, number, img: e.target.result })
        .then(() => { alert("Đã thêm!"); toggleAddMemberForm(); });
    };
    r.readAsDataURL(file);
}

function addAlbum() {
    const title = document.getElementById('inputTitle').value;
    const date = document.getElementById('inputDate').value;
    const file = document.getElementById('inputImage').files[0];
    if (!file) return alert("Chọn ảnh album!");
    const r = new FileReader();
    r.onload = (e) => {
        database.ref('albums').push({ title, date, img: e.target.result })
        .then(() => { alert("Đã tạo Album!"); document.getElementById('modalCreateAlbum').style.display='none'; });
    };
    r.readAsDataURL(file);
}

function addJersey() {
    const file = document.getElementById('jerseyImgInput').files[0];
    if (!file) return alert("Chọn ảnh áo!");
    const r = new FileReader();
    r.onload = (e) => {
        database.ref('jerseys').push({ img: e.target.result })
        .then(() => { alert("Đã up áo!"); document.getElementById('jerseyUploadArea').style.display='none'; });
    };
    r.readAsDataURL(file);
}
// Hàm lưu Video (Dán dưới addJersey)
function addVideoLink() {
    const input = document.getElementById('inputVideoLink');
    const link = input.value.trim();
    if (!link) return alert("Hãy dán link Youtube vào!");
    
    database.ref('videos').push({ 
        url: link,
        timestamp: Date.now() 
    })
    .then(() => {
        alert("Đã thêm Video thành công!");
        document.getElementById('modalVideoLink').style.display = 'none';
        input.value = ""; // Xóa trống ô nhập
    }).catch(err => alert("Lỗi: " + err.message));
}
// ==========================================
// 4. HÀM GIAO DIỆN (MỞ/ĐÓNG)
// ==========================================
function showTab(t) {
    if (t === 'thanh-vien') {
        document.getElementById('main-content').style.display = 'none';
        document.querySelector('.top-banner').style.display = 'none';
        document.querySelector('.main-heading').style.display = 'none';
        document.getElementById('thanh-vien-page').style.display = 'block';
    }
}
function goBackHome() { location.reload(); }
function toggleAddMemberForm() {
    const f = document.getElementById('addMemberForm');
    f.style.display = (f.style.display === 'none') ? 'block' : 'none';
}
function openAlbumModal() { document.getElementById('modalCreateAlbum').style.display = 'block'; }
function openJerseyUpload() {
    const a = document.getElementById('jerseyUploadArea');
    a.style.display = (a.style.display === 'none' || a.style.display === '') ? 'block' : 'none';
}
function deleteData(path) {
    if(confirm("Xóa?") && prompt("Pass:") === "HGF2026") database.ref(path).remove();
}
// Đóng modal
if(document.getElementById('btnCloseModal')){
    document.getElementById('btnCloseModal').onclick = () => document.getElementById('modalCreateAlbum').style.display='none';
}
// Hàm mở bảng thêm Video
function openVideoModal() {
    const modal = document.getElementById('modalVideoLink');
    if (modal) modal.style.display = 'block';
}
// Hàm mở bảng thêm video
function openVideoModal() {
    const modal = document.getElementById('modalVideoLink');
    if (modal) {
        modal.style.display = 'block';
    } else {
        alert("Lỗi: Không tìm thấy bảng thêm video!");
    }
}

// Hàm gửi link video lên Firebase
function addVideoLink() {
    const input = document.getElementById('inputVideoLink');
    const link = input.value.trim();
    
    if (!link) {
        alert("Bạn chưa dán link video mà!");
        return;
    }

    database.ref('videos').push({
        url: link,
        timestamp: Date.now()
    }).then(() => {
        alert("Đã thêm video thành công!");
        document.getElementById('modalVideoLink').style.display = 'none';
        input.value = ""; // Xóa trống ô nhập
    }).catch((error) => {
        alert("Lỗi khi lưu: " + error.message);
    });
}