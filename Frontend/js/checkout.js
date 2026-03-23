// Checkout Form Handler

document.addEventListener('DOMContentLoaded', () => {
  const checkoutForm = document.getElementById('checkout-form');
  if (!checkoutForm) return;

  const messageEl = document.createElement('div');
  messageEl.id = 'checkout-message';
  messageEl.style.margin = '14px 0';
  messageEl.style.padding = '12px 14px';
  messageEl.style.borderRadius = '10px';
  messageEl.style.display = 'none';
  checkoutForm.insertBefore(messageEl, checkoutForm.firstChild);

  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(checkoutForm);
    const data = Object.fromEntries(formData.entries());

    if (!data.email || !data.phone || !data.firstName || !data.lastName || !data.address || !data.city || !data.postal || !data.cardNumber || !data.expiry || !data.cvv) {
      showMessage('Please complete all required fields before submitting.', 'error');
      return;
    }

    if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      showMessage('Please enter a valid email address.', 'error');
      return;
    }

    if (!data.phone.match(/^[0-9 \-()+]+$/)) {
      showMessage('Please enter a valid phone number.', 'error');
      return;
    }

    const submitButton = checkoutForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'Processing...';
    submitButton.disabled = true;

    setTimeout(() => {
      showMessage('Order submitted successfully! Redirecting to confirmation...', 'success');
      localStorage.setItem('lastOrder', JSON.stringify({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        total: document.getElementById('total-value')?.textContent || '$0.00',
      }));
      setTimeout(() => {
        window.location.href = 'order-confirmation.html';
      }, 1200);
    }, 900);
  });

  function showMessage(text, type) {
    messageEl.style.display = 'block';
    messageEl.style.background = type === 'error' ? '#fee2e2' : '#ecfdf3';
    messageEl.style.color = type === 'error' ? '#991b1b' : '#065f46';
    messageEl.style.border = type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0';
    messageEl.textContent = text;
  }
});
