"""
============================================================================
 SignBridge AI  -  Hand Language Simulator  (Option A, single-file build)
============================================================================
 Recognises 24 sign-language gestures from your webcam and replies with
 VOICE and TEXT, to make communication easier for deaf, hard-of-hearing and
 differently-abled people.

 B.Tech CSE (AIML) - Credit 4 project.

 One file. Install three packages, then run:

     pip install opencv-python mediapipe pyttsx3
     python signbridge_ai.py              # live simulator (voice + text)
     python signbridge_ai.py --test       # quiz / test mode
     python signbridge_ai.py --no-voice   # text reply only

 Controls:  Q = quit   V = toggle voice   T = new quiz target

 How it works
 ------------
 Every frame is reduced to two feature families and scored against 24 rules:

 1. POSE   - which fingers are extended, plus spread / pinch / cone / fist
             flags derived from distances between the 21 MediaPipe
             landmarks (wrist 0, thumb 1-4, index 5-8, middle 9-12,
             ring 13-16, pinky 17-20).
 2. MOTION - a 1.2 second sliding window of the wrist, reduced to wave
             count, nod count, circularity, net drift and travel.

 This mirrors sign-language phonology: a sign is defined by handshape,
 location, orientation and movement. HELLO and GOODBYE share a pose and
 differ only in finger spread; PLEASE and SORRY share a chest location and
 differ in handshape; THANK YOU is defined purely by its chin-to-forward
 movement path.

 Linux note: pyttsx3 needs a speech backend, e.g.
     sudo apt install espeak-ng libespeak-ng1
============================================================================
"""

import argparse
import math
import queue
import random
import threading
import time
from collections import deque

import cv2
import mediapipe as mp
import pyttsx3


# ============================================================================
# 1. THE 24 GESTURES  (label, instruction, spoken reply)
# ============================================================================

GESTURES = [
    {"id": "hello",         "name": "HELLO",             "blurb": "Wave your hand from side to side.",
     "voice": "Hello! It is wonderful to see you."},
    {"id": "please",        "name": "PLEASE",            "blurb": "Tap your fingertips on your chest (near heart).",
     "voice": "Please, of course, take your time."},
    {"id": "thank-you",     "name": "THANK YOU",         "blurb": "Touch your chin and move hand forward.",
     "voice": "Thank you so much."},
    {"id": "yes",           "name": "YES",               "blurb": "Thumb up.",
     "voice": "Yes, absolutely."},
    {"id": "no",            "name": "NO",                "blurb": "Shake your index finger side to side.",
     "voice": "No, not this time."},
    {"id": "sorry",         "name": "SORRY",             "blurb": "Place hand on chest and move slightly down.",
     "voice": "I am truly sorry."},
    {"id": "excuse-me",     "name": "EXCUSE ME",         "blurb": "Open hand, move it forward slightly.",
     "voice": "Excuse me, may I pass?"},
    {"id": "goodbye",       "name": "GOODBYE",           "blurb": "Wave your hand with fingers spread.",
     "voice": "Goodbye! Take care of yourself."},
    {"id": "i-love-you",    "name": "I LOVE YOU",        "blurb": "Thumb, index and little finger up (middle and ring down).",
     "voice": "I love you."},
    {"id": "more",          "name": "MORE",              "blurb": "Rub your fingertips together (come closer).",
     "voice": "More, please continue."},
    {"id": "help",          "name": "HELP",              "blurb": "Raise both hands, palms up, then move up.",
     "voice": "Help, I need assistance."},
    {"id": "time",          "name": "TIME / NOW",        "blurb": "Point to your wrist (like a watch).",
     "voice": "What time is it? Right now."},
    {"id": "fingerspell-a", "name": "FINGERSPELL (A)",   "blurb": "Thumb across palm (fist).",
     "voice": "The letter A."},
    {"id": "okay",          "name": "OKAY",              "blurb": "Make a circle with thumb and index finger.",
     "voice": "Okay, that works for me."},
    {"id": "youre-welcome", "name": "YOU'RE WELCOME",    "blurb": "Open hand, palm up, slight forward motion.",
     "voice": "You are very welcome."},
    {"id": "sorry-regret",  "name": "SORRY / REGRET",    "blurb": "Hands together, fingers pointing up, then move down slightly.",
     "voice": "I feel deep regret for that."},
    {"id": "sign",          "name": "SIGN",              "blurb": "Point to your palm with the other hand (or show the sign).",
     "voice": "Please show me the sign."},
    {"id": "fingerspell-b", "name": "FINGERSPELL (B)",   "blurb": "Index and middle fingers up (V shape).",
     "voice": "The letter B."},
    {"id": "yes-alt",       "name": "YES (ALTERNATIVE)", "blurb": "Nod your head (with hand gesture).",
     "voice": "Yes, I agree."},
    {"id": "no-alt",        "name": "NO (ALTERNATIVE)",  "blurb": "Shake head (with hand gesture).",
     "voice": "No, I disagree."},
    {"id": "eat",           "name": "EAT",               "blurb": "Tap fingers to mouth.",
     "voice": "Let us eat something."},
    {"id": "drink",         "name": "DRINK",             "blurb": "Bring hand to mouth like holding a cup.",
     "voice": "I would like a drink."},
    {"id": "sleep",         "name": "SLEEP",             "blurb": "Place hands together and rest head on them.",
     "voice": "I am feeling sleepy."},
    {"id": "thanks",        "name": "THANKS",            "blurb": "Move hand from chest outward.",
     "voice": "Thanks a lot!"},
]


