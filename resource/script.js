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

    // Mail Input Elements
    const emailInput = document.getElementById('contactEmail');
    const emailConfirmInput = document.getElementById('contactEmailConfirm');

    let isValid = true;

    // リセット: エラー表示と結果メッセージをクリア
    inputs.forEach(input => {
        const errorMsg = input.nextElementSibling;
        if (errorMsg && errorMsg.classList.contains('error-message')) {
            errorMsg.classList.add('hidden');
        }
        input.classList.remove('border-red-500', 'bg-red-50');
    });
    resultDiv.classList.add('hidden');
    resultDiv.textContent = '';

    // バリデーションチェック (必須チェック)
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            showError(input);
        }
    });

    // メールアドレス形式チェック (正規表現)
    // 簡易的な形式チェック: 文字列@文字列.文字列
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput.value.trim() && !emailPattern.test(emailInput.value)) {
        isValid = false;
        showError(emailInput);
    }

    // メールアドレス一致チェック
    if (emailInput.value.trim() !== emailConfirmInput.value.trim()) {
        isValid = false;
        showError(emailConfirmInput);
    }

    if (!isValid) return; // エラーがあれば中断

    // 送信中表示
    btn.disabled = true;
    btn.classList.add('opacity-75', 'cursor-not-allowed');
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');

    // データ準備
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        // 確認用メールアドレスは送信データに含めない
        if (key === 'contactEmailConfirm') return;

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
            // 成功時のアニメーション
            formWrapper.style.maxHeight = '0px';
            formWrapper.style.opacity = '0';
            formWrapper.style.marginBottom = '0';
            formWrapper.style.padding = '0';

            successMessage.classList.remove('hidden');
            successMessage.classList.add('flex');

            setTimeout(() => {
                successMessage.classList.remove('opacity-0', 'translate-y-4');
                successMessage.classList.add('opacity-100', 'translate-y-0');
            }, 600);

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

// エラー表示用ヘルパー関数
function showError(inputElement) {
    inputElement.classList.add('border-red-500', 'bg-red-50');
    const errorMsg = inputElement.nextElementSibling;
    if (errorMsg && errorMsg.classList.contains('error-message')) {
        errorMsg.classList.remove('hidden');
    }
}

// 動画の遅延読み込み＆自動再生制御
document.addEventListener("DOMContentLoaded", function() {
    var lazyVideos = [].slice.call(document.querySelectorAll("video.lazy"));

    if ("IntersectionObserver" in window) {
        var lazyVideoObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(video) {
                if (video.isIntersecting) {
                    var videoElement = video.target;
                    var sources = videoElement.children;
                    for (var i = 0; i < sources.length; i++) {
                        var source = sources[i];
                        if (source.tagName === "SOURCE" && source.dataset.src) {
                            source.src = source.dataset.src;
                        }
                    }
                    videoElement.load();
                    videoElement.classList.remove("lazy");
                    
                    var playPromise = videoElement.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.log("自動再生ブロック:", error);
                        });
                    }
                    lazyVideoObserver.unobserve(videoElement);
                }
            });
        });

        lazyVideos.forEach(function(lazyVideo) {
            lazyVideoObserver.observe(lazyVideo);
        });
    }
});