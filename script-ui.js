// Lấy các phần tử từ HTML thông qua ID
const modal = document.getElementById('modalCreateAlbum');
const btnOpen = document.getElementById('btnOpenModal');
const btnClose = document.getElementById('btnCloseModal');

// Khi bấm nút "Tạo Album Mới", đổi style thành hiển thị (flex/block)
btnOpen.addEventListener('click', function() {
    modal.style.display = 'block';
});

// Khi bấm nút "X" trên hộp thoại, đổi style thành ẩn đi (none)
btnClose.addEventListener('click', function() {
    modal.style.display = 'none';
});

// Khi bấm ra vùng đen mờ bên ngoài hộp thoại, cũng ẩn nó đi
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
// 1. Tự động tính tuổi khi chọn ngày sinh
function calculateAge() {
    const birthInput = document.getElementById('memBirth').value;
    if (!birthInput) return;
    const birthDate = new Date(birthInput);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    document.getElementById('memAge').value = age;
}

// 2. Đóng/Mở Form nhập liệu
function toggleAddMemberForm() {
    const form = document.getElementById('addMemberForm');
    form.style.display = (form.style.display === 'none' || form.style.display === '') ? 'block' : 'none';
}

// 3. Hàm thêm thành viên (Đã sửa để gọi hàm xóa có mật khẩu)
function addMember() {
    const name = document.getElementById('memName').value;
    const age = document.getElementById('memAge').value;
    const number = document.getElementById('memNumber').value;
    const imgInput = document.getElementById('memImg');
    const grid = document.getElementById('memberGrid');

    if (!name || !number) {
        alert("Bạn quên nhập Tên hoặc Số áo kìa!");
        return;
    }

    const createCard = (imgSrc) => {
        const finalImg = imgSrc || 'https://via.placeholder.com/80?text=FC+HGF';
        const memberId = Date.now(); // Tạo ID duy nhất cho mỗi thành viên

        // LƯU Ý QUAN TRỌNG: Chỗ onclick đã đổi thành deleteMember
        const html = `
            <div class="member-card" id="mem-${memberId}" style="position: relative; animation: zoomIn 0.3s ease;">
                <button class="delete-mem-btn" onclick="deleteMember(${memberId})" 
                        style="position: absolute; top: 10px; right: 10px; background: red; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">×</button>
                <img src="${finalImg}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border: 3px solid #6CABDD; margin-bottom:10px;">
                <h3 style="margin: 5px 0; color: #1c2c5b;">${name}</h3>
                <p style="margin: 0; font-style: italic; color: #666;">Tuổi: ${age || '??'}</p>
                <span class="number" style="background: #6CABDD; color: white; padding: 2px 10px; border-radius: 15px; font-weight: bold; display: inline-block; margin-top: 5px;">Số ${number}</span>
            </div>
        `;
        
        // Lưu vào LocalStorage để không bị mất khi F5
        const newMember = { id: memberId, name, age, number, img: finalImg };
        let list = JSON.parse(localStorage.getItem('fcHGFMembers')) || [];
        list.push(newMember);
        localStorage.setItem('fcHGFMembers', JSON.stringify(list));

        grid.insertAdjacentHTML('beforeend', html);
        
        // Reset form
        document.getElementById('memName').value = '';
        document.getElementById('memBirth').value = '';
        document.getElementById('memAge').value = '';
        document.getElementById('memNumber').value = '';
        imgInput.value = '';
        toggleAddMemberForm();
    };

    if (imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => createCard(e.target.result);
        reader.readAsDataURL(imgInput.files[0]);
    } else {
        createCard(null);
    }
}

// 4. Hàm xóa thành viên (Sửa lại để xóa đúng thẻ ID)
function deleteMember(id) {
    const isConfirm = confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi đội bóng không?");
    
    if (isConfirm) {
        const password = prompt("XÁC NHẬN BẢO MẬT\nVui lòng nhập mật khẩu để thực hiện quyền xóa:");

        if (password === "HGF2026") {
            // Xóa trong bộ nhớ LocalStorage
            let list = JSON.parse(localStorage.getItem('fcHGFMembers')) || [];
            list = list.filter(m => m.id !== id);
            localStorage.setItem('fcHGFMembers', JSON.stringify(list));
            
            // Xóa trên giao diện ngay lập tức
            const memberCard = document.getElementById(`mem-${id}`);
            if (memberCard) memberCard.remove();

            alert("✅ Đã xóa thành viên thành công!");
        } else if (password !== null) {
            alert("❌ Sai mật khẩu! Bạn không thể xóa thành viên này.");
        }
    }
}
// Tự động nạp dữ liệu từ máy khi F5 hoặc vừa mở trang
document.addEventListener("DOMContentLoaded", function() {
    renderMembers(); 
});
function renderMembers() {
    const grid = document.getElementById('memberGrid');
    if (!grid) return;

    // Lấy danh sách từ bộ nhớ LocalStorage
    let list = JSON.parse(localStorage.getItem('fcHGFMembers')) || [];
    
    // Nếu không có ai thì hiện thông báo nhẹ
    if (list.length === 0) {
        grid.innerHTML = "<p style='text-align:center; color:#888; width:100%;'>Chưa có thành viên nào.</p>";
        return;
    }

    // Vẽ lại tất cả các thẻ cầu thủ dựa trên dữ liệu đã lưu
    grid.innerHTML = list.map(m => `
        <div class="member-card" id="mem-${m.id}" style="position: relative;">
            <button class="delete-mem-btn" onclick="deleteMember(${m.id})" 
                    style="position: absolute; top: 10px; right: 10px; background: red; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">×</button>
            <img src="${m.img || 'https://via.placeholder.com/80?text=FC+HGF'}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border: 3px solid #6CABDD; margin-bottom:10px;">
            <h3 style="margin: 5px 0; color: #1c2c5b;">${m.name}</h3>
            <p style="margin: 0; font-style: italic; color: #666;">Tuổi: ${m.age || '??'}</p>
            <span class="number" style="background: #6CABDD; color: white; padding: 2px 10px; border-radius: 15px; font-weight: bold; display: inline-block; margin-top: 5px;">Số ${m.number}</span>
        </div>
    `).join('');
}
function showTab(tabName) {
    if (tabName === 'thanh-vien') {
        // 1. Hiện trang thành viên và ghi đè style rõ ràng
        const memberPage = document.getElementById('thanh-vien-page');
        if (memberPage) {
            memberPage.style.setProperty('display', 'block', 'important');
        }

        // 2. Ẩn các phần kia (dòng này dự phòng thêm)
        if (document.querySelector('.top-banner')) document.querySelector('.top-banner').style.display = 'none';
        if (document.querySelector('.main-heading')) document.querySelector('.main-heading').style.display = 'none';
        if (document.getElementById('main-content')) document.getElementById('main-content').style.display = 'none';

        window.scrollTo(0, 0);
        if (typeof toggleMenu === 'function') toggleMenu();
    }
}

function goBackHome() {
    const banner = document.querySelector('.top-banner');
    const header = document.querySelector('.main-heading');
    const mainContent = document.getElementById('main-content');
    const memberPage = document.getElementById('thanh-vien-page');

    if (banner) banner.setAttribute('style', 'display: block');
    if (header) header.setAttribute('style', 'display: block');
    if (mainContent) mainContent.setAttribute('style', 'display: block');
    if (memberPage) memberPage.setAttribute('style', 'display: none');

    window.scrollTo(0, 0);
}