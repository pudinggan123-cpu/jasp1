// Fungsi website utama JASP
document.getElementById("year").textContent = new Date().getFullYear();
// Tombol navigasi pengelola berubah menjadi chip profil setelah login.
function renderAdminNav(){
  const link=document.getElementById('adminNavLink'); if(!link)return;
  let loggedIn=false, profile={};
  try { loggedIn=localStorage.getItem('jasp_admin_logged_in')==='true'; profile=JSON.parse(localStorage.getItem('jasp_admin_profile')||'{}'); } catch(e) { /* local file mode may restrict browser storage */ }
  if(!loggedIn){link.textContent='Login';link.className='button button-small';link.href='admin.html';return;}
  const name=profile.name||'Admin'; link.className='admin-nav-profile';link.href='admin.html';link.replaceChildren();
  if(profile.avatar){const img=document.createElement('img');img.src=profile.avatar;img.alt='Foto profil';img.className='admin-nav-avatar';link.appendChild(img);}
  else{const avatar=document.createElement('span');avatar.className='admin-nav-avatar admin-nav-placeholder';avatar.textContent=(name.trim()[0]||'A').toUpperCase();link.appendChild(avatar);}
  const label=document.createElement('span');label.className='admin-nav-name';label.textContent=name;link.appendChild(label);
}
renderAdminNav();
window.addEventListener('pageshow',renderAdminNav);
window.addEventListener('storage',event=>{if(!event.key||event.key.startsWith('jasp_admin_'))renderAdminNav();});


const claimButton = document.getElementById("claimVoucher");
const voucherNotice = document.getElementById("voucherNotice");
const clientForm = document.getElementById("clientForm");
const clientLoginFields = document.getElementById("clientLoginFields");
const clientLoggedIn = document.getElementById("clientLoggedIn");
const clientMessage = document.getElementById("clientMessage");
const clientVoucherInput = document.getElementById("clientVoucher");
const activeVoucherCode = document.getElementById("activeVoucherCode");
const CLIENT_SESSION_KEY = "jasp_client_session";

function showClientLoggedIn(code) {
  clientLoginFields.hidden = true;
  clientLoggedIn.hidden = false;
  activeVoucherCode.textContent = code;
  clientMessage.className = "form-message";
  clientMessage.textContent = "";
}
function showClientLoggedOut() {
  clientLoginFields.hidden = false;
  clientLoggedIn.hidden = true;
  clientForm.reset();
  clientMessage.className = "form-message";
  clientMessage.textContent = "";
}
const CLIENT_PROFILE_KEY = "jasp_client_profile";
function getClientSession() {
  try { return JSON.parse(localStorage.getItem(CLIENT_SESSION_KEY) || "null"); }
  catch (error) { return null; }
}
function getClientProfile() {
  try { return JSON.parse(localStorage.getItem(CLIENT_PROFILE_KEY) || "{}"); }
  catch (error) { return {}; }
}
function renderClientProfile() {
  const profile = getClientProfile();
  const name = profile.name || "Pelanggan JASP";
  const avatar = document.getElementById("clientAvatar");
  const placeholder = document.getElementById("clientAvatarPlaceholder");
  document.getElementById("clientDisplayName").textContent = name;
  document.getElementById("clientNameInput").value = profile.name || "";
  if (profile.avatar) {
    avatar.src = profile.avatar;
    avatar.hidden = false;
    placeholder.hidden = true;
  } else {
    avatar.removeAttribute("src");
    avatar.hidden = true;
    placeholder.hidden = false;
  }
}
const savedClientSession = getClientSession();
if (savedClientSession && savedClientSession.voucher && savedClientSession.loggedIn) {
  showClientLoggedIn(savedClientSession.voucher);
  renderClientProfile();
}

// Simpan foto dan nama profil agar tetap ada saat halaman dibuka kembali.
document.getElementById("clientAvatarInput").addEventListener("change", function () {
  const file = this.files && this.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    clientMessage.className = "form-message show error";
    clientMessage.textContent = "Pilih file gambar untuk foto profil.";
    this.value = "";
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    clientMessage.className = "form-message show error";
    clientMessage.textContent = "Ukuran foto maksimal 2 MB.";
    this.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = function () {
    const profile = getClientProfile();
    profile.avatar = reader.result;
    try {
      localStorage.setItem(CLIENT_PROFILE_KEY, JSON.stringify(profile));
      renderClientProfile();
      clientMessage.className = "form-message show ok";
      clientMessage.textContent = "Foto profil tersimpan.";
    } catch (error) {
      clientMessage.className = "form-message show error";
      clientMessage.textContent = "Foto gagal disimpan. Coba gambar yang lebih kecil.";
    }
  };
  reader.readAsDataURL(file);
});
document.getElementById("saveClientProfile").addEventListener("click", function () {
  const profile = getClientProfile();
  profile.name = document.getElementById("clientNameInput").value.trim().slice(0, 40) || "Pelanggan JASP";
  try {
    localStorage.setItem(CLIENT_PROFILE_KEY, JSON.stringify(profile));
    renderClientProfile();
    clientMessage.className = "form-message show ok";
    clientMessage.textContent = "Profil berhasil disimpan.";
  } catch (error) {
    clientMessage.className = "form-message show error";
    clientMessage.textContent = "Profil belum bisa disimpan di browser ini.";
  }
});

claimButton.addEventListener("click", function () {
  voucherNotice.hidden = false;
  voucherNotice.textContent = "Kode voucher: JASP-TRY-01. Masukkan kode ini pada formulir masuk pelanggan.";
  clientVoucherInput.value = "JASP-TRY-01";
  document.getElementById("pelanggan").scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll("[data-package]").forEach(function (button) {
  button.addEventListener("click", function () {
    voucherNotice.hidden = false;
    voucherNotice.textContent = "Kamu memilih " + button.dataset.package + ". Pembayaran online belum terhubung.";
  });
});

clientForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const code = clientVoucherInput.value.trim().toUpperCase();
  if (code === "JASP-TRY-01") {
    localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify({ voucher: code, loggedIn: true }));
    showClientLoggedIn(code);
    renderClientProfile();
    clientMessage.className = "form-message show ok";
    clientMessage.textContent = "Berhasil masuk. Status masuk akan tetap tersimpan sampai kamu memilih Keluar.";
  } else {
    clientMessage.className = "form-message show error";
    clientMessage.textContent = "Kode voucher tidak ditemukan. Periksa kembali kode voucher.";
  }
});

document.getElementById("clientLogout").addEventListener("click", function () {
  localStorage.removeItem(CLIENT_SESSION_KEY);
  showClientLoggedOut();
  clientMessage.className = "form-message show ok";
  clientMessage.textContent = "Kamu sudah keluar dari akun pelanggan.";
});