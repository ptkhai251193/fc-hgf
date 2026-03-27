const form = document.getElementById('albumForm');
const container = document.getElementById('albumContainer');

// Hàm hiển thị danh sách album ra màn hình
function loadAlbums() {
    if (!container) return;
    container.innerHTML = ''; 
    let albums = JSON.parse(localStorage.getItem('myAlbums')) || [];

    albums.forEach(function(album, index) {
        const div = document.createElement('div');
        div.className = 'album-card';
        
        // Click vào thẻ để mở xem chi tiết (trừ nút xóa)
        div.onclick = function(e) {
            if (!e.target.classList.contains('btn-delete-album')) {
                if (typeof openAlbum === "function") {
                    openAlbum(index);
                }
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

        // Xử lý nút xóa Album bảo mật hơn
        div.querySelector('.btn-delete-album').onclick = (e) => {
            e.stopPropagation(); // Ngăn không cho mở album khi bấm nút xóa
            
            // Thay đổi nội dung câu hỏi để không lộ mật khẩu
            const password = prompt("Xác nhận quyền quản trị: Vui lòng nhập mật khẩu để xóa album này.");
            
            if (password === null) {
                // Người dùng nhấn 'Hủy'
                return;
            }

            if (password === "HGF2026") {
                const confirmFinal = confirm("Bạn có chắc chắn muốn xóa vĩnh viễn album '" + album.title + "' không?");
                if (confirmFinal) {
                    albums.splice(index, 1);
                    localStorage.setItem('myAlbums', JSON.stringify(albums));
                    loadAlbums();
                    alert("Đã xóa album thành công.");
                }
            } else {
                alert("Mật khẩu không chính xác. Bạn không có quyền xóa album này!");
            }
        };

        container.appendChild(div);
    });
}

// Xử lý sự kiện khi nhấn nút "Lưu Album"
form.addEventListener('submit', function(event) {
    event.preventDefault(); // Chặn trang web bị load lại

    const fileInput = document.getElementById('inputImage');
    if (!fileInput.files[0]) {
        alert("Vui lòng chọn một ảnh đại diện!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const newAlbum = {
            title: document.getElementById('inputTitle').value,
            creator: document.getElementById('inputCreator').value,
            date: document.getElementById('inputDate').value,
            image: e.target.result, // Ảnh đại diện dạng chuỗi
            photos: [] // Mảng trống để sau này thêm nhiều ảnh vào trong
        };

        let albums = JSON.parse(localStorage.getItem('myAlbums')) || [];
        albums.push(newAlbum);
        localStorage.setItem('myAlbums', JSON.stringify(albums));

        // Reset form và đóng bảng
        form.reset();
        document.getElementById('modalCreateAlbum').style.display = 'none';
        
        // Tải lại danh sách ngay lập tức
        loadAlbums();
        alert("Đã thêm album mới thành công!");
    };
    
    reader.readAsDataURL(fileInput.files[0]);
});
// Xử lý mở hộp thoại chọn file khi bấm nút "Thêm Áo Đấu"
document.getElementById('btnOpenModalJersey').onclick = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const jerseyData = event.target.result;
            saveJersey(jerseyData);
        };
        reader.readAsDataURL(file);
    };
    input.click();
};

// Hàm lưu áo đấu vào localStorage
function saveJersey(imgData) {
    let jerseys = JSON.parse(localStorage.getItem('myJerseys')) || [];
    jerseys.push(imgData);
    localStorage.setItem('myJerseys', JSON.stringify(jerseys));
    loadJerseys();
}

// Hàm hiển thị áo đấu
function loadJerseys() {
    const container = document.getElementById('jerseyContainer');
    if (!container) return;
    container.innerHTML = '';
    
    let jerseys = JSON.parse(localStorage.getItem('myJerseys')) || [];
    jerseys.forEach((imgSrc, index) => {
        const div = document.createElement('div');
        div.className = 'jersey-item';
        div.innerHTML = `
            <img src="${imgSrc}">
            <button onclick="deleteJersey(${index})" style="margin-top:10px; color:red; border:none; background:none; cursor:pointer; font-size:11px;">Xóa</button>
        `;
        container.appendChild(div);
    });
}

// Hàm xóa áo đấu có bảo mật mật khẩu
function deleteJersey(index) {
    // Yêu cầu nhập mật khẩu giống như xóa Album
    const password = prompt("Xác nhận quyền quản trị: Vui lòng nhập mật khẩu để xóa mẫu áo đấu này.");

    if (password === null) {
        return; // Người dùng nhấn Hủy
    }

    if (password === "HGF2026") {
        const confirmFinal = confirm("Bạn có chắc chắn muốn xóa mẫu áo đấu này không?");
        if (confirmFinal) {
            let jerseys = JSON.parse(localStorage.getItem('myJerseys')) || [];
            jerseys.splice(index, 1);
            localStorage.setItem('myJerseys', JSON.stringify(jerseys));
            loadJerseys();
            alert("Đã xóa áo đấu thành công.");
        }
    } else {
        alert("Mật khẩu không chính xác. Bạn không có quyền thực hiện thao tác này!");
    }
}

