import pathlib
import unittest


ROOT = pathlib.Path(__file__).resolve().parent.parent


class CkBtcInterfaceTests(unittest.TestCase):
    def test_get_btc_deposit_address_is_declared(self) -> None:
        did_text = (ROOT / "src/declarations/backend/backend.did").read_text()
        self.assertIn("getBtcDepositAddress", did_text)


if __name__ == "__main__":
    unittest.main()
