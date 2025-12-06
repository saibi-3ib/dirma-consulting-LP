<?php
// send_mail.php

// CORS設定は同一ドメイン内であれば不要なので削除

// JSONレスポンス設定
header('Content-Type: application/json; charset=UTF-8');

// POSTメソッドのみ許可
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid Request Method']);
    exit;
}

// JSON入力の取得
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input) {
    echo json_encode(['status' => 'error', 'message' => 'No Data Received']);
    exit;
}

// 必須項目のチェック
$requiredFields = ['facilityName', 'facilityCategory', 'contactName', 'contactEmail'];
foreach ($requiredFields as $field) {
    if (empty($input[$field])) {
        echo json_encode(['status' => 'error', 'message' => "Missing field: $field"]);
        exit;
    }
}

// データの整形
$facilityName = htmlspecialchars($input['facilityName']);
$facilityCategory = htmlspecialchars($input['facilityCategory']);
$departments = isset($input['department']) ? (is_array($input['department']) ? implode(', ', $input['department']) : $input['department']) : 'なし';
$contactName = htmlspecialchars($input['contactName']);
$contactPosition = isset($input['contactPosition']) ? htmlspecialchars($input['contactPosition']) : 'なし';
$contactEmail = htmlspecialchars($input['contactEmail']);
$facilityUrl = isset($input['facilityUrl']) ? htmlspecialchars($input['facilityUrl']) : 'なし';

// メール送信設定
// ★受信先アドレスを実際の運用アドレスに変更してください
$to = 'med.ai.rep@gmail.com'; 
$subject = "【利用登録申込】" . $facilityName . "様";

$message = "以下の内容で利用登録の申し込みがありました。\n\n";
$message .= "■施設情報\n";
$message .= "施設名: $facilityName\n";
$message .= "カテゴリ: $facilityCategory\n";
$message .= "診療科: $departments\n";
$message .= "HP URL: $facilityUrl\n\n";
$message .= "■担当者情報\n";
$message .= "氏名: $contactName\n";
$message .= "役職: $contactPosition\n";
$message .= "Email: $contactEmail\n";
$message .= "\n--\n送信元: 皮膚科コンサルトLP";

$headers = "From: noreply@example.com" . "\r\n" .
           "Reply-To: " . $contactEmail . "\r\n" .
           "X-Mailer: PHP/" . phpversion();

// 送信実行
if (mail($to, $subject, $message, $headers)) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Mail sending failed.']);
}
?>