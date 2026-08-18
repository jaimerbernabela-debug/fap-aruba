<?php
declare(strict_types=1);

require __DIR__ . '/db.php';

header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    fap_json(['ok' => false, 'error' => 'method_not_allowed'], 405);
}

try {
    $pdo = fap_db();

    $total = (int) $pdo->query('SELECT COUNT(*) FROM predictions')->fetchColumn();

    $stmt = $pdo->query(
        'SELECT team_id, AVG(position) AS avg_pos, COUNT(*) AS votes
         FROM prediction_teams
         GROUP BY team_id
         ORDER BY avg_pos ASC'
    );
    $rows = $stmt->fetchAll();

    $teams = array_map(static function (array $row): array {
        return [
            'id' => $row['team_id'],
            'avg' => round((float) $row['avg_pos'], 2),
            'votes' => (int) $row['votes'],
        ];
    }, $rows);

    fap_json(['ok' => true, 'total' => $total, 'teams' => $teams]);
} catch (Throwable $e) {
    fap_json(['ok' => false, 'error' => 'server_error'], 500);
}
