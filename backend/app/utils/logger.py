"""
Structured logging utility using structlog.

This module provides a configured structlog logger that can be used throughout
the application. It supports both JSON output (for production) and colored
console output (for development).
"""

import logging
import sys
from typing import Any

import structlog
from structlog.types import Processor

from app.core.config import settings


def configure_logging() -> None:
    """
    Configure structlog with appropriate processors and formatters.
    
    Uses pretty colored console output by default. Set LOG_FORMAT=json for JSON output.
    """
    # Determine log format: use config setting, or default to console if TTY
    log_format = settings.LOG_FORMAT.lower()
    use_pretty_console = (
        log_format == "console" or 
        (log_format != "json" and sys.stdout.isatty())
    )
    
    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    )
    
    # Build processors list
    processors: list[Processor] = [
        structlog.contextvars.merge_contextvars,  # Merge context variables
        structlog.stdlib.add_log_level,  # Add log level
        structlog.stdlib.add_logger_name,  # Add logger name
        structlog.stdlib.ExtraAdder(),  # Add extra fields
        structlog.processors.StackInfoRenderer(),  # Render stack traces
        structlog.processors.format_exc_info,  # Format exceptions
    ]
    
    # Add formatter based on format preference
    if use_pretty_console:
        # Pretty colored console output
        processors.extend([
            structlog.processors.TimeStamper(fmt="%Y-%m-%d %H:%M:%S"),  # Human-readable timestamp
            structlog.dev.ConsoleRenderer(colors=True),  # Pretty colored output
        ])
    else:
        # JSON output
        processors.extend([
            structlog.processors.TimeStamper(fmt="iso"),  # ISO timestamp for JSON
            structlog.processors.dict_tracebacks,  # Format tracebacks as dicts
            structlog.processors.JSONRenderer(),  # JSON output
        ])
    
    # Configure structlog
    structlog.configure(
        processors=processors,
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str | None = None) -> structlog.stdlib.BoundLogger:
    """
    Get a configured structlog logger instance.
    
    Args:
        name: Logger name (typically __name__ of the calling module).
              If None, uses the calling module's name.
    
    Returns:
        A configured BoundLogger instance.
    
    Example:
        ```python
        from app.utils.logger import get_logger
        
        logger = get_logger(__name__)
        logger.info("User logged in", user_id=123, email="user@example.com")
        ```
    """
    if name is None:
        # Get the calling module's name
        import inspect
        frame = inspect.currentframe()
        if frame and frame.f_back:
            name = frame.f_back.f_globals.get("__name__", "app")
    
    return structlog.get_logger(name)


def bind_context(**kwargs: Any) -> None:
    """
    Bind context variables that will be included in all subsequent log entries.
    
    This merges with existing context variables. Use clear_context() to remove
    all context, or unbind_context() to remove specific keys.
    
    Args:
        **kwargs: Key-value pairs to bind as context.
    
    Example:
        ```python
        from app.utils.logger import bind_context, get_logger
        
        bind_context(request_id="abc123", user_id=456)
        logger = get_logger(__name__)
        logger.info("Processing request")  # Will include request_id and user_id
        ```
    """
    structlog.contextvars.bind_contextvars(**kwargs)


def clear_context() -> None:
    """
    Clear all bound context variables.
    
    Example:
        ```python
        from app.utils.logger import clear_context
        
        clear_context()  # Removes all previously bound context
        ```
    """
    structlog.contextvars.clear_contextvars()


def unbind_context(*keys: str) -> None:
    """
    Unbind specific context variables by their keys.
    
    Args:
        *keys: Names of context variables to unbind.
    
    Example:
        ```python
        from app.utils.logger import bind_context, unbind_context
        
        bind_context(request_id="abc", user_id=123, session_id="xyz")
        unbind_context("session_id")  # Removes only session_id
        ```
    """
    for key in keys:
        structlog.contextvars.unbind_contextvars(key)


# Configure logging on module import
configure_logging()

# Export a default logger instance for convenience
logger = get_logger("app")
