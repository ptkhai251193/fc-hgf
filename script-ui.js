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


// Lắng nghe Thành Viên và hiển thị ra màn hình
database.ref('members').on('value', (s) => {
    const data = s.val();
    const grid = document.getElementById('memberGrid');
    if (!grid) return;
    
    grid.innerHTML = data ? Object.keys(data).map(k => {
        const member = data[k];
        return `
        <div class="member-card" style="position:relative; background:rgba(255, 255, 255, 0.45); padding:15px; border-radius:15px; text-align:center; border: 1px solid rgba(255,255,255,0.2);">
            <button onclick="deleteData('members/${k}')" style="position:absolute; top:5px; right:5px; background:red; color:white; border:none; border-radius:50%; width:25px; height:25px; cursor:pointer;">×</button>
            
            <img src="${member.image || member.img}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:2px solid #FFD700; margin-bottom:10px;">
            
            <h3 style="color:white; margin:0 0 5px 0; font-size:18px;">${member.name}</h3>
            <p style="color:#FFD700; font-weight:bold; margin:0 0 8px 0;">Số áo: ${member.number}</p>
            
            <p style="color:#00FF00; font-weight:bold; font-size:13px; margin:0;">
                🎂 Sinh Nhật: ${member.birth ? formatBirthDate(member.birth) : 'Chưa cập nhật'}
            </p>
        </div>`;
    }).join('') : "";
});

database.ref('albums').on('value', (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('albumContainer');
    if (!container || !data) return;

    container.innerHTML = Object.keys(data).map(key => {
        const item = data[key];
        return `
        <div class="album-card" onclick="openAlbumDetail('${key}')" style="margin:10px; background:white; border-radius:15px; display:inline-block; width:250px; cursor:pointer;">
            <img src="${item.cover}" style="width:100%; height:160px; object-fit:cover; border-radius:15px 15px 0 0;">
            <div style="padding:10px; text-align:center;">
                <h4 style="color:#333; margin:5px 0;">${item.title}</h4>
                <p style="color:#666; font-size:11px;">📅 ${item.date}</p>
            </div>
        </div>`;
    }).reverse().join('');
});

