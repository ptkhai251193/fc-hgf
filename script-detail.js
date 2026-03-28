let currentAlbumIndex = null;

// Hàm mở Album chi tiết
function openAlbum(index) {
    currentAlbumIndex = index;
    const albums = JSON.parse(localStorage.getItem('myAlbums'));
    const album = albums[index];

    // Đổ dữ liệu tên và thông tin vào tiêu đề bảng
    document.getElementById('detailTitle').innerText = album.title;
    document.getElementById('detailInfo').innerText = `Người tạo: ${album.creator} | Ngày: ${album.date}`;
    
    // Hiển thị danh sách ảnh (bao gồm cả ảnh đại diện)
    renderPhotos(); 
    document.getElementById('modalAlbumDetail').style.display = 'block';
}

// Hàm vẽ lưới ảnh trong Album
// Hàm hiển thị ảnh dạng lưới
function renderPhotos() {
    const albums = JSON.parse(localStorage.getItem('myAlbums'));
    const album = albums[currentAlbumIndex];
    const photoGrid = document.getElementById('photoGrid');
    photoGrid.innerHTML = '';

    // Gom tất cả ảnh (ảnh đại diện + ảnh phụ) vào một danh sách để hiển thị
    const allPhotos = [];
    if (album.image) allPhotos.push(album.image);
    if (album.photos) allPhotos.push(...album.photos);

    allPhotos.forEach(photoSrc => {
        const img = document.createElement('img');
        img.src = photoSrc;
        img.className = 'photo-item';
        
        // SỬA TẠI ĐÂY: Nhấn vào để gọi hàm phóng to thay vì mở tab mới
        img.onclick = () => viewPhoto(photoSrc);
        
        photoGrid.appendChild(img);
    });
}

// Hàm xử lý phóng to ảnh
function viewPhoto(src) {
    const viewer = document.getElementById('photoViewer');
    const fullImg = document.getElementById('fullPhoto');
    fullImg.src = src;
    viewer.style.display = 'flex';
}

// HÀM NÉN ẢNH: Để bạn thêm bao nhiêu ảnh cũng không sợ bị đầy bộ nhớ
function compressDetailImage(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1000; // Ảnh chi tiết cho nét hơn một chút
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // Nén còn 60%
            callback(dataUrl);
        };
    };
}

// Kiểm tra xem nút có tồn tại không rồi mới gắn lệnh
const addPhotosInput = document.getElementById('inputAddPhotos');

if (addPhotosInput) {
    addPhotosInput.addEventListener('change', function(e) {
        const files = e.target.files;
        
        // Kiểm tra xem có đang mở album nào không
        if (typeof currentAlbumId === 'undefined' || !currentAlbumId) {
            alert("Chưa xác định được Album để thêm ảnh!");
            return;
        }

        const albumId = currentAlbumId; 

        Array.from(files).forEach(file => {
            // Đảm bảo hàm compressDetailImage đã được định nghĩa ở trên hoặc file khác
            if (typeof compressDetailImage === 'function') {
                compressDetailImage(file, function(compressedBase64) {
                    database.ref(`albums/${albumId}/photos`).push(compressedBase64)
                    .then(() => {
                        console.log("Đã đồng bộ ảnh lên Firebase!");
                    })
                    .catch(err => console.error("Lỗi đồng bộ: " + err.message));
                });
            }
        });
    });
}

// Nút đóng bảng chi tiết
document.getElementById('btnCloseDetail').onclick = () => {
    document.getElementById('modalAlbumDetail').style.display = 'none';
};