// Gọi hàm tải áo đấu khi mở trang
loadJerseys();

// Chạy hàm load khi vừa mở trang
loadAlbums();
// ==========================================================
// PHẦN XỬ LÝ VIDEO KỶ NIỆM (YOUTUBE & TIKTOK)
// ==========================================================

// 1. Mở bảng nhập link khi bấm nút "+ Thêm Video"
if(document.getElementById('btnOpenModalVideo')) {
    document.getElementById('btnOpenModalVideo').onclick = function() {
        document.getElementById('modalVideoLink').style.display = 'block';
    };
}

// 2. Hàm xử lý link và lưu vào localStorage (Cực nhẹ)
function addVideoLink() {
    const linkInput = document.getElementById('inputVideoLink');
    const link = linkInput.value.trim();
    if (!link) return alert("Vui lòng dán link video!");

    let embedLink = "";
    let type = "";

    // Xử lý link YouTube
    if (link.includes("youtube.com") || link.includes("youtu.be")) {
        let videoId = link.includes("v=") ? link.split("v=")[1].split("&")[0] : link.split("youtu.be/")[1];
        embedLink = `https://www.youtube.com/embed/${videoId}`;
        type = "youtube";
    } 
    // Xử lý link TikTok
    else if (link.includes("tiktok.com")) {
        const tiktokId = link.split("/video/")[1]?.split("?")[0];
        if (tiktokId) {
            embedLink = `https://www.tiktok.com/embed/v2/${tiktokId}`;
            type = "tiktok";
        }
    }

    if (embedLink) {
        let videos = JSON.parse(localStorage.getItem('myVideos')) || [];
        videos.push({ src: embedLink, type: type });
        localStorage.setItem('myVideos', JSON.stringify(videos));
        
        // Reset và đóng bảng
        linkInput.value = "";
        document.getElementById('modalVideoLink').style.display = 'none';
        loadVideos();
    } else {
        alert("Link không hợp lệ! Hãy dán link từ trình duyệt.");
    }
}

// 3. Hàm hiển thị Video ra màn hình (Fix lỗi cấu hình 153)
function loadVideos() {
    const container = document.getElementById('videoContainer');
    if (!container) return;
    container.innerHTML = '';
    
    let videos = JSON.parse(localStorage.getItem('myVideos')) || [];
    videos.forEach((video, index) => {
        const div = document.createElement('div');
        div.className = 'album-card';
        // Video TikTok để khung cao hơn cho đẹp, YouTube để khung ngang
        const frameHeight = video.type === "tiktok" ? "480px" : "250px";

        div.innerHTML = `
            <iframe 
                src="${video.src}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen 
                style="width: 100%; height: ${frameHeight}; border-radius: 15px 15px 0 0;">
            </iframe>
            <div style="padding: 10px; text-align: center; background: #fff;">
                <button onclick="deleteVideo(${index})" class="btn-delete-album">Xóa Video</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// 4. Hàm xóa video (Dùng mật khẩu quản trị)
function deleteVideo(index) {
    const password = prompt("Xác nhận quyền quản trị: Nhập mật khẩu để xóa Video.");
    if (password === "HGF2026") {
        let videos = JSON.parse(localStorage.getItem('myVideos')) || [];
        videos.splice(index, 1);
        localStorage.setItem('myVideos', JSON.stringify(videos));
        loadVideos();
    } else if (password !== null) {
        alert("Mật khẩu sai!");
    }
}

// 5. Chạy hàm load khi trang web khởi động
loadVideos();
// Đóng mở Menu 3 gạch
function toggleMenu() {
    document.getElementById("sideMenu").classList.toggle("active");
}

// Hàm chuyển sang trang Thành Viên
function showTab(tabName) {
    if (tabName === 'thanh-vien') {
        // 1. Ẩn trang chủ (phần nội dung chính của bạn)
        // Lưu ý: Hãy đảm bảo phần nội dung chính của bạn nằm trong 1 cái ID (ví dụ: main-content)
        document.getElementById("main-content").style.display = "none"; 
        
        // 2. Hiện trang Thành viên
        document.getElementById("thanh-vien-page").style.display = "block";
        
        // 3. Đóng Menu
        toggleMenu();
        
        // 4. Cuộn lên đầu trang
        window.scrollTo(0,0);
    }
}

// Hàm quay lại trang chủ
function goBackHome() {
    document.getElementById("thanh-vien-page").style.display = "none";
    document.getElementById("main-content").style.display = "block";
}

function closeTab() {
    document.getElementById("tabContentOverlay").style.display = "none";
}