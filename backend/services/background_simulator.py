import threading

import time


from services.simulator import generate_transaction






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



        time.sleep(5)







def start_background_simulator():


    thread = threading.Thread(


        target=simulator_worker,


        daemon=True


    )


    thread.start()