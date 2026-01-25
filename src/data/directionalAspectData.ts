import { DirectionalAspectInterpretation, RelationshipContext } from '../types/directionalAspects';

export const directionalAspectDatabase: DirectionalAspectInterpretation[] = [
  {
    aspectKey: "venus_conjunct_saturn",
    personARole: "Venus Person",
    personBRole: "Saturn Person",
    
    personAExperience: {
      romance: "You feel loving, warm, and want to express affection freely. However, you may feel held back, criticized, or that they're emotionally distant. You might feel your gestures aren't appreciated or that you're 'too much' for them. You crave their approval but fear you'll never be good enough.",
      friendship: "You want to show appreciation and bring joy to the friendship, but they seem reserved or formal. You bring the lightness and warmth they need, even if they don't always show it. You may feel like you're doing all the emotional labor.",
      business: "You bring aesthetic vision, people skills, and client relationships. You may feel they're too rigid, conservative, or critical of your creative ideas. You value harmony and beauty; they value structure and practicality. You want to say yes; they always say 'but what about...'",
      creative: "Your creative expression feels restricted by their practical concerns. You want beauty, flow, and artistic freedom; they want discipline, mastery, and measurable results. You're the visionary; they're the editor who makes you better (even when it's frustrating).",
      family: "You want to create harmony and show love, but they seem emotionally unavailable or overly responsible. You're the softness in the relationship, bringing affection when they bring structure. You may feel rejected or that love must be earned through achievement."
    },
    
    personBExperience: {
      romance: "You feel cautious, responsible, and perhaps unworthy of their love. Their affection may feel overwhelming, or you fear disappointing them. You want commitment and seriousness; they seem frivolous or naive. You're the reality check, often feeling like the 'bad guy' for being practical. Deep down, you fear being vulnerable.",
      friendship: "You're the mature, responsible friend who provides stability. You may come across as a buzzkill, but you're protecting them from poor choices. You teach boundaries and self-respect. You want to trust them, but trust must be earned in your world.",
      business: "You bring structure, long-term planning, quality control, and sustainability. You may seem negative or controlling, but you're ensuring excellence and viability. You're the CFO to their Chief Creative Officer. You prevent disasters they don't see coming.",
      creative: "You're the critic, the editor, the one asking 'but is it practical? Will it work?' You teach them craftsmanship, mastery, and that real art requires discipline. You're not trying to kill their joy—you're trying to make them great. But yes, you do kill their joy sometimes.",
      family: "You're the authority figure, the responsible one, possibly the 'parent energy' regardless of actual role. You create stability and structure but may seem cold or demanding. You carry the weight of responsibility, often feeling it's thankless work. You want to soften but don't know how without losing control."
    },
    
    mutualWork: "Both learning that love needs freedom AND commitment, warmth AND boundaries. Venus person must develop self-worth independent of approval. Saturn person must risk vulnerability and soften their defenses. This aspect matures into deep, lasting love if both do the inner work.",
    
    intensityLevel: 8,
    growthPotential: 9,
    challengeLevel: 8,
    
    evolutionTimeline: {
      romance: {
        year1_3: "Venus person feels increasingly restricted and may become needy or resentful. Saturn person feels pressured and may withdraw further, creating a painful push-pull dynamic.",
        year4_7: "If both are committed to growth, Saturn person begins to soften and trust. Venus person develops genuine self-worth. The relationship stabilizes as both mature into their roles.",
        year7_plus: "Can become profoundly stable, mature love. Venus brings joy and beauty to Saturn's structure. Saturn provides the container for Venus's love to deepen. Both feel safe enough to be fully themselves."
      },
      friendship: {
        year1_3: "Venus feels like they're always initiating warmth while Saturn holds back. The friendship may feel one-sided or formal. Trust builds slowly.",
        year4_7: "Saturn begins to rely on Venus's warmth and shows appreciation in their own reserved way. Venus learns to appreciate Saturn's quiet loyalty.",
        year7_plus: "Deep, reliable friendship. Saturn is the rock Venus can always count on. Venus brings joy and lightness to Saturn's serious world. Lifelong bond."
      },
      business: {
        year1_3: "Tension between creative vision and practical constraints. Venus feels stifled; Saturn feels like they're doing all the responsible work.",
        year4_7: "If they survive, they learn their complementary strengths. Venus handles clients and aesthetics; Saturn handles operations and finances.",
        year7_plus: "Highly successful partnership. Venus's creativity is grounded by Saturn's structure. Both respect what the other brings. Built to last."
      },
      creative: {
        year1_3: "Friction between artistic freedom and discipline. Venus feels criticized; Saturn feels their standards aren't appreciated.",
        year4_7: "Venus learns that Saturn's feedback makes the work better. Saturn learns to deliver criticism constructively.",
        year7_plus: "Master-level collaboration. Venus's beauty meets Saturn's craftsmanship. The work has both inspiration and excellence."
      },
      family: {
        childhood: "Venus child feels they can never earn Saturn parent's approval. Love feels conditional on achievement. Saturn parent feels responsible but struggles to show warmth. Emotional distance despite good intentions.",
        adolescence: "Venus pushes for emotional connection; Saturn responds with more rules or withdrawal. Conflict over 'being responsible' vs. 'being loving.' Venus may rebel or become a people-pleaser to earn love.",
        adulthood: "If both have done the work, Saturn learns to express love directly and Venus develops self-worth independent of parental approval. Can become a deeply respectful, mature relationship. If not, emotional distance persists."
      }
    }
  },
  
  {
    aspectKey: "venus_square_saturn",
    personARole: "Venus Person",
    personBRole: "Saturn Person",
    
    personAExperience: {
      romance: "You feel blocked, rejected, or like your love is never enough. They seem critical, cold, or unavailable at key moments. You may feel you're auditioning for love rather than receiving it freely. Timing feels off—when you're open, they're closed. You question your worthiness constantly in this dynamic.",
      friendship: "You want closeness but feel kept at arm's length. They create rules and boundaries that feel restrictive. You bring warmth; they bring walls. You wonder if they actually like you or just tolerate you.",
      business: "Your creative ideas get shot down or heavily criticized. They seem to block your initiatives with 'practical concerns.' You feel stifled, undervalued, or that beauty and relationships don't matter in their world of spreadsheets and timelines.",
      creative: "Every creative impulse meets resistance. You want to experiment; they demand proven methods. The friction can sharpen your work OR kill your inspiration—depends on how it's handled. You may need to work alone more than together.",
      family: "You experience conditional love—affection only when you meet their standards. You may never feel good enough. Their criticism (even when 'constructive') cuts deep. You long for acceptance but prepare for judgment."
    },
    
    personBExperience: {
      romance: "You feel guilty for not being more affectionate, but vulnerability terrifies you. You fear being hurt or taken advantage of if you let your guard down. You nitpick because if you can find flaws first, you won't be blindsided. You want to love them but don't trust it's safe.",
      friendship: "You maintain boundaries they experience as walls. You need space and independence; they need connection. You're protecting yourself from disappointment, but they experience it as rejection. You wish you could relax but don't know how.",
      business: "You're trying to prevent failure by managing risk, but they experience it as killing their vision. You see the problems they don't, and someone has to be the adult in the room. You're exhausted from being the 'no' person but don't trust them to be responsible.",
      creative: "You're the quality control, the voice of mastery saying 'not good enough yet.' You genuinely want to help them improve, but your criticism lands harder than intended. You fear their work (and by extension, you) will be judged as mediocre.",
      family: "You're repeating patterns from your own childhood—probably experienced criticism yourself and now perpetuate it. You want to provide structure and teach responsibility, but it comes out as coldness or impossible standards. You're afraid of failure—yours and theirs."
    },
    
    mutualWork: "Square requires active effort. Both must work to meet in the middle. Venus learns self-love isn't dependent on Saturn's approval. Saturn learns to risk vulnerability without expecting rejection. This aspect can strengthen both people IF they commit to the work, but many relationships break here.",
    
    intensityLevel: 9,
    growthPotential: 7,
    challengeLevel: 9,
    
    evolutionTimeline: {
      romance: {
        year1_3: "Extremely difficult. Venus feels increasingly hurt and may become people-pleasing. Saturn becomes more critical as their fears increase. May not survive this phase without conscious work.",
        year4_7: "Either breaks or both people do serious healing work. If it survives, there's a grudging respect developing. Saturn starts to appreciate Venus's persistence. Venus starts to see Saturn's criticism as protection, not rejection.",
        year7_plus: "If still together, it's EARNED. Deep respect, mature love, and shared accomplishment. Both have grown tremendously. The square never fully disappears but becomes workable—even a source of strength."
      },
      friendship: {
        year1_3: "Venus feels rejected and may try harder or pull away. Saturn feels suffocated by Venus's need for closeness. Frequent hurt feelings and misunderstandings.",
        year4_7: "Either the friendship fades or both accept each other's different needs. If surviving: Saturn shows up when it matters; Venus stops expecting warmth Saturn can't give.",
        year7_plus: "Hard-won respect. Venus knows Saturn's loyalty runs deep despite the distance. Saturn has learned to show appreciation in small ways. Not easy, but enduring."
      },
      business: {
        year1_3: "Constant friction over approach. Venus feels micromanaged; Saturn feels ignored on risk. Power struggles over creative direction.",
        year4_7: "Make or break. Either clear role separation emerges or the partnership dissolves. If surviving: strict boundaries about who decides what.",
        year7_plus: "If survived: battle-tested partnership that's weathered real challenges. Both know their lanes. Mutual respect for what the other survived."
      },
      creative: {
        year1_3: "Venus feels creatively suffocated. Saturn's standards feel impossible. Work may be technically good but joyless.",
        year4_7: "Either Venus leaves to work with someone less critical, or they learn to use the friction productively.",
        year7_plus: "Rare creative partnership where the tension produces exceptional work. Both have learned to fight FOR the work, not against each other."
      },
      family: {
        childhood: "Venus child feels constantly criticized and never good enough. Saturn parent's love feels entirely conditional. Deep wounds around worthiness form early. Venus may develop anxiety or perfectionism.",
        adolescence: "Major conflict. Venus rebels against impossible standards or becomes a perfectionist trying to earn love. Saturn doubles down on control. The relationship is strained or breaks entirely.",
        adulthood: "Requires significant healing work from both. Venus must grieve the unconditional love they didn't receive. Saturn must acknowledge their own wounds and learn new patterns. If both do the work: respect replaces resentment. If not: estrangement or painful obligatory contact."
      }
    }
  },

  {
    aspectKey: "sun_conjunct_pluto",
    personARole: "Sun Person",
    personBRole: "Pluto Person",
    
    personAExperience: {
      romance: "You feel seen at your deepest core—and it's terrifying and exhilarating. They perceive everything you hide. You feel transformed, empowered, but also exposed and vulnerable. Your sense of self is being reconstructed. You can't hide, can't be casual, can't escape their penetrating awareness. Life-changing intensity.",
      friendship: "This is not a light friendship. They see your shadow and reflect it back. You feel stripped of pretense. They challenge you to be authentic in ways that are uncomfortable but ultimately freeing. You can't fake anything around them.",
      business: "They see your potential and your blocks. They push you toward your power, sometimes ruthlessly. You may feel controlled or manipulated OR powerfully supported—depends on their maturity. Your identity and authority are being tested and forged.",
      creative: "They catalyze your deepest creative power. Your work transforms when collaborating with them. They push you toward your authentic creative voice, not the safe one. Scary but breakthrough-inducing.",
      family: "Intense, complex dynamics. They may try to control or shape your identity. Power struggles over who you're 'supposed to be' vs. who you are. Transformation through this relationship is inevitable, for better or worse."
    },
    
    personBExperience: {
      romance: "You're magnetically drawn to their light and want to merge with it—or possess it. You see their hidden power and want to unlock it. You have X-ray vision into them, which creates intimacy but also tempts control. You must choose: empowerment or domination. This is your test.",
      friendship: "You see through their persona to their true self. You can help them transform OR become obsessed with 'fixing' them. You're the depth to their light. You have tremendous power here—use it wisely or lose them.",
      business: "You see their leadership potential and the blocks holding them back. You can be the catalyst for their success OR you can undermine them through jealousy or power plays. You control resources or information they need. Your shadow will show up here.",
      creative: "You see the depth they're not accessing. You can mine the gold in their psyche for collaborative work. You're the depth psychologist of the partnership. Don't manipulate the process or steamroll their vision with your intensity.",
      family: "You may unconsciously try to remake them in your image or control their path. You see their potential but confuse it with your projection. Your own unhealed wounds around power and control will surface. You're the transformative force—make sure it's empowerment, not domination."
    },
    
    mutualWork: "Sun must maintain identity while allowing transformation. Pluto must empower without controlling. Both learning healthy use of power. This aspect creates profound change—both people are reborn through this connection if handled consciously.",
    
    intensityLevel: 10,
    growthPotential: 10,
    challengeLevel: 9,
    
    evolutionTimeline: {
      romance: {
        year1_3: "Intense fascination and power struggles. Sun feels both empowered and controlled. Pluto is obsessed. Everything is heightened. Jealousy, possessiveness, and transformation all at once.",
        year4_7: "Crisis point: evolve or implode. Either Pluto learns to release control and Sun learns to own their power, OR the relationship becomes destructive. Major tests around control, trust, and autonomy.",
        year7_plus: "If survived consciously, becomes a profoundly transformative partnership. Both are changed forever. Deep trust, mutual empowerment, and the ability to weather any storm together. Unshakeable bond forged through crisis."
      },
      friendship: {
        year1_3: "Intensity from day one. Sun feels Pluto sees everything. Pluto is fascinated by Sun's light. The friendship goes deep fast—no superficial conversations here.",
        year4_7: "Power dynamics surface. Does Pluto empower or try to control? Does Sun accept transformation or resist? Crisis tests the friendship's foundation.",
        year7_plus: "If survived: unbreakable bond. Both have transformed through knowing each other. Pluto helped Sun own their power; Sun helped Pluto trust the light."
      },
      business: {
        year1_3: "Intense collaboration. Pluto sees Sun's potential and pushes hard. Sun feels both supported and controlled. Power dynamics are constant.",
        year4_7: "Major tests around control of the business. Who leads? Who has final say? Either clear hierarchy emerges or destructive power struggles.",
        year7_plus: "If survived: formidable partnership. Sun's leadership is empowered by Pluto's strategic depth. Pluto trusts Sun's vision. Together, unstoppable."
      },
      creative: {
        year1_3: "Intense creative chemistry. Work goes to depths Sun didn't know they could access. Pluto pushes Sun toward authentic expression.",
        year4_7: "Creative differences may become power struggles. Whose vision wins? Can both serve the work without ego battles?",
        year7_plus: "Transformative creative legacy. The work has changed both people. Deep, powerful art that couldn't have been made alone."
      },
      family: {
        childhood: "Pluto parent's intensity feels overwhelming. Child feels seen but also controlled. Power dynamics are present from earliest memories. Child may feel they can't have secrets or privacy.",
        adolescence: "Major power struggles. Child pushes for autonomy; Pluto parent struggles to release control. This is the crucible—either transformation or trauma.",
        adulthood: "If Pluto parent learned to release control, this becomes profound mutual respect. Child has individuated; parent has evolved. If not: ongoing control dynamics or estrangement."
      }
    }
  },

  {
    aspectKey: "sun_opposite_pluto",
    personARole: "Sun Person",
    personBRole: "Pluto Person",
    
    personAExperience: {
      romance: "You feel like they see straight through you—and it's both thrilling and terrifying. There's a magnetic pull, but also a sense of being consumed. You're drawn to their intensity yet may feel your identity is being challenged or threatened. Power dynamics are constant. You want their depth but fear losing yourself in it.",
      friendship: "They fascinate and unsettle you. You sense they know things about you that you don't know yourself. The friendship forces honesty—you can't maintain facades. They push you to own your power, but their intensity can feel overwhelming.",
      business: "They see your blind spots and aren't afraid to call them out. You may feel exposed or undermined, OR you recognize they're helping you grow. There's a tug-of-war over direction and control. Success requires learning to share power rather than compete for it.",
      creative: "They bring depth and intensity to your creative vision. The collaboration can be transformative but also feels like a battle for creative control. Your light meets their shadow—the fusion can be brilliant or explosive.",
      family: "Power struggles are likely. They may try to control or transform you in ways that feel threatening to your identity. Yet there's also profound potential for mutual growth if both parties respect boundaries."
    },
    
    personBExperience: {
      romance: "You're powerfully drawn to their light, their confidence, their presence. You want to merge with them—or possess them. The opposition creates magnetic attraction but also constant tension. You see their potential and want to unlock it, but must resist the urge to control or dominate.",
      friendship: "You're the intense one in this dynamic. You see through their persona and may feel compelled to 'fix' or transform them. Your depth challenges their identity. Learn to empower rather than overpower.",
      business: "You hold strategic insight they lack. The temptation is to control from behind the scenes. But the opposition means your power plays will be noticed and resisted. True success comes from transparent collaboration.",
      creative: "You bring psychological depth and transformative vision. But the opposition means your intensity can overpower their contribution. Balance is key—let their light shine while you provide the shadow and depth.",
      family: "You may unconsciously try to remake them. The opposition creates push-pull dynamics around control and identity. Your transformative energy can heal or wound—intention and awareness determine the outcome."
    },
    
    mutualWork: "The opposition demands balance between identity (Sun) and transformation (Pluto). Sun must allow change without losing core self. Pluto must empower without controlling. This aspect creates powerful attraction AND powerful conflict—conscious work is essential for survival.",
    
    intensityLevel: 10,
    growthPotential: 9,
    challengeLevel: 10,
    
    evolutionTimeline: {
      romance: {
        year1_3: "Intense attraction and equally intense power struggles. The magnetic pull is undeniable but so are the conflicts. Both feel simultaneously drawn together and pushed apart. Crisis moments test whether the connection can survive.",
        year4_7: "Make or break period. Either both learn to balance power and respect autonomy, OR the relationship becomes a destructive cycle of control and rebellion. If surviving: deep mutual transformation is underway.",
        year7_plus: "If both have done the work, this becomes an unshakeable bond. You've weathered the storms and emerged transformed. Mutual empowerment replaces power struggles. If not, the pattern of control and resistance continues."
      },
      friendship: {
        year1_3: "Magnetic but volatile. Sun is drawn to Pluto's depth; Pluto to Sun's light. Power dynamics surface quickly. Not a casual friendship.",
        year4_7: "Either learned to balance the intensity or it became too much. Surviving friendships have navigated major power confrontations.",
        year7_plus: "If survived: profound, rare friendship. Both have transformed through knowing each other. Unshakeable loyalty forged through crisis."
      },
      business: {
        year1_3: "Magnetic attraction to collaborate but immediate power struggles. Who leads? Who controls resources? The opposition is felt in every decision.",
        year4_7: "Crisis around control. Either clear power-sharing emerges or the partnership explodes. If surviving: hard-won respect for each other's domain.",
        year7_plus: "Battle-tested partnership. Both know they can trust the other through crisis. Power is shared consciously. Formidable together."
      },
      creative: {
        year1_3: "Electric creative chemistry and immediate creative conflicts. Sun wants visibility; Pluto wants depth. Can you have both?",
        year4_7: "The work is either brilliant or the collaboration implodes. If surviving: you've learned to balance light and shadow in the work.",
        year7_plus: "Transformative creative legacy. The opposition that once threatened to destroy has become the source of creative power."
      },
      family: {
        childhood: "Child feels Pluto parent's intensity as overwhelming or controlling. Power dynamics are set early. Child may feel consumed or invisible depending on Pluto's awareness.",
        adolescence: "Major rebellion or power struggles. Child pushes for autonomy; parent struggles to release control. The opposition creates crisis that demands transformation.",
        adulthood: "If both have done the work, transforms into mutual respect. Parent sees child as equal; child owns their power. If not: ongoing power struggles or estrangement."
      }
    }
  },

  {
    aspectKey: "moon_conjunct_moon",
    personARole: "Person A",
    personBRole: "Person B",
    
    personAExperience: {
      romance: "You feel instantly understood emotionally. They get your moods, needs, and rhythms without explanation. Emotional safety and comfort. You're home with them. Risk: too much comfort can lead to stagnation or enabling each other's emotional patterns.",
      friendship: "Natural emotional rapport. You can be yourselves completely. Shared emotional language and similar needs for nurturing. You recharge together rather than drain each other.",
      business: "You understand each other's emotional needs in the workplace. Similar stress responses and self-care needs. Can be supportive OR too comfortable to challenge each other to grow. May avoid conflict.",
      creative: "Shared emotional inspiration. You feel and create from the same emotional palette. Beautiful collaboration but may lack contrast or tension that pushes creative boundaries.",
      family: "Deep emotional understanding and similar emotional needs. Can create beautiful harmony OR enable each other's unhealthy patterns. May mirror family-of-origin dynamics without realizing it."
    },
    
    personBExperience: {
      romance: "Same as Person A—this is a mutual, mirroring aspect. You feel met emotionally in ways you've rarely experienced. They naturally know how to comfort you. Home feeling.",
      friendship: "Same as Person A—instant emotional kinship.",
      business: "Same as Person A—emotional compatibility in work.",
      creative: "Same as Person A—shared emotional creative language.",
      family: "Same as Person A—deep emotional recognition."
    },
    
    mutualWork: "Both must avoid emotional codependency and enabling each other's patterns. Use the emotional understanding to support growth, not comfort stagnation. Challenge: too much sameness can limit growth. Benefit: unmatched emotional security.",
    
    intensityLevel: 7,
    growthPotential: 6,
    challengeLevel: 3,
    
    evolutionTimeline: {
      romance: {
        year1_3: "Blissful emotional harmony. Feels like you've known each other forever. Safe haven from the world.",
        year4_7: "Comfortable, possibly too comfortable. May need to consciously introduce challenge and growth. Risk of taking each other for granted emotionally.",
        year7_plus: "Either beautifully secure and supportive OR emotionally merged and stagnant. Need other aspects to provide growth and differentiation. At its best: lifelong emotional home base."
      },
      friendship: {
        year1_3: "Instant emotional recognition. You 'get' each other without explanation. Easy, comfortable connection.",
        year4_7: "Deep emotional intimacy and trust. May rely on each other heavily. Risk of enmeshment if no other friends provide contrast.",
        year7_plus: "Lifelong emotional support. This friend knows you at your core. Beautiful safety if not codependent."
      },
      business: {
        year1_3: "Emotionally comfortable work environment. You understand each other's stress responses and needs.",
        year4_7: "May avoid necessary conflicts. Too much emotional similarity can mean blind spots. Need outside perspectives.",
        year7_plus: "Stable, supportive work relationship. Know how to support each other through challenges. May need partners with different Moon signs for growth."
      },
      creative: {
        year1_3: "Emotional creative harmony. You feel into the work the same way. Easy collaboration.",
        year4_7: "May become predictable. The comfort zone is limiting. Need creative tension from elsewhere.",
        year7_plus: "Beautiful emotional foundation for creative work, but needs challenge from other sources to stay vital."
      },
      family: {
        childhood: "Deep emotional attunement between family members. Understanding without words. Beautiful nurturing if both are healthy. Risk of enmeshment if one has unhealthy patterns.",
        adolescence: "Continued emotional closeness. May struggle to differentiate. Need outside relationships to develop individual emotional identity.",
        adulthood: "Lifelong emotional understanding and support. Beautiful if both have individuated. Codependent if boundaries were never established."
      }
    }
  },

  {
    aspectKey: "mars_square_mars",
    personARole: "Person A",
    personBRole: "Person B",
    
    personAExperience: {
      romance: "Your desires, timing, and action styles clash. When you want to go, they want to stop. Your anger triggers theirs. Sexual rhythms may be off. Exciting friction OR constant irritation. Passionate fights and passionate makeup sex. Never boring but exhausting.",
      friendship: "Competitive energy. You may butt heads or push each other in healthy ways. Need to choose: friendly competition or ego battles. Can bring out each other's warrior spirit OR just fight.",
      business: "Conflicting approaches to action and strategy. One wants to charge ahead; the other wants a different direction. Power struggles over WHO drives the process. Can be productive tension if channeled into complementary roles (one leads sales, other leads operations).",
      creative: "Competing creative visions. Different ideas about timing, execution, and approach. Can create innovative fusion OR just conflict. Need a third party to mediate or clear role divisions.",
      family: "Aggressive energy between you. May trigger each other's anger. Similar volatility patterns that escalate when both are activated. Need conscious strategies to de-escalate. Can teach each other about healthy anger expression OR traumatize each other."
    },
    
    personBExperience: {
      romance: "Same as Person A—mutual friction. You both feel the other is 'doing it wrong.' Your instincts clash. Must learn to appreciate different approaches OR be in constant conflict.",
      friendship: "Same as Person A—competitive dynamic that's either healthy or destructive.",
      business: "Same as Person A—strategic conflicts that need role clarity.",
      creative: "Same as Person A—creative tension requiring structure.",
      family: "Same as Person A—aggressive dynamics that need management."
    },
    
    mutualWork: "Both learning to respect different action styles and timings. Mars square Mars can be incredibly productive IF both learn when to lead and when to follow. Requires ego work and communication. Channel the competitive energy into shared goals, not against each other.",
    
    intensityLevel: 8,
    growthPotential: 7,
    challengeLevel: 8,
    
    evolutionTimeline: {
      romance: {
        year1_3: "Hot and exciting OR fighting constantly. Sexual chemistry high but fights are also intense. Testing boundaries and power dynamics. May be addictive chaos.",
        year4_7: "Either learned to work with the friction (exciting, productive) OR exhausted from constant conflict. Breakup common at this stage if no progress made. If surviving: developed dance of who leads when.",
        year7_plus: "If still together, you've mastered the art of productive tension. Respect for different approaches. Still passionate but not destructive. You've learned each other's triggers and how to de-escalate. The square keeps life interesting without destroying it."
      },
      friendship: {
        year1_3: "Competitive, energetic, possibly combative. You push each other—for better or worse.",
        year4_7: "Either channeled into healthy competition (sports, games, mutual goals) or the friendship has become too exhausting.",
        year7_plus: "If survived: you've learned to be friendly rivals who push each other to be better. Mutual respect for each other's warrior spirit."
      },
      business: {
        year1_3: "Power struggles over direction and control. Different instincts about when and how to act.",
        year4_7: "Either clear role separation (different domains of control) or the partnership has dissolved in conflict.",
        year7_plus: "If survived: you've learned to leverage the tension productively. Different approaches mean better coverage. Still fiery but constructive."
      },
      creative: {
        year1_3: "Creative conflicts about direction, execution, style. Both want to lead.",
        year4_7: "Either found complementary roles or the collaboration has imploded. If surviving: the friction produces better work.",
        year7_plus: "The creative tension has become the source of innovation. You push each other beyond comfort zones."
      },
      family: {
        childhood: "Aggressive dynamics between family members. Arguments and power struggles. Both easily triggered by the other. Need conscious de-escalation strategies.",
        adolescence: "Intensified conflict as both assert independence. May feel like constant war. Need third-party mediation or physical outlets for the Mars energy.",
        adulthood: "If both learned healthy anger expression: mutual respect for each other's strength. If not: explosive gatherings or avoidance. The square never disappears but can be managed consciously."
      }
    }
  },

  {
    aspectKey: "venus_opposite_mars",
    personARole: "Venus Person",
    personBRole: "Mars Person",
    
    personAExperience: {
      romance: "Magnetic attraction with polarity. They pursue; you attract. You want romance and courtship; they want action and sex. Beautiful tension if balanced—you soften their aggression; they energize your receptivity. Risk: feeling chased/pressured or like you have to work to civilize them.",
      friendship: "You bring harmony and social grace; they bring action and initiative. Complementary IF you appreciate differences. You want to discuss; they want to DO. Can balance each other beautifully OR frustrate each other.",
      business: "You handle people, aesthetics, client relations; they handle execution, strategy, drive. Natural division of labor. You're the face; they're the force. Works if you respect each other's domains. Fails if Mars steamrolls Venus's needs or Venus blocks Mars's action.",
      creative: "You bring beauty and refinement; they bring boldness and execution. Artist (you) meets warrior (them). Can create stunning work together—you envision, they manifest. Or they're too aggressive/crude for your taste, and you're too precious/slow for theirs.",
      family: "Traditional masculine/feminine polarity (regardless of genders). One is the nurturer/harmonizer (Venus), one is the protector/doer (Mars). Can be beautifully complementary OR fall into rigid, unhealthy gender roles with resentment."
    },
    
    personBExperience: {
      romance: "You're drawn to their beauty and want to pursue/conquer. You bring the chase, the passion, the sexual initiative. You want action; they want romance. You need to learn that attraction isn't just about pursuit—it's about receptivity too. You're learning about desire versus connection.",
      friendship: "You bring energy and action; they bring harmony and social skill. You initiate; they refine. You want to compete/challenge; they want to connect. You're learning about relationship, not just achievement.",
      business: "You're the executor, the one who makes things happen. They're the one who makes it beautiful and marketable. You need them to sell what you create. You're learning that force alone doesn't build lasting success.",
      creative: "You're the bold visionary who executes fearlessly. They're the one who refines it into something people actually want. You need each other—you provide the courage; they provide the taste. You're learning about balance between force and finesse.",
      family: "You're the active, protective, doing energy. They're the harmonizing, connecting, beautifying energy. You're learning that relationships aren't battles to win but dances to share. You must lead AND follow."
    },
    
    mutualWork: "Opposition requires both people to integrate the other's energy into themselves. Venus must develop some Mars (assertion, action). Mars must develop some Venus (receptivity, harmony). This aspect creates attraction BECAUSE you see in them what you need to develop in yourself.",
    
    intensityLevel: 8,
    growthPotential: 9,
    challengeLevel: 6,
    
    evolutionTimeline: {
      romance: {
        year1_3: "Electric attraction. Opposites attract phase. Exciting, passionate, magnetic. You're fascinated by how different you are. Sexual chemistry is high.",
        year4_7: "Either learning to appreciate differences (strength phase) OR frustrated by them (conflict phase). Mars may feel rejected; Venus may feel pressured. Both learning to give what the other needs, not what they would need.",
        year7_plus: "At its best: beautifully integrated partnership where both have developed the other's qualities. Venus is more assertive; Mars is more receptive. You complete each other without losing yourselves. Lasting attraction AND deep respect."
      },
      friendship: {
        year1_3: "Dynamic friendship. Venus provides social grace; Mars provides energy and initiative. You do different things well.",
        year4_7: "Either appreciate the complementarity or tire of the differences. Venus may find Mars exhausting; Mars may find Venus passive.",
        year7_plus: "If survived: balanced friendship. Venus has learned to be more direct; Mars has learned to be more harmonious. You've integrated each other's gifts."
      },
      business: {
        year1_3: "Natural role division. Venus handles relationships and aesthetics; Mars handles execution and drive.",
        year4_7: "Either the division works beautifully or resentment builds (Mars feels Venus doesn't work hard enough; Venus feels Mars is too aggressive).",
        year7_plus: "If survived: highly effective partnership. Both have integrated the other's approach while maintaining their strengths."
      },
      creative: {
        year1_3: "Exciting creative polarity. Venus brings beauty; Mars brings boldness. The work has both refinement and courage.",
        year4_7: "Either the creative tension produces great work or the differences become irreconcilable.",
        year7_plus: "At its best: the opposition creates work that's both beautiful and powerful. You've learned to let each other lead in different phases."
      },
      family: {
        childhood: "Clear polarity in family roles. One parent/sibling is the harmonizer; the other is the doer/protector. Can model healthy complementarity or rigid gender roles.",
        adolescence: "May push against assigned roles. The opposition creates tension around 'masculine' and 'feminine' energy. Need to integrate both within each person.",
        adulthood: "If healthy: appreciation for complementary strengths. If unhealthy: resentment about who does what. Best outcome: both have integrated the other's energy while honoring their nature."
      }
    }
  },

  {
    aspectKey: "mercury_square_mercury",
    personARole: "Person A",
    personBRole: "Person B",
    
    personAExperience: {
      romance: "You think and communicate differently. What seems obvious to you, they don't get. What they think is clear, you find confusing. Frequent miscommunications and 'that's not what I meant!' moments. Can be frustrating OR stimulating if you frame it as learning different perspectives.",
      friendship: "Different communication styles and thinking processes. You may talk past each other. One processes fast (air/fire Mercury), other needs time (earth/water Mercury). One is direct, other is indirect. Requires effort to understand each other.",
      business: "Major communication challenges. Different approaches to problem-solving and decision-making. Need clear protocols, written agreements, and regular check-ins. Can lead to innovative solutions (different perspectives) OR constant misunderstandings and conflict.",
      creative: "Different creative thinking styles. Can be complementary (one sees big picture, other sees details) OR just frustrating. Need to establish clear roles and communication methods. Brainstorming together may be chaotic.",
      family: "You communicate on different wavelengths. They don't understand how you think; you don't understand how they think. Can lead to feeling dismissed or misunderstood. Requires patience and deliberate effort to bridge the gap."
    },
    
    personBExperience: {
      romance: "Same as Person A—mutual communication challenges. You both feel misunderstood. The other seems to deliberately miss your point. Requires learning to speak each other's language.",
      friendship: "Same as Person A—different wavelengths requiring effort.",
      business: "Same as Person A—systematic communication structures needed.",
      creative: "Same as Person A—complementary OR conflicting thinking styles.",
      family: "Same as Person A—feeling unheard or misunderstood."
    },
    
    mutualWork: "Both learning that different thinking styles aren't wrong, just different. Mercury square Mercury requires both people to translate for each other and value diverse perspectives. Can become a strength if both commit to understanding rather than being understood. Teaches flexibility in communication.",
    
    intensityLevel: 6,
    growthPotential: 7,
    challengeLevel: 7,
    
    evolutionTimeline: {
      romance: {
        year1_3: "Frequent miscommunications. Frustration that they 'don't get it.' Feeling unheard or like you're speaking different languages. May find it charming at first ('we're so different!') but novelty wears off.",
        year4_7: "Either developed translation skills and appreciate different perspectives OR given up trying to communicate effectively. Breakup common here due to communication breakdown. If surviving: you've created systems and learned each other's language.",
        year7_plus: "If still together, you've mastered cross-cultural communication. You can translate your thoughts into their language and vice versa. The square becomes a source of diverse perspectives that enrich decision-making. You've turned a bug into a feature."
      },
      friendship: {
        year1_3: "Miscommunications and frustrations. You talk past each other regularly.",
        year4_7: "Either learned to appreciate different thinking styles or the friendship has faded from exhaustion.",
        year7_plus: "If survived: you've learned to translate. Different perspectives enrich both of you. The square keeps conversations interesting."
      },
      business: {
        year1_3: "Communication breakdowns. Different approaches to problems. Need explicit protocols.",
        year4_7: "Either developed systems for clear communication or the partnership has dissolved. If surviving: different thinking styles are now an asset (diverse perspectives).",
        year7_plus: "The communication challenges have become a strength. You catch each other's blind spots. Clear protocols mean fewer misunderstandings."
      },
      creative: {
        year1_3: "Creative brainstorming is chaotic. Different ways of thinking about the work.",
        year4_7: "Either found complementary roles (one conceptualizes, other executes) or too frustrating to continue.",
        year7_plus: "If survived: the different thinking styles produce more innovative work. You've learned to translate between your creative languages."
      },
      family: {
        childhood: "Feeling misunderstood by this family member. Different communication wavelengths. May feel dismissed or frustrated by their thinking style.",
        adolescence: "Communication gaps widen. Different thought processes feel like deliberate misunderstanding. Need patience and explicit translation efforts.",
        adulthood: "If both have made effort: learned to communicate across difference. If not: persistent feeling of being on different wavelengths. Can improve with conscious work at any age."
      }
    }
  },

  {
    aspectKey: "jupiter_conjunct_venus",
    personARole: "Venus Person",
    personBRole: "Jupiter Person",
    
    personAExperience: {
      romance: "They make you feel cherished, expanded, and joyful. Generous affection, optimistic about the relationship. They see your beauty and worth. You feel appreciated and celebrated. Risk: overindulgence, taking each other for granted, or love without depth (all celebration, no shadow work).",
      friendship: "Joyful, generous friendship. They bring abundance and optimism into your life. Fun adventures together. They're the friend who always says yes and makes you feel valued. Risk: superficiality or enabling bad habits.",
      business: "They bring growth, opportunities, and optimism to your projects. Generous with resources and connections. You bring aesthetic value and people skills. Great partnership for expansion. Risk: overpromising, overexpanding, or spending too much.",
      creative: "They expand your creative vision and believe in your talent. Generous encouragement and opportunities. You bring beauty; they bring the audience and platform. Risk: grandiosity without skill-building.",
      family: "They're the generous, optimistic family member who sees the best in you. You feel loved and accepted. They provide abundance (emotional or material). Risk: overindulgence or avoiding difficult realities together."
    },
    
    personBExperience: {
      romance: "You see their beauty and want to shower them with love, gifts, and experiences. You feel generous and expansive around them. They make you want to be your best self. Risk: overdoing it, loving the idea of them vs. the reality, or expecting perfection.",
      friendship: "You love being generous with them and bringing joy. They make you feel optimistic and warm. You want to give them opportunities and experiences. Risk: being the 'giver' who enables dependency or expects gratitude.",
      business: "You see the value in their vision and want to expand it. You bring resources, connections, and optimism. You believe in their success. Risk: overinvesting emotionally or financially without due diligence.",
      creative: "You see their talent and want to promote it. You're the patron, the believer, the one who opens doors. Risk: projecting your own dreams onto them or being disappointed if they don't meet your vision of their potential.",
      family: "You want to provide abundance and be the generous one. You see their worth and want to celebrate them. Risk: creating dependency or giving with strings attached (subtle expectations)."
    },
    
    mutualWork: "Both learning to balance optimism with realism, generosity with boundaries, and celebration with depth. Jupiter-Venus is a blessing but needs grounding from other aspects. Without challenges, it can be superficial. Use this gift to weather harder aspects in the chart.",
    
    intensityLevel: 5,
    growthPotential: 7,
    challengeLevel: 2,
    
    evolutionTimeline: {
      romance: {
        year1_3: "Honeymoon vibes. Everything feels easy, generous, and joyful. You see the best in each other. Love and optimism are high. This is the 'falling in love' aspect.",
        year4_7: "Still positive but may have taken each other for granted. Need to consciously maintain appreciation. Risk of boredom if no challenges in the relationship—Jupiter-Venus alone doesn't create depth.",
        year7_plus: "Sustained mutual appreciation and joy IF both people continue to grow. At its best: lifelong cheerleaders for each other. At its worst: shallow happiness without real intimacy. Depends on other aspects for depth."
      },
      friendship: {
        year1_3: "Joyful, fun, generous friendship. You celebrate each other. Good times together.",
        year4_7: "Still enjoyable. May need to add depth or the friendship stays surface-level fun.",
        year7_plus: "Lifelong fun friendship with mutual appreciation. May lack depth but provides consistent joy and support."
      },
      business: {
        year1_3: "Optimistic partnership. Big visions, generous investments in each other.",
        year4_7: "Need to balance expansion with sustainability. Risk of overextending.",
        year7_plus: "If balanced: successful, growing partnership. If not balanced: may have expanded beyond capacity."
      },
      creative: {
        year1_3: "Mutual creative encouragement. Big visions, generous support.",
        year4_7: "Need to balance inspiration with craft. Risk of grandiosity without substance.",
        year7_plus: "At its best: sustained creative partnership with mutual belief in each other's talent."
      },
      family: {
        childhood: "Generous, optimistic family relationship. Feeling celebrated and valued. May lack discipline or realistic expectations.",
        adolescence: "Continued warmth and generosity. Risk of overindulgence or avoiding difficult conversations.",
        adulthood: "Warm, appreciative family bond. You celebrate each other's successes. Need other family dynamics for depth and challenge."
      }
    }
  },

  {
    aspectKey: "neptune_conjunct_venus",
    personARole: "Venus Person",
    personBRole: "Neptune Person",
    
    personAExperience: {
      romance: "They seem like your soulmate, your dream come true. Magical, spiritual, romantic beyond belief. You feel you've found divine love. WARNING: You may be in love with a fantasy, not the real person. Are you seeing them clearly or projecting your ideal? Beautiful OR devastating, depending on their integrity and your clarity.",
      friendship: "Compassionate, empathetic, spiritually connected. You feel understood at a soul level. They seem to 'get' you. Risk: boundaries dissolve, you enable each other's avoidance of reality, or one is in a fantasy about the friendship.",
      business: "DANGER: Neptune dissolves practical boundaries. Are they actually capable or just good at seeming capable? Are you seeing their potential or reality? Excellent for creative/spiritual businesses but terrible for anything requiring clarity, contracts, or accountability.",
      creative: "Inspired, transcendent creative collaboration. Shared artistic or spiritual vision. You access higher realms of creativity together. Beautiful for art, music, film, or spiritual work. Risk: lack of discipline or practical follow-through.",
      family: "Compassionate, empathetic connection. You want to save or help them (or vice versa). Risk: codependency, victim/savior dynamics, enabling addiction or avoidance. Beautiful spiritual bond OR devastating enmeshment."
    },
    
    personBExperience: {
      romance: "You see them as divine, perfect, your muse. You may idealize them OR deceive yourself about who they are. You bring spirituality, compassion, and transcendence to love. Risk: disappointment when they're human, escapism through romance, or deceiving yourself/them about reality.",
      friendship: "You feel their pain and want to help or transcend together. Compassionate but may blur boundaries. You're the empathetic friend who absorbs their emotions. Risk: losing yourself, enabling their problems, or expecting them to be your savior.",
      business: "You see their vision/potential more than reality. You may inspire them BUT also confuse them with vague ideas. You're the dreamer; they need a practical partner to balance you. Risk: promises you can't keep, lack of follow-through, or deception (even unintentional).",
      creative: "You're the channel for divine inspiration with them. Your muse. Spiritual and artistic magic happens. Risk: lack of grounding, discipline, or losing the thread in fantasy.",
      family: "You're the compassionate, spiritual one. You may take on their pain or try to save them. Risk: martyr complex, codependency, enabling dysfunction, or being disappointed they can't save you back."
    },
    
    mutualWork: "Both must stay grounded in reality while honoring the spiritual connection. Venus must see Neptune clearly, not just through rose-colored glasses. Neptune must be honest, not just enchanting. This can be transcendent love OR devastating disillusionment. Requires brutal honesty and strong Saturn aspects elsewhere for grounding.",
    
    intensityLevel: 9,
    growthPotential: 8,
    challengeLevel: 10,
    
    evolutionTimeline: {
      romance: {
        year1_3: "Enchanted, magical, perfect. Living in a dream. You feel you've found your soulmate. Everything is romantic, spiritual, transcendent. WARNING: You may not be seeing reality at all.",
        year4_7: "Reality check. The fog lifts. You start to see who they actually are (Venus person) or who you actually are (Neptune person). Disillusionment is common. May discover deception (theirs, yours, or mutual). Crisis point: can you love the real person or were you only in love with the fantasy?",
        year7_plus: "If still together, you've integrated the spiritual with the real. Conscious spiritual partnership where both people are committed to truth AND transcendence. Rare but beautiful. More commonly: painful breakup when illusions shatter. Neptune-Venus requires exceptional maturity and honesty to succeed long-term."
      },
      friendship: {
        year1_3: "Magical, spiritual connection. You feel understood at soul level. Beautiful empathy and compassion.",
        year4_7: "Either boundaries have been established or enmeshment has occurred. Reality testing: is this friendship healthy or enabling?",
        year7_plus: "If healthy: deep spiritual friendship with maintained boundaries. If not: codependency or painful awakening when illusions shatter."
      },
      business: {
        year1_3: "Inspired vision but unclear execution. Dreams without discipline. Risk of confusion about roles, money, agreements.",
        year4_7: "Reality check: is the business viable? Have commitments been kept? Often dissolves when Neptune's promises don't materialize.",
        year7_plus: "Rare to survive unless strong Saturn elsewhere. If it has: spiritual business with practical grounding. Usually dissolved by this point."
      },
      creative: {
        year1_3: "Transcendent creative inspiration. Beautiful work but may lack finish or commercial viability.",
        year4_7: "Need to ground the vision. Is the work being completed? Is it reaching audiences? Reality testing.",
        year7_plus: "If grounded: beautiful, inspired creative partnership. If not: a lot of half-finished projects and unfulfilled potential."
      },
      family: {
        childhood: "Magical, spiritual bond with this family member. May idealize them or feel spiritually connected. Risk of boundaries being dissolved or codependency developing.",
        adolescence: "Either healthy compassion or unhealthy enmeshment. Need reality testing: am I seeing them clearly? Am I losing myself in their needs?",
        adulthood: "If healthy: beautiful spiritual connection with maintained boundaries. If not: codependency, enabling, or painful disillusionment. Requires conscious boundary work."
      }
    }
  },

  {
    aspectKey: "chiron_conjunct_venus",
    personARole: "Venus Person",
    personBRole: "Chiron Person",
    
    personAExperience: {
      romance: "They trigger your deepest love wounds. Where you feel unlovable, unworthy, rejected. They may hurt you OR help you heal—often both. Your relationship insecurities surface intensely. If they're mature: they help you heal. If not: they retraumatize you. This is a teaching relationship either way.",
      friendship: "They expose your wounds around worthiness and acceptance. You may feel inadequate or 'less than' around them, OR they help you heal your self-worth. Your relationship patterns become obvious. They're the mirror.",
      business: "They expose your wounds around value, money, or worthiness. You may feel undervalued or they may teach you to value yourself appropriately. Your money wounds or imposter syndrome surfaces.",
      creative: "They trigger your wounds around creative worthiness. 'Am I talented enough? Beautiful enough? Valuable enough?' They can help you heal artistic shame OR make you feel like a fraud. Your relationship with creative self-worth is tested.",
      family: "They activate old family wounds around love, worth, and acceptance. You may recreate painful family dynamics with them OR finally heal them. Likely they remind you of a family wound."
    },
    
    personBExperience: {
      romance: "You're the wounded healer in this relationship. You've been hurt in similar ways and can help them heal—but you must be far enough along in your own healing. If not, you'll wound each other. You see their pain because it mirrors yours. You can be the medicine OR the poison.",
      friendship: "You understand their worthiness wounds because you have similar ones. You can help them heal OR trigger them depending on your awareness. You're the teacher here—are you conscious enough?",
      business: "Your wounds around value and money are activated too. You can teach them what you've learned OR compete in scarcity mindset. You have the gift of seeing value (yours and theirs) but must be healed enough to share it.",
      creative: "You've been wounded around creativity and can help them avoid your mistakes OR traumatize them with your unhealed shame. You're the teacher of creative worthiness. Teach consciously.",
      family: "You carry family wounds around love and acceptance. You can help them heal family patterns OR perpetuate them. You're likely the older soul or the one further along the healing path. Use that wisely."
    },
    
    mutualWork: "Chiron-Venus is a karmic teaching relationship about love, worth, and value. Both are healing love wounds together. Requires both people to be in active healing work. This aspect doesn't cause the wounds—it brings existing wounds to consciousness so they can heal. Often painful but deeply transformative.",
    
    intensityLevel: 8,
    growthPotential: 10,
    challengeLevel: 9,
    
    evolutionTimeline: {
      romance: {
        year1_3: "Old love wounds resurface intensely. You're triggering each other's deepest insecurities around worthiness and lovability. Painful but illuminating. You're being shown exactly what needs healing.",
        year4_7: "Crisis and breakthrough. Either both people are doing healing work and the relationship becomes medicine, OR one or both retraumatize and the relationship becomes destructive. Make or break period.",
        year7_plus: "If survived consciously: profound healing and teaching relationship. Both people have healed love wounds through this connection. You can now help others heal similar wounds. If not survived: was a painful but necessary teacher showing you what needs healing before you try again."
      },
      friendship: {
        year1_3: "Worthiness wounds surface. You trigger each other's insecurities about being accepted and valued.",
        year4_7: "Either healing together or retraumatizing each other. The friendship is medicine or poison depending on mutual awareness.",
        year7_plus: "If survived: deep understanding and healing. You've helped each other become more whole. The friendship has therapeutic value."
      },
      business: {
        year1_3: "Money and value wounds surface. Imposter syndrome and worthiness issues in the work.",
        year4_7: "Either learned to value each other and self appropriately, or scarcity dynamics have poisoned the partnership.",
        year7_plus: "If survived: you've healed money wounds through the work together. You know your value and price it appropriately."
      },
      creative: {
        year1_3: "Creative worthiness wounds surface. 'Am I good enough?' The collaboration triggers deep artistic insecurities.",
        year4_7: "Either healing creative shame together or reinforcing it. The work reveals what needs healing.",
        year7_plus: "If survived: you've healed creative wounds. You can create from wholeness rather than wound. The collaboration has been therapeutic."
      },
      family: {
        childhood: "This family member activates wounds around love, worth, and acceptance. May recreate earlier family dynamics. Early exposure to themes of worthiness.",
        adolescence: "Wounds deepen or begin healing depending on awareness. The family relationship shows what needs healing. Pain is present but potentially transformative.",
        adulthood: "If both have done healing work: the relationship becomes medicine. Old wounds have transformed into wisdom. If not: continued triggering of worthiness issues. Can heal at any point with conscious effort."
      }
    }
  }
];

