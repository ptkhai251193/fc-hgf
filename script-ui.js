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
                <p style="color:#ccc; font-size:12px; text-align:center; margin:0;">${a.date} (${a.photos ? a.photos.length : 1} ảnh)</p>
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
    const title = document.getElementById('inputTitle').value;
    const date = document.getElementById('inputDate').value;
    const fileInput = document.getElementById('inputImage');
    const files = fileInput.files;

    if (!title || !date || files.length === 0) return alert("Thiếu thông tin hoặc chưa chọn ảnh!");

    // Hiển thị thông báo đang xử lý vì nhiều ảnh sẽ nặng
    const btn = document.querySelector("#modalCreateAlbum button");
    const originalText = btn.innerText;
    btn.innerText = "Đang tải " + files.length + " ảnh... Đợi xíu!";
    btn.disabled = true;

    try {
        const photoPromises = [];
        
        // Vòng lặp để đọc TẤT CẢ các file bạn đã chọn
        for (let i = 0; i < files.length; i++) {
            photoPromises.push(new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(files[i]);
            }));
        }

        // Đợi tất cả ảnh chuyển sang dạng dữ liệu xong
        const allPhotos = await Promise.all(photoPromises);

        // Đẩy lên Firebase: cover là ảnh đầu, photos là mảng tất cả ảnh
        await database.ref('albums').push({
            title: title,
            date: date,
            cover: allPhotos[0], // Lấy ảnh đầu làm đại diện
            photos: allPhotos,   // Lưu toàn bộ danh sách ảnh vào đây
            timestamp: Date.now()
        });

        alert("Thành công! Đã tạo album với " + files.length + " ảnh.");
        document.getElementById('modalCreateAlbum').style.display = 'none';
        // Reset form
        document.getElementById('inputTitle').value = "";
        fileInput.value = "";
    } catch (error) {
        alert("Lỗi: " + error.message);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
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
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    if (sidebar.style.display === 'none' || sidebar.style.display === '') {
        sidebar.style.display = 'block';
        // Thêm một chút hiệu ứng lướt (tùy chọn)
        sidebar.style.animation = "slideIn 0.3s forwards";
    } else {
        sidebar.style.display = 'none';
    }
}

// Hàm quay lại trang chủ (Dùng để thoát khỏi chế độ xem Album chi tiết)
function goBackHome() {
    // Hiện lại trang chủ
    const mainContent = document.getElementById('main-content');
    const topBanner = document.querySelector('.top-banner');
    const mainHeading = document.querySelector('.main-heading');
    
    if (mainContent) mainContent.style.display = 'block';
    if (topBanner) topBanner.style.display = 'block';
    if (mainHeading) mainHeading.style.display = 'block';

    // Ẩn trang chi tiết Album và trang Thành viên
    const detailPage = document.getElementById('album-detail-page');
    const memberPage = document.getElementById('thanh-vien-page');
    
    if (detailPage) detailPage.style.display = 'none';
    if (memberPage) memberPage.style.display = 'none';
    
    // Cuộn lên đầu trang
    window.scrollTo(0, 0);
}
// ==========================================
// 5. HÀM XỬ LÝ XEM CHI TIẾT ALBUM (MỚI THÊM)
// ==========================================

function openAlbumDetail(albumId) {
    // 1. Ẩn nội dung trang chủ
    const mainContent = document.getElementById('main-content');
    const topBanner = document.querySelector('.top-banner');
    const mainHeading = document.querySelector('.main-heading');
    
    if (mainContent) mainContent.style.display = 'none';
    if (topBanner) topBanner.style.display = 'none';
    if (mainHeading) mainHeading.style.display = 'none';

    // 2. Hiển thị khu vực xem chi tiết Album (Kho HTML đã tạo ở Bước 1)
    let detailArea = document.getElementById('album-detail-page');
    if (!detailArea) {
        alert("Lỗi: Không tìm thấy khu vực xem chi tiết Album (Bước 1 chưa thông)!");
        goBackHome();
        return;
    }
    
    // Đảm bảo khu vực chi tiết được hiển thị
    detailArea.style.display = 'block';

    // 3. Lấy dữ liệu Album từ Firebase
    database.ref('albums/' + albumId).once('value', (snapshot) => {
        const album = snapshot.val();
        if (!album) {
            alert("Không tìm thấy dữ liệu Album!");
            goBackHome();
            return;
        }

        // Lấy danh sách ảnh (Nếu album cũ chỉ có 1 ảnh, thì gom nó lại thành danh sách)
        const photos = album.photos || [album.cover || album.img];

        // 4. Vẽ giao diện chi tiết Album (Tiêu đề, nút quay lại và Grid ảnh)
        detailArea.innerHTML = `
            <div class="container" style="max-width: 1200px; margin: 0 auto; color: white;">
                <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid #FFD700; padding-bottom: 15px;">
                    <button class="add-btn" onclick="goBackHome()" style="background: #555; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">← Quay lại trang chủ</button>
                    <div style="text-align: right;">
                        <h2 class="title-member" style="margin: 0; font-size: 32px; color: #FFD700;">${album.title}</h2>
                        <p style="color: #ccc; margin: 0; font-size: 15px;">Ngày: ${album.date} | Tổng số: ${photos.length} ảnh</p>
                    </div>
                </div>

                <div class="photo-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; padding-bottom: 50px;">
                    ${photos.map(photoUrl => `
                        <div class="photo-item" style="border: 3px solid #333; border-radius: 10px; overflow: hidden; background: #000; transition: transform 0.2s;">
                            <img src="${photoUrl}" style="width: 100%; height: 200px; object-fit: cover; cursor: pointer;" onclick="viewFullPhoto('${photoUrl}')">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
}