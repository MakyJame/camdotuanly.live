// ============================================
// FIREBASE CONFIGURATION
// ============================================
// ⚠️ QUAN TRỌNG: Thay config này bằng config của BẠN từ Firebase Console
// Hướng dẫn lấy config ở phần sau

const firebaseConfig = {
    apiKey: "AIzaSyC01h45JR8wk4hrOEm2QvKmVVfFfY8ouGM",
    authDomain: "camdo-tuanly.firebaseapp.com",
    databaseURL: "https://camdo-tuanly-default-rtdb.firebaseio.com",
    projectId: "camdo-tuanly",
    storageBucket: "camdo-tuanly.firebasestorage.app",
    messagingSenderId: "20462751104",
    appId: "1:20462751104:web:cfed383ba5a576cb6b8565",
    measurementId: "G-PGSBH3GZBT"
};

// Khởi tạo Firebase
let database = null;
let isFirebaseEnabled = false;

try {
    // Kiểm tra xem config đã được thay chưa
    if (firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        isFirebaseEnabled = true;
        console.log("✅ Firebase connected successfully!");
    } else {
        console.warn("⚠️ Firebase chưa được cấu hình. Vui lòng thay firebaseConfig.");
    }
} catch (error) {
    console.error("❌ Firebase error:", error);
}

// ============================================
// PHẦN 1: SMOOTH SCROLLING (Cuộn mượt)
// ============================================
// Khi click vào link có href bắt đầu bằng #
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // Ngăn hành vi mặc định (nhảy cóc)
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth', // Cuộn mượt mà
                block: 'start' // Cuộn đến đầu element
            });
        }
    });
});

// ============================================
// PHẦN 2: FAQ ACCORDION (Mở/Đóng câu hỏi)
// ============================================
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');

        // Đóng tất cả FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });

        // Mở FAQ vừa click (nếu nó đang đóng)
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// ============================================
// PHẦN 3: CALCULATOR - TÍNH LÃI SUẤT
// ============================================

// Hàm format số thành dạng có dấu phẩy (VD: 10000000 → 10,000,000)
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Hàm xóa dấu phẩy để tính toán (VD: "10,000,000" → 10000000)
function unformatNumber(str) {
    return parseFloat(str.replace(/,/g, '')) || 0;
}

// Lắng nghe sự kiện khi người dùng nhập số tiền
const loanAmountInput = document.getElementById('loanAmount');
loanAmountInput.addEventListener('input', function (e) {
    // Lấy giá trị, xóa dấu phẩy, format lại
    let value = e.target.value.replace(/,/g, '');
    if (value) {
        e.target.value = formatNumber(value);
    }
});

// Lắng nghe click button "TÍNH TOÁN"
document.getElementById('calculateBtn').addEventListener('click', function () {
    // Bước 1: Lấy dữ liệu từ input
    const loanAmountStr = document.getElementById('loanAmount').value;
    const loanMonths = parseInt(document.getElementById('loanMonths').value);

    // Bước 2: Validate (kiểm tra dữ liệu hợp lệ)
    if (!loanAmountStr || !loanMonths) {
        alert('⚠️ Vui lòng nhập đầy đủ số tiền và số tháng!');
        return;
    }

    const loanAmount = unformatNumber(loanAmountStr);

    if (loanAmount <= 0) {
        alert('⚠️ Số tiền phải lớn hơn 0!');
        return;
    }

    if (loanMonths <= 0 || loanMonths > 120) {
        alert('⚠️ Số tháng phải từ 1 đến 120!');
        return;
    }

    // Bước 3: TÍNH TOÁN
    const interestRate = 0.05; // 5% = 0.05

    // Lãi mỗi tháng = Tiền gốc × 5%
    const monthlyInterest = loanAmount * interestRate;

    // Tổng lãi = Lãi mỗi tháng × Số tháng
    const totalInterest = monthlyInterest * loanMonths;

    // Tổng phải trả = Tiền gốc + Tổng lãi
    const totalPayment = loanAmount + totalInterest;

    // Bước 4: HIỂN THỊ KẾT QUẢ
    document.getElementById('resultPrincipal').textContent = formatNumber(loanAmount) + ' đ';
    document.getElementById('resultMonthlyInterest').textContent = formatNumber(monthlyInterest) + ' đ';
    document.getElementById('resultTotalInterest').textContent = formatNumber(totalInterest) + ' đ';
    document.getElementById('resultTotal').textContent = formatNumber(totalPayment) + ' đ';

    // Hiệu ứng: Làm nổi bật kết quả
    const resultDiv = document.getElementById('calculatorResult');
    resultDiv.style.animation = 'none';
    setTimeout(() => {
        resultDiv.style.animation = 'fadeInUp 0.5s';
    }, 10);
});