database.ref('videos').on('value', (s) => {
    const data = s.val();
    const container = document.getElementById('videoContainer');
    if (!container || !data) return;

    // CẤU HÌNH VUỐT NGANG (SCROLL SNAP)
    container.style.display = "flex";
    container.style.flexWrap = "nowrap"; // Không cho xuống dòng
    container.style.overflowX = "auto"; // Cho phép cuộn ngang
    container.style.webkitOverflowScrolling = "touch"; // Vuốt mượt trên iPhone
    container.style.scrollSnapType = "x mandatory"; // Tự động dừng đúng khung video
    container.style.gap = "15px";
    container.style.padding = "10px 20px";
    container.style.scrollbarWidth = "none"; // Ẩn thanh cuộn trên máy tính
    container.style.msOverflowStyle = "none";

    container.innerHTML = Object.keys(data).map(k => {
        let v = data[k];
        let videoId = v.url.includes('v=') ? v.url.split('v=')[1].split('&')[0] : v.url.split('/').pop();
        
        return `
        <div style="flex: 0 0 85%; scroll-snap-align: center; position:relative; background:rgba(255,255,255,0.1); padding:10px; border-radius:15px; border: 1px solid rgba(255,255,255,0.2); box-sizing:border-box;">
            <span onclick="deleteData('videos/${k}')" style="position:absolute; top:-5px; right:-5px; color:white; background:red; width:25px; height:25px; border-radius:50%; text-align:center; line-height:25px; cursor:pointer; z-index:10;">&times;</span>
            
            <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:10px;">
                <iframe 
                    style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" 
                    src="https://www.youtube.com/embed/${videoId}" 
                    allowfullscreen>
                </iframe>
            </div>
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
    if (prompt("Nhập mật khẩu quản trị:") === "HGF2026") {
        database.ref(path).remove().then(() => alert("Đã xóa xong!"));
    } else { alert("Sai mật khẩu!"); }
}

// --- Các hàm còn lại giữ nguyên ---
function addMember() {
    const name = document.getElementById('memName').value;
    const number = document.getElementById('memNumber').value;
    const birth = document.getElementById('memBirth').value; 
    const imgFile = document.getElementById('memImg').files[0];

    // Kiểm tra đầu vào
    if (!name || !number) {
        alert("Anh Khải ơi, nhập thiếu Tên hoặc Số áo rồi!");
        return;
    }

    if (!imgFile) {
        alert("Anh chưa chọn ảnh cho thành viên này nhé!");
        return;
    }

    // ĐOẠN QUAN TRỌNG: Đọc ảnh để điện thoại hiểu được
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const imageData = e.target.result; // Chuyển ảnh thành mã dữ liệu
        
        // Gửi lên Firebase
        database.ref('members').push({
            name: name,
            number: number,
            birth: birth, 
            img: imageData, // Lưu vào trường 'img' để khớp với lệnh map() ở trên của anh
            timestamp: Date.now()
        }).then(() => {
            // Xóa sạch ô nhập sau khi thành công
            document.getElementById('memName').value = '';
            document.getElementById('memNumber').value = '';
            document.getElementById('memBirth').value = '';
            document.getElementById('memImg').value = '';
            
            alert("✅ Đã thêm thành viên thành công!");
            
            // Đóng form nếu anh có hàm này
            if (typeof toggleAddMemberForm === 'function') toggleAddMemberForm();
        }).catch((error) => {
            alert("Lỗi kết nối Firebase: " + error.message);
        });
    };

    reader.onerror = function() {
        alert("Lỗi khi đọc file ảnh từ điện thoại!");
    };

    reader.readAsDataURL(imgFile);
}

async function addAlbum() {
    const title = document.getElementById('inputTitle').value;
    const author = document.getElementById('inputAuthor').value || "Quản trị";
    const date = document.getElementById('inputDate').value;
    const files = document.getElementById('inputImage').files;

    if (!title || !date || files.length === 0) return alert("Thiếu thông tin album anh ơi!");

    // Hàm nén ảnh dùng Canvas
    const compress = (file, quality, maxWidth) => {
        return new Promise((res) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const scale = maxWidth / img.width;
                    canvas.width = maxWidth;
                    canvas.height = img.height * scale;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    res(canvas.toDataURL('image/jpeg', quality));
                };
            };
            reader.readAsDataURL(file);
        });
    };

    alert("⏳ Đang nén ảnh Album, anh đợi tí nhé...");

    // Nén ảnh bìa (600px) và danh sách ảnh (800px)
    const cover = await compress(files[0], 0.6, 600);
    const photoPromises = Array.from(files).map(file => compress(file, 0.5, 800));
    const allPhotos = await Promise.all(photoPromises);

    database.ref('albums').push({
        title,
        author,
        date,
        cover: cover,
        photos: allPhotos,
        timestamp: Date.now()
    }).then(() => {
        alert("✅ Đã đăng Album nhẹ tênh!");
        closeAlbumModal();
    });
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
function formatBirthDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr; 
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}
function viewPhoto(src) { document.getElementById('fullPhoto').src = src; document.getElementById('photoViewer').style.display = 'flex'; }
function toggleAddMemberForm() { const f = document.getElementById('addMemberForm'); f.style.display = (f.style.display === 'none') ? 'block' : 'none'; }
function openAlbumModal() { document.getElementById('modalCreateAlbum').style.display = 'block'; }
function closeAlbumModal() { document.getElementById('modalCreateAlbum').style.display = 'none'; }
function openVideoModal() { document.getElementById('modalVideoLink').style.display = 'flex'; }
function closeVideoModal() { document.getElementById('modalVideoLink').style.display = 'none'; }

