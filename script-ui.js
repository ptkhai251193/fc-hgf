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

// Khởi tạo nếu chưa có
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// ==========================================
// 2. CÁC HÀM LẮNG NGHE (READ DATA) - ĐỒNG BỘ MỌI THIẾT BỊ
// ==========================================

// Lắng nghe Áo đấu (Sửa lỗi khớp tên biến 'image')
database.ref('jerseys').on('value', (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('jerseyContainer');
    if (!container) return;
    
    container.innerHTML = ''; 

    if (data) {
        Object.keys(data).forEach(key => {
            const jersey = data[key];
            const div = document.createElement('div');
            div.className = 'album-card'; 
            div.style.background = 'white';
            div.style.border = '2px solid #ddd';
            div.style.margin = '10px';
            div.style.display = 'inline-block';
            div.style.width = '200px';
            
            // Dùng jersey.image (khớp với hàm push bên dưới)
            div.innerHTML = `
                <img src="${jersey.image}" style="width: 100%; height: 200px; object-fit: contain; padding: 10px;">
                <div style="text-align:center; padding-bottom: 10px;">
                    <button onclick="deleteData('jerseys/${key}')" style="background:#ff4d4d; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-size:12px;">Xóa</button>
                </div>
            `;
            container.appendChild(div);
        });
    }
});

// Lắng nghe Thành Viên
database.ref('members').on('value', (s) => {
    const data = s.val();
    const grid = document.getElementById('memberGrid');
    if (!grid) return;
    if (!data) { grid.innerHTML = "<p style='color:yellow;'>Trống.</p>"; return; }
    const list = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    grid.innerHTML = list.map(m => `
        <div class="member-card" style="position:relative; background:rgba(255,255,255,0.1); padding:15px; border-radius:15px; text-align:center;">
            <button onclick="deleteData('members/${m.id}')" style="position:absolute;top:5px;right:5px;background:red;color:white;border:none;border-radius:50%;cursor:pointer;width:25px;height:25px;">×</button>
            <img src="${m.img}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:2px solid #FFD700;">
            <h3 style="color:white; margin:10px 0 5px 0;">${m.name}</h3>
            <p style="color:#FFD700; font-weight:bold;">Số áo: ${m.number}</p>
        </div>
    `).join('');
});

// Lắng nghe Album
database.ref('albums').on('value', (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('albumContainer');
    if (!container) return;
    if (!data) { container.innerHTML = "<p style='color:white;'>Chưa có album nào.</p>"; return; }
    
    const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    container.innerHTML = list.map(a => `
        <div class="album-card" style="margin:10px; background:white; padding:0; border-radius:15px; display:inline-block; width:250px; position:relative; cursor:pointer; border:2px solid #ddd; overflow:hidden;">
            <span onclick="event.stopPropagation(); deleteData('albums/${a.id}')" style="position:absolute; top:5px; right:10px; color:red; font-size:25px; cursor:pointer; z-index:10;">&times;</span>
            <div onclick="openAlbumDetail('${a.id}')">
                <img src="${a.cover || a.photos[0]}" style="width:100%; height:160px; object-fit:cover;">
                <div style="padding:10px;">
                    <h4 style="color:#333; margin:5px 0; text-align:center;">${a.title}</h4>
                    <p style="color:#666; font-size:11px; text-align:center; margin:0;">👤 ${a.author || 'Quản trị'}</p>
                    <p style="color:#888; font-size:11px; text-align:center; margin:0;">📅 ${a.date}</p>
                </div>
            </div>
        </div>
    `).reverse().join('');
});

// Lắng nghe Video
database.ref('videos').on('value', (s) => {
    const data = s.val();
    const container = document.getElementById('videoContainer');
    if (!container) return;
    if (!data) { container.innerHTML = ""; return; }
    const list = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    container.innerHTML = list.map(v => {
        let videoId = v.url.includes('v=') ? v.url.split('v=')[1].split('&')[0] : v.url.split('/').pop();
        return `
            <div style="margin-bottom:20px; position:relative; background:rgba(0,0,0,0.3); padding:10px; border-radius:10px; width:100%; max-width:400px; display:inline-block; margin:10px;">
                <span onclick="deleteData('videos/${v.id}')" style="position:absolute; top:5px; right:15px; color:white; font-size:30px; cursor:pointer; z-index:10;">&times;</span>
                <iframe width="100%" height="210" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="border-radius:8px;"></iframe>
            </div>
        `;
    }).reverse().join('');
});

