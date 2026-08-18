<?php
declare(strict_types=1);

require __DIR__ . '/db.php';

header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fap_json(['ok' => false, 'error' => 'method_not_allowed'], 405);
}

$raw = file_get_contents('php://input');
$body = json_decode($raw ?: '', true);

if (!is_array($body)) {
    fap_json(['ok' => false, 'error' => 'invalid_json'], 400);
}

$voter = isset($body['voter']) ? trim((string) $body['voter']) : '';
$order = isset($body['order']) && is_array($body['order']) ? array_values($body['order']) : [];

if ($voter === '' || strlen($voter) > 64) {
    fap_json(['ok' => false, 'error' => 'invalid_voter'], 400);
}

if (count($order) !== count(FAP_TEAMS)) {
    fap_json(['ok' => false, 'error' => 'invalid_order_length'], 400);
}

$order = array_map(static fn($v) => is_string($v) ? $v : '', $order);
$uniqueOrder = array_unique($order);

if (count($uniqueOrder) !== count(FAP_TEAMS) || array_diff($order, FAP_TEAMS) !== []) {
    fap_json(['ok' => false, 'error' => 'invalid_teams'], 400);
}

try {
    $pdo = fap_db();
    $pdo->beginTransaction();

    $stmt = $pdo->prepare(
        'INSERT INTO predictions (voter_id) VALUES (:voter)
         ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP'
    );
    $stmt->execute(['voter' => $voter]);

    $idStmt = $pdo->prepare('SELECT id FROM predictions WHERE voter_id = :voter');
    $idStmt->execute(['voter' => $voter]);
    $predictionId = (int) $idStmt->fetchColumn();

    $del = $pdo->prepare('DELETE FROM prediction_teams WHERE prediction_id = :id');
    $del->execute(['id' => $predictionId]);

    $ins = $pdo->prepare(
        'INSERT INTO prediction_teams (prediction_id, team_id, position) VALUES (:id, :team, :pos)'
    );
    foreach ($order as $index => $teamId) {
        $ins->execute(['id' => $predictionId, 'team' => $teamId, 'pos' => $index + 1]);
    }

    $pdo->commit();
    fap_json(['ok' => true]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    fap_json(['ok' => false, 'error' => 'server_error'], 500);
}
