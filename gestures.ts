export interface PoseConfig {
  /** extension of [index, middle, ring, pinky] */
  fingers: [boolean, boolean, boolean, boolean];
  spread?: boolean;
  thumb: "up" | "side" | "across" | "out" | "tip";
  /** overrides finger rendering with a special handshape */
  shape?: "cone" | "c";
  /** two-handed sign — renders a mirrored partner hand */
  both?: boolean;
}

export interface Gesture {
  id: string;
  name: string;
  blurb: string;
  category: string;
  pose: PoseConfig;
  voice: string;
  deep: {
    handshape: string;
    movement: string;
    location: string;
    orientation: string;
    meaning: string;
    ml: string;
    mistake: string;
  };
}

export const CATEGORIES = [
  "All",
  "Greetings",
  "Politeness",
  "Conversation",
  "Feelings",
  "Daily Life",
  "Fingerspelling",
] as const;

export const GESTURES: Gesture[] = [
  {
    id: "hello",
    name: "Hello",
    blurb: "Wave your hand from side to side.",
    category: "Greetings",
    pose: { fingers: [true, true, true, true], thumb: "side" },
    voice: "Hello! It is wonderful to see you.",
    deep: {
      handshape:
        "Open-B handshape: all four fingers extended and adducted (held together), thumb braced across or beside the palm. This is the neutral 'flat hand' of the sign inventory.",
      movement:
        "A radioulnar wave — the hand rotates at the wrist side-to-side around a vertical axis, not the whole arm swinging. Two to three oscillations read as a friendly greeting.",
      location: "Neutral signing space at shoulder height, slightly to the dominant side.",
      orientation: "Palm faces the receiver throughout; the palm-forward orientation is what marks it as attention-getting rather than descriptive.",
      meaning:
        "A universal greeting and attention-getter. In many Deaf cultures, eye contact plus this wave replaces calling someone's name aloud.",
      ml: "Detector looks for: all fingertips extended, palm toward camera, and ≥2 horizontal direction reversals of the wrist within 1.2 s.",
      mistake: "Swinging from the elbow makes it look like 'goodbye'. Keep the motion in the wrist and keep fingers together.",
    },
  },
  {
    id: "please",
    name: "Please",
    blurb: "Tap your fingertips on your chest (near heart).",
    category: "Politeness",
    pose: { fingers: [true, true, true, true], thumb: "side" },
    voice: "Please — of course, take your time.",
    deep: {
      handshape: "Flat open hand, fingers together — the same B handshape as HELLO, distinguished entirely by location and movement.",
      movement:
        "The palm rubs the centre of the chest in a small clockwise circle, usually one and a half revolutions. The circular path encodes sincerity and repetition of intent.",
      location: "Sternum, over the heart — a 'location with semantic load' that ties the sign to feeling.",
      orientation: "Palm faces the signer's own chest, the reverse of HELLO. Orientation alone flips who the sign is directed at.",
      meaning: "A politeness marker for requests. It can stand alone ('please?') or modify another sign.",
      ml: "Classifier watches for an open hand whose wrist traces a small closed loop while staying inside the chest bounding box.",
      mistake: "Tapping instead of circling turns it into a different lexical sign in several sign languages. Keep the contact continuous.",
    },
  },
  {
    id: "thank-you",
    name: "Thank You",
    blurb: "Touch your chin and move hand forward.",
    category: "Politeness",
    pose: { fingers: [true, true, true, true], thumb: "side" },
    voice: "Thank you so much.",
    deep: {
      handshape: "Open flat hand, fingers adducted. The handshape stays constant; the grammar lives in the path.",
      movement:
        "A single forward-downward arc away from the chin — a 'giving' trajectory that metaphorically hands gratitude to the receiver.",
      location: "Begins with fingertips at the chin/lips (the source of speech) and ends in shared signing space.",
      orientation: "Palm up-and-outward at the release, offering the feeling forward.",
      meaning: "Expresses gratitude. Historically related to blowing a kiss — affection projected outward.",
      ml: "Recognised by the hand starting in the face region and producing a net outward displacement of >0.25 of frame width.",
      mistake: "Starting at the forehead changes the sign's meaning in ASL. Anchor at the chin.",
    },
  },
  {
    id: "yes",
    name: "Yes",
    blurb: "Thumb up.",
    category: "Conversation",
    pose: { fingers: [false, false, false, false], thumb: "up" },
    voice: "Yes, absolutely.",
    deep: {
      handshape: "Closed fist (S handshape) with the thumb extended upward — an A/S fist modified by a single active digit.",
      movement:
        "The fist nods at the wrist, mimicking a head nod. The sign is iconic: the hand becomes a miniature nodding head.",
      location: "Neutral space in front of the chest.",
      orientation: "Thumb points up, knuckles face the receiver.",
      meaning: "Affirmation, agreement, consent. One of the earliest signs acquired by deaf children.",
      ml: "Fist detected (all four PIP–tip distances collapsed) plus thumb tip above thumb MCP, with small vertical oscillation.",
      mistake: "A still thumb reads as the letter 'A' or '10'. The nod is phonemically required.",
    },
  },
  {
    id: "no",
    name: "No",
    blurb: "Shake your index finger side to side.",
    category: "Conversation",
    pose: { fingers: [true, false, false, false], thumb: "across" },
    voice: "No, not this time.",
    deep: {
      handshape: "Index finger extended (1/D handshape), remaining fingers sealed into the palm with the thumb over them.",
      movement:
        "Lateral wrist shake — the index sweeps left-right like a metronome. Again iconic of a head shake.",
      location: "Neutral signing space, chest to shoulder height.",
      orientation: "Palm faces inward or toward the receiver depending on emphasis.",
      meaning: "Negation, refusal, or correction. Sharper, faster shakes signal stronger refusal.",
      ml: "Single extended index plus ≥2 horizontal reversals of the fingertip while the fist centroid stays fixed.",
      mistake: "Bending the index into a hook makes it the letter 'X'. Keep it straight.",
    },
  },
  {
    id: "sorry",
    name: "Sorry",
    blurb: "Place hand on chest and move slightly down.",
    category: "Feelings",
    pose: { fingers: [false, false, false, false], thumb: "across" },
    voice: "I am truly sorry.",
    deep: {
      handshape: "A-fist: closed hand with the thumb resting along the side of the index — a 'heart-held' handshape.",
      movement:
        "The fist circles the chest in a slow grind, weight pressing inward. The friction against the chest encodes emotional weight.",
      location: "Centre of the chest, over the heart.",
      orientation: "Knuckles out, palm toward the body.",
      meaning: "Apology or regret. Facial expression (furrowed brows) is grammatically part of the sign.",
      ml: "Fist centroid locked to the chest box while wrist angle accumulates one full rotation.",
      mistake: "Lifting the hand off the chest breaks the sign — contact is the morpheme.",
    },
  },
  {
    id: "excuse-me",
    name: "Excuse Me",
    blurb: "Open hand, move it forward slightly.",
    category: "Politeness",
    pose: { fingers: [true, true, true, true], thumb: "side" },
    voice: "Excuse me, may I pass?",
    deep: {
      handshape: "Open B hand, fingers together.",
      movement: "A short, repeated forward brush — the hand slices away from the body once or twice.",
      location: "Starts near the torso and projects into the space you are moving through.",
      orientation: "Palm edge leads, like the blade of the hand clearing a path.",
      meaning: "A brief courtesy for interrupting or passing someone; lighter register than PLEASE.",
      ml: "Open hand with a small net forward displacement and low oscillation — distinguished from THANK YOU by the absence of a face-region start.",
      mistake: "Adding a circular path turns it into PLEASE. Keep the motion linear.",
    },
  },
  {
    id: "goodbye",
    name: "Goodbye",
    blurb: "Wave your hand with fingers spread.",
    category: "Greetings",
    pose: { fingers: [true, true, true, true], spread: true, thumb: "out" },
    voice: "Goodbye! Take care of yourself.",
    deep: {
      handshape: "Open 5-hand: fingers extended and deliberately spread, thumb abducted — maximum visible surface area.",
      movement: "Full-hand wave from the wrist, larger amplitude than HELLO.",
      location: "Raised to head height or above, marking departure.",
      orientation: "Palm squarely toward the person leaving.",
      meaning: "Farewell. The spread fingers distinguish it lexically from the together-fingers greeting wave.",
      ml: "Same wave motion as HELLO but inter-fingertip distance above the spread threshold — spread is the only phoneme that differs.",
      mistake: "Holding fingers together reverts the meaning to HELLO. Spread is mandatory.",
    },
  },
  {
    id: "i-love-you",
    name: "I Love You",
    blurb: "Thumb, index and little finger up (middle and ring down).",
    category: "Feelings",
    pose: { fingers: [true, false, false, true], thumb: "up" },
    voice: "I love you.",
    deep: {
      handshape:
        "The ILY handshape fuses the fingerspelled letters I, L and Y into one simultaneous chord — a rare example of letters collapsing into a single iconic sign.",
      movement: "Usually static, or a gentle forward tilt toward the addressee.",
      location: "Chest height, directed at the loved one.",
      orientation: "Palm out so the letter-form is legible to the receiver.",
      meaning: "Declaration of love or deep affection; also a widely recognised symbol of Deaf pride and culture.",
      ml: "Exact boolean pattern [index↑, middle↓, ring↓, pinky↑, thumb↑] — one of the most reliably classified static poses.",
      mistake: "Confusing it with the 'rock on' horns sign, which tucks the thumb. Thumb position is the phonemic switch.",
    },
  },
  {
    id: "more",
    name: "More",
    blurb: "Rub your fingertips together (come closer).",
    category: "Conversation",
    pose: { fingers: [false, false, false, false], thumb: "tip", shape: "cone" },
    voice: "More, please continue.",
    deep: {
      handshape: "Flat-O: all fingertips pinched to the thumb tip, forming a cone. Both hands mirror each other.",
      movement: "The two cones tap together twice at the fingertips — a reduplication that pluralises the request.",
      location: "Neutral space in front of the torso.",
      orientation: "Fingertips face each other across the midline.",
      meaning: "'More', 'again', or 'come closer' depending on context — a high-frequency core vocabulary sign.",
      ml: "Both hands detected with all tips within one fingertip-radius of the thumb tip, and inter-hand distance oscillating.",
      mistake: "Using a full fist instead of a fingertip pinch changes the sign entirely.",
    },
  },
  {
    id: "help",
    name: "Help",
    blurb: "Raise both hands, palms up, then move up.",
    category: "Conversation",
    pose: { fingers: [true, true, true, true], thumb: "up", both: true },
    voice: "Help — I need assistance.",
    deep: {
      handshape: "Non-dominant hand flat, palm up, acting as a platform; dominant hand forms a thumbs-up fist resting on it.",
      movement: "Both hands rise together as one unit — the platform literally 'lifts' the request.",
      location: "Starts low at waist level and elevates.",
      orientation: "Platform palm faces up; fist thumb points to the signer.",
      meaning: "Request or offer of assistance. Direction reversed (downward) means 'to help someone'.",
      ml: "Two-hand detection with one open palm-up hand beneath a fist, and a shared upward net displacement.",
      mistake: "Moving only the top hand loses the 'joint lift' morphology.",
    },
  },
  {
    id: "time",
    name: "Time / Now",
    blurb: "Point to your wrist (like a watch).",
    category: "Daily Life",
    pose: { fingers: [true, false, false, false], thumb: "across", both: true },
    voice: "What time is it? Right now.",
    deep: {
      handshape: "Dominant index finger extended; non-dominant hand presents the wrist as a flat surface.",
      movement: "The index taps the wrist once or twice — a deictic point at the cultural location of a watch.",
      location: "The back of the non-dominant wrist.",
      orientation: "Index points down at the wrist; wrist palm faces down.",
      meaning: "Time, 'now', or a question about the hour. A borrowed-iconic sign referencing wristwatch culture.",
      ml: "Two hands in contact: an extended index tip within threshold of the opposite wrist landmark.",
      mistake: "Tapping the palm instead of the wrist loses the iconic anchor.",
    },
  },
  {
    id: "fingerspell-a",
    name: "Fingerspell (A)",
    blurb: "Thumb across palm (fist).",
    category: "Fingerspelling",
    pose: { fingers: [false, false, false, false], thumb: "side" },
    voice: "The letter A.",
    deep: {
      handshape: "S/A fist: all fingers curled, thumb braced vertically along the side of the index — not across it (that would be 'S').",
      movement: "Static letter hold; in fingerspelling, letters are held briefly and evenly, not bounced.",
      location: "Spelling space at shoulder height to the dominant side.",
      orientation: "Palm faces the reader squarely for legibility.",
      meaning: "The letter A of the manual alphabet, used to spell names, places, and terms without an established sign.",
      ml: "Fist with thumb-tip beside (not over) the index PIP — a subtle thumb-position cue separates A from S.",
      mistake: "Wrapping the thumb across the fingers produces 'S'. Keep the thumb on the side.",
    },
  },
  {
    id: "okay",
    name: "Okay",
    blurb: "Make a circle with thumb and index finger.",
    category: "Conversation",
    pose: { fingers: [false, true, true, true], thumb: "tip" },
    voice: "Okay, that works for me.",
    deep: {
      handshape: "F-handshape: thumb and index tips touch to form a ring while middle, ring and pinky fan out.",
      movement: "Often static; can be bounced lightly for emphasis ('very okay').",
      location: "Neutral signing space.",
      orientation: "Palm out, ring visible to the receiver.",
      meaning: "Agreement, acceptance, or 'all correct'. Note: in some cultures the ring gesture is offensive — context travels with signs.",
      ml: "Thumb-tip to index-tip distance below pinch threshold while the other three fingers stay extended.",
      mistake: "Letting the three free fingers droop collapses the F shape into a generic pinch.",
    },
  },
  {
    id: "youre-welcome",
    name: "You're Welcome",
    blurb: "Open hand, palm up, slight forward motion.",
    category: "Politeness",
    pose: { fingers: [true, true, true, true], thumb: "side" },
    voice: "You are very welcome.",
    deep: {
      handshape: "Open flat hand, relaxed.",
      movement: "A small forward glide from the chin or chest outward — the same giving-path family as THANK YOU.",
      location: "Begins near the body, releases into shared space.",
      orientation: "Palm turns upward during the release, presenting the response.",
      meaning: "The conventional reply to THANK YOU, completing the politeness adjacency pair.",
      ml: "Open palm-up hand with a gentle outward vector following a prior THANK YOU detection in dialogue state.",
      mistake: "Omitting the palm-up rotation makes it indistinguishable from THANK YOU.",
    },
  },
  {
    id: "sorry-regret",
    name: "Sorry / Regret",
    blurb: "Hands together, fingers pointing up, then move down slightly.",
    category: "Feelings",
    pose: { fingers: [true, true, true, true], thumb: "side", both: true },
    voice: "I feel deep regret for that.",
    deep: {
      handshape: "Both flat hands, fingers together and pointing skyward, pressed along the finger edges.",
      movement: "The joined hands sink slowly a few centimetres — a visible 'sinking heart' metaphor.",
      location: "In front of the chest, centreline.",
      orientation: "Palms face each other; fingertips aligned.",
      meaning: "A heavier register of apology than SORRY — remorse, grief, or formal regret.",
      ml: "Two open hands with near-parallel orientation and a small shared downward drift.",
      mistake: "Raising instead of lowering the hands inverts the emotional metaphor.",
    },
  },
  {
    id: "sign",
    name: "Sign",
    blurb: "Point to your palm with the other hand (or show the sign).",
    category: "Conversation",
    pose: { fingers: [true, false, false, false], thumb: "across", both: true },
    voice: "Please show me the sign.",
    deep: {
      handshape: "Non-dominant hand flat as a page; dominant index finger as a pen.",
      movement: "The index traces or taps across the open palm, mimicking writing.",
      location: "The upturned palm of the non-dominant hand.",
      orientation: "Palm faces up-and-out; index points down at it.",
      meaning: "The noun/verb 'sign' or 'to sign' — writing on the palm metonymises marking language onto the hand.",
      ml: "Index tip tracking along the surface plane of the opposite open palm.",
      mistake: "Tapping with a fist turns it into a different two-hand lexical item.",
    },
  },
  {
    id: "fingerspell-b",
    name: "Fingerspell (B)",
    blurb: "Index and middle fingers up (V shape).",
    category: "Fingerspelling",
    pose: { fingers: [true, true, false, false], thumb: "across" },
    voice: "The letter B.",
    deep: {
      handshape: "Two upright fingers with the ring and pinky folded and the thumb crossing them — the project chart renders it as a V-style chord.",
      movement: "Static hold within the fingerspelling rhythm.",
      location: "Spelling space, steady height.",
      orientation: "Palm to the reader; upright fingers vertical.",
      meaning: "A manual-alphabet letter; note that true ASL 'B' spreads all four fingers — this project variant follows the V-form shown in the reference chart.",
      ml: "Exactly two adjacent extended fingers with the thumb crossing the folded pair.",
      mistake: "Separating the two fingers into a wide V drifts toward the letter 'V'/'2'.",
    },
  },
  {
    id: "yes-alt",
    name: "Yes (Alternative)",
    blurb: "Nod your head (with hand gesture).",
    category: "Conversation",
    pose: { fingers: [false, true, true, true], thumb: "tip" },
    voice: "Yes — I agree.",
    deep: {
      handshape: "F/OK handshape held while the head nods — a bimodal sign combining manual and non-manual channels.",
      movement: "The hand bobs in sync with a genuine head nod; the two channels reinforce each other.",
      location: "Beside the shoulder or chin.",
      orientation: "Ring faces outward.",
      meaning: "Emphatic or casual agreement; the nod carries much of the semantic load, showing how sign grammar recruits the face and head.",
      ml: "OK pose plus vertical oscillation of both hand and face landmarks in phase.",
      mistake: "Nodding without the hand, or holding the hand still, halves the bimodal signal.",
    },
  },
  {
    id: "no-alt",
    name: "No (Alternative)",
    blurb: "Shake head (with hand gesture).",
    category: "Conversation",
    pose: { fingers: [true, true, true, true], spread: true, thumb: "out" },
    voice: "No — I disagree.",
    deep: {
      handshape: "Open spread hand raised beside the face.",
      movement: "The hand sways side-to-side in phase with a head shake — the manual echo of negation.",
      location: "Near the cheek or temple.",
      orientation: "Palm outward, acting as a soft 'stop' surface.",
      meaning: "Disagreement or refusal with added emphasis; demonstrates non-manual markers working with the hands.",
      ml: "Open hand near face landmarks with horizontal oscillation correlated to nose-landmark sway.",
      mistake: "Placing the hand far from the face decouples it from the head-shake channel.",
    },
  },
  {
    id: "eat",
    name: "Eat",
    blurb: "Tap fingers to mouth.",
    category: "Daily Life",
    pose: { fingers: [false, false, false, false], thumb: "tip", shape: "cone" },
    voice: "Let us eat something.",
    deep: {
      handshape: "Flat-O cone — fingertips gathered to the thumb like holding a morsel of food.",
      movement: "The cone taps the lips once or twice — iconic of placing food in the mouth.",
      location: "The mouth.",
      orientation: "Fingertips toward the lips.",
      meaning: "'Eat' or 'food'. Reduplication (eat-eat) can mean 'meal' or 'restaurant' in some sign languages.",
      ml: "Cone handshape with fingertip centroid repeatedly entering the mouth region of the face mesh.",
      mistake: "Using an open flat hand at the mouth reads as a different sign (e.g. 'drink' variants).",
    },
  },
  {
    id: "drink",
    name: "Drink",
    blurb: "Bring hand to mouth like holding a cup.",
    category: "Daily Life",
    pose: { fingers: [true, true, true, true], thumb: "out", shape: "c" },
    voice: "I would like a drink.",
    deep: {
      handshape: "C-hand: fingers and thumb curved to grip an imaginary cup.",
      movement: "The 'cup' tilts toward the lips in a drinking arc.",
      location: "Travels from chest height to the mouth.",
      orientation: "The C opening rotates upward as it approaches the lips.",
      meaning: "'Drink' or 'beverage'. The handshape is purely iconic — you can see the cup.",
      ml: "Curvature signature (moderate tip spread, tips forward of knuckles) plus a mouth-bound trajectory.",
      mistake: "Closing the C into a fist loses the cup metaphor.",
    },
  },
  {
    id: "sleep",
    name: "Sleep",
    blurb: "Place hands together and rest head on them.",
    category: "Daily Life",
    pose: { fingers: [true, true, true, true], thumb: "side", both: true },
    voice: "I am feeling sleepy.",
    deep: {
      handshape: "Both open hands start at the face and draw downward, fingers closing as they pass the chin — the eyes 'closing' made manual.",
      movement: "A single downward sweep ending with the joined hands resting against the tilted cheek.",
      location: "From the eyes down to the cheek, with a head tilt onto the hands.",
      orientation: "Palms face the signer at the start, ending pressed together at the side of the face.",
      meaning: "'Sleep', 'tired', or 'bed'. The whole body enacts the concept — a pantomimic sign.",
      ml: "Two hands descending the face region while inter-hand distance shrinks to contact; head-roll angle increases.",
      mistake: "Keeping the head upright removes half the pantomime.",
    },
  },
  {
    id: "thanks",
    name: "Thanks",
    blurb: "Move hand from chest outward.",
    category: "Politeness",
    pose: { fingers: [true, true, true, true], thumb: "side" },
    voice: "Thanks a lot!",
    deep: {
      handshape: "Open flat hand, relaxed and together.",
      movement: "A single outward sweep from the chest — shorter and more casual than the chin-anchored THANK YOU.",
      location: "Starts at the sternum, releases forward.",
      orientation: "Palm up-and-out in a presenting arc.",
      meaning: "A lighter, everyday 'thanks' — register variation within the gratitude family.",
      ml: "Open hand leaving the chest box with one smooth outward vector and no face contact.",
      mistake: "Anchoring at the chin upgrades it to the formal THANK YOU.",
    },
  },
];

export const gestureById = (id: string) => GESTURES.find((g) => g.id === id);
