import source from "../../signbridge_ai.py?raw";

export const PY_SOURCE = source;
export const PY_FILENAME = "signbridge_ai.py";
export const PY_LINES = source.split("\n").length;

export const PY_INSTALL_CMD = "pip install opencv-python mediapipe pyttsx3";
export const PY_RUN_CMDS = [
  "python signbridge_ai.py",
  "python signbridge_ai.py --test",
  "python signbridge_ai.py --no-voice",
];
