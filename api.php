<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(200); exit(0); }

define("DB_HOST", "localhost");
define("DB_USER", "root");
define("DB_PASS", "");
define("DB_NAME", "gestion_employes");

function db() {
    static $conn = null;
    if ($conn === null) {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($conn->connect_error) { http_response_code(500); echo json_encode(["success"=>false,"error"=>$conn->connect_error]); exit; }
        $conn->set_charset("utf8mb4");
    }
    return $conn;
}
function ok($data, $code=200) { http_response_code($code); echo json_encode(["success"=>true,"data"=>$data],JSON_UNESCAPED_UNICODE); exit; }
function err($code, $msg)     { http_response_code($code); echo json_encode(["success"=>false,"error"=>$msg],JSON_UNESCAPED_UNICODE); exit; }

$method = $_SERVER["REQUEST_METHOD"];
$action = $_GET["action"] ?? "employes";

if ($method==="GET"    && $action==="employes") { $r=[]; $res=db()->query("SELECT * FROM employe ORDER BY matricule"); while($row=$res->fetch_assoc()) $r[]=$row; ok($r); }
if ($method==="GET"    && $action==="audit")    { $f=$_GET["filter"]??"all"; $sql="SELECT * FROM audit_employe"; if(in_array($f,["ajout","modification","suppression"])) $sql.=" WHERE type_action=\"$f\""; $sql.=" ORDER BY date_maj DESC LIMIT 200"; $r=[]; $res=db()->query($sql); while($row=$res->fetch_assoc()) $r[]=$row; ok($r); }
if ($method==="GET"    && $action==="stats")    { $res=db()->query("SELECT COUNT(*) AS total, SUM(type_action=\"ajout\") AS insertions, SUM(type_action=\"modification\") AS modifications, SUM(type_action=\"suppression\") AS suppressions FROM audit_employe"); ok($res->fetch_assoc()); }
if ($method==="POST"   && $action==="employes") { $d=json_decode(file_get_contents("php://input"),true); $m=trim($d["matricule"]??""); $n=trim($d["nom"]??""); $s=floatval($d["salaire"]??0); if(!$m||!$n||$s<=0) err(400,"Donnees invalides"); $st=db()->prepare("INSERT INTO employe(matricule,nom,salaire) VALUES(?,?,?)"); $st->bind_param("ssd",$m,$n,$s); $st->execute()||err(400,db()->error); ok(["message"=>"Ajoute"],201); }
if ($method==="PUT"    && $action==="employes") { $d=json_decode(file_get_contents("php://input"),true); $m=trim($d["matricule"]??""); $n=trim($d["nom"]??""); $s=floatval($d["salaire"]??0); if(!$m||!$n||$s<=0) err(400,"Donnees invalides"); $st=db()->prepare("UPDATE employe SET nom=?,salaire=? WHERE matricule=?"); $st->bind_param("sds",$n,$s,$m); $st->execute(); ok(["message"=>"Modifie"]); }
if ($method==="DELETE" && $action==="employes") { $m=trim($_GET["matricule"]??""); if(!$m) err(400,"Matricule manquant"); $st=db()->prepare("DELETE FROM employe WHERE matricule=?"); $st->bind_param("s",$m); $st->execute(); ok(["message"=>"Supprime"]); }
if ($method==="GET"    && $action==="export")   { header("Content-Type: text/csv; charset=utf-8"); header("Content-Disposition: attachment; filename=audit_".date("Ymd_His").".csv"); $out=fopen("php://output","w"); fprintf($out,chr(0xEF).chr(0xBB).chr(0xBF)); fputcsv($out,["ID","Action","Date","Matricule","Nom","Sal.Ancien","Sal.Nouveau","User"],";"); $res=db()->query("SELECT * FROM audit_employe ORDER BY date_maj DESC"); while($r=$res->fetch_assoc()) fputcsv($out,[$r["id"],$r["type_action"],$r["date_maj"],$r["matricule"],$r["nom"],$r["salaire_ancien"]??"",$r["salaire_nouv"]??"",$r["user"]],";"); fclose($out); exit; }

err(404,"Route introuvable");
?>
