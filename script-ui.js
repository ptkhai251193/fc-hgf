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
// 2. CÁC HÀM LẮNG NGHE (READ DATA)
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
database.ref('albums').on('value', (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('albumContainer');
    if (!container || !data) {
        if (container) container.innerHTML = "<p style='color:white;'>Chưa có album nào.</p>";
        return;
    }
    const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    container.innerHTML = list.map(a => `
        <div class="album-card" style="margin:10px; background:rgba(0,0,0,0.5); padding:10px; border-radius:10px; display:inline-block; width:250px; position:relative; cursor:pointer;">
            <span onclick="event.stopPropagation(); deleteData('albums/${a.id}')" style="position:absolute; top:5px; right:10px; color:white; font-size:22px; cursor:pointer;">&times;</span>
            <div onclick="openAlbumDetail('${a.id}')">
                <img src="${a.cover || a.img}" style="width:100%; border-radius:5px; height:150px; object-fit:cover;">
                <h4 style="color:#ffcc00; margin:5px 0; text-align:center;">${a.title}</h4>
                <p style="color:#fff; font-size:11px; text-align:center; margin:0;">👤 ${a.author || 'Ẩn danh'}</p>
                <p style="color:#ccc; font-size:11px; text-align:center; margin:0;">📅 ${a.date}</p>
            </div>
        </div>
    `).reverse().join('');
});

// Lắng nghe Áo Đấu
database.ref('jerseys').on('value', (s) => {
    const data = s.val();
    const container = document.getElementById('jerseyContainer');
    if (!container) return;
    if (!data) { container.innerHTML = "<p style='color:white;'>Trống.</p>"; return; }
    const list = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    container.innerHTML = list.map(item => `
        <div style="display:inline-block; margin:10px; position:relative;">
            <span onclick="deleteData('jerseys/${item.id}')" style="position:absolute; top:5px; right:10px; color:red; font-size:22px; cursor:pointer;">&times;</span>
            <img src="${item.img}" style="width:160px; border:3px solid #6CABDD; border-radius:12px; background:white; padding:5px;">
        </div>
    `).reverse().join('');
});

// Lắng nghe Video
database.ref('videos').on('value', (s) => {
    const data = s.val();
    const container = document.getElementById('videoContainer');
    if (!container || !data) return;
    const list = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    container.innerHTML = list.map(v => {
        let videoId = v.url.includes('v=') ? v.url.split('v=')[1].split('&')[0] : v.url.split('/').pop();
        return `
            <div style="margin-bottom:20px; position:relative; background:rgba(0,0,0,0.3); padding:10px; border-radius:10px;">
                <span onclick="deleteData('videos/${v.id}')" style="position:absolute; top:5px; right:15px; color:white; font-size:25px; cursor:pointer;">&times;</span>
                <iframe width="100%" height="210" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="border-radius:8px;"></iframe>
            </div>
        `;
    }).reverse().join('');
});

// ==========================================
// 3. CÁC HÀM GỬI DỮ LIỆU (WRITE DATA)
// ==========================================

function addMember() {
    const name = document.getElementById('memName').value;
    const number = document.getElementById('memNumber').value;
    const file = document.getElementById('memImg').files[0];
    if (!file || !name) return alert("Thiếu thông tin!");
    const r = new FileReader();
    r.onload = (e) => {
        database.ref('members').push({ name, number, img: e.target.result })
        .then(() => { alert("Đã thêm thành viên!"); toggleAddMemberForm(); });
    };
    r.readAsDataURL(file);
}

async function addAlbum() {
    const titleInput = document.getElementById('inputTitle');
    const authorInput = document.getElementById('inputAuthor');
    const dateInput = document.getElementById('inputDate');
    const fileInput = document.getElementById('inputImage');

    const title = titleInput.value.trim();
    const author = authorInput ? authorInput.value.trim() : "Ẩn danh";
    const date = dateInput.value;
    const files = fileInput.files;

    if (!title || !date || files.length === 0) return alert("Vui lòng nhập đủ thông tin!");

    const btn = document.querySelector("#modalCreateAlbum .btn-submit");
    if(btn) { btn.disabled = true; btn.innerText = "⏳ Đang tải..."; }

    try {
        const photoPromises = Array.from(files).map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        });

        const allPhotos = await Promise.all(photoPromises);
        await database.ref('albums').push({
            title, author, date,
            cover: allPhotos[0],
            photos: allPhotos,
            timestamp: Date.now()
        });
        alert("✅ Đã đăng album!");
        closeAlbumModal();
    } catch (error) { alert("Lỗi: " + error.message); }
    finally { if(btn) { btn.disabled = false; btn.innerText = "ĐĂNG ALBUM"; } }
}

function addJersey() {
    const fileInput = document.getElementById('jerseyImgInput');
    const file = fileInput.files[0];
    if (!file) return alert("Hãy chọn ảnh!");
    const reader = new FileReader();
    reader.onload = (e) => {
        database.ref('jerseys').push({ img: e.target.result, timestamp: Date.now() })
        .then(() => { alert("Đã thêm áo!"); openJerseyUpload(); });
    };
    reader.readAsDataURL(file);
}

function addVideo() {
    const urlInput = document.getElementById('videoUrl');
    const url = urlInput ? urlInput.value.trim() : "";
    if (!url) return alert("Dán link YouTube vào!");
    database.ref('videos').push({ url, timestamp: Date.now() })
    .then(() => { alert("✅ Đã thêm video!"); closeVideoModal(); });
}

// ==========================================
// 4. ĐIỀU KHIỂN GIAO DIỆN (UI CONTROL)
// ==========================================

function deleteData(path) {
    if (prompt("Nhập mật khẩu quản trị:") === "HGF2026") {
        if (confirm("Xóa vĩnh viễn dữ liệu này?")) {
            database.ref(path).remove().then(() => alert("Đã xóa!"));
        }
    } else { alert("Sai mật khẩu!"); }
}

function openAlbumDetail(albumId) {
    const modal = document.getElementById('modalAlbumDetail');
    const grid = document.getElementById('photoGrid');
    database.ref('albums/' + albumId).once('value', (snapshot) => {
        const album = snapshot.val();
        if (!album) return;
        document.getElementById('detailTitle').innerText = album.title;
        modal.style.display = 'block';
        grid.innerHTML = album.photos.map(src => `
            <img src="${src}" onclick="viewPhoto('${src}')" style="width:100%; height:120px; object-fit:cover; border-radius:8px; cursor:pointer;">
        `).join('');
    });
}

function viewPhoto(src) {
    const viewer = document.getElementById('photoViewer');
    document.getElementById('fullPhoto').src = src;
    viewer.style.display = 'flex';
}

function toggleAddMemberForm() {
    const f = document.getElementById('addMemberForm');
    if(f) f.style.display = (f.style.display === 'none') ? 'block' : 'none';
}

function openAlbumModal() { document.getElementById('modalCreateAlbum').style.display = 'block'; }
function closeAlbumModal() { document.getElementById('modalCreateAlbum').style.display = 'none'; }
function openVideoModal() { document.getElementById('modalVideoLink').style.display = 'flex'; }
function closeVideoModal() { document.getElementById('modalVideoLink').style.display = 'none'; }
function openJerseyUpload() {
    const area = document.getElementById('jerseyUploadArea');
    area.style.display = (area.style.display === 'none') ? 'block' : 'none';
}