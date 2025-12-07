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

// データの整形
$facilityName = htmlspecialchars($input['facilityName'] ?? '');
$facilityCategory = htmlspecialchars($input['facilityCategory'] ?? '');
$departments = isset($input['department']) ? (is_array($input['department']) ? implode(', ', $input['department']) : $input['department']) : 'なし';
$contactName = htmlspecialchars($input['contactName'] ?? '');
$contactPosition = isset($input['contactPosition']) ? htmlspecialchars($input['contactPosition']) : 'なし';
$contactEmail = htmlspecialchars($input['contactEmail'] ?? '');
$facilityUrl = isset($input['facilityUrl']) ? htmlspecialchars($input['facilityUrl']) : 'なし';

// ===================================================
// ★ 設定 (書き換えてください)
// ===================================================
$smtp_host = 'ssl://smtp.gmail.com'; 
$smtp_port = 465;
$username = 'med.ai.rep@gmail.com';  
$password = 'ypyf jetc rrja hvyx'; // アプリパスワード

$to = 'med.ai.rep+LP@gmail.com'; // テスト用宛先
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
$body .= "\n--\n送信元: ダーマコンサルランディングページ (https://med-ai-rep.com/derma-consulting/LP.html)";

// SMTP送信関数（詳細ログ付き）
function send_smtp_mail($to, $subject, $body, $from, $host, $port, $user, $pass) {
    $debug_log = []; // ログ記録用
    
    $socket = fsockopen($host, $port, $errno, $errstr, 30);
    if (!$socket) {
        return ['result' => false, 'log' => "Socket Error: $errstr ($errno)"];
    }

    // サーバーからの応答を読み取るヘルパー関数
    $getResponse = function($socket) {
        $data = "";
        while($str = fgets($socket, 512)) {
            $data .= $str;
            if(substr($str, 3, 1) == " ") break;
        }
        return $data;
    };

    $debug_log[] = "CONNECT: " . $getResponse($socket);

    fputs($socket, "EHLO " . $_SERVER['SERVER_NAME'] . "\r\n");
    $debug_log[] = "EHLO: " . $getResponse($socket);

    fputs($socket, "AUTH LOGIN\r\n");
    $debug_log[] = "AUTH LOGIN: " . $getResponse($socket);

    fputs($socket, base64_encode($user) . "\r\n");
    $debug_log[] = "USER: " . $getResponse($socket);

    fputs($socket, base64_encode($pass) . "\r\n");
    $debug_log[] = "PASS: " . $getResponse($socket);

    fputs($socket, "MAIL FROM: <$from>\r\n");
    $debug_log[] = "MAIL FROM: " . $getResponse($socket);

    fputs($socket, "RCPT TO: <$to>\r\n");
    $debug_log[] = "RCPT TO: " . $getResponse($socket);

    fputs($socket, "DATA\r\n");
    $debug_log[] = "DATA: " . $getResponse($socket);

    // ★重要：Gmailに弾かれないためのヘッダー強化★
    $headers = "From: $from\r\n";
    $headers .= "Reply-To: $from\r\n";
    $headers .= "To: $to\r\n";
    $headers .= "Date: " . date('r') . "\r\n"; // 必須：RFC形式の日付
    $headers .= "Message-ID: <" . md5(uniqid(time())) . "@gmail.com>\r\n"; // 必須：ユニークID
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "Content-Transfer-Encoding: 8bit\r\n";
    $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";

    fputs($socket, "$headers\r\n$body\r\n.\r\n");
    $final_response = $getResponse($socket);
    $debug_log[] = "BODY END: " . $final_response;

    fputs($socket, "QUIT\r\n");
    fclose($socket);

    // 成功判定 (250 OK が返ってきているか)
    $is_success = strpos($final_response, '250') !== false;
    
    return ['result' => $is_success, 'log' => $debug_log];
}

// 実行
$response = send_smtp_mail($to, $subject, $body, $from, $smtp_host, $smtp_port, $username, $password);

if ($response['result']) {
    // 成功時もデバッグログを返す（確認用）
    echo json_encode(['status' => 'success', 'debug_log' => $response['log']]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Mail sending failed.', 'debug_log' => $response['log']]);
}
?>