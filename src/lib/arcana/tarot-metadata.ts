export interface TarotMetadata {
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  element?: string;
  astrology?: string;
  numerology?: string;
  description: string;
}

export const MAJOR_ARCANA_METADATA: Record<string, TarotMetadata> = {
  'The Fool': {
    keywords: ['beginnings', 'innocence', 'spontaneity', 'free spirit', 'adventure'],
    uprightMeaning: 'New beginnings, optimism, trust in life, taking a leap of faith, embracing the unknown with open heart.',
    reversedMeaning: 'Recklessness, taken advantage of, inconsideration, naivety, holding back from new opportunities.',
    element: 'Air',
    astrology: 'Uranus',
    numerology: '0 - Infinite potential, the void before creation',
    description: 'The Fool represents the beginning of a journey, stepping into the unknown with pure faith and optimism. It embodies innocence, spontaneity, and the courage to take risks.'
  },
  'The Magician': {
    keywords: ['manifestation', 'resourcefulness', 'power', 'inspired action', 'willpower'],
    uprightMeaning: 'Manifestation, power to create reality, resourcefulness, inspired action, mastery of skills and tools.',
    reversedMeaning: 'Manipulation, poor planning, untapped talents, trickery, illusions, wasted potential.',
    element: 'Air',
    astrology: 'Mercury',
    numerology: '1 - Creation, initiative, new beginnings',
    description: 'The Magician symbolizes the power to manifest desires into reality. With all tools at hand, this card represents skill, concentration, and the ability to use resources wisely.'
  },
  'The High Priestess': {
    keywords: ['intuition', 'sacred knowledge', 'divine feminine', 'subconscious mind', 'mystery'],
    uprightMeaning: 'Intuition, sacred knowledge, the subconscious mind, inner voice, hidden talents and mysteries.',
    reversedMeaning: 'Secrets, disconnected from intuition, withdrawal, silence, repressed feelings.',
    element: 'Water',
    astrology: 'Moon',
    numerology: '2 - Duality, balance, partnership',
    description: 'The High Priestess sits at the gateway between the conscious and subconscious realms. She represents intuition, sacred knowledge, and the mysteries that lie beneath the surface.'
  },
  'The Empress': {
    keywords: ['femininity', 'beauty', 'nature', 'nurturing', 'abundance', 'fertility'],
    uprightMeaning: 'Abundance, nurturing, fertility, creative expression, beauty, connection with nature.',
    reversedMeaning: 'Creative block, dependence on others, smothering, emptiness, neglecting self-care.',
    element: 'Earth',
    astrology: 'Venus',
    numerology: '3 - Creativity, growth, expansion',
    description: 'The Empress is the archetype of the divine feminine, representing abundance, nurturing, and the creative force of nature. She embodies fertility in all forms.'
  },
  'The Emperor': {
    keywords: ['authority', 'structure', 'control', 'stability', 'father figure', 'leadership'],
    uprightMeaning: 'Authority, structure, control, stability, leadership, protection through established order.',
    reversedMeaning: 'Domination, excessive control, rigidity, inflexibility, lack of discipline.',
    element: 'Fire',
    astrology: 'Aries',
    numerology: '4 - Stability, foundation, order',
    description: 'The Emperor represents authority, structure, and the establishment of order. He is the father figure who provides stability and protection through rules and systems.'
  },
  'The Hierophant': {
    keywords: ['tradition', 'conformity', 'morality', 'ethics', 'spiritual wisdom', 'institutions'],
    uprightMeaning: 'Spiritual wisdom, tradition, conformity, institutions, education, belief systems.',
    reversedMeaning: 'Rebellion, subversiveness, new approaches, unconventional, freedom from tradition.',
    element: 'Earth',
    astrology: 'Taurus',
    numerology: '5 - Challenge, change, freedom',
    description: 'The Hierophant represents traditional values, religious beliefs, and conformity to social norms. He is the keeper of sacred knowledge passed through established institutions.'
  },
  'The Lovers': {
    keywords: ['love', 'harmony', 'relationships', 'values alignment', 'choices', 'union'],
    uprightMeaning: 'Love, harmony, relationships, alignment of values, important choices, deep connections.',
    reversedMeaning: 'Disharmony, imbalance, misalignment of values, conflict, poor choices in relationships.',
    element: 'Air',
    astrology: 'Gemini',
    numerology: '6 - Harmony, balance, choice',
    description: 'The Lovers card represents deep connections, harmony, and the union of opposites. It speaks to choices made from the heart and alignment of values.'
  },
  'The Chariot': {
    keywords: ['control', 'willpower', 'success', 'action', 'determination', 'victory'],
    uprightMeaning: 'Control, willpower, success through determination, forward movement, triumph over obstacles.',
    reversedMeaning: 'Lack of direction, opposition, lack of control, aggression, scattered energy.',
    element: 'Water',
    astrology: 'Cancer',
    numerology: '7 - Victory, spiritual growth, inner wisdom',
    description: 'The Chariot represents triumph through willpower and determination. It symbolizes controlled forward movement and victory achieved through discipline and focus.'
  },
  'Strength': {
    keywords: ['strength', 'courage', 'patience', 'compassion', 'inner power', 'self-control'],
    uprightMeaning: 'Inner strength, courage, patience, compassion, soft control, persuasion over force.',
    reversedMeaning: 'Self-doubt, weakness, insecurity, lack of confidence, feeling powerless.',
    element: 'Fire',
    astrology: 'Leo',
    numerology: '8 - Power, infinity, manifestation',
    description: 'Strength represents the power of the gentle spirit over brute force. It embodies courage, patience, and the ability to tame wild energies through compassion.'
  },
  'The Hermit': {
    keywords: ['soul-searching', 'introspection', 'inner guidance', 'solitude', 'wisdom'],
    uprightMeaning: 'Soul-searching, introspection, inner guidance, solitude, spiritual enlightenment.',
    reversedMeaning: 'Isolation, loneliness, withdrawal, losing your way, refusing to seek help.',
    element: 'Earth',
    astrology: 'Virgo',
    numerology: '9 - Completion, wisdom, hermitage',
    description: 'The Hermit represents the inward journey, solitude, and the search for deeper truth. He carries the lantern of wisdom gained through introspection.'
  },
  'Wheel of Fortune': {
    keywords: ['change', 'cycles', 'fate', 'turning point', 'luck', 'destiny'],
    uprightMeaning: 'Good luck, karma, life cycles, destiny, turning point, upward movement in fortune.',
    reversedMeaning: 'Bad luck, resistance to change, breaking cycles, external forces, setbacks.',
    element: 'Fire',
    astrology: 'Jupiter',
    numerology: '10 - Completion of cycle, new beginning',
    description: 'The Wheel of Fortune represents the ever-turning cycles of life, fate, and karma. It reminds us that change is the only constant and fortune is always in motion.'
  },
  'Justice': {
    keywords: ['justice', 'fairness', 'truth', 'cause and effect', 'law', 'accountability'],
    uprightMeaning: 'Justice, fairness, truth, cause and effect, law, accountability for actions.',
    reversedMeaning: 'Unfairness, lack of accountability, dishonesty, bias, avoiding consequences.',
    element: 'Air',
    astrology: 'Libra',
    numerology: '11 - Master number, balance, enlightenment',
    description: 'Justice represents fairness, truth, and the law of cause and effect. This card reminds us that actions have consequences and balance must be maintained.'
  },
  'The Hanged Man': {
    keywords: ['pause', 'surrender', 'letting go', 'new perspective', 'sacrifice'],
    uprightMeaning: 'Pause, surrender, letting go, new perspectives, sacrifice for greater good.',
    reversedMeaning: 'Delays, resistance, stalling, indecision, missed opportunities.',
    element: 'Water',
    astrology: 'Neptune',
    numerology: '12 - Sacrifice, suspension, enlightenment through surrender',
    description: 'The Hanged Man represents voluntary suspension, letting go, and seeing things from a completely new angle. Sometimes we must pause to gain true understanding.'
  },
  'Death': {
    keywords: ['endings', 'transformation', 'transition', 'letting go', 'renewal', 'change'],
    uprightMeaning: 'Endings, transformation, transition, letting go of the old to make way for the new.',
    reversedMeaning: 'Resistance to change, holding on, stagnation, decay, fear of change.',
    element: 'Water',
    astrology: 'Scorpio',
    numerology: '13 - Transformation, death and rebirth',
    description: 'Death represents transformation and the natural cycle of endings and beginnings. It clears away the old to make space for new growth and transformation.'
  },
  'Temperance': {
    keywords: ['balance', 'moderation', 'patience', 'purpose', 'meaning', 'alchemy'],
    uprightMeaning: 'Balance, moderation, patience, purpose, meaning, harmonious blending of opposites.',
    reversedMeaning: 'Imbalance, excess, lack of harmony, extremes, losing your center.',
    element: 'Fire',
    astrology: 'Sagittarius',
    numerology: '14 - Alchemy, balance, synthesis',
    description: 'Temperance represents balance, moderation, and the alchemical blending of opposing forces into harmonious unity. It counsels patience and the middle path.'
  },
  'The Devil': {
    keywords: ['bondage', 'addiction', 'materialism', 'playfulness', 'shadow self', 'restriction'],
    uprightMeaning: 'Bondage, addiction, materialism, attachment, shadow self, playfulness.',
    reversedMeaning: 'Releasing limiting beliefs, exploring dark thoughts, detachment, freedom from chains.',
    element: 'Earth',
    astrology: 'Capricorn',
    numerology: '15 - Temptation, bondage, materialism',
    description: 'The Devil represents the chains we forge for ourselves through addiction, materialism, and unhealthy attachments. It also speaks to our shadow self and earthly desires.'
  },
  'The Tower': {
    keywords: ['sudden change', 'upheaval', 'chaos', 'revelation', 'awakening', 'disruption'],
    uprightMeaning: 'Sudden upheaval, broken pride, disaster, revelation, awakening, necessary destruction.',
    reversedMeaning: 'Fear of change, averting disaster, delaying the inevitable, resisting revelation.',
    element: 'Fire',
    astrology: 'Mars',
    numerology: '16 - Sudden change, destruction, awakening',
    description: 'The Tower represents sudden, dramatic change that shatters false structures. Though painful, this upheaval clears the way for truth and authentic rebuilding.'
  },
  'The Star': {
    keywords: ['hope', 'faith', 'purpose', 'renewal', 'spirituality', 'healing'],
    uprightMeaning: 'Hope, faith, purpose, renewal, spirituality, healing, serenity after the storm.',
    reversedMeaning: 'Lack of faith, despair, disconnection, discouragement, hopelessness.',
    element: 'Air',
    astrology: 'Aquarius',
    numerology: '17 - Hope, inspiration, cosmic wisdom',
    description: 'The Star represents hope, faith, and spiritual renewal. It is the calm after the storm, offering healing waters and guiding light toward our true purpose.'
  },
  'The Moon': {
    keywords: ['illusion', 'fear', 'anxiety', 'subconscious', 'intuition', 'dreams'],
    uprightMeaning: 'Illusion, fear, anxiety, subconscious, intuition, dreams, the path through darkness.',
    reversedMeaning: 'Release of fear, repressed emotion, inner confusion clearing, finding clarity.',
    element: 'Water',
    astrology: 'Pisces',
    numerology: '18 - Illusion, deception, hidden truths',
    description: 'The Moon represents the realm of illusion, dreams, and the subconscious. It illuminates the path through fear and uncertainty with intuitive moonlight.'
  },
  'The Sun': {
    keywords: ['joy', 'success', 'celebration', 'positivity', 'vitality', 'clarity'],
    uprightMeaning: 'Joy, success, celebration, positivity, vitality, warmth, pure and simple happiness.',
    reversedMeaning: 'Inner child, feeling down, overly optimistic, clouded vision, temporary setbacks.',
    element: 'Fire',
    astrology: 'Sun',
    numerology: '19 - Joy, success, vitality',
    description: 'The Sun represents pure joy, success, and vital energy. It is uncomplicated happiness, warmth, and the radiant light of consciousness.'
  },
  'Judgement': {
    keywords: ['judgement', 'rebirth', 'inner calling', 'absolution', 'awakening', 'renewal'],
    uprightMeaning: 'Judgement, rebirth, inner calling, absolution, reckoning, awakening to higher purpose.',
    reversedMeaning: 'Self-doubt, inner critic, ignoring the call, lack of self-awareness.',
    element: 'Fire',
    astrology: 'Pluto',
    numerology: '20 - Rebirth, inner calling, redemption',
    description: 'Judgement represents spiritual awakening, rebirth, and answering a higher calling. It is the moment of reckoning when we rise renewed and transformed.'
  },
  'The World': {
    keywords: ['completion', 'integration', 'accomplishment', 'travel', 'fulfillment', 'wholeness'],
    uprightMeaning: 'Completion, integration, accomplishment, travel, fulfillment, the journey comes full circle.',
    reversedMeaning: 'Incompletion, lack of closure, seeking personal closure, short-cuts.',
    element: 'Earth',
    astrology: 'Saturn',
    numerology: '21 - Completion, wholeness, cosmic consciousness',
    description: 'The World represents completion, wholeness, and the fulfillment of a journey. It is cosmic consciousness and the integration of all that has been learned.'
  }
};

