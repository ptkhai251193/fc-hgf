// 1. CẤU HÌNH FIREBASE (BẮT BUỘC Ở ĐẦU FILE)
// ==========================================================
if (!firebase.apps.length) {
    var hgfConfig = {
        apiKey: "AIzaSyB61v8FCk4pUVWY61W-35OBk_7mgEQWsBA",
        authDomain: "fc-hgf.firebaseapp.com",
        databaseURL: "https://fc-hgf-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "fc-hgf",
        storageBucket: "fc-hgf.firebasestorage.app",
        messagingSenderId: "1057951855896",
        appId: "1:1057951855896:web:6a50e64266f8ebaf339a6d"
    };
    firebase.initializeApp(hgfConfig);
}
var database = firebase.database();

const form = document.getElementById('albumForm');
const container = document.getElementById('albumContainer');

// ==========================================================
// 2. PHẦN ĐỒNG BỘ ÁO ĐẤU (CHUYỂN SANG FIREBASE)
// ==========================================================

// Tự động lắng nghe và hiển thị Áo đấu từ Firebase (Giúp Laptop & Điện thoại thông nhau)
database.ref('jerseys').on('value', (snapshot) => {
    const jerseyContainer = document.getElementById('jerseyContainer');
    if (!jerseyContainer) return;
    jerseyContainer.innerHTML = '';
    
    const data = snapshot.val();
    if (data) {
        Object.keys(data).forEach((key) => {
            const imgSrc = data[key].img;
            const div = document.createElement('div');
            div.className = 'jersey-item';
            div.innerHTML = `
                <img src="${imgSrc}" style="width: 100%; border-radius: 10px;">
                <button onclick="deleteJerseyFirebase('${key}')" style="margin-top:10px; color:red; border:none; background:none; cursor:pointer; font-size:11px;">Xóa</button>
            `;
            jerseyContainer.appendChild(div);
        });
    }
});

// Hàm lưu Áo đấu lên Firebase
function handleJerseyUpload() {
    const fileInput = document.getElementById('inputJerseyFile');
    const file = fileInput.files[0];

    if (!file) {
        alert("Anh Manager ơi, vui lòng chọn một tấm ảnh áo đấu đã nhé!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const jerseyData = event.target.result;
        
        // Đẩy lên mạng (Firebase)
        database.ref('jerseys').push({
            img: jerseyData,
            timestamp: Date.now()
        }).then(() => {
            fileInput.value = ""; 
            document.getElementById('modalJersey').style.display = 'none';
            alert("Đã đồng bộ mẫu áo lên hệ thống rồi anh nhé!");
        });
    };
    reader.readAsDataURL(file);
}

// Hàm xóa Áo đấu trên Firebase
function deleteJerseyFirebase(id) {
    const password = prompt("Xác nhận quyền quản trị: Nhập mật khẩu để xóa mẫu áo.");
    if (password === "HGF2026") {
        database.ref('jerseys/' + id).remove().then(() => {
            alert("Đã xóa xong trên tất cả thiết bị!");
        });
    } else if (password !== null) {
        alert("Mật khẩu sai!");
    }
}

// ==========================================================
// 3. PHẦN ALBUM & VIDEO (GIỮ LOGIC LOCALSTORAGE CỦA ANH)
// ==========================================================

function loadAlbums() {
    if (!container) return;
    container.innerHTML = ''; 
    let albums = JSON.parse(localStorage.getItem('myAlbums')) || [];

    albums.forEach(function(album, index) {
        const div = document.createElement('div');
        div.className = 'album-card';
        div.onclick = function(e) {
            if (!e.target.classList.contains('btn-delete-album')) {
                if (typeof openAlbum === "function") openAlbum(index);
            }
        };

        div.innerHTML = `
            <div style="background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 2px solid #ddd; margin-bottom: 20px;">
                <img src="${album.image}" class="album-preview" style="width: 100%; height: 180px; object-fit: cover; border-bottom: 2px solid #eee;">
                <div style="padding: 15px; text-align: center;">
                    <h3 style="color: #333; margin: 0 0 8px 0; font-size: 18px;">${album.title}</h3>
                    <p style="color: #666; font-size: 13px; margin: 0;">
                        <span style="color: #0088cc;">👤</span> ${album.creator} <br> 
                        <span style="color: #ffcc00;">📅</span> ${album.date}
                    </p>
                    <button class="btn-delete-album" style="margin-top: 15px; background: #ff4d4d; color: white; border: none; padding: 5px 15px; border-radius: 5px; cursor: pointer; font-size: 12px;">Xóa Album</button>
                </div>
            </div>
        `;

        div.querySelector('.btn-delete-album').onclick = (e) => {
            e.stopPropagation();
            const password = prompt("Xác nhận quyền quản trị: Vui lòng nhập mật khẩu để xóa album này.");
            if (password === "HGF2026") {
                if (confirm("Xóa vĩnh viễn album '" + album.title + "'?")) {
                    albums.splice(index, 1);
                    localStorage.setItem('myAlbums', JSON.stringify(albums));
                    loadAlbums();
                }
            } else if (password !== null) alert("Sai mật khẩu!");
        };
        container.appendChild(div);
    });
}

if(form) {
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const fileInput = document.getElementById('inputImage');
        if (!fileInput.files[0]) return alert("Vui lòng chọn ảnh đại diện!");

        const reader = new FileReader();
        reader.onload = function(e) {
            const newAlbum = {
                title: document.getElementById('inputTitle').value,
                creator: document.getElementById('inputCreator').value,
                date: document.getElementById('inputDate').value,
                image: e.target.result,
                photos: []
            };
            let albums = JSON.parse(localStorage.getItem('myAlbums')) || [];
            albums.push(newAlbum);
            localStorage.setItem('myAlbums', JSON.stringify(albums));
            form.reset();
            document.getElementById('modalCreateAlbum').style.display = 'none';
            loadAlbums();
        };
        reader.readAsDataURL(fileInput.files[0]);
    });
}

