// ==========================================
// 1. CẤU HÌNH FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyB61v8FCk4pUVWY61W-35OBk_7mgEQWsBA",
    authDomain: "fc-hgf.firebaseapp.com",
    databaseURL: "https://fc-hgf-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fc-hgf",
    storageBucket: "fc-hgf.firebasestorage.app",
    messagingSenderId: "1057951855896",
    appId: "1:1057951855896:web:6a50e64266f8ebaf339a6d"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// ==========================================
// 2. CÁC HÀM LẮNG NGHE (ĐỒNG BỘ DỮ LIỆU)
// ==========================================

// Lắng nghe Áo đấu
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
            div.style = 'background:white; border:2px solid #ddd; margin:10px; display:inline-block; width:150px; border-radius:10px; overflow:hidden;';
            div.innerHTML = `
                <img src="${jersey.image || jersey.img}" style="width: 100%; height: 150px; object-fit: contain; padding: 5px;">
                <div style="text-align:center; padding-bottom: 5px;">
                    <button onclick="deleteData('jerseys/${key}')" style="color:red; border:none; background:none; cursor:pointer; font-size:11px;">Xóa</button>
                </div>`;
            container.appendChild(div);
        });
    }
});

// Lắng nghe Thành Viên, Album, Video (Giữ nguyên logic của anh nhưng tối ưu)
database.ref('members').on('value', (s) => {
    const data = s.val();
    const grid = document.getElementById('memberGrid');
    if (!grid) return;
    grid.innerHTML = data ? Object.keys(data).map(k => `
        <div class="member-card" style="position:relative; background:rgba(255,255,255,0.1); padding:15px; border-radius:15px; text-align:center;">
            <button onclick="deleteData('members/${k}')" style="position:absolute;top:5px;right:5px;background:red;color:white;border:none;border-radius:50%;width:25px;height:25px;">×</button>
            <img src="${data[k].img}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:2px solid #FFD700;">
            <h3 style="color:white; margin:10px 0 5px 0;">${data[k].name}</h3>
            <p style="color:#FFD700; font-weight:bold;">Số áo: ${data[k].number}</p>
        </div>`).join('') : "";
});

database.ref('albums').on('value', (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('albumContainer');
    if (!container || !data) return;
    container.innerHTML = Object.keys(data).map(key => `
        <div class="album-card" style="margin:10px; background:white; border-radius:15px; display:inline-block; width:250px; position:relative; border:2px solid #ddd; overflow:hidden;">
            <span onclick="event.stopPropagation(); deleteData('albums/${key}')" style="position:absolute; top:5px; right:10px; color:red; font-size:25px; cursor:pointer; z-index:10;">&times;</span>
            <div onclick="openAlbumDetail('${key}')">
                <img src="${data[key].cover || data[key].photos[0]}" style="width:100%; height:160px; object-fit:cover;">
                <div style="padding:10px; text-align:center;">
                    <h4 style="color:#333; margin:5px 0;">${data[key].title}</h4>
                    <p style="color:#666; font-size:11px; margin:0;">👤 ${data[key].author || 'Quản trị'} | 📅 ${data[key].date}</p>
                </div>
            </div>
        </div>`).reverse().join('');
});

database.ref('videos').on('value', (s) => {
    const data = s.val();
    const container = document.getElementById('videoContainer');
    if (!container || !data) return;
    container.innerHTML = Object.keys(data).map(k => {
        let v = data[k];
        let videoId = v.url.includes('v=') ? v.url.split('v=')[1].split('&')[0] : v.url.split('/').pop();
        return `<div style="margin:10px; position:relative; background:rgba(0,0,0,0.3); padding:10px; border-radius:10px; width:100%; max-width:400px; display:inline-block;">
                    <span onclick="deleteData('videos/${k}')" style="position:absolute; top:5px; right:15px; color:white; font-size:30px; cursor:pointer; z-index:10;">&times;</span>
                    <iframe width="100%" height="210" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="border-radius:8px;"></iframe>
                </div>`;
    }).reverse().join('');
});

// ==========================================
// 3. CÁC HÀM XỬ LÝ (MỞ MODAL & GỬI DỮ LIỆU)
// ==========================================

