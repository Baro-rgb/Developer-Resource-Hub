const BACKEND_URL = 'http://localhost:4000/api';

document.addEventListener('DOMContentLoaded', async () => {
  const authSection = document.getElementById('authSection');
  const saveSection = document.getElementById('saveSection');
  const tokenInput = document.getElementById('tokenInput');
  const saveTokenBtn = document.getElementById('saveTokenBtn');
  const authMsg = document.getElementById('authMsg');
  
  const urlInput = document.getElementById('urlInput');
  const fetchBtn = document.getElementById('fetchBtn');
  const statusBox = document.getElementById('statusBox');
  const statusMsg = document.getElementById('statusMsg');
  const loader = document.getElementById('loader');
  const logoutBtn = document.getElementById('logoutBtn');

  // Check auth
  chrome.storage.local.get(['authToken'], async (result) => {
    if (result.authToken) {
      showSaveSection();
    } else {
      showAuthSection();
    }
  });

  // Handle Token Save
  saveTokenBtn.addEventListener('click', () => {
    const token = tokenInput.value.trim();
    if (!token) return;
    chrome.storage.local.set({ authToken: token }, () => {
      authMsg.textContent = 'Đã lưu Token!';
      authMsg.className = 'msg success';
      setTimeout(showSaveSection, 1000);
    });
  });

  // Handle Logout
  logoutBtn.addEventListener('click', () => {
    chrome.storage.local.remove(['authToken'], () => {
      tokenInput.value = '';
      authMsg.textContent = '';
      showAuthSection();
    });
  });

  // Handle Fetch & Save
  fetchBtn.addEventListener('click', async () => {
    const url = urlInput.value;
    if (!url) return;

    chrome.storage.local.get(['authToken'], async (result) => {
      const token = result.authToken;
      if (!token) return showAuthSection();

      try {
        fetchBtn.disabled = true;
        statusBox.classList.remove('hidden');
        loader.style.display = 'block';
        statusMsg.textContent = 'Đang quét dữ liệu trang web...';
        statusMsg.className = '';

        // 1. Fetch Meta (AI)
        const metaRes = await fetch(`${BACKEND_URL}/automation/fetch-meta`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ url })
        });
        
        const metaData = await metaRes.json();
        if (!metaRes.ok || !metaData.success) {
          throw new Error('Lỗi khi phân tích web');
        }

        statusMsg.textContent = 'Đang lưu vào Hub...';

        const { title, description, category, subcategory, technologies } = metaData.data;

        // 2. Save Resource
        const saveRes = await fetch(`${BACKEND_URL}/resources`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: title || 'Tài nguyên chưa có tên',
            url: url,
            description: description || '',
            category: category || '',
            subcategory: subcategory || '',
            technologies: technologies || [],
            source: 'Khác' // Default source
          })
        });

        if (!saveRes.ok) {
          throw new Error('Lỗi khi lưu tài nguyên');
        }

        loader.style.display = 'none';
        statusMsg.textContent = '✅ Đã lưu thành công!';
        statusMsg.className = 'success';
        
        setTimeout(() => {
          window.close(); // Close popup after success
        }, 2000);

      } catch (err) {
        loader.style.display = 'none';
        statusMsg.textContent = '❌ ' + err.message;
        statusMsg.className = 'error';
        fetchBtn.disabled = false;
      }
    });
  });

  // Helper functions
  function showAuthSection() {
    authSection.classList.remove('hidden');
    saveSection.classList.add('hidden');
  }

  function showSaveSection() {
    authSection.classList.add('hidden');
    saveSection.classList.remove('hidden');
    
    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab && currentTab.url) {
        // Không tự động điền nếu đang mở localhost hoặc trang nội bộ của Chrome
        if (!currentTab.url.includes('localhost:') && !currentTab.url.startsWith('chrome://')) {
          urlInput.value = currentTab.url;
        } else {
          urlInput.value = '';
        }
      }
    });
  }
});
