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

// --- THAY THẾ ĐOẠN LẮNG NGHE ALBUM CŨ (PHẦN 2) ---
database.ref('albums').on('value', (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('albumContainer');
    if (!container) return;

    if (!data) {
        container.innerHTML = "<p style='color:white; text-align:center; width:100%;'>Chưa có album kỷ niệm nào.</p>";
        return;
    }

    const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    
    // Vẽ giao diện Album (Có nút xóa và khu vực bấm để mở chi tiết)
    container.innerHTML = list.map(a => `
        <div class="album-card" style="margin:10px; background:rgba(0,0,0,0.5); padding:10px; border-radius:10px; display:inline-block; width:250px; position:relative; cursor:pointer;">
            <span onclick="event.stopPropagation(); deleteData('albums/${a.id}')" style="position:absolute; top:5px; right:10px; color:rgba(255,255,255,0.6); font-size:22px; cursor:pointer; font-weight:bold; z-index:10;">&times;</span>
            
            <div onclick="openAlbumDetail('${a.id}')">
                <img src="${a.cover || a.img}" style="width:100%; border-radius:5px; height:150px; object-fit:cover; border: 2px solid #555;">
            <h4 style="color:#ffcc00; margin:5px 0; text-align:center;">${a.title}</h4>
            <p style="color:#fff; font-size:11px; text-align:center; margin:0;">👤 Người đăng: ${a.author || 'Ẩn danh'}</p>
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
            <span onclick="deleteData('jerseys/${item.id}')" style="position:absolute; top:5px; right:10px; color:rgba(0,0,0,0.4); font-size:22px; cursor:pointer; font-weight:bold; z-index:10;">&times;</span>
            
            <img src="${item.img}" style="width:160px; border:3px solid #6CABDD; border-radius:12px; background:white; padding:5px;">
        </div>
    `).reverse().join('');
});
// Lắng nghe Video Kỷ Niệm
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

async function addAlbum() {
    const titleInput = document.getElementById('inputTitle');
    const authorInput = document.getElementById('inputAuthor');
    const dateInput = document.getElementById('inputDate');
    const fileInput = document.getElementById('inputImage');

    const title = titleInput ? titleInput.value.trim() : "";
    const author = authorInput ? authorInput.value.trim() : "Ẩn danh";
    const date = dateInput ? dateInput.value : "";
    const files = fileInput ? fileInput.files : [];

    if (!title || !date || files.length === 0) {
        return alert("Vui lòng nhập đầy đủ Tiêu đề, Ngày và ít nhất 1 tấm ảnh!");
    }

    const btn = document.querySelector("#modalCreateAlbum .btn-submit") || document.querySelector("button[onclick='addAlbum()']");
    const originalText = btn ? btn.innerText : "Đăng";
    
    if(btn) {
        btn.innerText = `⏳ Đang tải ${files.length} ảnh...`;
        btn.disabled = true;
    }

    try {
        const photoPromises = [];
        for (let i = 0; i < files.length; i++) {
            photoPromises.push(new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(files[i]);
            }));
        }

        const allPhotos = await Promise.all(photoPromises);

        await database.ref('albums').push({
            title: title,
            author: author,
            date: date,
            cover: allPhotos[0],
            photos: allPhotos,
            timestamp: Date.now()
        });

        alert(`✅ Thành công! Album đã được đăng bởi ${author}`);
        
        // Reset form
        titleInput.value = "";
        if(authorInput) authorInput.value = "";
        dateInput.value = "";
        fileInput.value = "";
        document.getElementById('modalCreateAlbum').style.display = 'none';

    } catch (error) {
        alert("❌ Lỗi: " + error.message);
    } finally {
        if(btn) {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }
}

// ==========================================
// 4. HÀM XÓA DỮ LIỆU CÓ MẬT KHẨU (ADMIN)
// ==========================================
function deleteData(path) {
    const password = prompt("Xác nhận quyền quản trị: Vui lòng nhập mật khẩu để xóa.");
    if (password === "HGF2026") {
        const confirmFinal = confirm("Bạn có chắc chắn muốn xóa vĩnh viễn dữ liệu này?");
        if (confirmFinal) {
            database.ref(path).remove()
                .then(() => alert("Đã xóa thành công!"))
                .catch(err => alert("Lỗi: " + err.message));
        }
    } else if (password !== null) {
        alert("Mật khẩu không chính xác!");
    }
}

