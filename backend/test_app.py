import unittest

from fastapi.testclient import TestClient

from app import app, db


client = TestClient(app)


def reset_state() -> None:
    db["users"] = {
        "elara": {
            "merit": 50,
            "salt": "secret_123",
            "wallet": "0x40954b0d1fd2ca1f0a85de79b8faea2029766cd5",
        },
        "devon": {
            "merit": 20,
            "salt": "secret_456",
            "wallet": "0xabcdef1234567890abcdef1234567890abcdef12",
        },
    }
    db["bounties"] = []
    db["private_ledger"] = []
    db["public_audit_log"] = []
    db["cases"] = []


class AppTests(unittest.TestCase):
    def setUp(self) -> None:
        reset_state()

    def test_chat_endpoint_accepts_list_payload(self) -> None:
        payload = [{"role": "user", "content": "hello"}]
        response = client.post("/chat", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["response"].startswith("This is a dummy chat response"))

    def test_chat_endpoint_rejects_non_list_payload(self) -> None:
        response = client.post("/chat", json={"role": "user"})
        self.assertEqual(response.status_code, 422)

    def test_justice_flow_updates_juror_merit(self) -> None:
        db["users"]["alpha"] = {"merit": 40, "salt": "s1", "wallet": "0x1"}
        db["users"]["beta"] = {"merit": 30, "salt": "s2", "wallet": "0x2"}
        db["users"]["gamma"] = {"merit": 25, "salt": "s3", "wallet": "0x3"}

        case_resp = client.post(
            "/justice/file_case",
            params={
                "plaintiff": "elara",
                "defendant": "devon",
                "category": "Conduct",
                "evidence": "proof-data",
            },
        )
        self.assertEqual(case_resp.status_code, 200)
        case_data = case_resp.json()
        case_id = case_data["case_id"]
        jury = case_data["jury"]
        self.assertEqual(len(jury), 3)

        merit_before = {juror: db["users"][juror]["merit"] for juror in jury}

        for juror in jury:
            verdict_resp = client.post(
                "/justice/cast_verdict",
                params={"case_id": case_id, "juror_name": juror, "verdict": "guilty"},
            )
            self.assertEqual(verdict_resp.status_code, 200)

        for juror in jury:
            self.assertEqual(db["users"][juror]["merit"], merit_before[juror] + 5)

    def test_justice_jury_requires_unique_weighted_selection(self) -> None:
        import app as app_module

        original_choices = app_module.random.choices
        try:
            app_module.random.choices = lambda population, weights=None, k=1: ["alpha", "alpha", "alpha"]
            db["users"]["alpha"] = {"merit": 40, "salt": "s1", "wallet": "0x1"}
            db["users"]["beta"] = {"merit": 30, "salt": "s2", "wallet": "0x2"}
            db["users"]["gamma"] = {"merit": 25, "salt": "s3", "wallet": "0x3"}

            response = client.post(
                "/justice/file_case",
                params={
                    "plaintiff": "elara",
                    "defendant": "devon",
                    "category": "Conduct",
                    "evidence": "proof-data",
                },
            )
            self.assertEqual(response.status_code, 200)
            jury = response.json()["jury"]
            self.assertEqual(len(jury), 3)
            self.assertEqual(len(set(jury)), 3)
        finally:
            app_module.random.choices = original_choices


if __name__ == "__main__":
    unittest.main()