export interface MinorArcanaMetadata {
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  description: string;
}

export const MINOR_ARCANA_METADATA: Record<string, Record<string, MinorArcanaMetadata>> = {
  cups: {
    'Ace': {
      keywords: ['love', 'new feelings', 'emotional awakening', 'creativity', 'intuition'],
      uprightMeaning: 'New love, new feelings, emotional awakening, creative inspiration, overflowing emotions.',
      reversedMeaning: 'Emotional loss, blocked creativity, emptiness, emotional instability.',
      description: 'The Ace of Cups represents new emotional beginnings and the overflow of love and compassion.'
    },
    'Two': {
      keywords: ['partnership', 'unity', 'attraction', 'connection', 'mutual respect'],
      uprightMeaning: 'Unified love, partnership, mutual attraction, deep connection, harmony in relationships.',
      reversedMeaning: 'Imbalance, broken communication, tension, disharmony in partnership.',
      description: 'The Two of Cups represents partnership, mutual attraction, and harmonious connections.'
    },
    'Three': {
      keywords: ['celebration', 'friendship', 'creativity', 'collaboration', 'joy'],
      uprightMeaning: 'Celebration, friendship, creativity, collaboration, social gatherings bringing joy.',
      reversedMeaning: 'Independence, alone time, overindulgence, excess, isolation.',
      description: 'The Three of Cups represents joyful celebration, friendship, and creative collaboration.'
    },
    'Four': {
      keywords: ['apathy', 'contemplation', 'reevaluation', 'meditation', 'boredom'],
      uprightMeaning: 'Apathy, contemplation, reevaluation, meditation, disconnection from present offerings.',
      reversedMeaning: 'Sudden awareness, choosing happiness, acceptance, new perspectives.',
      description: 'The Four of Cups represents contemplation and reevaluation of emotional offerings.'
    },
    'Five': {
      keywords: ['loss', 'grief', 'regret', 'disappointment', 'focusing on negative'],
      uprightMeaning: 'Loss, grief, regret, disappointment, focusing on what went wrong.',
      reversedMeaning: 'Moving on, acceptance, forgiveness, finding peace after loss.',
      description: 'The Five of Cups represents loss, grief, and the process of emotional healing.'
    },
    'Six': {
      keywords: ['nostalgia', 'childhood memories', 'innocence', 'joy', 'reunion'],
      uprightMeaning: 'Nostalgia, childhood memories, innocence, joy from the past, reunion.',
      reversedMeaning: 'Living in the past, stuck in memories, clinging to childhood, unrealistic views.',
      description: 'The Six of Cups represents nostalgia, innocence, and sweet memories from the past.'
    },
    'Seven': {
      keywords: ['choices', 'illusion', 'fantasy', 'wishful thinking', 'imagination'],
      uprightMeaning: 'Choices, illusion, fantasy, wishful thinking, too many options causing confusion.',
      reversedMeaning: 'Clarity, making decisions, alignment, focusing on what matters.',
      description: 'The Seven of Cups represents choices, fantasies, and illusions that may cloud judgment.'
    },
    'Eight': {
      keywords: ['walking away', 'disillusionment', 'leaving behind', 'seeking truth'],
      uprightMeaning: 'Walking away, disillusionment, leaving behind what no longer serves, seeking deeper meaning.',
      reversedMeaning: 'Fear of change, staying in bad situations, avoiding necessary endings.',
      description: 'The Eight of Cups represents leaving behind what no longer fulfills to seek deeper truth.'
    },
    'Nine': {
      keywords: ['contentment', 'satisfaction', 'gratitude', 'wish fulfillment', 'emotional stability'],
      uprightMeaning: 'Contentment, satisfaction, gratitude, emotional fulfillment, wishes coming true.',
      reversedMeaning: 'Dissatisfaction, greed, materialism, lack of inner joy despite outer success.',
      description: 'The Nine of Cups represents contentment, satisfaction, and emotional fulfillment.'
    },
    'Ten': {
      keywords: ['harmony', 'happy family', 'emotional fulfillment', 'divine love', 'bliss'],
      uprightMeaning: 'Harmony, happy family, emotional fulfillment, divine love, lasting happiness.',
      reversedMeaning: 'Broken relationships, family conflict, disconnection, disharmony at home.',
      description: 'The Ten of Cups represents ultimate emotional fulfillment and harmonious family life.'
    },
    'Page': {
      keywords: ['creative opportunities', 'intuitive messages', 'curiosity', 'new emotions'],
      uprightMeaning: 'Creative opportunities, intuitive messages, curiosity, childlike wonder with emotions.',
      reversedMeaning: 'Emotional immaturity, creative blocks, bad news, unrealistic expectations.',
      description: 'The Page of Cups represents youthful emotional energy and creative opportunities.'
    },
    'Knight': {
      keywords: ['romance', 'charm', 'imagination', 'beauty', 'emotional idealism'],
      uprightMeaning: 'Romance, charm, imagination, beauty, following the heart, emotional idealism.',
      reversedMeaning: 'Moodiness, unrealistic expectations, jealousy, overactive imagination.',
      description: 'The Knight of Cups represents romantic idealism and following the heart.'
    },
    'Queen': {
      keywords: ['compassion', 'calm', 'comfort', 'emotional security', 'intuitive'],
      uprightMeaning: 'Compassion, calm, comfort, emotional security, intuitive and nurturing energy.',
      reversedMeaning: 'Inner feelings, self-care, insecurity, emotional dependence.',
      description: 'The Queen of Cups represents compassionate, nurturing, and intuitive emotional mastery.'
    },
    'King': {
      keywords: ['emotional balance', 'control', 'generosity', 'diplomatic', 'calm'],
      uprightMeaning: 'Emotional balance and control, generosity, diplomatic, calm in emotional situations.',
      reversedMeaning: 'Emotional manipulation, moodiness, volatility, self-compassion needed.',
      description: 'The King of Cups represents emotional maturity, balance, and compassionate leadership.'
    }
  },
  wands: {
    'Ace': {
      keywords: ['inspiration', 'new opportunities', 'growth', 'potential', 'creative spark'],
      uprightMeaning: 'Inspiration, new opportunities, growth, potential, creative spark igniting action.',
      reversedMeaning: 'Lack of energy, delays, creative blocks, missed opportunities.',
      description: 'The Ace of Wands represents inspiration, new creative ventures, and the spark of potential.'
    },
    'Two': {
      keywords: ['planning', 'decisions', 'discovery', 'personal power', 'bold moves'],
      uprightMeaning: 'Planning, making decisions, discovery, personal power, bold moves forward.',
      reversedMeaning: 'Fear of unknown, lack of planning, poor decisions, staying in comfort zone.',
      description: 'The Two of Wands represents planning, personal power, and making bold decisions.'
    },
    'Three': {
      keywords: ['expansion', 'foresight', 'leadership', 'progress', 'enterprise'],
      uprightMeaning: 'Expansion, foresight, overseas opportunities, leadership, forward planning.',
      reversedMeaning: 'Lack of foresight, delays, obstacles, frustration with progress.',
      description: 'The Three of Wands represents expansion, foresight, and enterprise.'
    },
    'Four': {
      keywords: ['celebration', 'harmony', 'marriage', 'home', 'community'],
      uprightMeaning: 'Celebration, harmony, marriage, home, community, joyful milestones.',
      reversedMeaning: 'Lack of harmony, cancelled celebrations, instability at home.',
      description: 'The Four of Wands represents celebration, harmony, and joyful community.'
    },
    'Five': {
      keywords: ['conflict', 'competition', 'tension', 'diversity', 'disagreement'],
      uprightMeaning: 'Conflict, competition, tension, diversity of opinion, disagreement.',
      reversedMeaning: 'Avoiding conflict, respecting differences, inner conflict resolved.',
      description: 'The Five of Wands represents conflict, competition, and diverse viewpoints clashing.'
    },
    'Six': {
      keywords: ['victory', 'success', 'public recognition', 'progress', 'self-confidence'],
      uprightMeaning: 'Victory, success, public recognition, progress, self-confidence.',
      reversedMeaning: 'Lack of recognition, no confidence, fall from grace, egotism.',
      description: 'The Six of Wands represents victory, public recognition, and confident success.'
    },
    'Seven': {
      keywords: ['challenge', 'competition', 'perseverance', 'standing ground', 'defense'],
      uprightMeaning: 'Challenge, competition, perseverance, standing your ground, defending position.',
      reversedMeaning: 'Exhaustion, giving up, overwhelmed, confrontation avoidance.',
      description: 'The Seven of Wands represents perseverance, defending your position against challenges.'
    },
    'Eight': {
      keywords: ['speed', 'action', 'air travel', 'movement', 'swift change'],
      uprightMeaning: 'Speed, action, air travel, rapid movement, swift change and progress.',
      reversedMeaning: 'Delays, frustration, resisting change, slowness, losing momentum.',
      description: 'The Eight of Wands represents rapid action, swift movement, and dynamic change.'
    },
    'Nine': {
      keywords: ['resilience', 'courage', 'persistence', 'boundaries', 'defensive'],
      uprightMeaning: 'Resilience, courage, persistence, test of faith, boundaries.',
      reversedMeaning: 'Exhaustion, fatigue, questioning motivations, paranoia.',
      description: 'The Nine of Wands represents resilience, courage, and persistent defense.'
    },
    'Ten': {
      keywords: ['burden', 'responsibility', 'hard work', 'stress', 'achievement'],
      uprightMeaning: 'Burden, responsibility, hard work, stress, achievement with heavy cost.',
      reversedMeaning: 'Inability to delegate, burnout, collapse under pressure.',
      description: 'The Ten of Wands represents heavy burdens, responsibility, and achievement through struggle.'
    },
    'Page': {
      keywords: ['inspiration', 'ideas', 'discovery', 'free spirit', 'enthusiasm'],
      uprightMeaning: 'Inspiration, ideas, discovery, limitless potential, free spirit.',
      reversedMeaning: 'Lack of direction, procrastination, creative blocks, bad news.',
      description: 'The Page of Wands represents youthful enthusiasm, inspiration, and discovery.'
    },
    'Knight': {
      keywords: ['energy', 'passion', 'adventure', 'impulsiveness', 'action'],
      uprightMeaning: 'Energy, passion, adventure, impulsiveness, taking action fearlessly.',
      reversedMeaning: 'Recklessness, haste, frustration, delays, arrogance.',
      description: 'The Knight of Wands represents passionate energy, adventure, and impulsive action.'
    },
    'Queen': {
      keywords: ['courage', 'confidence', 'independence', 'social butterfly', 'determination'],
      uprightMeaning: 'Courage, confidence, independence, social butterfly, determination.',
      reversedMeaning: 'Selfish, demanding, intolerant, jealous, low confidence.',
      description: 'The Queen of Wands represents courageous, confident, and independently creative energy.'
    },
    'King': {
      keywords: ['natural leader', 'vision', 'entrepreneur', 'honor', 'boldness'],
      uprightMeaning: 'Natural leader, vision, entrepreneur, honor, boldness.',
      reversedMeaning: 'Impulsive, overbearing, unachievable expectations, aggressive.',
      description: 'The King of Wands represents visionary leadership, entrepreneurial spirit, and bold action.'
    }
  },
  swords: {
    'Ace': {
      keywords: ['breakthrough', 'clarity', 'sharp mind', 'success', 'truth'],
      uprightMeaning: 'Breakthrough, clarity, sharp mind, success, truth cutting through confusion.',
      reversedMeaning: 'Confusion, brutality, chaos, lack of clarity, clouded judgment.',
      description: 'The Ace of Swords represents breakthrough, mental clarity, and the power of truth.'
    },
    'Two': {
      keywords: ['difficult decisions', 'stalemate', 'avoidance', 'denial', 'choices'],
      uprightMeaning: 'Difficult decisions, weighing options, stalemate, avoidance, tough choices.',
      reversedMeaning: 'Indecision, confusion, information overload, lies, deception.',
      description: 'The Two of Swords represents difficult decisions and the need to face difficult truths.'
    },
    'Three': {
      keywords: ['heartbreak', 'suffering', 'grief', 'pain', 'emotional release'],
      uprightMeaning: 'Heartbreak, suffering, grief, pain, emotional hurt and release.',
      reversedMeaning: 'Recovery from heartbreak, forgiveness, moving on, releasing pain.',
      description: 'The Three of Swords represents heartbreak, grief, and necessary emotional pain.'
    },
    'Four': {
      keywords: ['rest', 'restoration', 'contemplation', 'recovery', 'passivity'],
      uprightMeaning: 'Rest, restoration, contemplation, recuperation, passive recovery.',
      reversedMeaning: 'Restlessness, burnout, stress, lack of progress, stagnation.',
      description: 'The Four of Swords represents rest, restoration, and necessary recuperation.'
    },
    'Five': {
      keywords: ['conflict', 'defeat', 'loss', 'winning at all costs', 'tension'],
      uprightMeaning: 'Conflict, tension, loss, defeat, win/lose mentality, discord.',
      reversedMeaning: 'Resolution, moving on, past resentment, open to change.',
      description: 'The Five of Swords represents conflict, tension, and the cost of victory.'
    },
    'Six': {
      keywords: ['transition', 'change', 'rite of passage', 'moving on', 'travel'],
      uprightMeaning: 'Transition, change, rite of passage, releasing baggage, moving on.',
      reversedMeaning: 'Resistance to change, unfinished business, unable to move on.',
      description: 'The Six of Swords represents transition, moving on, and necessary change.'
    },
    'Seven': {
      keywords: ['deception', 'betrayal', 'getting away with something', 'stealth'],
      uprightMeaning: 'Deception, betrayal, getting away with something, acting strategically.',
      reversedMeaning: 'Coming clean, rethinking approach, facing consequences.',
      description: 'The Seven of Swords represents deception, strategy, and tactical thinking.'
    },
    'Eight': {
      keywords: ['imprisonment', 'restriction', 'victim mentality', 'powerlessness'],
      uprightMeaning: 'Imprisonment, restriction, self-imposed limitation, victim mentality.',
      reversedMeaning: 'Freedom, release, taking control, escape, new perspective.',
      description: 'The Eight of Swords represents restriction, self-imposed limitations, and trapped thinking.'
    },
    'Nine': {
      keywords: ['anxiety', 'worry', 'nightmares', 'fear', 'mental anguish'],
      uprightMeaning: 'Anxiety, worry, fear, nightmares, negative thoughts, mental anguish.',
      reversedMeaning: 'Hope, reaching out, recovery from depression, facing fears.',
      description: 'The Nine of Swords represents anxiety, worry, and mental anguish.'
    },
    'Ten': {
      keywords: ['painful ending', 'betrayal', 'loss', 'crisis', 'rock bottom'],
      uprightMeaning: 'Painful ending, deep wounds, betrayal, loss, crisis, rock bottom.',
      reversedMeaning: 'Recovery, regeneration, fear of ruin, inevitable end avoided.',
      description: 'The Ten of Swords represents painful endings, betrayal, and hitting rock bottom.'
    },
    'Page': {
      keywords: ['curiosity', 'restlessness', 'mental energy', 'vigilance', 'new ideas'],
      uprightMeaning: 'Curiosity, restlessness, mental energy, vigilance, new ideas.',
      reversedMeaning: 'Deception, manipulation, all talk no action, lack of planning.',
      description: 'The Page of Swords represents curious mental energy and vigilant awareness.'
    },
    'Knight': {
      keywords: ['action', 'impulsiveness', 'defending beliefs', 'rush', 'aggression'],
      uprightMeaning: 'Action, impulsiveness, defending beliefs, charging ahead, assertive.',
      reversedMeaning: 'No direction, disregard for consequences, impulsive, unfocused.',
      description: 'The Knight of Swords represents swift action, impulsive energy, and assertive pursuit.'
    },
    'Queen': {
      keywords: ['independent', 'unbiased judgement', 'clear boundaries', 'direct communication'],
      uprightMeaning: 'Independent, unbiased judgement, clear boundaries, direct communication.',
      reversedMeaning: 'Overly emotional, easily influenced, harsh, bitter, cold.',
      description: 'The Queen of Swords represents independent thinking, clear judgment, and direct truth.'
    },
    'King': {
      keywords: ['mental clarity', 'intellectual power', 'truth', 'authority', 'discipline'],
      uprightMeaning: 'Mental clarity, intellectual power, authority, truth, discipline.',
      reversedMeaning: 'Manipulative, cruel, weakness, tyranny, abusive power.',
      description: 'The King of Swords represents intellectual power, clear authority, and disciplined truth.'
    }
  },
  pentacles: {
    'Ace': {
      keywords: ['opportunity', 'prosperity', 'new venture', 'manifestation', 'abundance'],
      uprightMeaning: 'Opportunity, prosperity, new venture, manifestation, abundance, material gain.',
      reversedMeaning: 'Lost opportunity, missed chance, lack of planning, poor financial decisions.',
      description: 'The Ace of Pentacles represents new financial opportunities and material manifestation.'
    },
    'Two': {
      keywords: ['balance', 'adaptability', 'time management', 'prioritization', 'juggling'],
      uprightMeaning: 'Balance, adaptability, time management, prioritization, juggling resources.',
      reversedMeaning: 'Imbalance, disorganization, overwhelmed, dropped balls, poor planning.',
      description: 'The Two of Pentacles represents balance, adaptability, and managing multiple priorities.'
    },
    'Three': {
      keywords: ['teamwork', 'collaboration', 'learning', 'implementation', 'skill building'],
      uprightMeaning: 'Teamwork, collaboration, learning, implementation, building skills.',
      reversedMeaning: 'Lack of teamwork, poor quality work, lack of commitment, incompetence.',
      description: 'The Three of Pentacles represents collaboration, craftsmanship, and skill development.'
    },
    'Four': {
      keywords: ['saving', 'security', 'conservatism', 'hoarding', 'control'],
      uprightMeaning: 'Saving money, security, conservatism, scarcity, control over finances.',
      reversedMeaning: 'Greed, materialism, self-protection, financial insecurity.',
      description: 'The Four of Pentacles represents financial security, control, and conservation of resources.'
    },
    'Five': {
      keywords: ['financial loss', 'poverty', 'insecurity', 'worry', 'isolation'],
      uprightMeaning: 'Financial loss, poverty, lack mindset, insecurity, worry, isolation.',
      reversedMeaning: 'Recovery from loss, spiritual poverty, positive changes coming.',
      description: 'The Five of Pentacles represents financial hardship, insecurity, and material struggle.'
    },
    'Six': {
      keywords: ['generosity', 'charity', 'sharing wealth', 'giving', 'receiving help'],
      uprightMeaning: 'Generosity, charity, giving and receiving, sharing wealth, community support.',
      reversedMeaning: 'Strings attached, inequality, debt, selfishness, power and domination.',
      description: 'The Six of Pentacles represents generosity, charity, and balanced giving and receiving.'
    },
    'Seven': {
      keywords: ['long-term view', 'perseverance', 'investment', 'effort', 'patience'],
      uprightMeaning: 'Long-term view, perseverance, investment, sustainable results, patience.',
      reversedMeaning: 'Lack of long-term vision, limited success, impatience, poor investment.',
      description: 'The Seven of Pentacles represents long-term investment, perseverance, and patience.'
    },
    'Eight': {
      keywords: ['apprenticeship', 'skill development', 'quality', 'mastery', 'attention to detail'],
      uprightMeaning: 'Apprenticeship, skill development, attention to detail, mastery, quality work.',
      reversedMeaning: 'Lack of focus, poor quality, lack of motivation, dead-end job.',
      description: 'The Eight of Pentacles represents dedication to craft, skill mastery, and quality work.'
    },
    'Nine': {
      keywords: ['abundance', 'luxury', 'self-sufficiency', 'financial independence', 'comfort'],
      uprightMeaning: 'Abundance, luxury, self-sufficiency, financial independence, comfort.',
      reversedMeaning: 'Self-worth, overinvestment in work, hustling, materialism.',
      description: 'The Nine of Pentacles represents financial independence, luxury, and self-sufficiency.'
    },
    'Ten': {
      keywords: ['wealth', 'financial security', 'family', 'legacy', 'long-term success'],
      uprightMeaning: 'Wealth, financial security, family, long-term success, contribution, legacy.',
      reversedMeaning: 'Financial failure, loneliness, loss of stability, financial loss.',
      description: 'The Ten of Pentacles represents wealth, family legacy, and long-term financial security.'
    },
    'Page': {
      keywords: ['manifestation', 'financial opportunity', 'new venture', 'learning', 'ambition'],
      uprightMeaning: 'Manifestation, financial opportunity, skill development, manifestation of goals.',
      reversedMeaning: 'Lack of progress, procrastination, bad news financially, lack of focus.',
      description: 'The Page of Pentacles represents new financial opportunities and practical learning.'
    },
    'Knight': {
      keywords: ['efficiency', 'routine', 'conservatism', 'methodical', 'hard work'],
      uprightMeaning: 'Efficiency, hard work, responsibility, routine, conservatism, methodical approach.',
      reversedMeaning: 'Laziness, obsessiveness, work without reward, boredom, feeling stuck.',
      description: 'The Knight of Pentacles represents methodical work, efficiency, and steady progress.'
    },
    'Queen': {
      keywords: ['nurturing', 'practical', 'providing', 'down-to-earth', 'working parent'],
      uprightMeaning: 'Practical, providing financially, down-to-earth, working parent, security.',
      reversedMeaning: 'Financial independence, self-care, work-home imbalance, smothering.',
      description: 'The Queen of Pentacles represents practical nurturing, financial security, and grounded wisdom.'
    },
    'King': {
      keywords: ['wealth', 'business', 'leadership', 'security', 'discipline', 'abundance'],
      uprightMeaning: 'Wealth, business success, leadership, security, discipline, abundance.',
      reversedMeaning: 'Greed, materialism, wasteful, chauvinism, poor financial decisions.',
      description: 'The King of Pentacles represents financial mastery, business success, and material abundance.'
    }
  }
};
