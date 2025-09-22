// toast.js
export function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;

  // Style
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.background = "#333";
  toast.style.color = "#fff";
  toast.style.padding = "8px 14px";
  toast.style.borderRadius = "6px";
  toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  toast.style.fontSize = "14px";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.3s ease";

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });

  // Auto remove after 2s
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}