// Xử lý Video kỷ niệm
function loadVideos() {
    const vContainer = document.getElementById('videoContainer');
    if (!vContainer) return;
    vContainer.innerHTML = '';
    let videos = JSON.parse(localStorage.getItem('myVideos')) || [];
    videos.forEach((video, index) => {
        const div = document.createElement('div');
        div.className = 'album-card';
        const frameHeight = video.type === "tiktok" ? "480px" : "250px";
        div.innerHTML = `
            <iframe src="${video.src}" frameborder="0" allowfullscreen style="width: 100%; height: ${frameHeight}; border-radius: 15px 15px 0 0;"></iframe>
            <div style="padding: 10px; text-align: center; background: #fff;">
                <button onclick="deleteVideo(${index})" class="btn-delete-album">Xóa Video</button>
            </div>
        `;
        vContainer.appendChild(div);
    });
}

function deleteVideo(index) {
    if (prompt("Mật khẩu xóa Video:") === "HGF2026") {
        let videos = JSON.parse(localStorage.getItem('myVideos')) || [];
        videos.splice(index, 1);
        localStorage.setItem('myVideos', JSON.stringify(videos));
        loadVideos();
    }
}

// ==========================================================
// 4. KHỞI CHẠY (INIT)
// ==========================================================
loadAlbums();
loadVideos();

// Các hàm UI giữ nguyên
function toggleMenu() { document.getElementById("sideMenu").classList.toggle("active"); }
function showTab(tabName) {
    if (tabName === 'thanh-vien') {
        document.getElementById("main-content").style.display = "none"; 
        document.getElementById("thanh-vien-page").style.display = "block";
        toggleMenu(); window.scrollTo(0,0);
    }
}
function goBackHome() {
    document.getElementById("thanh-vien-page").style.display = "none";
    document.getElementById("main-content").style.display = "block";
}
function closeTab() { document.getElementById("tabContentOverlay").style.display = "none"; }
function openJerseyModal() { document.getElementById('modalJersey').style.display = 'block'; }
// Hàm 1: Mở cái bảng (Modal) khi bấm nút "Thêm Áo"
function openJerseyModal() {
    const modal = document.getElementById('modalJersey');
    if (modal) {
        modal.style.display = 'block';
    } else {
        alert("Không tìm thấy bảng modalJersey trong HTML anh ơi!");
    }
}