def by_id(gid):
    """Look a gesture up by id, or return None."""
    for g in GESTURES:
        if g["id"] == gid:
            return g
    return None


# ============================================================================
# 2. HAND TRACKING  (MediaPipe: 21 landmarks per hand, up to two hands)
# ============================================================================

class HandTracker:
    def __init__(self, max_hands=2, detection=0.7, tracking=0.5):
        self.hands = mp.solutions.hands.Hands(
            model_complexity=1,
            max_num_hands=max_hands,
            min_detection_confidence=detection,
            min_tracking_confidence=tracking,
        )
        self.connections = mp.solutions.hands.HAND_CONNECTIONS
        self.style = mp.solutions.drawing_styles.get_default_hand_landmarks_style()
        self.drawing = mp.solutions.drawing_utils

    def process(self, rgb_frame):
        """Feed an RGB frame, get a MediaPipe results object."""
        return self.hands.process(rgb_frame)

    def landmarks_of(self, results):
        """List (one entry per hand) of 21-point landmark lists."""
        if not results.multi_hand_landmarks:
            return []
        return [h.landmark for h in results.multi_hand_landmarks]

    def draw(self, frame, results):
        """Overlay the skeleton on the BGR frame for live feedback."""
        if results.multi_hand_landmarks:
            for hl in results.multi_hand_landmarks:
                self.drawing.draw_landmarks(frame, hl, self.connections, None, self.style)

    def close(self):
        self.hands.close()


# ============================================================================
# 3. FEATURE EXTRACTION  (pose signature + motion window)
# ============================================================================

def _d(a, b):
    return math.hypot(a.x - b.x, a.y - b.y)


def pose_of(lm):
    """Reduce 21 landmarks to a boolean pose signature."""
    s = _d(lm[0], lm[9]) or 1e-6
    ext = lambda pip, tip: _d(lm[tip], lm[0]) > _d(lm[pip], lm[0]) * 1.12

    index  = ext(6, 8)
    middle = ext(10, 12)
    ring   = ext(14, 16)
    pinky  = ext(18, 20)
    thumb  = _d(lm[4], lm[17]) > _d(lm[3], lm[17]) * 1.08

    spread = _d(lm[8], lm[12]) / s > 0.60
    pinch  = _d(lm[4], lm[8]) / s < 0.32
    cone   = (not index) and all(_d(lm[t], lm[4]) / s < 0.45 for t in (8, 12, 16, 20))
    fist   = not (index or middle or ring or pinky)
    open_h = index and middle and ring and pinky
    cshape = thumb and index and ring and pinky and not pinch and _d(lm[4], lm[8]) / s < 0.8

    return {
        "index": index, "middle": middle, "ring": ring, "pinky": pinky,
        "thumb": thumb, "spread": spread, "pinch": pinch, "cone": cone,
        "fist": fist, "open": open_h, "cshape": cshape, "scale": s,
    }