// ==========================================
// 5. HÀM MỞ CHI TIẾT ALBUM (POPUP)
// ==========================================
function openAlbumDetail(albumId) {
    const modal = document.getElementById('modalAlbumDetail');
    const grid = document.getElementById('photoGrid');
    const title = document.getElementById('detailTitle');
    
    if(!modal || !grid) return;

    // Lấy dữ liệu album cụ thể từ Firebase
    database.ref('albums/' + albumId).once('value', (snapshot) => {
        const album = snapshot.val();
        if (!album) return;

        title.innerText = album.title;
        modal.style.display = 'block';
        grid.innerHTML = "<p style='color:#666;'>Đang tải ảnh...</p>";

        // Nếu có mảng ảnh photos
        if (album.photos && album.photos.length > 0) {
            grid.innerHTML = album.photos.map(src => `
                <img src="${src}" class="photo-item" onclick="viewPhoto('${src}')" 
                     style="width:100%; height:120px; object-fit:cover; border-radius:8px; cursor:pointer;">
            `).join('');
        } else {
            grid.innerHTML = "<p>Album này chưa có ảnh chi tiết.</p>";
        }
    });
}

// Hàm phóng to ảnh
function viewPhoto(src) {
    const viewer = document.getElementById('photoViewer');
    const fullImg = document.getElementById('fullPhoto');
    if(viewer && fullImg) {
        fullImg.src = src;
        viewer.style.display = 'flex';
    }
}

// Các hàm đóng mở Form nhanh
function toggleAddMemberForm() {
    const f = document.getElementById('addMemberForm');
    if(f) f.style.display = (f.style.display === 'none') ? 'block' : 'none';
}

function openAlbumModal() {
    document.getElementById('modalCreateAlbum').style.display = 'block';
}

// Hàm thêm Video nhanh
function addVideo() {
    const url = document.getElementById('videoUrl').value;
    if(!url) return alert("Dán link YouTube vào!");
    database.ref('videos').push({ url: url })
    .then(() => {
        alert("Đã thêm video!");
        document.getElementById('videoUrl').value = "";
    });
}
// Hàm mở bảng nhập link Video
function openVideoModal() {
    const modal = document.getElementById('modalVideoLink');
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error("Lỗi: Không tìm thấy Modal có ID 'modalVideoLink'");
    }
}

// Hàm đóng bảng nhập link Video
function closeVideoModal() {
    const modal = document.getElementById('modalVideoLink');
    if (modal) {
        modal.style.display = 'none';
        // Xóa trắng ô nhập sau khi đóng
        const input = document.getElementById('videoUrl');
        if(input) input.value = "";
    }
}

// Hàm gửi Video lên Firebase (Bổ sung để nút "Đăng" hoạt động)
function addVideo() {
    const urlInput = document.getElementById('videoUrl');
    if (!urlInput || !urlInput.value.trim()) {
        return alert("Vui lòng dán link YouTube vào!");
    }

    const url = urlInput.value.trim();
    
    // Đẩy dữ liệu lên Firebase
    database.ref('videos').push({
        url: url,
        timestamp: Date.now()
    })
    .then(() => {
        alert("✅ Đã thêm video thành công!");
        closeVideoModal();
    })
    .catch((error) => {
        alert("❌ Lỗi: " + error.message);
    });
}
// Hàm đóng/mở khu vực chọn ảnh áo đấu
function openJerseyUpload() {
    const area = document.getElementById('jerseyUploadArea');
    if (area) {
        // Nếu đang ẩn thì hiện, đang hiện thì ẩn
        area.style.display = (area.style.display === 'none' || area.style.display === '') ? 'block' : 'none';
    } else {
        console.error("Không tìm thấy ID 'jerseyUploadArea' trong HTML");
    }
}

// Hàm gửi ảnh Áo Đấu lên Firebase
function addJersey() {
    const fileInput = document.getElementById('jerseyImgInput');
    const file = fileInput.files[0];
    
    if (!file) return alert("Vui lòng chọn một tấm ảnh áo đấu!");

    // Hiển thị trạng thái đang tải
    const btn = document.querySelector("#jerseyUploadArea button");
    const originalText = btn.innerText;
    btn.innerText = "Đang tải...";
    btn.disabled = true;

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result;

        // Đẩy lên nhánh 'jerseys' trên Firebase
        database.ref('jerseys').push({
            img: base64Image,
            timestamp: Date.now()
        })
        .then(() => {
            alert("✅ Đã thêm mẫu áo đấu mới!");
            fileInput.value = ""; // Xóa file đã chọn
            openJerseyUpload();   // Đóng khung nhập
        })
        .catch(err => {
            alert("❌ Lỗi: " + err.message);
        })
        .finally(() => {
            btn.innerText = originalText;
            btn.disabled = false;
        });
    };
    reader.readAsDataURL(file);
}