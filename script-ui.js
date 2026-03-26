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
// 2. LẮNG NGHE DỮ LIỆU (ĐỂ THÔNG NHAU)
// ==========================================

// Thông Thành Viên
database.ref('members').on('value', (snapshot) => {
    const data = snapshot.val();
    const grid = document.getElementById('memberGrid');
    if (!grid) return;
    if (!data) { grid.innerHTML = "<p style='color:#ffcc00;'>Trống.</p>"; return; }
    const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    grid.innerHTML = list.map(m => `
        <div class="member-card" style="position: relative;">
            <button onclick="deleteMember('${m.id}')" style="position: absolute; top: 5px; right: 5px; background: red; color: white; border-radius: 50%; border: none; cursor: pointer;">×</button>
            <img src="${m.img}" style="width:100px; height:100px; border-radius:50%; object-fit:cover;">
            <h3>${m.name}</h3>
            <p>Số: ${m.number}</p>
        </div>
    `).join('');
});

// Thông Album
database.ref('albums').on('value', (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('albumContainer');
    if (!container) return;
    if (!data) { container.innerHTML = "<p style='color:white;'>Chưa có album.</p>"; return; }
    const list = Object.values(data);
    container.innerHTML = list.map(a => `
        <div class="album-card" style="margin:10px; background:rgba(0,0,0,0.5); padding:10px; border-radius:10px;">
            <img src="${a.img}" style="width:100%; border-radius:5px;">
            <h4 style="color:#ffcc00; margin:5px 0;">${a.title}</h4>
            <p style="color:#ccc; font-size:12px;">${a.date}</p>
        </div>
    `).reverse().join('');
});

// Thông Áo Đấu (Phần bạn đang bị kẹt)
database.ref('jerseys').on('value', (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('jerseyContainer');
    if (!container) return;
    if (!data) { container.innerHTML = "<p style='color:white;'>Chưa có mẫu áo.</p>"; return; }
    const list = Object.values(data);
    container.innerHTML = list.map(item => `
        <div style="display: inline-block; margin: 10px;">
            <img src="${item.img}" style="width: 160px; border: 3px solid #6CABDD; border-radius: 12px; background: white; padding: 5px;">
        </div>
    `).reverse().join('');
});

// Thông Video
database.ref('videos').on('value', (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('videoContainer');
    if (!container || !data) return;
    const list = Object.values(data);
    container.innerHTML = list.map(v => {
        let videoId = v.url.includes('v=') ? v.url.split('v=')[1].split('&')[0] : v.url.split('/').pop();
        return `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${videoId}" frameborder="0" style="margin-bottom:10px; border-radius:10px;"></iframe>`;
    }).join('');
});

// ==========================================
// 3. CÁC HÀM GỬI DỮ LIỆU (TỪ ĐIỆN THOẠI)
// ==========================================

function addMember() {
    const name = document.getElementById('memName').value;
    const number = document.getElementById('memNumber').value;
    const imgInput = document.getElementById('memImg');
    if (!imgInput.files[0]) return alert("Chọn ảnh!");
    const reader = new FileReader();
    reader.onload = (e) => {
        database.ref('members').push({ name, number, img: e.target.result })
        .then(() => { alert("Xong!"); toggleAddMemberForm(); });
    };
    reader.readAsDataURL(imgInput.files[0]);
}

function addAlbum() {
    const title = document.getElementById('inputTitle').value;
    const date = document.getElementById('inputDate').value;
    const imgInput = document.getElementById('inputImage');
    if (!imgInput.files[0]) return alert("Chọn ảnh album!");
    const reader = new FileReader();
    reader.onload = (e) => {
        database.ref('albums').push({ title, date, img: e.target.result })
        .then(() => { alert("Đã tạo Album!"); document.getElementById('modalCreateAlbum').style.display='none'; });
    };
    reader.readAsDataURL(imgInput.files[0]);
}

function addJersey() {
    const imgInput = document.getElementById('jerseyImgInput');
    if (!imgInput.files[0]) return alert("Hãy chọn ảnh áo đấu!");
    const reader = new FileReader();
    reader.onload = (e) => {
        database.ref('jerseys').push({ img: e.target.result, timestamp: Date.now() })
        .then(() => { 
            alert("Đã up áo đấu!"); 
            document.getElementById('jerseyUploadArea').style.display = 'none';
        });
    };
    reader.readAsDataURL(imgInput.files[0]);
}

function addVideoLink() {
    const link = document.getElementById('inputVideoLink').value;
    if (!link) return;
    database.ref('videos').push({ url: link })
    .then(() => { alert("Đã thêm Video!"); document.getElementById('modalVideoLink').style.display='none'; });
}

// ==========================================
// 4. HÀM GIAO DIỆN (MỞ/ĐÓNG)
// ==========================================

function showTab(tabName) {
    if (tabName === 'thanh-vien') {
        document.getElementById('main-content').style.display = 'none';
        document.querySelector('.top-banner').