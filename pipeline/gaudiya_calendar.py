#!/usr/bin/env python3
"""Gaudiya lunar calendar -> song suggestions.

No third-party dependencies. Moon phases and solar longitude are computed from
Meeus, *Astronomical Algorithms* (2nd ed.), ch.49 and ch.25.

Calendar rules implemented
--------------------------
* Gaudiya months are **pūrṇimānta**: a month runs from the day after one full
  moon through the next full moon. (Verified against observed Kārtika windows:
  2025-10-07..2025-11-05 and 2024-10-17..2024-11-15.)
* A month is *named* by the sidereal rāśi the Sun occupies at the **new moon**
  that falls inside it — Sun in Tulā -> Kārtika, Vṛścika -> Mārgaśīrṣa, etc.
* If two consecutive new moons occur with the Sun in the same rāśi, no
  saṅkrānti happened between them and the first lunation is **adhika-māsa**
  (Puruṣottama), the intercalary leap month.
* Sidereal longitudes use the Lahiri ayanāṁśa.

Public API
----------
    lunar_month(date)      -> LunarMonth
    songs_for_date(date)   -> dict with month info + suggested song uids
    month_songs(name)      -> song block for a Gaudiya month name
"""
from __future__ import annotations

import datetime
import json
import math
import os
from dataclasses import dataclass, asdict

HERE = os.path.dirname(os.path.abspath(__file__))
_SONGS_PATH = os.path.join(HERE, 'gaudiya_months.json')

# ---------------------------------------------------------------- astronomy --

def _jd(d: datetime.date) -> float:
    """Julian Day at 00:00 TT of a civil date."""
    y, m = d.year, d.month
    if m <= 2:
        y, m = y - 1, m + 12
    a = y // 100
    b = 2 - a + a // 4
    return (math.floor(365.25 * (y + 4716)) + math.floor(30.6001 * (m + 1))
            + d.day + b - 1524.5)


def _from_jd(jd: float) -> datetime.datetime:
    z = math.floor(jd + 0.5)
    f = (jd + 0.5) - z
    if z < 2299161:
        a = z
    else:
        alpha = math.floor((z - 1867216.25) / 36524.25)
        a = z + 1 + alpha - alpha // 4
    b = a + 1524
    c = math.floor((b - 122.1) / 365.25)
    d_ = math.floor(365.25 * c)
    e = math.floor((b - d_) / 30.6001)
    day = b - d_ - math.floor(30.6001 * e) + f
    month = e - 1 if e < 14 else e - 13
    year = c - 4716 if month > 2 else c - 4715
    di = int(day)
    frac = day - di
    return (datetime.datetime(year, month, di)
            + datetime.timedelta(days=frac))


def _moon_phase_jd(k: float) -> float:
    """JDE of a lunar phase. Integer k = new moon, k+0.5 = full moon (Meeus 49)."""
    T = k / 1236.85
    jde = (2451550.09766 + 29.530588861 * k + 0.00015437 * T ** 2
           - 0.000000150 * T ** 3 + 0.00000000073 * T ** 4)
    E = 1 - 0.002516 * T - 0.0000074 * T ** 2
    rad = math.radians
    M = rad(2.5534 + 29.10535670 * k - 0.0000014 * T ** 2 - 0.00000011 * T ** 3)
    Mp = rad(201.5643 + 385.81693528 * k + 0.0107582 * T ** 2
             + 0.00001238 * T ** 3 - 0.000000058 * T ** 4)
    F = rad(160.7108 + 390.67050284 * k - 0.0016118 * T ** 2
            - 0.00000227 * T ** 3 + 0.000000011 * T ** 4)
    Om = rad(124.7746 - 1.56375588 * k + 0.0020672 * T ** 2 + 0.00000215 * T ** 3)
    sin = math.sin
    is_full = abs(k - math.floor(k) - 0.5) < 1e-9
    if not is_full:                                    # new moon
        c = (-0.40720 * sin(Mp) + 0.17241 * E * sin(M) + 0.01608 * sin(2 * Mp)
             + 0.01039 * sin(2 * F) + 0.00739 * E * sin(Mp - M)
             - 0.00514 * E * sin(Mp + M) + 0.00208 * E * E * sin(2 * M)
             - 0.00111 * sin(Mp - 2 * F) - 0.00057 * sin(Mp + 2 * F)
             + 0.00056 * E * sin(2 * Mp + M) - 0.00042 * sin(3 * Mp)
             + 0.00042 * E * sin(M + 2 * F) + 0.00038 * E * sin(M - 2 * F)
             - 0.00024 * E * sin(2 * Mp - M) - 0.00017 * sin(Om)
             - 0.00007 * sin(Mp + 2 * M))
    else:                                              # full moon
        c = (-0.40614 * sin(Mp) + 0.17302 * E * sin(M) + 0.01614 * sin(2 * Mp)
             + 0.01043 * sin(2 * F) + 0.00734 * E * sin(Mp - M)
             - 0.00515 * E * sin(Mp + M) + 0.00209 * E * E * sin(2 * M)
             - 0.00111 * sin(Mp - 2 * F) - 0.00057 * sin(Mp + 2 * F)
             + 0.00056 * E * sin(2 * Mp + M) - 0.00042 * sin(3 * Mp)
             + 0.00042 * E * sin(M + 2 * F) + 0.00038 * E * sin(M - 2 * F)
             - 0.00024 * E * sin(2 * Mp - M) - 0.00017 * sin(Om)
             - 0.00007 * sin(Mp + 2 * M))
    return jde + c


def _sun_longitude(jd: float) -> float:
    """Apparent geocentric tropical longitude of the Sun, degrees (Meeus 25)."""
    T = (jd - 2451545.0) / 36525.0
    L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T ** 2
    M = math.radians(357.52911 + 35999.05029 * T - 0.0001537 * T ** 2)
    C = ((1.914602 - 0.004817 * T - 0.000014 * T ** 2) * math.sin(M)
         + (0.019993 - 0.000101 * T) * math.sin(2 * M)
         + 0.000289 * math.sin(3 * M))
    return (L0 + C) % 360.0


def _ayanamsa(jd: float) -> float:
    """Lahiri ayanāṁśa in degrees (linear fit, ~50.29\"/yr from J2000)."""
    return 23.85300 + (jd - 2451545.0) / 365.25 * 0.0139694


def _sidereal_sun(jd: float) -> float:
    return (_sun_longitude(jd) - _ayanamsa(jd)) % 360.0


# ------------------------------------------------------------------ calendar --

RASI = ['Meṣa', 'Vṛṣabha', 'Mithuna', 'Karka', 'Siṁha', 'Kanyā',
        'Tulā', 'Vṛścika', 'Dhanu', 'Makara', 'Kumbha', 'Mīna']

# rāśi the Sun sits in at the starting new moon -> lunar month name
RASI_TO_MONTH = ['Vaiśākha', 'Jyeṣṭha', 'Āṣāḍha', 'Śrāvaṇa', 'Bhādrapada',
                 'Āśvina', 'Kārtika', 'Mārgaśīrṣa', 'Pauṣa', 'Māgha',
                 'Phālguna', 'Caitra']

# lunar month -> Gaudiya (Viṣṇu) month name
GAUDIYA = {
    'Caitra': 'Viṣṇu', 'Vaiśākha': 'Madhusūdana', 'Jyeṣṭha': 'Trivikrama',
    'Āṣāḍha': 'Vāmana', 'Śrāvaṇa': 'Śrīdhara', 'Bhādrapada': 'Hṛṣīkeśa',
    'Āśvina': 'Padmanābha', 'Kārtika': 'Dāmodara', 'Mārgaśīrṣa': 'Keśava',
    'Pauṣa': 'Nārāyaṇa', 'Māgha': 'Mādhava', 'Phālguna': 'Govinda',
}


@dataclass
class LunarMonth:
    date: str
    month: str              # Kārtika, Śrāvaṇa, ...
    gaudiya_month: str      # Dāmodara, Śrīdhara, ...
    starts: str             # first civil day of the pūrṇimānta month
    ends: str               # the closing full moon
    new_moon: str           # new moon inside the month
    paksa: str              # kṛṣṇa (waning) | śukla (waxing)
    tithi: int              # 1..15 within the pakṣa
    adhika: bool            # True if this is Puruṣottama (leap) month
    sun_rasi: str


def _k_for(d: datetime.date) -> float:
    return (d.year + (d.timetuple().tm_yday / 365.25) - 2000.0) * 12.3685


def _full_moons_around(jd: float):
    """Nearest full moons strictly before and on/after jd."""
    k0 = math.floor((jd - 2451550.09766) / 29.530588861) - 2
    fms = sorted(_moon_phase_jd(k + 0.5) for k in range(int(k0), int(k0) + 6))
    prev = max(f for f in fms if f <= jd)
    nxt = min(f for f in fms if f > jd)
    return prev, nxt


def _new_moon_between(a: float, b: float) -> float:
    k0 = math.floor((a - 2451550.09766) / 29.530588861) - 1
    for k in range(int(k0), int(k0) + 5):
        nm = _moon_phase_jd(float(k))
        if a < nm <= b:
            return nm
    return (a + b) / 2


def lunar_month(d: datetime.date | str) -> LunarMonth:
    """Return the Gaudiya lunar month containing a civil date."""
    if isinstance(d, str):
        d = datetime.date.fromisoformat(d)
    jd = _jd(d) + 0.5                      # midday, so a date lands inside its day
    fm_prev, fm_next = _full_moons_around(jd)
    nm = _new_moon_between(fm_prev, fm_next)

    sun = _sidereal_sun(nm)
    rasi_i = int(sun // 30)
    name = RASI_TO_MONTH[rasi_i]

    # adhika-māsa: this lunation [nm, next_nm] contains no saṅkrānti, i.e. the Sun
    # is still in the same rāśi at the next new moon. The month *without* the
    # saṅkrānti is the leap month; the following one is nija (true).
    next_nm = _new_moon_between(nm + 1, nm + 31)
    adhika = int(_sidereal_sun(next_nm) // 30) == rasi_i

    paksa = 'kṛṣṇa' if jd <= nm else 'śukla'
    anchor = fm_prev if paksa == 'kṛṣṇa' else nm
    tithi = min(15, int((jd - anchor) / (29.530588861 / 30)) + 1)

    return LunarMonth(
        date=d.isoformat(),
        month=('Adhika ' + name) if adhika else name,
        gaudiya_month=('Puruṣottama (adhika)' if adhika else GAUDIYA[name]),
        starts=_from_jd(fm_prev).date().isoformat(),
        ends=_from_jd(fm_next).date().isoformat(),
        new_moon=_from_jd(nm).date().isoformat(),
        paksa=paksa, tithi=tithi, adhika=adhika, sun_rasi=RASI[rasi_i],
    )


# --------------------------------------------------------------- suggestions --

def _load():
    with open(_SONGS_PATH, encoding='utf-8') as f:
        return json.load(f)


def month_songs(month_name: str) -> dict:
    """Song block for a Gaudiya month ('Dāmodara') or lunar name ('Kārtika')."""
    data = _load()
    key = month_name.replace('Adhika ', '')
    for m in data['months']:
        if key in (m['lunar_month'], m['gaudiya_month']):
            return m
    return {}


def songs_for_date(d: datetime.date | str | None = None) -> dict:
    """Full answer: which lunar month, and which songs to sing in it."""
    d = d or datetime.date.today()
    lm = lunar_month(d)
    data = _load()
    block = month_songs('Puruṣottama' if lm.adhika else lm.month)
    if not block:
        block = month_songs(lm.month)
    return {
        **asdict(lm),
        'songs': block.get('songs', []),
        'observances': block.get('observances', []),
        'daily': data.get('daily', []),
        'note': block.get('note'),
    }


if __name__ == '__main__':
    import sys
    arg = sys.argv[1] if len(sys.argv) > 1 else None
    r = songs_for_date(arg)
    print(f"{r['date']}  →  {r['month']} ({r['gaudiya_month']}), "
          f"{r['paksa']}-pakṣa tithi {r['tithi']}")
    print(f"  month runs {r['starts']} → {r['ends']}  (new moon {r['new_moon']}, "
          f"Sun in {r['sun_rasi']})")
    if r.get('note'):
        print(f"  {r['note']}")
    if r['observances']:
        print('  observances:', ', '.join(r['observances']))
    print('  songs:')
    for s in r['songs']:
        au = ' ♪' if s.get('audio') else ''
        print(f"    {s['uid']:<6} {s['title'][:48]:<50}{au}  [{s['basis']}]")