// ============================================
// PHẦN 4: CONTACT FORM SUBMISSION + FIREBASE
// ============================================

// Hàm hiển thị success message
function showSuccessMessage() {
    const successMsg = document.getElementById('successMessage');
    successMsg.classList.add('show');
    setTimeout(() => {
        successMsg.classList.remove('show');
    }, 5000);
}

// Hàm lưu contact vào Firebase
function saveContactToFirebase(contactData) {
    if (!isFirebaseEnabled) {
        console.warn("Firebase chưa được kích hoạt");
        return Promise.resolve();
    }

    // Tạo reference đến node 'contacts'
    const contactsRef = database.ref('contacts');

    // Push data mới (tự động tạo unique ID)
    return contactsRef.push({
        name: contactData.name,
        phone: contactData.phone,
        amount: contactData.amount,
        message: contactData.message,
        timestamp: Date.now(),
        date: new Date().toLocaleString('vi-VN')
    });
}

document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const amount = document.getElementById('amount').value;
    const message = document.getElementById('message').value;

    // Tạo object contact data
    const contactData = { name, phone, amount, message };

    // Lưu vào Firebase
    saveContactToFirebase(contactData)
        .then(() => {
            console.log("✅ Đã lưu vào Firebase");
            showSuccessMessage();

            // Alert cho user
            alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ gọi lại trong vòng 5 phút.\n\nBạn có thể gọi trực tiếp: 0789 606 413');

            // Reset form
            this.reset();
        })
        .catch((error) => {
            console.error("❌ Lỗi khi lưu:", error);
            alert('Đã gửi thông tin! (Firebase chưa kết nối)');
            this.reset();
        });
});

// ============================================
// PHẦN 5: SCROLL ANIMATION (Hiệu ứng khi cuộn)
// ============================================
const observerOptions = {
    threshold: 0.1 // Hiện khi 10% element vào viewport
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s';
        }
    });
}, observerOptions);

// Áp dụng animation cho các elements
document.querySelectorAll('.feature-card, .service-card, .step, .calculator-container').forEach(el => {
    observer.observe(el);
});

// ============================================
// PHẦN 6: CHATBOT
// ============================================

