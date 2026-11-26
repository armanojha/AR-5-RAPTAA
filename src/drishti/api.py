from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, unquote, urlparse


class AlertRepository:
    def __init__(self, evidence_directory: str | Path, bundle_path: str | Path | None = None) -> None:
        self.evidence_directory = Path(evidence_directory)
        self.bundle_path = Path(bundle_path) if bundle_path else None

    def _payload(self) -> dict[str, Any]:
        return json.loads((self.evidence_directory / "alerts.json").read_text(encoding="utf-8"))

    def list_alerts(self, *, severity: str | None = None) -> list[dict[str, Any]]:
        alerts = list(self._payload().get("alerts", []))
        if severity:
            alerts = [alert for alert in alerts if alert.get("severity") == severity]
        return alerts

    def get_alert(self, alert_id: str) -> dict[str, Any] | None:
        return next((alert for alert in self.list_alerts() if alert.get("alert_id") == alert_id), None)

    def segment_timeline(self, segment_id: str) -> list[dict[str, Any]]:
        return list(self._payload().get("timelines", {}).get(segment_id, []))

    def bundle(self) -> dict[str, Any] | None:
        if self.bundle_path is None or not self.bundle_path.is_file():
            return None
        return json.loads(self.bundle_path.read_text(encoding="utf-8"))


class AlertApplication:
    def __init__(self, repository: AlertRepository) -> None:
        self.repository = repository

    def dispatch(self, raw_path: str) -> tuple[int, dict[str, Any] | list[Any]]:
        parsed = urlparse(raw_path)
        parts = [unquote(part) for part in parsed.path.split("/") if part]
        if not parts or parts == ["health"]:
            return 200, {
                "status": "ok",
                "service": "drishti-alert-api",
                "bundle_available": self.repository.bundle() is not None,
            }
        if parts == ["bundle"]:
            bundle = self.repository.bundle()
            return (200, bundle) if bundle is not None else (404, {"error": "frontend bundle not configured"})
        if parts == ["alerts"]:
            severity = parse_qs(parsed.query).get("severity", [None])[0]
            alerts = self.repository.list_alerts(severity=severity)
            return 200, {"count": len(alerts), "alerts": alerts}
        if len(parts) == 2 and parts[0] == "alerts":
            alert = self.repository.get_alert(parts[1])
            return (200, alert) if alert else (404, {"error": "alert not found"})
        if len(parts) == 3 and parts[0] == "segments" and parts[2] == "timeline":
            timeline = self.repository.segment_timeline(parts[1])
            return 200, {"segment_id": parts[1], "count": len(timeline), "records": timeline}
        return 404, {"error": "route not found"}


def create_alert_server(
    evidence_directory: str | Path,
    *,
    bundle_path: str | Path | None = None,
    host: str = "127.0.0.1",
    port: int = 8765,
) -> ThreadingHTTPServer:
    repository = AlertRepository(evidence_directory, bundle_path=bundle_path)
    application = AlertApplication(repository)

    class Handler(BaseHTTPRequestHandler):
        def _send(self, status: int, payload: dict[str, Any] | list[Any]) -> None:
            body = json.dumps(payload, indent=2).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self) -> None:  # noqa: N802 - stdlib handler contract
            status, payload = application.dispatch(self.path)
            self._send(status, payload)

        def log_message(self, _format: str, *_args: Any) -> None:
            return

    return ThreadingHTTPServer((host, port), Handler)


def serve_alert_api(
    evidence_directory: str | Path,
    *,
    bundle_path: str | Path | None = None,
    host: str = "127.0.0.1",
    port: int = 8765,
) -> None:
    server = create_alert_server(evidence_directory, bundle_path=bundle_path, host=host, port=port)
    print(f"Drishti alert API listening on http://{host}:{server.server_port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