// ==========================================
// 3. CÁC HÀM GỬI DỮ LIỆU (WRITE DATA)
// ==========================================

// Sửa hàm Thêm Áo (Khớp biến image)
function addJersey() {
    const fileInput = document.getElementById('jerseyImgInput');
    const file = fileInput.files[0];
    if (!file) return alert("Hãy chọn ảnh!");
    
    const btn = document.querySelector("#jerseyUploadArea button");
    btn.innerText = "⏳ Đang tải...";
    btn.disabled = true;

    const reader = new FileReader();
    reader.onload = (e) => {
        database.ref('jerseys').push({ 
            image: e.target.result, // Lưu là 'image' cho khớp hàm load
            timestamp: Date.now() 
        })
        .then(() => { 
            alert("Đã đồng bộ mẫu áo!"); 
            btn.innerText = "Xác nhận";
            btn.disabled = false;
            fileInput.value = "";
            openJerseyUpload(); // Đóng khung nhập
        });
    };
    reader.readAsDataURL(file);
}

// Các hàm khác giữ nguyên nhưng tối ưu logic
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
    const title = document.getElementById('inputTitle').value.trim();
    const author = document.getElementById('inputAuthor').value.trim() || "Quản trị";
    const date = document.getElementById('inputDate').value;
    const files = document.getElementById('inputImage').files;

    if (!title || !date || files.length === 0) return alert("Vui lòng nhập đủ thông tin!");

    const btn = document.querySelector("#modalCreateAlbum .btn-submit");
    btn.disabled = true; btn.innerText = "⏳ Đang đồng bộ...";

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
        alert("✅ Đã đăng album lên hệ thống!");
        closeAlbumModal();
    } catch (error) { alert("Lỗi: " + error.message); }
    finally { btn.disabled = false; btn.innerText = "ĐĂNG ALBUM"; }
}

function addVideo() {
    const url = document.getElementById('videoUrl').value.trim();
    if (!url) return alert("Dán link YouTube vào!");
    database.ref('videos').push({ url, timestamp: Date.now() })
    .then(() => { alert("✅ Đã thêm video!"); closeVideoModal(); document.getElementById('videoUrl').value = ""; });
}

function deleteData(path) {
    if (prompt("Nhập mật khẩu quản trị để xóa:") === "HGF2026") {
        if (confirm("Xóa vĩnh viễn dữ liệu này trên mọi thiết bị?")) {
            database.ref(path).remove().then(() => alert("Đã xóa xong!"));
        }
    } else { alert("Sai mật khẩu!"); }
}

// Các hàm đóng mở Modal giữ nguyên như code cũ của anh
function openAlbumDetail(albumId) {
    const modal = document.getElementById('modalAlbumDetail');
    const grid = document.getElementById('photoGrid');
    database.ref('albums/' + albumId).once('value', (snapshot) => {
        const album = snapshot.val();
        if (!album) return;
        document.getElementById('detailTitle').innerText = album.title;
        document.getElementById('detailInfo').innerText = `Người đăng: ${album.author} | Ngày: ${album.date}`;
        modal.style.display = 'block';
        grid.innerHTML = album.photos.map(src => `
            <img src="${src}" onclick="viewPhoto('${src}')" style="width:100%; height:150px; object-fit:cover; border-radius:8px; cursor:pointer; border:1px solid #eee;">
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
    f.style.display = (f.style.display === 'none') ? 'block' : 'none';
}

function openAlbumModal() { document.getElementById('modalCreateAlbum').style.display = 'block'; }
function closeAlbumModal() { document.getElementById('modalCreateAlbum').style.display = 'none'; }
function openVideoModal() { document.getElementById('modalVideoLink').style.display = 'flex'; }
function closeVideoModal() { document.getElementById('modalVideoLink').style.display = 'none'; }
function openJerseyUpload() {
    const area = document.getElementById('jerseyUploadArea');
    area.style.display = (area.style.display === 'none') ? 'block' : 'none';
}