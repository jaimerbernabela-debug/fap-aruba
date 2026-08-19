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

    $awardQuery = 'SELECT ANY_VALUE(%1$s) AS name, COUNT(*) AS votes
         FROM predictions
         WHERE %1$s IS NOT NULL AND TRIM(%1$s) <> \'\'
         GROUP BY LOWER(TRIM(%1$s))
         ORDER BY votes DESC, name ASC
         LIMIT 8';

    $mapAward = static function (array $row): array {
        return ['name' => $row['name'], 'votes' => (int) $row['votes']];
    };

    $topScorers = array_map($mapAward, $pdo->query(sprintf($awardQuery, 'top_scorer'))->fetchAll());
    $topAssists = array_map($mapAward, $pdo->query(sprintf($awardQuery, 'top_assist'))->fetchAll());

    fap_json([
        'ok' => true,
        'total' => $total,
        'teams' => $teams,
        'topScorers' => $topScorers,
        'topAssists' => $topAssists,
    ]);
} catch (Throwable $e) {
    fap_json(['ok' => false, 'error' => 'server_error'], 500);
}
