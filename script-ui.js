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
// 2. CÁC HÀM LẮNG NGHE (HIỂN THỊ DỮ LIỆU)
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
    const container = document.getElementById('album-list');
    if (!container) return; 
    if (!data) {
        container.innerHTML = "<p style='color:gray; text-align:center; width:100%;'>Chưa có album nào.</p>";
        return;
    }
    const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    container.innerHTML = list.map(a => `
        <div class="album-card" onclick="openAlbumDetail('${a.id}')" style="position: relative; text-align: center; background: white; border-radius: 15px; padding: 15px; display: inline-block; width: 280px; margin: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <span onclick="event.stopPropagation(); deleteData('albums/${a.id}')" style="position:absolute; top:10px; right:12px; color:#999; font-size:22px; cursor:pointer;">&times;</span>
            <img src="${a.cover || a.img}" style="width:100%; height:180px; object-fit:cover; border-radius: 12px; margin-bottom: 12px;">
            <h4 style="color: #D4A017; margin: 0 0 8px 0; font-size: 19px; font-weight: bold;">${a.title}</h4>
            <div style="color: #333; font-size: 14px; margin-bottom: 5px;">👤 Người đăng: <strong>${a.author || 'Admin'}</strong></div>
            <div style="color: #666; font-size: 13px;">📅 Ngày: ${a.date}</div>
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
            <span onclick="deleteData('jerseys/${item.id}')" style="position:absolute; top:5px; right:10px; color:rgba(0,0,0,0.4); font-size:22px; cursor:pointer; font-weight:bold; z-index:10;">&times;</span>
            <img src="${item.img}" style="width:160px; border:3px solid #6CABDD; border-radius:12px; background:white; padding:5px;">
        </div>
    `).reverse().join('');
});

// Lắng nghe Video
database.ref('videos').on('value', (s) => {
    const data = s.val();
    const container = document.getElementById('videoContainer');
    if (!container) return;
    if (!data) { container.innerHTML = "<p style='color:white;'>Chưa có video.</p>"; return; }
    const list = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    container.innerHTML = list.map(v => {
        let videoId = v.url.includes('v=') ? v.url.split('v=')[1].split('&')[0] : v.url.split('/').pop();
        return `
            <div style="margin-bottom:20px; position:relative; background:rgba(0,0,0,0.3); padding:10px; border-radius:10px;">
                <span onclick="deleteData('videos/${v.id}')" style="position:absolute; top:5px; right:15px; color:rgba(255,255,255,0.6); font-size:25px; cursor:pointer; font-weight:bold; z-index:10;">&times;</span>
                <iframe width="100%" height="210" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="border-radius:8px;"></iframe>
            </div>
        `;
    }).reverse().join('');
});

// ==========================================
// 3. CÁC HÀM XỬ LÝ (NÉN ẢNH & GỬI DỮ LIỆU)
// ==========================================

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                let width = img.width;
                let height = img.height;
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); 
            };
        };
    });
}

async function addAlbum() {
    const title = document.getElementById('inputTitle').value.trim();
    const author = document.getElementById('inputAuthor') ? document.getElementById('inputAuthor').value.trim() : "Admin";
    const date = document.getElementById('inputDate').value;
    const fileInput = document.getElementById('inputImage');
    const files = fileInput.files;

    if (!title || !author || !date || files.length === 0) return alert("Thiếu thông tin!");

    const btn = document.querySelector("#modalCreateAlbum button[onclick='addAlbum()']");
    btn.innerText = `⏳ Đang nén ${files.length} ảnh...`;
    btn.disabled = true;

    try {
        const photoPromises = [];
        for (let i = 0; i < files.length; i++) { photoPromises.push(compressImage(files[i])); }
        const allPhotos = await Promise.all(photoPromises);

        await database.ref('albums').push({
            title, author, date,
            cover: allPhotos[0],
            photos: allPhotos,
            timestamp: Date.now()
        });

        alert("✅ Thành công!");
        document.getElementById('modalCreateAlbum').style.display = 'none';
        location.reload(); 
    } catch (error) {
        alert("❌ Lỗi: " + error.message);
    }
}

function addVideoLink() {
    const input = document.getElementById('inputVideoLink');
    const link = input.value.trim();
    if (!link) return alert("Dán link Youtube!");
    database.ref('videos').push({ url: link, timestamp: Date.now() })
    .then(() => { alert("Xong!"); input.value = ""; document.getElementById('modalVideoLink').style.display='none'; });
}

// ==========================================
// 4. HÀM GIAO DIỆN
// ==========================================

function showTab(t) {
    if (t === 'thanh-vien') {
        document.getElementById('main-content').style.display = 'none';
        document.querySelector('.top-banner').style.display = 'none';
        document.querySelector('.main-heading').style.display = 'none';
        document.getElementById('thanh-vien-page').style.display = 'block';
    }
}

function goBackHome() {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.style.display = 'block';
        document.querySelector('.top-banner').style.display = 'block';
        document.querySelector('.main-heading').style.display = 'block';
        document.getElementById('album-detail-page').style.display = 'none';
        document.getElementById('thanh-vien-page').style.display = 'none';
    } else {
        location.reload();
    }
}

function openAlbumModal() { document.getElementById('modalCreateAlbum').style.display = 'block'; }
function openVideoModal() { document.getElementById('modalVideoLink').style.display = 'block'; }
function deleteData(path) {
    if(confirm("Xóa?") && prompt("Pass:") === "HGF2026") database.ref(path).remove();
}

function openAlbumDetail(albumId) {
    document.getElementById('main-content').style.display = 'none';
    document.querySelector('.top-banner').style.display = 'none';
    document.querySelector('.main-heading').style.display = 'none';
    const detailArea = document.getElementById('album-detail-page');
    detailArea.style.display = 'block';

    database.ref('albums/' + albumId).once('value', (snapshot) => {
        const album = snapshot.val();
        if (!album) return goBackHome();
        const photos = album.photos || [album.cover];
        detailArea.innerHTML = `
            <div style="background:white; padding:20px; min-height:100vh;">
                <button onclick="goBackHome()" style="padding:10px; cursor:pointer;">← Quay lại</button>
                <h2 style="color:#D4A017; text-align:right;">${album.title}</h2>
                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(250px, 1fr)); gap:15px;">
                    ${photos.map(p => `<img src="${p}" style="width:100%; border-radius:10px;">`).join('')}
                </div>
            </div>`;
    });
}