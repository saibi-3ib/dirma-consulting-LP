// script.js

function submitForm() {
    const form = document.getElementById('registrationForm');
    const resultDiv = document.getElementById('form-result');
    const inputs = form.querySelectorAll('input, select');
    let isValid = true;

    // Reset error messages and result text
    inputs.forEach(input => {
        const errorMsg = input.nextElementSibling;
        if (errorMsg && errorMsg.classList.contains('error-message')) {
            errorMsg.classList.add('hidden');
        }
        input.classList.remove('border-red-500', 'bg-red-50');
    });
    resultDiv.classList.add('hidden');
    resultDiv.textContent = '';
    resultDiv.className = 'text-center text-sm font-bold mt-2 hidden';

    // Validation Check
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            // Highlight Input
            input.classList.add('border-red-500', 'bg-red-50');
            // Show Error Message
            const errorMsg = input.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-message')) {
                errorMsg.classList.remove('hidden');
            }
        }
    });

    if (!isValid) {
        return; // Stop if validation fails
    }

    // Prepare Data
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        // Checkbox handling (append multiple values)
        if (data[key]) {
            if (!Array.isArray(data[key])) {
                data[key] = [data[key]];
            }
            data[key].push(value);
        } else {
            data[key] = value;
        }
    });

    // Send to Backend (send_mail.php)
    fetch('send_mail.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        resultDiv.classList.remove('hidden');
        if (result.status === 'success') {
            resultDiv.textContent = '送信が完了しました。担当者よりご連絡いたします。';
            resultDiv.classList.add('text-green-600');
            form.reset();
        } else {
            resultDiv.textContent = '送信に失敗しました: ' + result.message;
            resultDiv.classList.add('text-red-600');
        }
    })
    .catch(error => {
        resultDiv.classList.remove('hidden');
        resultDiv.textContent = '通信エラーが発生しました。';
        resultDiv.classList.add('text-red-600');
        console.error('Error:', error);
    });
}