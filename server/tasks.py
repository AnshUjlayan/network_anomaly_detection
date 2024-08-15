import time

from celery import Celery
from cicflowmeter.sniffer import run_sniffer

celery = Celery(
    "tasks",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0",
)


@celery.task
def add(x, y):
    time.sleep(15)
    return x + y


@celery.task
def start_sniffer():
    input_file = "data.pcap"
    input_interface = None
    output_mode = "csv"
    output = "output.csv"
    fields = None
    verbose = True

    run_sniffer(
        input_file=input_file,
        input_interface=input_interface,
        output_mode=output_mode,
        output=output,
        fields=fields,
        verbose=verbose,
    )