// Hàm 2: Xử lý khi anh bấm nút "Xác nhận" trong cái bảng đó
// Anh hãy kiểm tra nút "Xác nhận" trong HTML có onclick="handleJerseyUpload()" chưa nhé
function handleJerseyUpload() {
    const fileInput = document.getElementById('inputJerseyFile');
    const file = fileInput.files[0];

    if (!file) {
        alert("Anh Manager ơi, vui lòng chọn một tấm ảnh áo đấu đã nhé!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const jerseyData = event.target.result;
        
        // Gửi lên mạng (Firebase)
        database.ref('jerseys').push({
            img: jerseyData,
            timestamp: Date.now()
        }).then(() => {
            // Dọn dẹp sau khi xong
            fileInput.value = ""; 
            document.getElementById('modalJersey').style.display = 'none';
            alert("Đã đồng bộ mẫu áo lên hệ thống rồi anh nhé!");
        }).catch((error) => {
            alert("Lỗi rồi anh: " + error.message);
        });
    };
    reader.readAsDataURL(file);
}
// ==========================================================
// 5. PHẦN QUẢN LÝ THÀNH VIÊN (FIREBASE)
// ==========================================================

// --- LẮNG NGHE THÀNH VIÊN (HIỆN NGÀY SINH & MỞ ẢNH) ---
database.ref('members').on('value', (snapshot) => {
    const grid = document.getElementById('memberGrid');
    if (!grid) return;
    grid.innerHTML = ''; 
    const data = snapshot.val();
    if (!data) return;

    Object.keys(data).forEach((key) => {
        const m = data[key];
        
        // 1. Định dạng lại tên cho gọn (Viết hoa chữ cái đầu)
        const nameShow = m.name ? m.name.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ') : "";
        
        // 2. Định dạng Ngày sinh (DD/MM/YYYY)
        const birthShow = m.birth ? new Date(m.birth).toLocaleDateString('vi-VN') : 'Chưa cập nhật';
        
        const div = document.createElement('div');
        div.className = 'member-card';
        
        // 3. LỆNH MỞ ẢNH KHI NHẤN VÀO THẺ (Gọi hàm viewPhoto đã có của anh)
        div.onclick = function() { 
            if(typeof viewPhoto === "function") {
                viewPhoto(m.img); 
            } else {
                document.getElementById('fullPhoto').src = m.img;
                document.getElementById('photoViewer').style.display = 'flex';
            }
        };
        
        div.style = "position:relative; background:rgba(255,255,255,0.1); padding:15px; border-radius:15px; text-align:center; cursor:pointer; border: 1px solid rgba(255,215,0,0.2);";
        
        div.innerHTML = `
            <button onclick="event.stopPropagation(); deleteData('members/${key}')" style="position:absolute; top:5px; right:5px; background:red; color:white; border:none; border-radius:50%; width:25px; height:25px; cursor:pointer; z-index:10;">×</button>
            <img src="${m.img}" style="width:110px; height:110px; border-radius:50%; object-fit:cover; border:3px solid #FFD700; margin-bottom:10px;">
            <h3 style="color:white; margin:5px 0; font-size:18px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${nameShow}">${nameShow}</h3>
            <p style="color:#FFD700; font-weight:bold; margin:0; font-size:14px;">Số áo: ${m.number}</p>
            <p style="color:#ccc; font-size:12px; margin-top:5px; font-style:italic;">🎂 ${birthShow}</p>
        `;
        grid.appendChild(div);
    });
});

// Hàm lưu Thành viên mới lên Firebase
function addMember() {
    const name = document.getElementById('memName').value;
    const number = document.getElementById('memNumber').value;
    const birth = document.getElementById('memBirth').value; // Lấy ngày sinh từ ô nhập
    const file = document.getElementById('memImg').files[0];

    if (!file || !name) return alert("Anh Manager ơi, nhập tên và chọn ảnh đã nhé!");

    const reader = new FileReader();
    reader.onload = (e) => {
        database.ref('members').push({
            name: name,
            number: number,
            birth: birth, // <--- Dòng này cực kỳ quan trọng
            img: e.target.result,
            timestamp: Date.now()
        }).then(() => {
            alert("Đã thêm thành viên thành công!");
            // Xóa trắng ô nhập sau khi thêm
            document.getElementById('memName').value = "";
            document.getElementById('memNumber').value = "";
            document.getElementById('memBirth').value = "";
            toggleAddMemberForm();
        });
    };
    reader.readAsDataURL(file);
}

// Hàm xóa Thành viên trên Firebase
function deleteMemberFirebase(id) {
    if (prompt("Nhập mật khẩu quản trị để xóa thành viên:") === "HGF2026") {
        database.ref('members/' + id).remove().then(() => {
            alert("Đã xóa thành viên khỏi hệ thống!");
        });
    } else {
        alert("Mật khẩu không đúng!");
    }
}
function viewPhoto(src) {
    const viewer = document.getElementById('photoViewer');
    const fullImg = document.getElementById('fullPhoto');
    if (viewer && fullImg) {
        fullImg.src = src;
        viewer.style.display = 'flex'; // Hiện khung xem ảnh
    } else {
        alert("Lỗi: Không tìm thấy khung xem ảnh (photoViewer) trong HTML!");
    }
}