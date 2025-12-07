function submitForm() {
    const form = document.getElementById('registrationForm');
    const resultDiv = document.getElementById('form-result');
    const inputs = form.querySelectorAll('input, select');
    
    // UI Elements
    const btn = document.getElementById('submitButton');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    const formWrapper = document.getElementById('form-wrapper');
    const successMessage = document.getElementById('success-message');

    let isValid = true;

    // リセット
    inputs.forEach(input => {
        const errorMsg = input.nextElementSibling;
        if (errorMsg && errorMsg.classList.contains('error-message')) {
            errorMsg.classList.add('hidden');
        }
        input.classList.remove('border-red-500', 'bg-red-50');
    });
    resultDiv.classList.add('hidden');
    resultDiv.textContent = '';

    // バリデーション
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            input.classList.add('border-red-500', 'bg-red-50');
            const errorMsg = input.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-message')) {
                errorMsg.classList.remove('hidden');
            }
        }
    });

    if (!isValid) return;

    // 送信中表示
    btn.disabled = true;
    btn.classList.add('opacity-75', 'cursor-not-allowed');
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');

    // データ準備
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        if (data[key]) {
            if (!Array.isArray(data[key])) {
                data[key] = [data[key]];
            }
            data[key].push(value);
        } else {
            data[key] = value;
        }
    });

    const API_ENDPOINT = 'resource/send_mail.php';

    fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            // --- 成功時のアニメーション ---
            
            // 1. フォームを折りたたむ（高さ0、透明度0、余白0）
            formWrapper.style.maxHeight = '0px';
            formWrapper.style.opacity = '0';
            formWrapper.style.marginBottom = '0';
            formWrapper.style.padding = '0';

            // 2. 完了メッセージを表示準備（hidden削除）
            successMessage.classList.remove('hidden');
            successMessage.classList.add('flex');

            // 3. 少し待ってから完了メッセージをフェードイン（opacity 1, translateY 0）
            setTimeout(() => {
                successMessage.classList.remove('opacity-0', 'translate-y-4');
                successMessage.classList.add('opacity-100', 'translate-y-0');
            }, 600); // フォームが消えかけるタイミングで表示開始

            form.reset();
        } else {
            throw new Error(result.message);
        }
    })
    .catch(error => {
        resultDiv.classList.remove('hidden');
        resultDiv.textContent = '通信エラーが発生しました: ' + (error.message || '不明なエラー');
        resultDiv.classList.add('text-red-400');
        
        btn.disabled = false;
        btn.classList.remove('opacity-75', 'cursor-not-allowed');
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
        
        console.error('Error:', error);
    });
}