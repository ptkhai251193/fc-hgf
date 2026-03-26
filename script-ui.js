// 1. Cấu hình Firebase (Sử dụng cú pháp Compat để chạy trực tiếp trên web)
const firebaseConfig = {
  apiKey: "AIzaSyB61v8FCk4pUVWY61W-35OBk_7mgEQWsBA",
  authDomain: "fc-hgf.firebaseapp.com",
  databaseURL: "https://fc-hgf-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fc-hgf",
  storageBucket: "fc-hgf.firebasestorage.app",
  messagingSenderId: "1057951855896",
  appId: "1:1057951855896:web:6a50e64266f8ebaf339a6d"
};

// 2. Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 3. Tự động lấy dữ liệu từ mạng về khi có thay đổi
database.ref('members').on('value', (snapshot) => {
    const data = snapshot.val();
    const grid = document.getElementById('memberGrid');
    if (!grid) return;

    if (!data) {
        grid.innerHTML = "<p style='text-align:center; color:#ffcc00; width:100%;'>Chưa có thành viên nào.</p>";
        return;
    }

    // Chuyển dữ liệu từ Firebase thành danh sách để vẽ
    const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));

    grid.innerHTML = list.map(m => `
        <div class="member-card" id="mem-${m.id}" style="position: relative;">
            <button class="delete-mem-btn" onclick="deleteMember('${m.id}')" 
                    style="position: absolute; top: 10px; right: 10px; background: red; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">×</button>
            <img src="${m.img}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border: 3px solid #6CABDD; margin-bottom:10px;">
            <h3 style="margin: 5px 0; color: #ffcc00; text-shadow: 2px 2px 4px black;">${m.name}</h3>
            <p style="margin: 0; color: white; font-style: italic;">Số: ${m.number}</p>
        </div>
    `).join('');
});

// 4. Hàm thêm thành viên lên mạng
function addMember() {
    const name = document.getElementById('memName').value;
    const age = document.getElementById('memAge').value;
    const number = document.getElementById('memNumber').value;
    const imgInput = document.getElementById('memImg');

    if (!name || !number) {
        alert("Bạn quên nhập Tên hoặc Số áo rồi!");
        return;
    }

    // Hàm thực hiện đẩy lên mạng
    const sendToFirebase = (imgBase64) => {
        console.log("Đang bắt đầu gửi dữ liệu..."); // Dòng này để kiểm tra ở F12
        database.ref('members').push({
            name: name,
            age: age,
            number: number,
            img: imgBase64 || ""
        })
        .then(() => {
            alert("Thành công! Hãy kiểm tra trang Firebase của bạn.");
            location.reload(); // Tải lại trang để cập nhật
        })
        .catch((error) => {
            console.error("Lỗi gửi dữ liệu: ", error);
            alert("Lỗi: " + error.message);
        });
    };

    if (imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => sendToFirebase(e.target.result);
        reader.readAsDataURL(imgInput.files[0]);
    } else {
        sendToFirebase(""); // Gửi không có ảnh nếu người dùng không chọn
    }
}

// 5. Hàm xóa (Cần mật khẩu bảo mật)
function deleteMember(id) {
    if (confirm("Bạn muốn xóa thành viên này?")) {
        const pass = prompt("Nhập mật khẩu (HGF2026):");
        if (pass === "HGF2026") {
            database.ref('members/' + id).remove();
            alert("Đã xóa!");
        } else {
            alert("Sai mật khẩu!");
        }
    }
}

// 6. Các hàm giao diện (ShowTab, Toggle Form...)
function showTab(tabName) {
    if (tabName === 'thanh-vien') {
        document.querySelector('.top-banner').style.display = 'none';
        document.querySelector('.main-heading').style.display = 'none';
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('thanh-vien-page').style.display = 'block';
        window.scrollTo(0, 0);
    }
}

function goBackHome() {
    document.querySelector('.top-banner').style.display = 'block';
    document.querySelector('.main-heading').style.display = 'block';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('thanh-vien-page').style.display = 'none';
    window.scrollTo(0, 0);
}