class MotionBuffer:
    """Sliding 1.2 s window of wrist (x, y) and hand scale."""

    def __init__(self, window=1.2):
        self.window = window
        self.frames = deque()

    def push(self, x, y, scale):
        now = time.time()
        self.frames.append((now, x, y, scale))
        while len(self.frames) > 2 and now - self.frames[0][0] > self.window:
            self.frames.popleft()

    def features(self):
        f = self.frames
        zero = dict(xrev=0, yrev=0, circ=0.0, netdx=0.0, netdy=0.0,
                    path=0.0, scale=0.0, miny=1.0, starty=1.0, travel=0.0)
        if len(f) < 4:
            return zero

        xrev = yrev = 0
        path = cross = pdx = pdy = 0.0
        miny = 1.0
        for i in range(1, len(f)):
            dx = f[i][1] - f[i - 1][1]
            dy = f[i][2] - f[i - 1][2]
            path += math.hypot(dx, dy)
            if abs(dx) > 0.004 and pdx and (dx > 0) != (pdx > 0):
                xrev += 1
            if abs(dy) > 0.004 and pdy and (dy > 0) != (pdy > 0):
                yrev += 1
            if i > 1:
                cross += pdx * dy - pdy * dx
            if abs(dx) > 0.002:
                pdx = dx
            if abs(dy) > 0.002:
                pdy = dy
            miny = min(miny, f[i][2])

        ndx = f[-1][1] - f[0][1]
        ndy = f[-1][2] - f[0][2]
        s0 = f[0][3] or 1e-6
        return {
            "xrev": xrev, "yrev": yrev,
            "circ": max(-1.0, min(1.0, (cross / (path * path)) * 6)) if path > 0.02 else 0.0,
            "netdx": ndx, "netdy": ndy, "path": path,
            "scale": (f[-1][3] - f[0][3]) / s0,
            "miny": miny, "starty": f[0][2], "travel": abs(ndx) + abs(ndy),
        }


# ============================================================================
# 4. CLASSIFIER  (24 gesture rules scored from pose + motion)
# ============================================================================

