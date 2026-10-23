import os
import shutil
import sys
import tempfile
from pathlib import Path

import pytest


BACKEND_DIR = Path(__file__).resolve().parent.parent

sys.path.insert(0, str(BACKEND_DIR))

# Work on a throwaway copy of the seed database, without the live simulator
_tmp_dir = tempfile.mkdtemp(prefix="anomalyx-test-")
_db_path = Path(_tmp_dir) / "anomalyx.db"
shutil.copyfile(BACKEND_DIR / "database" / "anomalyx_seed.db", _db_path)

os.environ["ANOMALYX_DB_PATH"] = str(_db_path)
os.environ["ANOMALYX_SIMULATOR"] = "0"


@pytest.fixture(scope="session")
def client():

    from fastapi.testclient import TestClient
    from main import app

    with TestClient(app) as test_client:
        yield test_client

    shutil.rmtree(_tmp_dir, ignore_errors=True)
