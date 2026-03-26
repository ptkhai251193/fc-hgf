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
// 2. XỬ LÝ THÀNH VIÊN (MEMBERS)
// ==========================================
database.ref('members').on('value', (snapshot) => {
    const data = snapshot.val();
    const grid = document.getElementById('memberGrid');
    if (!grid) return;
    if (!data) {
        grid.innerHTML = "<p style='text-align:center; color:#ffcc00; width:100%;'>Chưa có thành viên nào.</p>";
        return;
    }
    const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    grid.innerHTML = list.map(m => `
        <div class="member-card" id="mem-${m.id}" style="position: relative;">
            <button class="delete-mem-btn" onclick="deleteMember('${m.id}')" style="position: absolute; top: 10px; right: 10px; background: red; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">×</button>
            <img src="${m.img}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border: 3px solid #6CABDD; margin-bottom:10px;">
            <h3 style="margin: 5px 0; color: #ffcc00;">${m.name}</h3>
            <p style="margin: 0; color: white;">Số: ${m.number}</p>
        </div>
    `).join('');
});

function addMember() {
    const name = document.getElementById('memName').value;
    const number = document.getElementById('memNumber').value;
    const imgInput = document.getElementById('memImg');
    if (!name || !number) { alert("Thiếu tên hoặc số áo!"); return; }

    const reader = new FileReader();
    reader.onload = (e) => {
        database.ref('members').push({ name, number, img: e.target.result })
        .then(() => { alert("Đã thêm thành viên!"); toggleAddMemberForm(); });
    };
    if (imgInput.files[0]) reader.readAsDataURL(imgInput.files[0]);
    else alert("Vui lòng chọn ảnh thành viên!");
}

// ==========================================
// 3. XỬ LÝ ALBUM KỶ NIỆM (ALBUMS)
// ==========================================
database.ref('albums').on('value', (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('albumContainer');
    if (!container) return;
    if (!data) { container.innerHTML = "<p style='color:white;'>Trống.</p>"; return; }

    const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    container.innerHTML = list.map(a => `
        <div class="album-card" style="margin:10px; background:rgba(0,0,0,0.5); padding:10px; border-radius:10px;">
            <img src="${a.img}" style="width:100%; border-radius:5px;">
            <h4 style="color:#ffcc00; margin:5px 0;">${a.title || 'Kỷ niệm'}</h4>
            <p style="color:#ccc; font-size:12px;">${a.date || ''}</p>
        </div>
    `).reverse().join('');
});

function addAlbum() {
    const title = document.getElementById('inputTitle').value;
    const date = document.getElementById('inputDate').value;
    const imgInput = document.getElementById('inputImage');
    if (!imgInput.files[0]) { alert("Chọn ảnh đại diện album!"); return; }

    const reader = new FileReader();
    reader.onload = (e) => {
        database.ref('albums').push({ title, date, img: e.target.result })
        .then(() => {
            alert("Đã tạo Album!");
            document.getElementById('modalCreateAlbum').style.display = 'none';
        });
    };
    reader.readAsDataURL(imgInput.files[0]);
}

// ==========================================
// 4. XỬ LÝ ÁO ĐẤU (JERSEYS)
// ==========================================
function openJerseyUpload() {
    const area = document.getElementById('jerseyUploadArea');
    if (area) {
        area.style.display = (area.style.display === 'none' || area.style.display === '') ? 'block' : 'none';
    }
}

function addJersey() {
    const imgInput = document.getElementById('jerseyImgInput');
    if (imgInput && imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            database.ref('jerseys').push({
                img: e.target.result,
                timestamp: Date.now()
            }).then(() => {
                alert("Đã cập nhật mẫu áo đấu mới!");
                document.getElementById('jerseyUploadArea').style.display = 'none';
                imgInput.value = ""; 
            });
        };
        reader.readAsDataURL(imgInput.files[0]);
    } else {
        alert("Vui lòng chọn ảnh áo đấu!");
    }
}

database.ref('jerseys').on('value', (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('jerseyContainer');
    if (!container) return;
    if (!data) {
        container.innerHTML = "<p style='color:white; text-align:center; width:100%;'>Chưa có mẫu áo nào.</p>";
        return;
    }
    const list = Object.values(data);
    container.innerHTML = list.map(item => `
        <div style="display: inline-block; margin: 10px; text-align: center;">
            <img src="${item.img}" style="width: 180px; border: 3px solid #6CABDD; border-radius: 15px; background: white; padding: 5px;">
        </div>
    `).reverse().join('');
});

// ==========================================
// 5. XỬ LÝ VIDEO KỶ NIỆM (VIDEOS)
// ==========================================
database.ref('videos').on('value', (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('videoContainer');
    if (!container || !data) return;
    const list = Object.values(data);
    container.innerHTML = list.map(v => {
        let videoId = v.url.includes('v=') ? v.url.split('v=')[1].split('&')[0] : v.url.split('/').pop();
        return `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${videoId}" frameborder="0" style="margin-bottom:10px;"></iframe>`;
    }).join('');
});

function addVideoLink() {
    const link = document.getElementById('inputVideoLink').value;
    if (!link) return;
    database.ref('videos').push({ url: link })
    .then(() => {
        alert("Đã thêm Video!");
        document.getElementById('modalVideoLink').style.display = 'none';
    });
}

// ==========================================
// 6. CÁC HÀM GIA