def classify(poses, m):
    """Score every gesture rule; return [(id, score), ...] best first."""
    if not poses:
        return []

    P = poses[0]
    two = len(poses) >= 2
    P2 = poses[1] if two else None

    wave_x = min(1.0, m["xrev"] / 3) if m["xrev"] >= 2 else 0.0
    nod_y  = min(1.0, m["yrev"] / 3) if m["yrev"] >= 2 else 0.0
    circle = min(1.0, abs(m["circ"]) / 0.55) if abs(m["circ"]) > 0.3 else 0.0
    still  = m["path"] < 0.09
    travel = m["travel"]
    chest  = m["miny"] > 0.48
    face   = m["miny"] < 0.45
    only_index = P["index"] and not (P["middle"] or P["ring"] or P["pinky"])

    out = []

    def push(i, s):
        if s > 0:
            out.append((i, s))

    # ---- dynamic one-hand signs ------------------------------------------
    if P["open"] and not P["spread"] and wave_x and not face:
        push("hello", 0.45 + wave_x * 0.5)
    if P["open"] and P["spread"] and wave_x:
        push("goodbye", 0.45 + wave_x * 0.5)
    if P["open"] and circle and chest and travel < 0.3:
        push("please", 0.4 + circle * 0.5)
    if P["fist"] and circle and chest:
        push("sorry", 0.4 + circle * 0.5)
    if P["open"] and m["starty"] < 0.42 and travel > 0.18:
        push("thank-you", 0.5 + min(0.4, travel))
    if P["open"] and not P["spread"] and m["scale"] > 0.07 and chest and not wave_x and circle < 0.3:
        push("excuse-me", 0.5 + m["scale"])
    if P["fist"] and P["thumb"] and nod_y:
        push("yes", 0.5 + nod_y * 0.4)
    if only_index and wave_x:
        push("no", 0.5 + wave_x * 0.4)
    if P["open"] and not two and m["netdy"] < -0.06 and 0.08 < travel < 0.3 and not wave_x:
        push("youre-welcome", 0.5)
    if P["open"] and P["spread"] and face and wave_x:
        push("no-alt", 0.5 + wave_x * 0.3)
    if P["pinch"] and P["middle"] and P["ring"] and P["pinky"] and nod_y:
        push("yes-alt", 0.5 + nod_y * 0.3)
    if P["cone"] and face and not two:
        push("eat", 0.65)
    if P["cshape"] and face and not two:
        push("drink", 0.65)
    if P["open"] and not face and 0.45 < m["starty"] < 0.9 and travel > 0.15 and not wave_x and circle < 0.3:
        push("thanks", 0.52)

    # ---- static one-hand poses --------------------------------------------
    if still:
        if P["index"] and not P["middle"] and not P["ring"] and P["pinky"] and P["thumb"]:
            push("i-love-you", 0.82)
        if P["pinch"] and P["middle"] and P["ring"] and P["pinky"]:
            push("okay", 0.78)
        if P["fist"] and not P["thumb"]:
            push("fingerspell-a", 0.72)
        if P["index"] and P["middle"] and not P["ring"] and not P["pinky"]:
            push("fingerspell-b", 0.78)

    # ---- two-hand signs ----------------------------------------------------
    if two and P2:
        if P["cone"] and P2["cone"]:
            push("more", 0.8)
        if (P["open"] or P2["open"]) and m["netdy"] < -0.09:
            push("help", 0.6)
        if P["open"] and P2["open"] and m["netdy"] > 0.05 and travel < 0.35:
            push("sorry-regret", 0.6)
        if P["open"] and P2["open"] and m["netdy"] > 0.09:
            push("sleep", 0.62)
        oi2 = P2["index"] and not (P2["middle"] or P2["ring"] or P2["pinky"])
        if only_index != oi2 and (only_index or oi2):
            other = P2 if only_index else P
            if other["open"] or other["fist"]:
                push("time" if (only_index and other["fist"]) else "sign", 0.62)

    out.sort(key=lambda t: t[1], reverse=True)
    return out[:6]


# ============================================================================
# 5. VOICE REPLY  (pyttsx3 on a worker thread so the loop never stalls)
# ============================================================================

class Voice:
    def __init__(self, rate=155):
        self.enabled = True
        self._q = queue.Queue()
        self._thread = threading.Thread(target=self._run, args=(rate,), daemon=True)
        self._thread.start()

    def _run(self, rate):
        engine = pyttsx3.init()
        engine.setProperty("rate", rate)
        voices = engine.getProperty("voices") or []
        for v in voices:
            if "english" in (v.name or "").lower() or "en_" in (v.id or "").lower():
                engine.setProperty("voice", v.id)
                break
        while True:
            text = self._q.get()
            if text is None:
                break
            engine.say(text)
            engine.runAndWait()

    def say(self, text):
        """Speak text, dropping anything still queued (latest reply wins)."""
        if not self.enabled:
            return
        while not self._q.empty():
            try:
                self._q.get_nowait()
            except queue.Empty:
                break
        self._q.put(text)

    def close(self):
        self._q.put(None)


# ============================================================================
# 6. MAIN LOOP  (webcam + HUD + commit/cooldown + voice/text + quiz mode)
# ============================================================================

COMMIT_SECONDS = 0.75     # hold time before a gesture commits
COOLDOWN_SECONDS = 2.5    # silence between repeats of the same sign
FONT = cv2.FONT_HERSHEY_SIMPLEX


def put(frame, text, org, scale=0.6, color=(255, 255, 255), thick=2):
    """Outlined text so the HUD stays readable on any background."""
    cv2.putText(frame, text, org, FONT, scale, (0, 0, 0), thick + 2)
    cv2.putText(frame, text, org, FONT, scale, color, thick)


