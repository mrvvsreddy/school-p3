import structlog
import logging
import sys
from datetime import datetime


def setup_logging(dev_mode: bool = True):
    """
    Configure structured logging with clean, readable output.
    
    Args:
        dev_mode: If True, use colored console output. If False, use JSON for production.
    """
    # Suppress default uvicorn access logs to avoid duplication
    logging.getLogger("uvicorn.access").disabled = True
    logging.getLogger("uvicorn.error").setLevel(logging.WARNING)
    
    # Set up basic logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.INFO,
    )

    if dev_mode:
        # Development: Colorful, readable console output
        processors = [
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.dev.set_exc_info,
            structlog.processors.TimeStamper(fmt="%H:%M:%S"),
            structlog.dev.ConsoleRenderer(
                colors=True,
                pad_event=30,
            ),
        ]
    else:
        # Production: Clean JSON output
        processors = [
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.dev.set_exc_info,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer(indent=2, sort_keys=True),
        ]

    structlog.configure(
        processors=processors,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )
