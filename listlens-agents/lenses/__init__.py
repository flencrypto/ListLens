"""Specialist Lens implementations.

Each Lens is the same shape: subclass ``LensAgent`` and implement
``analyse_guard`` + ``analyse_studio``. Most modules below are PROTOTYPE
stubs — the production work is replacing ``# TODO(production)`` blocks with
real vision / reference-data calls.

Stable / production-ready parts:
    - the Lens registry (``ALL_LENSES``)
    - the LensAgent contract from ``core.base_swarm``
"""

from .recordlens_agent import RecordLensAgent
from .solelens_agent import SoleLensAgent
from .watchlens_agent import WatchLensAgent
from .cardlens_agent import CardLensAgent
from .toylens_agent import ToyLensAgent
from .techlens_agent import TechLensAgent
from .booklens_agent import BookLensAgent
from .threadlens_agent import ThreadLensAgent
from .measurelens_agent import MeasureLensAgent
from .antiqueslens_agent import AntiquesLensAgent
from .autographlens_agent import AutographLensAgent
from .marketlens_agent import MarketLensAgent
from .studiolens_agent import StudioLensAgent
from .guardlens_agent import GuardLensAgent

ALL_LENSES = (
    RecordLensAgent,
    SoleLensAgent,
    WatchLensAgent,
    CardLensAgent,
    ToyLensAgent,
    TechLensAgent,
    BookLensAgent,
    ThreadLensAgent,
    MeasureLensAgent,
    AntiquesLensAgent,
    AutographLensAgent,
    MarketLensAgent,
    StudioLensAgent,
    GuardLensAgent,
)

__all__ = ["ALL_LENSES"] + [cls.__name__ for cls in ALL_LENSES]
