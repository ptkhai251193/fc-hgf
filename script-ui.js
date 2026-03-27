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
        <div class="album-card" onclick="openAlbumDetail('${a.id}')" style="position: relative; text-align: center;">
            
            <span onclick="event.stopPropagation(); deleteData('albums/${a.id}')" style="position:absolute; top:10px; right:12px; color:#999; font-size:22px; cursor:pointer;">&times;</span>
            
            <img src="${a.cover || a.img}" style="width:100%; height:180px; object-fit:cover; border-radius: 12px; margin-bottom: 12px;">
            
            <h4 style="color: #D4A017; margin: 0 0 8px 0; font-size: 19px; font-weight: bold; width: 100%;">${a.title}</h4>
            
            <div style="color: #333; font-size: 14px; margin-bottom: 5px; width: 100%;">
                👤 Người đăng: <strong>${a.author || 'Admin'}</strong>
            </div>
            
            <div style="color: #666; font-size: 13px; width: 100%;">
                📅 Ngày: ${a.date}
            </div>
        </div>
    `).reverse().join('');
});
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
// Hàm nén ảnh giúp web load nhanh hơn gấp 10 lần
function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1000; // Giới hạn chiều rộng ảnh
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Nén chất lượng còn 0.7 (70%)
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        };
    });
}
async function addAlbum() {
    // 1. Lấy dữ liệu từ các ô nhập
    const title = document.getElementById('inputTitle').value.trim();
    const author = document.getElementById('inputAuthor') ? document.getElementById('inputAuthor').value.trim() : ""; // Kiểm tra nếu ô Người đăng tồn tại
    const date = document.getElementById('inputDate').value;
    const fileInput = document.getElementById('inputImage');
    const files = fileInput.files;

    // 2. Kiểm tra điều kiện (Nếu thiếu sẽ báo Alert và dừng lại)
    if (!title) return alert("Bạn chưa nhập Tiêu đề Album!");
    if (!author) return alert("Bạn chưa nhập Tên người đăng!");
    if (!date) return alert("Bạn chưa chọn Ngày tháng!");
    if (files.length === 0) return alert("Bạn chưa chọn ảnh nào!");

    // 3. Hiển thị trạng thái đang xử lý
    const btn = document.querySelector("#modalCreateAlbum .btn-submit") || document.querySelector("#modalCreateAlbum button[onclick='addAlbum()']");
    const originalText = btn.innerText;
    btn.innerText = `⏳ Đang tải ${files.length} ảnh...`;
    btn.disabled = true;

   try {
    const photoPromises = [];
    for (let i = 0; i < files.length; i++) {
        // Gọi hàm nén thay vì đọc file trực tiếp
        photoPromises.push(compressImage(files[i]));
    }
    const allPhotos = await Promise.all(photoPromises);

        // 4. Đẩy lên Firebase (Lưu cả mảng ảnh và Người đăng)
        await database.ref('albums').push({
            title: title,
            author: author, // Lưu tên người đăng
            date: date,
            cover: allPhotos[0], // Lấy ảnh đầu làm đại diện
            photos: allPhotos,   // Danh sách tất cả ảnh
            timestamp: Date.now()
        });

        alert(`✅ Thành công! Đã tạo Album '${title}' (Đăng bởi: ${author})`);
        
        // 5. Reset và đóng bảng
        document.getElementById('inputTitle').value = "";
        if(document.getElementById('inputAuthor')) document.getElementById('inputAuthor').value = "";
        document.getElementById('inputDate').value = "";
        fileInput.value = "";
        document.getElementById('modalCreateAlbum').style.display = 'none';

    } catch (error) {
        alert("❌ Lỗi hệ thống: " + error.message);
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
            <div class="container" style="max-width: 1200px; margin: 0 auto; color: #333; padding: 20px; min-height: 100vh; background: white;">
                
                <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid #EEE; padding-bottom: 20px;">
                    <button class="add-btn" onclick="goBackHome()" style="background: #f5f5f5; color: #333; border: 1px solid #ddd; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 15px; transition: 0.2s;">
                        ← Quay lại trang chủ
                    </button>
                    
                    <div style="text-align: right;">
                        <h2 class="title-member" style="margin: 0; font-size: 36px; color: #D4A017; text-transform: uppercase; font-weight: bold;">
                            ${album.title}
                        </h2>
                        <p style="color: #666; margin: 5px 0 0 0; font-size: 15px; font-weight: 500;">
                            📅 Ngày: ${album.date} | 🖼️ Tổng số: ${photos.length} ảnh | 👤 Đăng bởi: ${album.author || 'Admin'}
                        </p>
                    </div>
                </div>

                <div class="photo-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; padding-bottom: 50px;">
                    ${photos.map(photoUrl => `
                        <div class="photo-item" style="border-radius: 15px; overflow: hidden; background: #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.08); transition: transform 0.2s; cursor: pointer;" onclick="openLightbox('${photoUrl}')">
                            <img src="${photoUrl}" style="width: 100%; height: 250px; object-fit: cover; display: block; border-bottom: 1px solid #eee;">
                        </div>
                    `).join('')}
                </div>
            </div>

            <div id="lightbox" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; text-align: center; cursor: pointer;" onclick="closeLightbox()">
                <span style="position: absolute; top: 20px; right: 30px; color: white; font-size: 50px; font-weight: bold; cursor: pointer;">&times;</span>
                <img id="lightbox-img" src="" style="max-width: 90%; max-height: 90%; margin-top: 5vh; border: 5px solid white; border-radius: 10px; box-shadow: 0 0 30px rgba(255,255,255,0.3);">
            </div>
        `;
    });
}
