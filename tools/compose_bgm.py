"""Render the game's background music to audio/*.mp3.

Everything here is original: the scores below are written for this game and every
instrument is synthesised (no samples), so the output carries no third-party rights.

    uv run --with numpy --with scipy --with soundfile python tools/compose_bgm.py

Tracks
  night  — exploring the kitchen. D minor, 64 bpm, 16 bars, seamless loop.
  cat    — the cat is awake. Same theme, driven: ostinato, taiko, horns. Seamless loop.
  home   — arriving home. The theme turned to D major. Plays once.
  fall   — the father falls. A short sting.
  rain   — chapter 2. The theme over a piano figure falling like drops. 60 bpm, 16 bars, seamless loop.

Looped files are written as [pad | loop | pad] where both pads are copies of the loop's
own wrap-around, so the player can loop between PAD and PAD+L without a click even if
the MP3 decoder leaves its encoder delay in. audio.js holds the matching numbers.
"""
import os
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
PAD = 0.25
rng = np.random.default_rng(20261122)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'audio')

# ───────────────────────── basics ─────────────────────────
NN = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def midi(s):
    n, i = NN[s[0]], 1
    while i < len(s) and s[i] in '#b':
        n += 1 if s[i] == '#' else -1
        i += 1
    return n + 12 * (int(s[i:]) + 1)


def hz(s):
    return 440.0 * 2 ** ((midi(s) - 69) / 12)


_sos = {}


def filt(kind, fc, order=2):
    key = (kind, tuple(np.round(np.atleast_1d(fc), 1)), order)
    if key not in _sos:
        _sos[key] = butter(order, fc, kind, fs=SR, output='sos')
    return _sos[key]


def peq(fc, db, q):
    """RBJ peaking biquad as one sos row."""
    A = 10 ** (db / 40)
    w = 2 * np.pi * fc / SR
    al = np.sin(w) / (2 * q)
    b = [1 + al * A, -2 * np.cos(w), 1 - al * A]
    a = [1 + al / A, -2 * np.cos(w), 1 - al / A]
    return np.array([[b[0] / a[0], b[1] / a[0], b[2] / a[0], 1, a[1] / a[0], a[2] / a[0]]])


def pan2(x, p):
    th = (np.clip(p, -1, 1) + 1) * np.pi / 4
    return np.stack([x * np.cos(th), x * np.sin(th)])


def saw(freq):
    """Band-limited sawtooth (PolyBLEP) for a per-sample frequency array."""
    dt = freq / SR
    ph = (np.cumsum(dt) + rng.random()) % 1.0
    y = 2 * ph - 1
    m = ph < dt
    x = ph[m] / dt[m]
    y[m] -= x + x - x * x - 1
    m = ph > 1 - dt
    x = (ph[m] - 1) / dt[m]
    y[m] -= x * x + x + x + 1
    return y


def env(n, att, dur, rel):
    t = np.arange(n) / SR
    a = np.clip(t / max(att, 1e-3), 0, 1)
    a = 0.5 - 0.5 * np.cos(np.pi * a)
    r = np.where(t > dur, np.exp(-(t - dur) / max(rel / 4.6, 1e-3)), 1.0)
    return a * r


