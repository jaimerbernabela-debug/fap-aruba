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

$topScorer = isset($body['topScorer']) ? trim((string) $body['topScorer']) : '';
$topAssist = isset($body['topAssist']) ? trim((string) $body['topAssist']) : '';
$topScorer = $topScorer === '' ? null : mb_substr($topScorer, 0, 80);
$topAssist = $topAssist === '' ? null : mb_substr($topAssist, 0, 80);

$ipHash = fap_ip_hash();

try {
    $pdo = fap_db();
    $pdo->beginTransaction();

    // Un mismo dispositivo (voter_id) o una misma IP (ip_hash) cuenta como la
    // misma persona: si ya existe una prediccion por cualquiera de los dos,
    // se actualiza esa fila en vez de crear un voto nuevo. Esto evita que
    // alguien infle "La General" borrando su navegador y reenviando varias veces.
    $findStmt = $pdo->prepare(
        'SELECT id FROM predictions WHERE voter_id = :voter OR ip_hash = :ip LIMIT 1'
    );
    $findStmt->execute(['voter' => $voter, 'ip' => $ipHash]);
    $existingId = $findStmt->fetchColumn();

    if ($existingId) {
        $predictionId = (int) $existingId;
        $upd = $pdo->prepare(
            'UPDATE predictions SET voter_id = :voter, ip_hash = :ip, top_scorer = :scorer, top_assist = :assist, updated_at = CURRENT_TIMESTAMP
             WHERE id = :id'
        );
        $upd->execute(['voter' => $voter, 'ip' => $ipHash, 'scorer' => $topScorer, 'assist' => $topAssist, 'id' => $predictionId]);
    } else {
        $ins = $pdo->prepare(
            'INSERT INTO predictions (voter_id, ip_hash, top_scorer, top_assist) VALUES (:voter, :ip, :scorer, :assist)'
        );
        $ins->execute(['voter' => $voter, 'ip' => $ipHash, 'scorer' => $topScorer, 'assist' => $topAssist]);
        $predictionId = (int) $pdo->lastInsertId();
    }

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
