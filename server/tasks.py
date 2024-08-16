import os
import subprocess

from celery import Celery

from cicflowmeter.sniffer import run_sniffer

# -----------------------------------------------------------------------------

celery = Celery(
    "tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
)

# -----------------------------------------------------------------------------


@celery.task
def create_tcpdump(interface, duration, output_file):
    try:
        # Temp file with the mame of the task id
        temp_file = os.path.join(
            "dump/temp", f"{create_tcpdump.request.id}.pcap"
        )

        command = f"tcpdump -i {interface} -w {temp_file} -G {duration} -W 1"
        subprocess.run(command, shell=True)
        fields = (",").join(
            [
                "dst_port",
                "totlen_fwd_pkts",
                "flow_iat_mean",
                "flow_iat_max",
                "fwd_iat_tot",
                "fwd_iat_mean",
                "fwd_iat_max",
                "fwd_iat_min",
                "fwd_header_len",
                "fwd_pkts_s",
                "bwd_pkts_s",
                "subflow_fwd_byts",
                "init_fwd_win_byts",
                "init_bwd_win_byts",
                "timestamp",
            ]
        )

        run_sniffer(
            input_file=temp_file,
            input_interface=None,
            output_mode="csv",
            output=output_file,
            fields=fields,
            verbose=False,
        )

        return True

    except Exception as e:
        print(e)
        return False

    finally:
        os.remove(temp_file)


# -----------------------------------------------------------------------------