def dynlp(x, fcs, block=512):
    """Two-pole low-pass whose cutoff follows fcs (one value per block); filter state carries over."""
    out = np.empty_like(x)
    zi = np.zeros((1, x.shape[0], 2))
    for b in range(0, x.shape[1], block):
        fc = float(np.clip(fcs[min(b // block, len(fcs) - 1)], 60, 18000))
        out[:, b:b + block], zi = sosfilt(filt('low', round(fc, -1)), x[:, b:b + block], axis=1, zi=zi)
    return out


# ───────────────────────── instruments ─────────────────────────
def strings(f, dur, vel=.6, att=.9, rel=1.4, voices=5, cents=7, vib=9, bright=1.0, pan=0., spread=.55,
            swell=0., trem=0.):
    n = int((dur + rel) * SR)
    t = np.arange(n) / SR
    out = np.zeros((2, n))
    vd = vib * np.clip((t - .25) / .7, 0, 1)
    for _ in range(voices):
        det = 2 ** (rng.uniform(-cents, cents) / 1200)
        vr = 5.2 * rng.uniform(.88, 1.12)
        fr = f * det * 2 ** (vd * np.sin(2 * np.pi * vr * t + rng.random() * 6.28) / 1200)
        out += pan2(saw(fr), pan + rng.uniform(-spread, spread))
    fc = min(15000, f * (2.5 + 5 * bright * vel) + 350 * bright)
    out = sosfilt(filt('low', fc), sosfilt(filt('low', fc * 1.4), out, axis=1), axis=1)
    e = env(n, att, dur, rel)
    if swell:
        e *= 1 - swell + swell * np.sin(np.pi * np.clip(t / max(dur, .1), 0, 1))
    if trem:
        e *= 1 - trem * (.5 + .5 * np.sin(2 * np.pi * rng.uniform(10.5, 12.5) * t + rng.random() * 6))
    return out * e * vel / np.sqrt(voices)


def spicc(f, vel=.7, pan=0.):
    """Short bowed note for ostinati."""
    n = int(.5 * SR)
    t = np.arange(n) / SR
    out = np.zeros((2, n))
    for _ in range(3):
        fr = np.full(n, f * 2 ** (rng.uniform(-6, 6) / 1200))
        out += pan2(saw(fr), pan + rng.uniform(-.4, .4))
    out = sosfilt(filt('low', min(9000, f * 9 * vel + 300)), out, axis=1)
    e = np.clip(t / .006, 0, 1) * (np.exp(-t / .09) * .85 + .15 * np.exp(-t / .3)) * (t < .42)
    return out * e * vel / np.sqrt(3)


def piano(f, dur, vel=.5, pan=None):
    lf = np.log2(f)
    T0 = float(np.interp(lf, np.log2([27.5, 4186]), [10, 1.3]))
    n = int((min(dur, T0 * 1.2) + .5) * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    B = .00028
    for k in range(1, 15):
        fk = k * f * np.sqrt(1 + B * k * k)
        if fk > 12000:
            break
        a = (1 / k ** (1.55 - .7 * vel)) * np.exp(-fk / (2200 + 3800 * vel))
        tau = T0 / (1 + .38 * (k - 1))
        dec = .62 * np.exp(-t / (tau * .22)) + .38 * np.exp(-t / tau)
        c = .7 * 2 ** (rng.uniform(-1, 1) / 1200)
        y += a * dec * (np.sin(2 * np.pi * fk * t + rng.random() * 6) + .7 * np.sin(2 * np.pi * fk * 2 ** (c / 1200) * t))
    ham = sosfilt(filt('band', [900, 3500]), rng.standard_normal(n)) * np.exp(-t / .006) * .04 * vel
    y = (y + ham) * np.clip(t / .002, 0, 1)
    y *= np.where(t > dur, np.exp(-(t - dur) / .12), 1.0)
    if pan is None:
        pan = float(np.clip((midi_from_hz(f) - 60) / 30, -.6, .6))
    return pan2(y * vel * .35, pan)


def midi_from_hz(f):
    return 69 + 12 * np.log2(f / 440)


def choir(f, dur, vel=.4, att=1.4, rel=2.0, pan=0.):
    return strings(f, dur, vel, att, rel, voices=6, cents=13, vib=6, bright=.7, pan=pan, spread=.8)


def brass(f, dur, vel=.6, att=.08, rel=.6, pan=0.):
    n = int((dur + rel) * SR)
    t = np.arange(n) / SR
    out = np.zeros((2, n))
    vd = 5 * np.clip((t - .3) / .6, 0, 1)
    for _ in range(3):
        fr = f * 2 ** ((rng.uniform(-5, 5) + vd * np.sin(2 * np.pi * 5 * t)) / 1200)
        out += pan2(saw(fr), pan + rng.uniform(-.35, .35))
    e = env(n, att, dur, rel)
    blk = 512
    eb = e[::blk]
    out = dynlp(out, f * (1.2 + 7 * vel * eb ** 1.5) + 200)
    return out * e * vel / np.sqrt(3)


def drum(f0, vel=.8, decay=.55, modes=(1,), noise=.35, nfc=1400):
    n = int(decay * 4 * SR)
    t = np.arange(n) / SR
    fr = f0 * (1 + .9 * np.exp(-t / .018))
    ph = 2 * np.pi * np.cumsum(fr) / SR
    y = np.zeros(n)
    for i, m in enumerate(modes):
        y += np.sin(ph * m) * np.exp(-t / (decay / (1 + i * .6))) / (1 + i)
    nz = sosfilt(filt('low', nfc), rng.standard_normal(n)) * np.exp(-t / .045)
    y = (y + noise * nz) * np.clip(t / .0015, 0, 1)
    return pan2(y * vel * .6, rng.uniform(-.1, .1))


def taiko(vel=.8):
    return drum(rng.uniform(62, 68), vel, .45, (1, 1.6), .55, 1100)


def tom(vel=.6):
    return drum(rng.uniform(105, 125), vel, .3, (1, 1.5), .5, 2200)


def timp(f, vel=.6):
    return drum(f, vel, 1.6, (1, 1.504, 1.742, 2.0), .25, 900)


def boom(vel=.8):
    return drum(36, vel, 1.6, (1,), .4, 300)


# ───────────────────────── mixing ─────────────────────────
class Track:
    WET = {'str': .34, 'solo': .3, 'pno': .26, 'cho': .5, 'brs': .3, 'drm': .16, 'low': .12}

    def __init__(self, bpm, bars, tail=7.0, beats=4):
        self.bpm, self.beats = bpm, beats
        self.L = bars * beats * 60 / bpm
        self.n = int((self.L + tail) * SR)
        self.bus = {k: np.zeros((2, self.n)) for k in self.WET}

    def sec(self, bar, beat=0.):
        return ((bar - 1) * self.beats + beat) * 60 / self.bpm

    def b(self, beats):
        return beats * 60 / self.bpm

    def add(self, bus, t, sig, jitter=.007):
        i = int(max(0, t + rng.normal(0, jitter)) * SR)
        m = min(sig.shape[1], self.n - i)
        if m > 0:
            self.bus[bus][:, i:i + m] += sig[:, :m]

    def mix(self, loop):
        ir = make_ir()
        body = np.concatenate([peq(260, 2.5, .9), peq(1300, -2, 1.2), peq(3000, 1.5, 1.5), filt('low', 9000)])
        self.bus['str'] = sosfilt(body, self.bus['str'], axis=1)
        self.bus['solo'] = sosfilt(body, self.bus['solo'], axis=1)
        form = sosfilt(filt('band', [450, 800]), self.bus['cho'], axis=1) + \
            .55 * sosfilt(filt('band', [900, 1300]), self.bus['cho'], axis=1) + \
            .2 * sosfilt(filt('band', [2300, 3000]), self.bus['cho'], axis=1)
        self.bus['cho'] = form * 2.2
        dry = sum(self.bus.values())
        wet = sum(self.bus[k] * w for k, w in self.WET.items())
        rev = np.stack([fftconvolve(wet[0], ir[0])[:self.n], fftconvolve(wet[1], ir[1])[:self.n]])
        y = dry * .82 + rev
        y = sosfilt(filt('high', 30), y, axis=1)
        if loop:
            L = int(self.L * SR)
            tail = y[:, L:]
            y = y[:, :L].copy()
            y[:, :tail.shape[1]] += tail[:, :L]
            y = np.concatenate([y[:, -int(PAD * SR):], y, y[:, :int(PAD * SR)]], axis=1)
        else:
            nz = np.nonzero(np.abs(y).max(0) > 1e-3)[0]
            y = y[:, :nz[-1] + 1]
            fo = int(3.5 * SR)
            y[:, -fo:] *= np.linspace(1, 0, fo)
        y = np.tanh(y / np.abs(y).max() * 1.15) / np.tanh(1.15) * .89
        return y


def make_ir(rt=3.0):
    n = int(rt * 1.3 * SR)
    t = np.arange(n) / SR
    ir = []
    for _ in range(2):
        nz = rng.standard_normal(n)
        lo = sosfilt(filt('low', 700), nz)
        mid = sosfilt(filt('band', [700, 3500]), nz)
        hi = sosfilt(filt('high', 3500), nz)
        r = lo * np.exp(-6.9 * t / rt) + mid * np.exp(-6.9 * t / (rt * .72)) + .6 * hi * np.exp(-6.9 * t / (rt * .35))
        r *= np.clip(t / .02, 0, 1)
        pre = int(.022 * SR)
        r = np.concatenate([np.zeros(pre), r])[:n]
        ir.append(r / np.sqrt(np.sum(r * r)) * .55)
    return np.stack(ir)


def write(name, y):
    os.makedirs(OUT, exist_ok=True)
    p = os.path.join(OUT, name + '.mp3')
    sf.write(p, y.T.astype(np.float32), SR, format='MP3', subtype='MPEG_LAYER_III', compression_level=.55,
             bitrate_mode='VARIABLE')
    print(f'{name}: {y.shape[1] / SR:.2f}s  {os.path.getsize(p) / 1024:.0f} KiB')


def melody(tr, bus, inst, notes, bar0, oct_dbl=None, **kw):
    """notes: list of (name|None, beats). Plays legato from bar0 beat 0."""
    pos = 0.
    for nm, bt in notes:
        if nm:
            t = tr.sec(bar0, pos)
            d = tr.b(bt) + .08
            tr.add(bus, t, inst(hz(nm), d, **kw))
            if oct_dbl:
                tr.add(oct_dbl[0], t, oct_dbl[1](hz(nm) / 2, d, **{**kw, 'vel': kw.get('vel', .5) * .7}))
        pos += bt


# ───────────────────────── night ─────────────────────────
# (bass, pad voicing, piano arpeggio pool) per bar; '>' splits a bar into two halves.
NIGHT = [
    ('D2', 'D3 A3 F4', 'D3 A3 D4 F4 A4'),
    ('C2', 'C3 A3 F4', 'C3 A3 D4 F4 A4'),
    ('Bb1', 'F3 A3 D4', 'Bb2 F3 A3 D4 F4'),
    ('A1', 'E3 A3 D4>E3 A3 C#4', 'A2 E3 A3 D4 E4>A2 E3 A3 C#4 E4'),
    ('D2', 'D3 A3 F4', 'D3 A3 D4 F4 A4'),
    ('Bb1', 'G3 Bb3 D4', 'Bb2 G3 Bb3 D4 G4'),
    ('A1', 'F3 A3 C4', 'A2 F3 A3 C4 F4'),
    ('A1', 'E3 A3 D4>E3 A3 C#4', 'A2 E3 A3 D4 E4>A2 E3 A3 C#4 E4'),
    ('Bb1', 'F3 Bb3 D4', 'Bb2 F3 Bb3 D4 F4'),
    ('A1', 'F3 A3 C4', 'A2 F3 A3 C4 F4'),
    ('G1', 'G3 Bb3 D4', 'G2 D3 G3 Bb3 D4'),
    ('F1', 'F3 A3 D4', 'F2 D3 F3 A3 D4'),
    ('G1', 'F3 Bb3 D4', 'G2 D3 F3 Bb3 D4'),
    ('Bb1', 'F3 Bb3 D4', 'Bb2 F3 Bb3 D4 F4'),
    ('A1', 'G3 D4 E4>G3 C#4 E4', 'A2 E3 G3 D4 E4>A2 E3 G3 C#4 E4'),
    ('A1', 'E3 A3 C#4', 'A2 E3 A3 C#4 E4'),
]
ARP = [(1, 0), (1.5, 1), (2, 2), (2.5, 3), (3, 4), (3.5, 2)]


def halves(s):
    return [h.split() for h in s.split('>')]


def night():
    tr = Track(64, 16)
    for i, (bass, pad, arp) in enumerate(NIGHT):
        bar = i + 1
        pv = .2 if bar <= 4 else .42 if 9 <= bar <= 12 else .3 if bar <= 14 else .22
        tr.add('str', tr.sec(bar), strings(hz(bass), tr.b(4) + .25, pv * .9, att=1.2, voices=4, bright=.6))
        tr.add('str', tr.sec(bar), strings(hz(bass) * 2, tr.b(4) + .25, pv * .55, att=1.2, voices=4, bright=.6))
        hv = halves(pad)
        for h, notes in enumerate(hv):
            span = 4 / len(hv)
            if bar <= 4 and h == 0 and len(notes) > 2:
                notes = notes[:2]
            for j, nm in enumerate(notes):
                tr.add('str', tr.sec(bar, h * span), strings(hz(nm), tr.b(span) + .25, pv * (.7 if bar > 4 else .5),
                                                             att=1.0 if h == 0 else .5, pan=(j - 1) * .5))
        # piano: low note on 1 with pedal, then a rising-falling arpeggio
        pa = halves(arp)
        pvel = .42 if bar <= 8 else .3 if bar <= 12 else .36
        tr.add('pno', tr.sec(bar), piano(hz(pa[0][0]) / (1 if midi(pa[0][0]) < 45 else 2), tr.b(4) + .6, pvel + .06))
        for beat, k in ARP:
            pool = pa[0] if beat < 2 or len(pa) == 1 else pa[1]
            if bar == 16 and beat > 2.5:
                continue
            v = pvel * (1 - .12 * (beat % 1 > 0)) * rng.uniform(.9, 1.06)
            tr.add('pno', tr.sec(bar, beat), piano(hz(pool[k]), tr.b(4.2 - beat), v))
        if 9 <= bar <= 12:
            for j, nm in enumerate(hv[-1][1:]):
                tr.add('cho', tr.sec(bar), choir(hz(nm) * 2, tr.b(4) + .3, .16, pan=(j - .5) * .8))
    cello = dict(vel=.5, att=.14, rel=.7, voices=2, cents=4, vib=15, bright=.9, spread=.15, swell=.25)
    melody(tr, 'solo', strings, [('A3', 2), ('D4', 1), ('E4', 1), ('F4', 3), ('E4', 1),
                                 ('D4', 1.5), ('C4', .5), ('D4', 1), ('A3', 1), ('E4', 4)], 5, **cello)
    violin = dict(vel=.42, att=.16, rel=.9, voices=3, cents=5, vib=14, bright=.8, spread=.25, swell=.3)
    melody(tr, 'solo', strings, [('F5', 2), ('G5', 1), ('A5', 1), ('C6', 2), ('A5', 1), ('F5', 1),
                                 ('G5', 1.5), ('F5', .5), ('E5', 1), ('D5', 1), ('D5', 3), ('C5', 1)], 9, **violin)
    melody(tr, 'solo', strings, [('D4', 2), ('C4', 1), ('Bb3', 1), ('A3', 2), ('F3', 2),
                                 ('E3', 2), ('D3', 1), ('C#3', 1), ('A2', 3)], 13, **{**cello, 'vel': .45})
    for k in range(10):   # soft timpani roll into bar 9
        tr.add('drm', tr.sec(8, 2 + k * .2), timp(hz('A1'), .05 + .02 * k), jitter=.003)
    tr.add('drm', tr.sec(9), timp(hz('Bb1'), .32))
    tr.add('low', tr.sec(1), boom(.22))
    return tr


# ───────────────────────── cat ─────────────────────────
CAT = ['D', 'D', 'Bb', 'A', 'D', 'D', 'Eb', 'A', 'G', 'G', 'Bb', 'A', 'D', 'Eb', 'Bb', 'A']
CHORD = {'D': 'D4 F4 A4', 'Bb': 'D4 F4 Bb4', 'A': 'C#4 E4 A4', 'Eb': 'Eb4 G4 Bb4', 'G': 'D4 G4 Bb4'}
ROOT = {'D': 'D2', 'Bb': 'Bb1', 'A': 'A1', 'Eb': 'Eb2', 'G': 'G1'}


def cat():
    tr = Track(96, 16, tail=5)
    pat = [(0, 0, 1), (.5, 0, .55), (1, 12, .7), (1.5, 0, .55), (2, 0, .85), (2.5, 12, .55), (3, 0, .7), (3.5, 7, .6)]
    for i, c in enumerate(CAT):
        bar = i + 1
        r = midi(ROOT[c])
        f = lambda m: 440 * 2 ** ((m - 69) / 12)
        for beat, iv, v in pat:
            tr.add('str', tr.sec(bar, beat), spicc(f(r + 12 + iv), v * .55, -.3), jitter=.004)
            tr.add('str', tr.sec(bar, beat), spicc(f(r + iv), v * .5, .2), jitter=.004)
        tr.add('str', tr.sec(bar), strings(f(r), tr.b(4) + .1, .3, att=.3, rel=.6, voices=4, bright=.5))
        if bar >= 9:
            for j, nm in enumerate(CHORD[c].split()):
                tr.add('str', tr.sec(bar), strings(hz(nm) * 2, tr.b(4) + .1, .14, att=.2, rel=.5, trem=.7,
                                                   pan=(j - 1) * .6, bright=.8))
        if 9 <= bar <= 12:
            for j, nm in enumerate(CHORD[c].split()):
                tr.add('brs', tr.sec(bar), brass(hz(nm) / 2, tr.b(3.2), .42, att=.12, pan=(j - 1) * .4))
        # drums
        if bar <= 4:
            hits = [(0, 1), (3, .7)]
        else:
            hits = [(0, 1), (1.5, .55), (2, .5), (3, .8), (3.5, .45)]
        for beat, v in hits:
            tr.add('drm', tr.sec(bar, beat), taiko(v * .8), jitter=.004)
        if bar % 4 == 0:
            for k in range(6):
                tr.add('drm', tr.sec(bar, 1 + k * .5), tom(.35 + .08 * k), jitter=.004)
        if bar in (1, 9):
            tr.add('low', tr.sec(bar), boom(.7))
    hp = dict(vel=.58, att=.09, rel=.5)
    melody(tr, 'brs', brass, [('A3', 2), ('D4', 1), ('E4', 1), ('F4', 3), ('E4', 1),
                              ('Eb4', 2), ('D4', 1), ('Bb3', 1), ('A3', 4)], 5, oct_dbl=('brs', brass), **hp)
    vl = dict(vel=.4, att=.1, rel=.6, voices=4, cents=6, vib=12, bright=1.0, spread=.3)
    melody(tr, 'solo', strings, [('D5', 2), ('E5', 1), ('F5', 1), ('Eb5', 3), ('D5', 1),
                                 ('D5', 2), ('F5', 2), ('E5', 2), ('C#5', 2)], 13, **vl)
    melody(tr, 'brs', brass, [('D4', 2), ('E4', 1), ('F4', 1), ('Eb4', 3), ('D4', 1),
                              ('D4', 2), ('F4', 2), ('E4', 2), ('C#4', 2)], 13, **{**hp, 'vel': .45})
    for i, c in enumerate(CAT[12:]):
        for j, nm in enumerate(CHORD[c].split()):
            tr.add('cho', tr.sec(13 + i), choir(hz(nm), tr.b(4) + .2, .2, att=.5, rel=.8, pan=(j - 1) * .7))
    return tr


# ───────────────────────── home ─────────────────────────
HOME = [
    ('D2', 'A3 D4 F#4', 'D3 A3 D4 F#4 A4'),
    ('C#2', 'A3 C#4 E4', 'C#3 A3 C#4 E4 A4'),
    ('B1', 'B3 D4 F#4', 'B2 F#3 B3 D4 F#4'),
    ('G1', 'B3 D4 G4', 'G2 D3 G3 B3 D4'),
    ('F#1', 'A3 D4 F#4', 'F#2 D3 A3 D4 F#4'),
    ('G1', 'B3 D4 G4', 'G2 D3 G3 B3 D4'),
    ('E2', 'G3 B3 D4', 'E2 B2 E3 G3 D4'),
    ('A1', 'E3 A3 D4>E3 A3 C#4', 'A2 E3 A3 D4 E4>A2 E3 A3 C#4 E4'),
    ('G1', 'G3 B3 D4', 'G2 D3 G3 B3 D4'),
    ('G1', 'A3 C#4 E4', 'G2 E3 A3 C#4 E4'),
    ('F#1', 'A3 C#4 E4>B3 D4 F#4', 'F#2 C#3 A3 C#4 E4>B2 F#3 B3 D4 F#4'),
    ('G1', 'B3 D4 G4>A3 C#4 E4', 'G2 D3 G3 B3 D4>A2 E3 A3 C#4 E4'),
]


def home():
    tr = Track(58, 14, tail=11)
    for i, (bass, pad, arp) in enumerate(HOME):
        bar = i + 1
        hv = halves(pad)
        bs = bass.split('>') if '>' in bass else [bass]
        if bar == 11:
            bs = ['F#1', 'B1']
        if bar == 12:
            bs = ['G1', 'A1']
        pv = .0 if bar <= 3 else .26 if bar == 4 else .34 if bar <= 8 else .44
        for h, b in enumerate(bs):
            span = 4 / len(bs)
            if pv:
                tr.add('str', tr.sec(bar, h * span), strings(hz(b), tr.b(span) + .25, pv * .9, att=1.0, voices=4, bright=.6))
                tr.add('str', tr.sec(bar, h * span), strings(hz(b) * 2, tr.b(span) + .25, pv * .5, att=1.0, voices=4, bright=.6))
        for h, notes in enumerate(hv):
            span = 4 / len(hv)
            for j, nm in enumerate(notes):
                if pv:
                    tr.add('str', tr.sec(bar, h * span), strings(hz(nm), tr.b(span) + .25, pv * .7, att=.9, pan=(j - 1) * .5))
                if bar >= 9:
                    tr.add('cho', tr.sec(bar, h * span), choir(hz(nm) * 2, tr.b(span) + .3, .15, att=1.0, pan=(j - 1) * .7))
        pa = halves(arp)
        pvel = .44 if bar <= 4 else .36
        tr.add('pno', tr.sec(bar), piano(hz(pa[0][0]) / (1 if midi(pa[0][0]) < 45 else 2), tr.b(2 if len(pa) > 1 else 4) + .5, pvel + .05))
        if len(pa) > 1:
            tr.add('pno', tr.sec(bar, 2), piano(hz(pa[1][0]) / (1 if midi(pa[1][0]) < 45 else 2), tr.b(2) + .5, pvel))
        for beat, k in ARP:
            pool = pa[0] if beat < 2 or len(pa) == 1 else pa[1]
            if bar >= 9 and beat % 1:
                continue
            tr.add('pno', tr.sec(bar, beat), piano(hz(pool[k]), tr.b(4.2 - beat), pvel * rng.uniform(.88, 1.04)))
    # final chord, long
    for nm in 'D2 D3'.split():
        tr.add('str', tr.sec(13), strings(hz(nm), tr.b(7), .4, att=1.2, rel=6, voices=4, bright=.5))
    for j, nm in enumerate('A3 D4 F#4 A4'.split()):
        tr.add('str', tr.sec(13), strings(hz(nm), tr.b(7), .3, att=1.2, rel=6, pan=(j - 1.5) * .4))
        tr.add('cho', tr.sec(13), choir(hz(nm) * 2, tr.b(6), .14, att=1.2, rel=5, pan=(j - 1.5) * .5))
    tr.add('pno', tr.sec(13), piano(hz('D2'), tr.b(8), .4))
    for k, nm in enumerate('D5 F#5 A5 D6'.split()):
        tr.add('pno', tr.sec(13, .5 + k * .5), piano(hz(nm), tr.b(8), .26))
    vio = dict(vel=.44, att=.18, rel=1.0, voices=3, cents=5, vib=14, bright=.8, spread=.25, swell=.3)
    melody(tr, 'solo', strings, [('A4', 2), ('D5', 1), ('E5', 1), ('F#5', 3), ('E5', 1),
                                 ('D5', 1.5), ('C#5', .5), ('D5', 1), ('B4', 1), ('E5', 2), ('C#5', 2)], 5, **vio)
    line = [('G5', 2), ('F#5', 1), ('E5', 1), ('E5', 2), ('C#5', 1), ('A4', 1),
            ('C#5', 2), ('D5', 2), ('B4', 1), ('D5', 1), ('C#5', 1), ('E5', 1), ('D5', 7)]
    melody(tr, 'solo', strings, line, 9, **{**vio, 'vel': .5})
    cello = dict(vel=.4, att=.18, rel=1.0, voices=2, cents=4, vib=14, bright=.8, spread=.15, swell=.25)
    melody(tr, 'solo', strings, [(n.replace('5', '4').replace('6', '5') if n[-1] in '56' else n, b) for n, b in line], 9, **cello)
    return tr


# ───────────────────────── fall ─────────────────────────
def fall():
    tr = Track(60, 3, tail=6)
    tr.add('low', 0, boom(.5))
    tr.add('pno', 0, piano(hz('D1'), 5, .5))
    tr.add('pno', 0, piano(hz('D2'), 5, .4))
    for j, nm in enumerate('D2 A2 F3 D4'.split()):
        tr.add('str', .05, strings(hz(nm), 4.2, .38, att=1.4, rel=2.5, voices=4, bright=.5, pan=(j - 1.5) * .4))
    melody(tr, 'solo', strings, [('A3', 1), ('F3', 1), ('E3', .8), ('D3', 2.6)], 1,
           vel=.5, att=.12, rel=1.6, voices=2, cents=4, vib=16, bright=.8, spread=.15, swell=.2)
    return tr


# ───────────────────────── rain (chapter 2) ─────────────────────────
RAIN = [
    ('D2', 'D3 A3 F4', 'A4 D5 F5 A5'), ('Bb1', 'D3 F3 Bb3', 'F4 Bb4 D5 F5'), ('A1', 'C3 F3 A3', 'F4 A4 C5 F5'), ('C2', 'E3 G3 C4', 'E4 G4 C5 E5'),
    ('D2', 'D3 A3 F4', 'A4 D5 F5 A5'), ('Bb1', 'D3 F3 Bb3', 'F4 Bb4 D5 F5'), ('G1', 'D3 G3 Bb3', 'G4 Bb4 D5 G5'), ('A1', 'E3 A3 D4>E3 A3 C#4', 'E4 A4 D5 E5>E4 A4 C#5 E5'),
    ('Bb1', 'D3 F3 Bb3', 'F4 Bb4 D5 F5'), ('C2', 'E3 G3 C4', 'E4 G4 C5 E5'), ('A1', 'E3 A3 C4', 'E4 A4 C5 E5'), ('D2', 'D3 A3 F4', 'A4 D5 F5 A5'),
    ('G1', 'D3 G3 Bb3', 'G4 Bb4 D5 G5'), ('Bb1', 'D3 F3 Bb3', 'F4 Bb4 D5 F5'), ('A1', 'E3 A3 D4>E3 A3 C#4', 'E4 A4 D5 E5>E4 A4 C#5 E5'), ('A1', 'E3 A3 C#4', 'E4 A4 C#5 E5'),
]


def rain():
    tr = Track(60, 16)
    drop = np.random.default_rng(3)
    for i, (bass, pad, arp) in enumerate(RAIN):
        bar = i + 1
        pv = .2 if bar <= 4 else .38 if 9 <= bar <= 12 else .28
        tr.add('str', tr.sec(bar), strings(hz(bass), tr.b(4) + .3, pv * .85, att=1.4, voices=4, bright=.5))
        hv = halves(pad)
        for h, notes in enumerate(hv):
            span = 4 / len(hv)
            for j, nm in enumerate(notes):
                tr.add('str', tr.sec(bar, h * span), strings(hz(nm), tr.b(span) + .3, pv * .6, att=1.1, pan=(j - 1) * .5, bright=.6))
        pa = halves(arp)
        tr.add('pno', tr.sec(bar), piano(hz(bass) * 2, tr.b(4) + .5, .34))
        for e in range(8):   # drops: a sparse, uneven fall of high notes
            if drop.random() < (.45 if bar <= 4 else .62):
                pool = pa[0] if e < 4 or len(pa) == 1 else pa[1]
                nm = pool[int(drop.integers(0, len(pool)))]
                tr.add('pno', tr.sec(bar, e * .5 + drop.normal(0, .03)), piano(hz(nm), tr.b(2.5), .2 + .12 * drop.random()), jitter=0)
        if 9 <= bar <= 12:
            for j, nm in enumerate(hv[-1][1:]):
                tr.add('cho', tr.sec(bar), choir(hz(nm) * 2, tr.b(4) + .3, .13, pan=(j - .5) * .8))
    cello = dict(vel=.48, att=.16, rel=.8, voices=2, cents=4, vib=15, bright=.85, spread=.15, swell=.3)
    melody(tr, 'solo', strings, [('D4', 2), ('C4', 1), ('A3', 1), ('Bb3', 3), ('A3', 1), ('G3', 2), ('A3', 1), ('Bb3', 1), ('A3', 4)], 5, **cello)
    violin = dict(vel=.4, att=.18, rel=1.0, voices=3, cents=5, vib=14, bright=.75, spread=.25, swell=.3)
    melody(tr, 'solo', strings, [('F5', 2), ('E5', 1), ('D5', 1), ('E5', 3), ('G5', 1), ('E5', 2), ('C5', 1), ('A4', 1), ('D5', 4)], 9, **violin)
    melody(tr, 'solo', strings, [('D4', 2), ('Bb3', 1), ('G3', 1), ('F3', 2), ('D4', 2), ('E4', 2), ('D4', 1), ('C#4', 1), ('A3', 3)], 13, **{**cello, 'vel': .42})
    tr.add('low', tr.sec(1), boom(.18))
    return tr


if __name__ == '__main__':
    import sys
    which = sys.argv[1:] or ['night', 'cat', 'home', 'fall', 'rain']
    for name in which:
        tr = globals()[name]()
        y = tr.mix(loop=name in ('night', 'cat', 'rain'))
        if name in ('night', 'cat', 'rain'):
            print(f'  loop {PAD} → {PAD + tr.L:.4f}')
        write(name, y)
