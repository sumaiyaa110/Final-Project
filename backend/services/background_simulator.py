import os
import threading
import time


from services.simulator import (
    generate_transaction,
    simulator_available
)


SIMULATOR_INTERVAL_SECONDS = 5


def simulator_worker():

    print(
        "Background simulator started"
    )

    while True:

        try:

            generate_transaction()

        except Exception as e:

            print(
                "Simulator error:",
                e
            )

        time.sleep(SIMULATOR_INTERVAL_SECONDS)


def start_background_simulator():

    if os.getenv("ANOMALYX_SIMULATOR", "1") == "0":

        print(
            "Background simulator disabled (ANOMALYX_SIMULATOR=0)"
        )

        return False

    if not simulator_available():

        print(
            "Background simulator not started (no transaction dataset)"
        )

        return False

    thread = threading.Thread(
        target=simulator_worker,
        daemon=True
    )

    thread.start()

    return True