// Hàm quan trọng nhất cho anh: Mở bảng Thêm Áo
function openJerseyModal() {
    const modal = document.getElementById('modalJersey');
    if (modal) modal.style.display = 'block';
}

// Hàm quan trọng thứ 2: Gửi ảnh lên Firebase
function handleJerseyUpload() {
    const fileInput = document.getElementById('inputJerseyFile');
    const file = fileInput.files[0];
    if (!file) return alert("Anh Manager ơi, hãy chọn ảnh!");

    const btn = document.querySelector("#modalJersey .btn-submit");
    if(btn) { btn.innerText = "⏳ Đang đồng bộ..."; btn.disabled = true; }

    const reader = new FileReader();
    reader.onload = (e) => {
        database.ref('jerseys').push({ 
            image: e.target.result, 
            timestamp: Date.now() 
        }).then(() => {
            alert("✅ Đã đồng bộ mẫu áo!");
            if(btn) { btn.innerText = "XÁC NHẬN LƯU"; btn.disabled = false; }
            fileInput.value = "";
            document.getElementById('modalJersey').style.display = 'none';
        });
    };
    reader.readAsDataURL(file);
}

// Hàm xóa dữ liệu chung
function deleteData(path) {
    if (prompt("Nhập mật khẩu quản trị :") === "HGF2026") {
        database.ref(path).remove().then(() => alert("Đã xóa xong!"));
    } else { alert("Sai mật khẩu!"); }
}

// --- Các hàm còn lại giữ nguyên ---
function addMember() {
    const name = document.getElementById('memName').value;
    const number = document.getElementById('memNumber').value;
    const file = document.getElementById('memImg').files[0];
    if (!file || !name) return alert("Thiếu thông tin!");
    const r = new FileReader();
    r.onload = (e) => {
        database.ref('members').push({ name, number, img: e.target.result }).then(() => { alert("Xong!"); toggleAddMemberForm(); });
    };
    r.readAsDataURL(file);
}

async function addAlbum() {
    const title = document.getElementById('inputTitle').value;
    const author = document.getElementById('inputAuthor').value || "Quản trị";
    const date = document.getElementById('inputDate').value;
    const files = document.getElementById('inputImage').files;
    if (!title || !date || files.length === 0) return alert("Thiếu thông tin!");
    const photoPromises = Array.from(files).map(file => new Promise(res => {
        const r = new FileReader(); r.onload = (e) => res(e.target.result); r.readAsDataURL(file);
    }));
    const allPhotos = await Promise.all(photoPromises);
    database.ref('albums').push({ title, author, date, cover: allPhotos[0], photos: allPhotos, timestamp: Date.now() })
    .then(() => { alert("✅ Đã đăng!"); closeAlbumModal(); });
}

function addVideo() {
    const url = document.getElementById('videoUrl').value;
    if (!url) return alert("Dán link YouTube!");
    database.ref('videos').push({ url, timestamp: Date.now() }).then(() => { alert("✅ Xong!"); closeVideoModal(); });
}

// UI functions
function openAlbumDetail(id) {
    database.ref('albums/' + id).once('value', (s) => {
        const a = s.val(); if (!a) return;
        document.getElementById('detailTitle').innerText = a.title;
        document.getElementById('modalAlbumDetail').style.display = 'block';
        document.getElementById('photoGrid').innerHTML = a.photos.map(src => `<img src="${src}" onclick="viewPhoto('${src}')" style="width:100%; height:150px; object-fit:cover; border-radius:8px; cursor:pointer;">`).join('');
    });
}
function viewPhoto(src) { document.getElementById('fullPhoto').src = src; document.getElementById('photoViewer').style.display = 'flex'; }
function toggleAddMemberForm() { const f = document.getElementById('addMemberForm'); f.style.display = (f.style.display === 'none') ? 'block' : 'none'; }
function openAlbumModal() { document.getElementById('modalCreateAlbum').style.display = 'block'; }
function closeAlbumModal() { document.getElementById('modalCreateAlbum').style.display = 'none'; }
function openVideoModal() { document.getElementById('modalVideoLink').style.display = 'flex'; }
function closeVideoModal() { document.getElementById('modalVideoLink').style.display = 'none'; }