// KNOWLEDGE BASE - Câu hỏi và câu trả lời
const chatbotKnowledge = {
    'lãi suất': {
        answer: 'Lãi suất của chúng tôi chỉ 5%/tháng - thấp nhất khu vực! Ví dụ: vay 10 triệu, mỗi tháng chỉ trả lãi 500,000đ.',
        quickReplies: ['Cần giấy tờ gì?', 'Thời gian cầm?', 'Liên hệ']
    },
    'giấy tờ': {
        answer: 'Bạn chỉ cần mang CMND/CCCD và giấy tờ xe (cavet/đăng ký). Không cần hộ khẩu hay bảo lãnh gì thêm nhé!',
        quickReplies: ['Quy trình như thế nào?', 'Có giữ xe không?', 'Liên hệ']
    },
    'quy trình': {
        answer: '4 bước đơn giản:\n1️⃣ Liên hệ hotline\n2️⃣ Mang xe + giấy tờ đến định giá\n3️⃣ Ký hợp đồng rõ ràng\n4️⃣ Nhận tiền ngay trong 30 phút!',
        quickReplies: ['Lãi suất bao nhiêu?', 'Cần giấy tờ gì?', 'Liên hệ']
    },
    'thời gian': {
        answer: 'Thời gian cầm linh hoạt theo nhu cầu của bạn - có thể 1 tháng, 3 tháng, 6 tháng hoặc lâu hơn. Bạn có thể trả trước hạn bất cứ lúc nào!',
        quickReplies: ['Nếu quá hạn thì sao?', 'Lãi suất bao nhiêu?', 'Liên hệ']
    },
    'giữ xe': {
        answer: 'Tùy vào hình thức:\n🔹 Cầm giấy tờ xe: Bạn vẫn giữ xe để đi\n🔹 Cầm cả xe: Xe gửi tại cửa hàng an toàn',
        quickReplies: ['Quy trình thế nào?', 'Cần bao nhiêu tiền?', 'Liên hệ']
    },
    'quá hạn': {
        answer: 'Nếu quá hạn bạn có thể gia hạn thêm hoặc trả một phần. Chúng tôi luôn trao đổi và hỗ trợ khách hàng tốt nhất, không ép buộc hay làm khó!',
        quickReplies: ['Lãi suất?', 'Thời gian cầm?', 'Liên hệ']
    },
    'liên hệ': {
        answer: '📞 Hotline: 0274 3781 065 - 0789 606 413\n📍 Địa chỉ: 10 DT743A, KP. Nội Hóa 2, P. Đông Hòa, TP. Dĩ An, Bình Dương\n⏰ Mở cửa: Thứ 2 - CN (8:00 - 20:00)',
        quickReplies: ['Tính lãi suất', 'Quy trình', 'Cảm ơn']
    },
    'default': {
        answer: 'Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể hỏi về: lãi suất, giấy tờ, quy trình, thời gian cầm, hoặc liên hệ!',
        quickReplies: ['Lãi suất?', 'Giấy tờ cần gì?', 'Quy trình?', 'Liên hệ']
    }
};

// Biến lưu trạng thái
let chatHistory = [];

// Hàm tìm câu trả lời phù hợp
function findAnswer(userMessage) {
    const msg = userMessage.toLowerCase().trim();

    // Kiểm tra từng keyword
    if (msg.includes('lãi') || msg.includes('suất') || msg.includes('%')) {
        return chatbotKnowledge['lãi suất'];
    }
    if (msg.includes('giấy') || msg.includes('tờ') || msg.includes('cmnd') || msg.includes('cccd')) {
        return chatbotKnowledge['giấy tờ'];
    }
    if (msg.includes('quy') || msg.includes('trình') || msg.includes('thủ tục') || msg.includes('làm')) {
        return chatbotKnowledge['quy trình'];
    }
    if (msg.includes('thời gian') || msg.includes('bao lâu') || msg.includes('cầm')) {
        return chatbotKnowledge['thời gian'];
    }
    if (msg.includes('giữ xe') || msg.includes('có giữ') || msg.includes('gửi xe')) {
        return chatbotKnowledge['giữ xe'];
    }
    if (msg.includes('quá hạn') || msg.includes('trễ') || msg.includes('chậm')) {
        return chatbotKnowledge['quá hạn'];
    }
    if (msg.includes('liên hệ') || msg.includes('số') || msg.includes('điện thoại') || msg.includes('địa chỉ')) {
        return chatbotKnowledge['liên hệ'];
    }

    // Không tìm thấy
    return chatbotKnowledge['default'];
}

// Hàm thêm tin nhắn vào chat
function addMessage(text, isUser = false, quickReplies = []) {
    const messagesDiv = document.getElementById('chatbotMessages');

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'message-user' : 'message-bot'}`;

    if (isUser) {
        messageDiv.innerHTML = `
                    <div class="message-bubble">${text}</div>
                `;
    } else {
        messageDiv.innerHTML = `
                    <div class="bot-avatar">🤖</div>
                    <div>
                        <div class="message-bubble">${text.replace(/\n/g, '<br>')}</div>
                        ${quickReplies.length > 0 ? `
                            <div class="quick-replies">
                                ${quickReplies.map(reply => `
                                    <button class="quick-reply-btn" onclick="handleQuickReply('${reply}')">${reply}</button>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
    }

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    chatHistory.push({ text, isUser });
}

