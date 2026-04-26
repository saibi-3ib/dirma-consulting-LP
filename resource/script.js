document.addEventListener('DOMContentLoaded', () => {
    // ページ読み込み時にイベントリスナーを設定
    setupValidation();
    setupVideoLazyLoad();
});

/**
 * フォームバリデーションの設定
 */
function setupValidation() {
    const form = document.getElementById('registrationForm');
    if (!form) return;

    const inputs = form.querySelectorAll('input, select');

    // 各入力欄に「カーソルが外れたとき(blur)」のチェックイベントを追加
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateInput(input);
        });

        // 入力中(input)は、エラーが解消されたら赤枠を消す親切設計にする
        input.addEventListener('input', () => {
            if (input.classList.contains('border-red-500')) {
                // 再チェックしてエラーがなければクリア
                const errorType = getErrorType(input);
                if (!errorType) {
                    clearError(input);
                }
            }
        });
    });
}

/**
 * 個別の入力欄をチェックする関数
 * @param {HTMLElement} input - チェック対象のinput要素
 * @returns {boolean} - エラーがなければ true
 */
function validateInput(input) {
    const errorType = getErrorType(input);

    if (errorType) {
        showError(input, errorType);
        return false;
    } else {
        clearError(input);
        return true;
    }
}

/**
 * エラーの種類を判定する関数
 */
function getErrorType(input) {
    const val = input.value.trim();
    const name = input.name;

    // 1. 必須チェック
    if (input.hasAttribute('required') && !val) {
        return 'required';
    }

    // 2. メールアドレス形式チェック (contactEmailのみ)
    if (name === 'contactEmail' && val) {
        // 簡易正規表現: 文字列 @ 文字列 . 文字列
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(val)) {
            return 'format';
        }
    }

    // 3. メールアドレス一致チェック (contactEmailConfirmのみ)
    if (name === 'contactEmailConfirm' && val) {
        const originalEmail = document.getElementById('contactEmail').value.trim();
        if (val !== originalEmail) {
            return 'mismatch';
        }
    }

    return null; // エラーなし
}

/**
 * エラーを表示する関数
 */
function showError(input, type) {
    // 赤枠をつける
    input.classList.add('border-red-500', 'bg-red-50');
    
    // 直後のエラーメッセージ要素を探す
    const errorMsg = input.nextElementSibling;
    if (errorMsg && errorMsg.classList.contains('error-message')) {
        errorMsg.classList.remove('hidden');
        
        // エラータイプに応じてメッセージを出し分ける（必要であればHTML側を汎用的にしてここで書き換えても良い）
        // 今回はHTMLに書かれたメッセージを表示する前提で制御
    }
}

/**
 * エラーを消去する関数
 */
function clearError(input) {
    // 赤枠を消す
    input.classList.remove('border-red-500', 'bg-red-50');
    
    // エラーメッセージを隠す
    const errorMsg = input.nextElementSibling;
    if (errorMsg && errorMsg.classList.contains('error-message')) {
        errorMsg.classList.add('hidden');
    }
}

/**
 * 送信ボタン押下時の処理
 */
function submitForm() {
    const form = document.getElementById('registrationForm');
    const resultDiv = document.getElementById('form-result');
    
    // UI Elements
    const btn = document.getElementById('submitButton');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    const formWrapper = document.getElementById('form-wrapper');
    const successMessage = document.getElementById('success-message');

    // 結果表示のリセット
    resultDiv.classList.add('hidden');
    resultDiv.textContent = '';

    // 全項目のバリデーションを一括実行
    const inputs = form.querySelectorAll('input, select');
    let isAllValid = true;

    inputs.forEach(input => {
        const isValid = validateInput(input);
        if (!isValid) {
            isAllValid = false;
        }
    });

    // エラーが1つでもあれば送信中断
    if (!isAllValid) {
        // 最初のエラー項目までスクロールしてあげる（親切設計）
        const firstError = form.querySelector('.border-red-500');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return; 
    }

    // --- ここから送信処理 ---
    
    // ボタンを無効化（二重送信防止）
    btn.disabled = true;
    btn.classList.add('opacity-75', 'cursor-not-allowed');
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');

    // データの準備
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
            // 成功アニメーション
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
        // エラー時の復帰処理
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

/**
 * 動画の遅延読み込み設定
 */
function setupVideoLazyLoad() {
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
                            console.log("自動再生がブロックされました:", error);
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
}