// Normalize aspect types (synastry uses "conjunction", directional uses "conjunct")
const normalizeAspectType = (aspectType: string): string => {
  const typeMap: Record<string, string> = {
    'conjunction': 'conjunct',
    'opposition': 'opposite',
    'trine': 'trine',
    'square': 'square',
    'sextile': 'sextile',
    'quincunx': 'quincunx'
  };
  const lower = aspectType.toLowerCase();
  return typeMap[lower] || lower;
};

// Helper function to get directional interpretation
export const getDirectionalInterpretation = (
  planet1: string,
  aspect: string,
  planet2: string,
  context: RelationshipContext
): DirectionalAspectInterpretation | null => {
  // Normalize input - convert "conjunction" to "conjunct", etc.
  const normalizedAspect = normalizeAspectType(aspect);
  const aspectKey = `${planet1.toLowerCase()}_${normalizedAspect}_${planet2.toLowerCase()}`;
  
  // Try exact match
  let found = directionalAspectDatabase.find(d => d.aspectKey === aspectKey);
  
  // Try reverse (e.g., saturn_conjunct_venus instead of venus_conjunct_saturn)
  if (!found) {
    const reverseKey = `${planet2.toLowerCase()}_${normalizedAspect}_${planet1.toLowerCase()}`;
    found = directionalAspectDatabase.find(d => d.aspectKey === reverseKey);
    
    // If found reversed, swap the person labels in the returned object
    if (found) {
      return {
        ...found,
        personARole: found.personBRole,
        personBRole: found.personARole,
        personAExperience: found.personBExperience,
        personBExperience: found.personAExperience
      };
    }
  }
  
  return found || null;
};
