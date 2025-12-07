<?php
// resource/send_mail.php

header('Content-Type: application/json; charset=UTF-8');

// POSTメソッドのみ許可
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid Request Method']);
    exit;
}

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input) {
    echo json_encode(['status' => 'error', 'message' => 'No Data Received']);
    exit;
}

// データの整形（入力がない場合は空文字を入れる）
$facilityName = htmlspecialchars($input['facilityName'] ?? '');
$facilityCategory = htmlspecialchars($input['facilityCategory'] ?? '');
$departments = isset($input['department']) ? (is_array($input['department']) ? implode(', ', $input['department']) : $input['department']) : 'なし';
$contactName = htmlspecialchars($input['contactName'] ?? '');
$contactPosition = isset($input['contactPosition']) ? htmlspecialchars($input['contactPosition']) : 'なし';
$contactEmail = htmlspecialchars($input['contactEmail'] ?? '');
$facilityUrl = isset($input['facilityUrl']) ? htmlspecialchars($input['facilityUrl']) : 'なし';

// ===================================================
// ★ 設定
// ===================================================
$smtp_host = 'ssl://smtp.gmail.com'; 
$smtp_port = 465;
$username = 'med.ai.rep@gmail.com';  
$password = 'ypyf jetc rrja hvyx'; // アプリパスワード

// 運用に合わせて変更してください
$to = 'med.ai.rep+LP@gmail.com'; 
$subject = "【利用登録申込】" . $facilityName . "様";
$from = 'med.ai.rep@gmail.com';
// ===================================================

$body = "以下の内容で利用登録の申し込みがありました。\n\n";
$body .= "■施設情報\n";
$body .= "施設名: $facilityName\n";
$body .= "カテゴリ: $facilityCategory\n";
$body .= "診療科: $departments\n";
$body .= "HP URL: $facilityUrl\n\n";
$body .= "■担当者情報\n";
$body .= "氏名: $contactName\n";
$body .= "役職: $contactPosition\n";
$body .= "Email: $contactEmail\n";
$body .= "\n--\n送信元: ダーマコンサルランディングページ(https://medai.jp/derma-consulting/LP.html)";

// SMTP送信関数（シンプル版）
function send_smtp_mail($to, $subject, $body, $from, $host, $port, $user, $pass) {
    $socket = fsockopen($host, $port, $errno, $errstr, 30);
    if (!$socket) return false;

    // サーバーからの応答を読み捨てる関数
    $read = function($s) { while($str = fgets($s, 512)) if(substr($str, 3, 1) == " ") break; };

    $read($socket); // 接続時の応答

    fputs($socket, "EHLO " . $_SERVER['SERVER_NAME'] . "\r\n");
    $read($socket);

    fputs($socket, "AUTH LOGIN\r\n");
    $read($socket);

    fputs($socket, base64_encode($user) . "\r\n");
    $read($socket);

    fputs($socket, base64_encode($pass) . "\r\n");
    $read($socket);

    fputs($socket, "MAIL FROM: <$from>\r\n");
    $read($socket);

    fputs($socket, "RCPT TO: <$to>\r\n");
    $read($socket);

    fputs($socket, "DATA\r\n");
    $read($socket);

    // ヘッダー作成
    $headers = "From: $from\r\n";
    $headers .= "Reply-To: $from\r\n";
    $headers .= "To: $to\r\n";
    $headers .= "Date: " . date('r') . "\r\n";
    $headers .= "Message-ID: <" . md5(uniqid(time())) . "@gmail.com>\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "Content-Transfer-Encoding: 8bit\r\n";
    $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";

    fputs($socket, "$headers\r\n$body\r\n.\r\n");
    
    // 送信結果の確認
    $result = fgets($socket, 512); 
    
    fputs($socket, "QUIT\r\n");
    fclose($socket);

    // 250 OK なら成功
    return strpos($result, '250') !== false;
}

// 実行
if (send_smtp_mail($to, $subject, $body, $from, $smtp_host, $smtp_port, $username, $password)) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Mail sending failed.']);
}
?>