def main():
    ap = argparse.ArgumentParser(description="SignBridge AI hand-language simulator")
    ap.add_argument("--test", action="store_true", help="quiz mode")
    ap.add_argument("--no-voice", action="store_true", help="disable speech")
    args = ap.parse_args()

    tracker = HandTracker()
    voice = Voice()
    voice.enabled = not args.no_voice
    buffer = MotionBuffer()

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        raise SystemExit("Could not open camera 0.")

    stable_id = None
    stable_since = 0.0
    last_id = None
    last_commit = 0.0
    current = None                       # last committed gesture
    target = random.choice(GESTURES) if args.test else None
    score = streak = 0
    verdict_until = 0.0
    verdict_text = ""

    while True:
        ok, frame = cap.read()
        if not ok:
            break
        frame = cv2.flip(frame, 1)       # mirror for natural self-view
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = tracker.process(rgb)
        tracker.draw(frame, results)

        hands = tracker.landmarks_of(results)
        now = time.time()

        if hands:
            poses = [pose_of(lm) for lm in hands]
            buffer.push(hands[0][0].x, hands[0][0].y, poses[0]["scale"])
            candidates = classify(poses, buffer.features())

            # live candidate meter (top-left)
            for row, (cid, cscore) in enumerate(candidates[:4]):
                g = by_id(cid)
                y0 = 90 + row * 34
                put(frame, g["name"], (16, y0), 0.55, (248, 208, 140))
                cv2.rectangle(frame, (190, y0 - 16), (490, y0 - 2), (20, 40, 60), -1)
                cv2.rectangle(frame, (190, y0 - 16),
                              (190 + int(300 * min(1.0, cscore)), y0 - 2),
                              (255, 195, 76), -1)

            top_id, top_score = candidates[0] if candidates else (None, 0.0)
            if top_id and top_score >= 0.55:
                if stable_id == top_id:
                    if now - stable_since > COMMIT_SECONDS and (
                        last_id != top_id or now - last_commit > COOLDOWN_SECONDS
                    ):
                        last_id, last_commit = top_id, now
                        g = by_id(top_id)
                        current = g
                        voice.say(g["voice"])          # <-- voice reply
                        if args.test:                  # <-- quiz grading
                            if top_id == target["id"]:
                                score += 1
                                streak += 1
                                verdict_text = "CORRECT!"
                            else:
                                streak = 0
                                verdict_text = "READ AS " + g["name"]
                            verdict_until = now + 1.5
                            target = random.choice(GESTURES)
                else:
                    stable_id, stable_since = top_id, now
            else:
                stable_id = None
        else:
            buffer.frames.clear()
            stable_id = None

        # ---- HUD ----------------------------------------------------------
        put(frame, "SignBridge AI", (16, 34), 0.8, (255, 195, 76))
        if current:
            put(frame, "REPLY: " + current["voice"], (16, frame.shape[0] - 46),
                0.6, (120, 230, 170))
            put(frame, "SIGN: " + current["name"], (16, frame.shape[0] - 16),
                0.6, (255, 255, 255))

        if args.test and target:
            put(frame, "QUIZ  sign -> " + target["name"], (16, 64),
                0.65, (120, 230, 170))
            put(frame, "score " + str(score) + "  streak " + str(streak),
                (frame.shape[1] - 260, 34), 0.6, (255, 195, 76))
            if now < verdict_until:
                good = verdict_text.startswith("C")
                put(frame, verdict_text,
                    (frame.shape[1] // 2 - 140, frame.shape[0] // 2), 1.1,
                    (120, 230, 170) if good else (110, 110, 255))

        put(frame, "Q quit  V voice:" + ("on" if voice.enabled else "off") +
            ("  T target" if args.test else ""),
            (16, frame.shape[0] - 76), 0.45, (150, 180, 210))

        cv2.imshow("SignBridge AI", frame)
        key = cv2.waitKey(1) & 0xFF
        if key == ord("q"):
            break
        if key == ord("v"):
            voice.enabled = not voice.enabled
        if key == ord("t") and args.test:
            target = random.choice(GESTURES)

    cap.release()
    voice.close()
    tracker.close()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
