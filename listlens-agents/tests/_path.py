"""Test helpers — make sibling packages importable when running
``python -m unittest discover -s tests`` from the ``listlens-agents`` folder.

The directory name contains a hyphen (``listlens-agents``) which Python
cannot import as a package, so we instead expose ``core/``, ``lenses/``,
``retrieval/``, and ``hoardlens/`` as top-level packages by putting the
project root on ``sys.path``.
"""

from __future__ import annotations

import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
_PROJECT = os.path.dirname(_HERE)

if _PROJECT not in sys.path:
    sys.path.insert(0, _PROJECT)
