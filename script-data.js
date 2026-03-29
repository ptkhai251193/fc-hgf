// ==========================================================
// 1. CẤU HÌNH FIREBASE (BẮT BUỘC Ở ĐẦU FILE)
// ==========================================================
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
                <button onclick="askDelete('jerseys/${key}')" class="btn-delete">Xóa</button>
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