// Hàm hiển thị typing indicator
function showTyping() {
    const messagesDiv = document.getElementById('chatbotMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message message-bot';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
                <div class="bot-avatar">🤖</div>
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            `;
    messagesDiv.appendChild(typingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function hideTyping() {
    const typingDiv = document.getElementById('typingIndicator');
    if (typingDiv) typingDiv.remove();
}

// Hàm xử lý tin nhắn của user
function handleUserMessage(message) {
    if (!message.trim()) return;

    // Thêm tin nhắn user
    addMessage(message, true);

    // Hiển thị typing
    showTyping();

    // Delay 1 giây để giống thật
    setTimeout(() => {
        hideTyping();

        // Tìm câu trả lời
        const response = findAnswer(message);
        addMessage(response.answer, false, response.quickReplies);
    }, 1000);

    // Clear input
    document.getElementById('chatbotInput').value = '';
}

// Hàm xử lý quick reply
window.handleQuickReply = function (reply) {
    handleUserMessage(reply);
};

// Toggle chatbot
document.getElementById('chatbotToggle').addEventListener('click', function () {
    const window = document.getElementById('chatbotWindow');
    const isActive = window.classList.contains('active');

    if (!isActive) {
        window.classList.add('active');

        // Nếu lần đầu mở, hiển thị tin nhắn chào
        if (chatHistory.length === 0) {
            setTimeout(() => {
                addMessage('Xin chào! Tôi là trợ lý tư vấn của Cầm Đồ Tuấn Lý. Tôi có thể giúp gì cho bạn?', false, [
                    'Lãi suất bao nhiêu?',
                    'Cần giấy tờ gì?',
                    'Quy trình thế nào?',
                    'Liên hệ'
                ]);
            }, 500);
        }
    } else {
        window.classList.remove('active');
    }
});

// Close chatbot
document.getElementById('chatbotClose').addEventListener('click', function () {
    document.getElementById('chatbotWindow').classList.remove('active');
});

// Send message button
document.getElementById('chatbotSend').addEventListener('click', function () {
    const input = document.getElementById('chatbotInput');
    handleUserMessage(input.value);
});

// Enter key to send
document.getElementById('chatbotInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        handleUserMessage(this.value);
    }
});

// ============================================
// PHẦN 7: ADMIN PANEL - QUẢN LÝ CONTACTS (với Firebase Auth)
// ============================================

let isAdminAuthenticated = false;
let currentUser = null;

// Khởi tạo Firebase Auth
let auth = null;
if (isFirebaseEnabled) {
    auth = firebase.auth();

    // Lắng nghe trạng thái đăng nhập
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            isAdminAuthenticated = true;
            console.log("✅ User đã đăng nhập:", user.email);
        } else {
            currentUser = null;
            isAdminAuthenticated = false;
            console.log("❌ User chưa đăng nhập");
        }
    });
}

// Hàm đăng nhập với Firebase Authentication
window.loginWithFirebaseAuth = function () {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    // Validate input
    if (!email || !password) {
        alert('⚠️ Vui lòng nhập đầy đủ email và mật khẩu!');
        return;
    }

    if (!auth) {
        alert('❌ Firebase Auth chưa được khởi tạo!');
        return;
    }

    // Đăng nhập
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Đăng nhập thành công
            const user = userCredential.user;
            console.log("✅ Đăng nhập thành công!", user.email);

            isAdminAuthenticated = true;
            currentUser = user;

            // Ẩn form login, hiện danh sách
            document.getElementById('adminLogin').style.display = 'none';
            document.getElementById('contactList').style.display = 'block';

            // Load contacts
            loadContacts();

            alert('✅ Đăng nhập thành công! Xin chào ' + user.email);
        })
        .catch((error) => {
            // Đăng nhập thất bại
            console.error("❌ Lỗi đăng nhập:", error);

            let errorMessage = '';
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Email không hợp lệ!';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'Tài khoản không tồn tại!';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Mật khẩu sai!';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Quá nhiều lần thử! Vui lòng thử lại sau.';
                    break;
                default:
                    errorMessage = 'Lỗi: ' + error.message;
            }

            alert('❌ ' + errorMessage);
        });
};

// Hàm đăng xuất
window.logoutAdmin = function () {
    if (auth) {
        auth.signOut()
            .then(() => {
                console.log("✅ Đã đăng xuất");
                isAdminAuthenticated = false;
                currentUser = null;

                // Ẩn danh sách, hiện form login
                document.getElementById('contactList').style.display = 'none';
                document.getElementById('adminLogin').style.display = 'block';

                // Clear form
                document.getElementById('adminEmail').value = '';
                document.getElementById('adminPassword').value = '';

                alert('✅ Đã đăng xuất thành công!');
            })
            .catch((error) => {
                console.error("❌ Lỗi đăng xuất:", error);
            });
    }
};

// Toggle admin panel
document.getElementById('adminToggle').addEventListener('click', function () {
    const panel = document.getElementById('adminPanel');
    panel.classList.toggle('active');

    // Nếu mở panel
    if (panel.classList.contains('active')) {
        if (!isAdminAuthenticated) {
            // Chưa login → hiện form login
            document.getElementById('adminLogin').style.display = 'block';
            document.getElementById('contactList').style.display = 'none';
        } else if (isFirebaseEnabled) {
            // Đã login → load contacts
            document.getElementById('adminLogin').style.display = 'none';
            document.getElementById('contactList').style.display = 'block';
            loadContacts();
        }
    }
});

// Close admin panel
document.getElementById('adminClose').addEventListener('click', function () {
    document.getElementById('adminPanel').classList.remove('active');
});

// Hàm load tất cả contacts từ Firebase
function loadContacts() {
    if (!isFirebaseEnabled) {
        document.getElementById('contactList').innerHTML = `
                    <div class="empty-state">
                        <p>⚠️ Firebase chưa được cấu hình</p>
                        <p style="font-size: 0.9rem;">Vui lòng xem hướng dẫn setup bên dưới</p>
                    </div>
                `;
        return;
    }

    const contactsRef = database.ref('contacts');

    // Lắng nghe real-time updates
    contactsRef.on('value', (snapshot) => {
        const contacts = snapshot.val();
        const contactListDiv = document.getElementById('contactList');

        // Nếu không có contacts
        if (!contacts) {
            contactListDiv.innerHTML = `
                        <div class="empty-state">
                            <p>📭 Chưa có liên hệ nào</p>
                        </div>
                    `;
            return;
        }

        // Chuyển object thành array và sắp xếp theo thời gian
        const contactsArray = Object.entries(contacts).map(([id, data]) => ({
            id,
            ...data
        })).sort((a, b) => b.timestamp - a.timestamp);

        // Hiển thị danh sách
        contactListDiv.innerHTML = contactsArray.map(contact => `
                    <div class="contact-item-admin">
                        <h4>👤 ${contact.name}</h4>
                        <p><strong>📞 SĐT:</strong> ${contact.phone}</p>
                        <p><strong>💰 Số tiền:</strong> ${contact.amount || 'Không ghi'}</p>
                        <p><strong>💬 Ghi chú:</strong> ${contact.message || 'Không có'}</p>
                        <small>🕐 ${contact.date}</small>
                        <br>
                        <button class="delete-btn" onclick="deleteContact('${contact.id}')">🗑️ Xóa</button>
                    </div>
                `).join('');
    });
}

// Hàm xóa contact
window.deleteContact = function (contactId) {
    if (!isFirebaseEnabled) return;

    if (confirm('Bạn có chắc muốn xóa liên hệ này?')) {
        database.ref('contacts/' + contactId).remove()
            .then(() => {
                console.log('✅ Đã xóa contact');
            })
            .catch((error) => {
                console.error('❌ Lỗi khi xóa:', error);
            });
    }
};