function toggleAddMemberForm() {
    const form = document.getElementById('addMemberForm');
    form.style.display = (form.style.display === 'none' || form.style.display === '') ? 'block' : 'none';
}
// --- PHẦN XỬ LÝ ALBUM ẢNH ---

// Hàm này dùng để gửi ảnh Album lên Firebase
function addAlbum() {
    const imgInput = document.getElementById('albumImgInput'); // Đảm bảo ID này khớp với file index.html
    
    if (imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imgSrc = e.target.result;
            
            // Gửi dữ liệu vào thư mục 'albums' trên Firebase
            database.ref('albums').push({
                img: imgSrc,
                timestamp: Date.now()
            }).then(() => {
                alert("Đã thêm ảnh vào Album thành công!");
                imgInput.value = ""; // Xóa file cũ trong ô chọn
            }).catch((error) => {
                alert("Lỗi: " + error.message);
            });
        };
        reader.readAsDataURL(imgInput.files[0]);
    } else {
        alert("Vui lòng chọn một tấm ảnh Album!");
    }
}

// Hàm này dùng để tự động tải Album từ mạng về màn hình
database.ref('albums').on('value', (snapshot) => {
    const data = snapshot.val();
    const albumGrid = document.getElementById('albumGrid'); // ID nơi hiển thị ảnh
    if (!albumGrid) return;

    if (!data) {
        albumGrid.innerHTML = "<p style='color:white;'>Chưa có ảnh album nào.</p>";
        return;
    }

    const list = Object.values(data);
    // Vẽ lại toàn bộ ảnh trong Album
    albumGrid.innerHTML = list.map(item => `
        <div class="album-card" style="margin: 10px; display: inline-block;">
            <img src="${item.img}" style="width: 250px; border-radius: 8px; border: 2px solid #fff;">
        </div>
    `).reverse().join(''); // .reverse() để ảnh mới nhất nằm đầu tiên
});
// --- PHẦN XỬ LÝ ÁO ĐẤU ---

function addJersey() {
    const imgInput = document.getElementById('jerseyImgInput');
    if (imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            database.ref('jerseys').push({
                img: e.target.result
            }).then(() => {
                alert("Đã cập nhật mẫu áo đấu mới!");
                imgInput.value = "";
            });
        };
        reader.readAsDataURL(imgInput.files[0]);
    }
}

database.ref('jerseys').on('value', (snapshot) => {
    const data = snapshot.val();
    const jerseyGrid = document.getElementById('jerseyGrid');
    if (!jerseyGrid || !data) return;

    const list = Object.values(data);
    jerseyGrid.innerHTML = list.map(item => `
        <div class="jersey-card">
            <img src="${item.img}" style="width: 150px; border: 2px dashed #ffcc00; padding: 5px;">
        </div>
    `).join('');
});
// --- HÀM XỬ LÝ ÁO ĐẤU ---
function addJersey() {
    const imgInput = document.getElementById('jerseyImgInput'); // Bạn cần thêm input này vào modal tương ứng
    if (imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            database.ref('jerseys').push({ img: e.target.result })
            .then(() => alert("Đã thêm áo đấu!"));
        };
        reader.readAsDataURL(imgInput.files[0]);
    }
}

// --- HÀM XỬ LÝ ALBUM ---
// Sửa lại hàm addAlbum để khớp với ID trong file HTML của bạn
function addAlbum() {
    const title = document.getElementById('inputTitle').value;
    const imgInput = document.getElementById('inputImage');
    if (imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            database.ref('albums').push({
                title: title,
                img: e.target.result,
                date: new Date().toLocaleDateString()
            }).then(() => {
                alert("Đã thêm Album!");
                document.getElementById('modalCreateAlbum').style.display = 'none';
            });
        };
        reader.readAsDataURL(imgInput.files[0]);
    }
}

// --- HÀM XỬ LÝ VIDEO ---
function addVideoLink() {
    const link = document.getElementById('inputVideoLink').value;
    if (link) {
        database.ref('videos').push({ url: link })
        .then(() => {
            alert("Đã thêm Video!");
            document.getElementById('modalVideoLink').style.display = 'none';
        });
    }
}