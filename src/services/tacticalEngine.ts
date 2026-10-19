import { 
  Formation, 
  OpponentTeam, 
  SwotData, 
  GeneratedInsight, 
  Player, 
  TacticalPhaseAnalysis, 
  MultidimensionalReport 
} from '../types';

/**
 * MULTIDIMENSIONAL TACTICAL FOOTBALL ANALYST
 * Operating through an Integrated Triple-Synthetic Perspective Framework:
 * 1. GEMINI Perspective (Geometry, Space & Structure)
 * 2. CHATGPT Perspective (Profiles, Roles & Individual Behaviors)
 * 3. CLAUDE Perspective (Systemic & Operational SWOT)
 * Strictly structured across the 10 Mandatory Phases of Play.
 */

// Helper: Normalize & clean input strings
const cleanText = (str?: string) => (str || '').trim();

export interface PlayerCluster {
  goalkeeper: Player;
  centralDefenders: Player[];
  fullbacks: Player[];
  midfieldPivots: Player[];
  attackingMidfielders: Player[];
  wingers: Player[];
  strikers: Player[];
  invertedPlayers: Player[];
  allActive: Player[];
}

/**
 * Categorize current squad players based on pitch coordinates, positions, and footedness
 */
export function extractPlayerClusters(players: Player[] = []): PlayerCluster {
  const onPitch = players.filter(p => p.pitchX !== undefined && p.pitchY !== undefined);
  const active = onPitch.length > 0 ? onPitch : players.slice(0, 11);

  const goalkeeper = active.find(p => p.position === 'GK') || 
    players.find(p => p.position === 'GK') || 
    { id: 'gk-def', name: 'Zulfairuuz Rudy', number: 1, position: 'GK', preferredFoot: 'Right' };

  const allActiveDefenders = active.filter(p => p.position === 'DEF');

  // Match CB by roleLabel or central pitch corridor (26% to 74% width)
  const centralDefenders = allActiveDefenders.filter(p => {
    const role = (p.roleLabel || '').toUpperCase();
    if (role.includes('CB') || role.includes('CD') || role.includes('SW') || role.includes('CENT') || role.includes('LIB')) return true;
    if (role.includes('WB') || role === 'LB' || role === 'RB') return false;
    return p.pitchX !== undefined && p.pitchX >= 26 && p.pitchX <= 74;
  });

  const fullbacks = allActiveDefenders.filter(p => {
    const role = (p.roleLabel || '').toUpperCase();
    if (role.includes('WB') || role === 'LB' || role === 'RB' || role.includes('FULL') || role.includes('WING')) return true;
    if (role.includes('CB') || role.includes('CD') || role.includes('SW')) return false;
    return p.pitchX !== undefined && (p.pitchX < 26 || p.pitchX > 74);
  });

  const midfieldPivots = active.filter(p => p.position === 'MID' && (p.roleLabel?.includes('DM') || p.roleLabel?.includes('Pivot') || p.roleLabel?.includes('CM')));
  const attackingMidfielders = active.filter(p => p.position === 'MID' && (p.roleLabel?.includes('AM') || p.roleLabel?.includes('10')));
  const wingers = active.filter(p => p.position === 'FWD' && (p.roleLabel?.includes('W') || (p.pitchX !== undefined && (p.pitchX <= 30 || p.pitchX >= 70))));
  const strikers = active.filter(p => p.position === 'FWD' && (!p.roleLabel || p.roleLabel.includes('CF') || p.roleLabel.includes('ST') || (p.pitchX !== undefined && p.pitchX > 30 && p.pitchX < 70)));

  // Detect inverted players (e.g. Left-footed playing right side or explicit notes/role)
  const invertedPlayers = active.filter(p => {
    const isRightSide = (p.pitchX !== undefined && p.pitchX > 55) || (p.roleLabel?.includes('R'));
    const isLeftSide = (p.pitchX !== undefined && p.pitchX < 45) || (p.roleLabel?.includes('L'));
    const isLeftFooted = p.preferredFoot === 'Left';
    const isRightFooted = p.preferredFoot === 'Right';
    const hasInvertedNote = (p.notes || '').toLowerCase().includes('invert') || (p.roleLabel || '').toLowerCase().includes('invert');

    return hasInvertedNote || (isRightSide && isLeftFooted) || (isLeftSide && isRightFooted);
  });

  return {
    goalkeeper,
    centralDefenders: centralDefenders.length > 0 ? centralDefenders : allActiveDefenders.slice(0, 2),
    fullbacks: fullbacks.length > 0 ? fullbacks : allActiveDefenders.slice(2, 4),
    midfieldPivots: midfieldPivots.length > 0 ? midfieldPivots : active.filter(p => p.position === 'MID').slice(0, 2),
    attackingMidfielders: attackingMidfielders.length > 0 ? attackingMidfielders : active.filter(p => p.position === 'MID').slice(1, 2),
    wingers: wingers.length > 0 ? wingers : active.filter(p => p.position === 'FWD').slice(1, 3),
    strikers: strikers.length > 0 ? strikers : active.filter(p => p.position === 'FWD').slice(0, 1),
    invertedPlayers,
    allActive: active,
  };
}

/**
 * Generate the Complete Multidimensional Analysis Report across the 10 Mandatory Phases of Play
 */
export function generateMultidimensionalReport(
  hgufcFormation: Formation,
  rivalFormation: Formation,
  opponent: OpponentTeam,
  swot: SwotData,
  players: Player[] = []
): MultidimensionalReport {
  const clusters = extractPlayerClusters(players);
  const { goalkeeper, centralDefenders, fullbacks, midfieldPivots, wingers, strikers, invertedPlayers } = clusters;

  const allActiveDefenders = clusters.allActive.filter(p => p.position === 'DEF');
  const allSquadDefenders = players.filter(p => p.position === 'DEF');

  // Key Player References - strictly unique pairs
  const leadCB = centralDefenders[0] || allActiveDefenders[0] || allSquadDefenders[0] || { id: 'cb-1', name: 'Lead Center-Back', number: 4, preferredFoot: 'Right' };

  // secondCB must ALWAYS be distinct from leadCB (never duplicate the same player)
  const candidateSecondCB = 
    centralDefenders.find(p => (p.id ? p.id !== leadCB.id : p.name.trim().toLowerCase() !== leadCB.name.trim().toLowerCase())) ||
    allActiveDefenders.find(p => (p.id ? p.id !== leadCB.id : p.name.trim().toLowerCase() !== leadCB.name.trim().toLowerCase()) && !fullbacks.slice(0, 2).some(fb => fb.id === p.id)) ||
    allActiveDefenders.find(p => (p.id ? p.id !== leadCB.id : p.name.trim().toLowerCase() !== leadCB.name.trim().toLowerCase())) ||
    allSquadDefenders.find(p => (p.id ? p.id !== leadCB.id : p.name.trim().toLowerCase() !== leadCB.name.trim().toLowerCase()));

  let secondCB = candidateSecondCB || { 
    id: 'cb-2-fallback', 
    name: leadCB.name.includes('Aplin') ? 'Kazuma Takayama' : 'Anders Aplin', 
    number: leadCB.number === 5 ? 6 : 5, 
    preferredFoot: 'Right' 
  };

  // Fail-safe duplicate protection: if names match, force a distinct defender
  if (secondCB.name.trim().toLowerCase() === leadCB.name.trim().toLowerCase()) {
    const alternativeDef = allSquadDefenders.find(p => p.name.trim().toLowerCase() !== leadCB.name.trim().toLowerCase());
    secondCB = alternativeDef || { 
      id: 'cb-2-fallback', 
      name: leadCB.name.includes('Aplin') ? 'Kazuma Takayama' : 'Anders Aplin', 
      number: leadCB.number === 5 ? 6 : 5, 
      preferredFoot: 'Right' 
    };
  }

  // Fullback References - strictly unique pair and distinct from central defenders
  const leadFB = fullbacks[0] || allActiveDefenders.find(p => p.id !== leadCB.id && p.id !== secondCB.id) || allSquadDefenders.find(p => p.id !== leadCB.id && p.id !== secondCB.id) || { id: 'fb-1', name: 'Active Fullback', number: 2, preferredFoot: 'Right' };

  const candidateOppositeFB = 
    fullbacks.find(p => (p.id ? (p.id !== leadFB.id && p.id !== leadCB.id && p.id !== secondCB.id) : (p.name.trim().toLowerCase() !== leadFB.name.trim().toLowerCase() && p.name.trim().toLowerCase() !== leadCB.name.trim().toLowerCase() && p.name.trim().toLowerCase() !== secondCB.name.trim().toLowerCase()))) ||
    allActiveDefenders.find(p => (p.id ? (p.id !== leadFB.id && p.id !== leadCB.id && p.id !== secondCB.id) : (p.name.trim().toLowerCase() !== leadFB.name.trim().toLowerCase() && p.name.trim().toLowerCase() !== leadCB.name.trim().toLowerCase() && p.name.trim().toLowerCase() !== secondCB.name.trim().toLowerCase()))) ||
    allSquadDefenders.find(p => (p.id ? (p.id !== leadFB.id && p.id !== leadCB.id && p.id !== secondCB.id) : (p.name.trim().toLowerCase() !== leadFB.name.trim().toLowerCase() && p.name.trim().toLowerCase() !== leadCB.name.trim().toLowerCase() && p.name.trim().toLowerCase() !== secondCB.name.trim().toLowerCase())));

  let oppositeFB = candidateOppositeFB || { 
    id: 'fb-2-fallback', 
    name: leadFB.name.includes('Nazrul') ? 'Farhan Zulkifli' : 'Nazrul Nazari', 
    number: leadFB.number === 4 ? 3 : 4, 
    preferredFoot: 'Left' 
  };

  if (oppositeFB.name.trim().toLowerCase() === leadFB.name.trim().toLowerCase()) {
    const alternativeFB = allSquadDefenders.find(p => 
      p.name.trim().toLowerCase() !== leadFB.name.trim().toLowerCase() && 
      p.name.trim().toLowerCase() !== leadCB.name.trim().toLowerCase() && 
      p.name.trim().toLowerCase() !== secondCB.name.trim().toLowerCase()
    );
    oppositeFB = alternativeFB || { 
      id: 'fb-2-fallback', 
      name: leadFB.name.includes('Nazrul') ? 'Farhan Zulkifli' : 'Nazrul Nazari', 
      number: leadFB.number === 4 ? 3 : 4, 
      preferredFoot: 'Left' 
    };
  }

  const leadPivot = midfieldPivots[0] || { name: 'Holding Midfielder', number: 6, preferredFoot: 'Right' };
  const creativeMid = clusters.attackingMidfielders[0] || midfieldPivots[1] || { name: 'Creative Midfielder', number: 10, preferredFoot: 'Right' };
  const leadStriker = strikers[0] || { name: 'Main Striker', number: 9, preferredFoot: 'Right' };
  const primaryWinger = wingers[0] || { name: 'Direct Winger', number: 11, preferredFoot: 'Right' };

  // Rival Key Players
  const rivalSquad = opponent.players || [];
  const rivalStriker = rivalSquad.find(p => p.position === 'FWD') || { name: `${opponent.shortName} Leading Striker`, number: 9 };
  const rivalMid = rivalSquad.find(p => p.position === 'MID') || { name: `${opponent.shortName} Central Pivot`, number: 8 };
  const rivalCB = rivalSquad.find(p => p.position === 'DEF') || { name: `${opponent.shortName} Center-Back`, number: 4 };
  const rivalStrikerId = 'id' in rivalStriker ? rivalStriker.id : undefined;
  const rivalWinger = rivalSquad.find(p => p.position === 'FWD' && (rivalStrikerId ? p.id !== rivalStrikerId : true)) || { name: `${opponent.shortName} Wide Threat`, number: 7 };

  // User SWOT observations
  const ourStr = cleanText(swot.ourStrengths);
  const ourWeak = cleanText(swot.ourWeaknesses);
  const rivStr = cleanText(swot.rivalStrengths);
  const rivWeak = cleanText(swot.rivalWeaknesses);

  const hName = hgufcFormation.name;
  const rName = rivalFormation.name;
  const oppName = opponent.name;

  // Detect Inverted Fullback or Wing dynamic
  const invertedNote = invertedPlayers.length > 0 
    ? `${invertedPlayers.map(p => `${p.name} (#${p.number}, ${p.preferredFoot || 'preferred'}-foot)`).join(', ')} operating inside central channels`
    : `${leadFB.name} (#${leadFB.number}) stepping into interior half-spaces`;

  const phases: TacticalPhaseAnalysis[] = [
    // 1. Goal-kick
    {
      phaseNumber: 1,
      phaseKey: 'goal-kick',
      phaseName: '1. Goal-kick',
      subtitle: 'Restart and build-up from goal kicks',
      geminiPerspective: {
        channelOccupation: `Split central defenders (${leadCB.name} and ${secondCB.name}) to both edges of the 6-yard box with ${goalkeeper.name} forming an elevated passing apex. ${leadFB.name} and ${oppositeFB.name} push high onto touchlines to horizontally stretch ${oppName}'s first pressing line.`,
        lineHeightsAndCompactness: `${leadPivot.name} drops to 18-yard semi-circle creating a 3+1 geometric base. The rival's forward block (${rName}) is pinned by high positioning of ${leadStriker.name}.`,
        superiorities: `3v2 numerical overload inside our defensive penalty box against ${oppName}'s front pressing pair (${rivalStriker.name} and supporting forward). Positional superiority achieved through deep pocket angles.`
      },
      chatGptPerspective: {
        playerProfiles: `${goalkeeper.name} (#${goalkeeper.number}) possesses confident ball-striking capability. Center-back footedness (${leadCB.preferredFoot || 'Right'}-footed ${leadCB.name}) allows open-body reception facing the flanks. ${invertedNote}.`,
        requiredBehaviors: `${leadPivot.name} must employ dummy check-in runs to draw ${rivalMid.name} out of position, opening direct vertical passing channels into the feet of ${creativeMid.name}.`
      },
      claudePerspective: {
        strength: `Clean numerical circulation in the initial 18-yard box; ${ourStr ? `maximizes our identified strength: "${ourStr.slice(0, 60)}..."` : 'superior technical composure under goalkeeper distribution'}.`,
        weakness: `High turnovers when pressed intensely on square balls across our box${ourWeak ? `; note our identified risk: "${ourWeak.slice(0, 60)}..."` : ''}.`,
        opportunity: `${oppName}'s aggressive first-line press leaves massive space behind their midfield line for direct diagonal clipped passes to ${primaryWinger.name}.`,
        threat: `${rivalStriker.name} curved pressing runs cutting off the switch to ${secondCB.name}, funneling play into an isolated touchline trap.`
      },
      directTacticalRecommendation: `Prioritize short split-circulation to invite ${oppName}'s press, then break the first line via third-man bounce from ${leadPivot.name} directly to ${creativeMid.name}.`
    },

    // 2. Build Up from open play
    {
      phaseNumber: 2,
      phaseKey: 'build-up',
      phaseName: '2. Build Up from open play',
      subtitle: 'Progressing through early and mid-build-up',
      geminiPerspective: {
        channelOccupation: `Establish a 3-2 progression shape with ${leadPivot.name} dropping between or alongside ${leadCB.name} (Salida Lavolpiana). Fullbacks occupy intermediate lateral channels while ${creativeMid.name} occupies the right half-space seam.`,
        lineHeightsAndCompactness: `Maintain 14-18 meter inter-line distance between our defensive spine and midfield line. Horizontal compactness prevents central line-breaking passes from ${oppName} on turnovers.`,
        superiorities: `Qualitative superiority in central progression: ${creativeMid.name} operates between the lines of ${oppName}'s flat or staggered midfield, generating free-man access.`
      },
      chatGptPerspective: {
        playerProfiles: `${leadCB.name} steps into the mid-third with progressive ball carrying. ${leadFB.name} plays with inverted behavior, pinching inside to create a numerical 4v3 in the central corridor.`,
        requiredBehaviors: `Require our wingers (${primaryWinger.name}) to maintain maximum touchline width until the moment the central pass is played, freezing ${oppName}'s fullbacks.`
      },
      claudePerspective: {
        strength: `Structured midfield passing triangles around ${creativeMid.name} and ${leadPivot.name} ensuring progressive possession tempo.`,
        weakness: `Overcommitting fullbacks forward exposes flank channels to rapid transition counter-punches by ${rivalWinger.name}.`,
        opportunity: `${oppName}'s central midfield drifts toward the ball, routinely leaving the weak-side half-space unoccupied for switch balls.`,
        threat: `${rivalMid.name} jumping onto ${creativeMid.name}'s blindside on reception to force turnovers in Zone 11/12.`
      },
      directTacticalRecommendation: `Execute 2-touch circulation through the pivot; when ${leadCB.name} commits the rival forward, punch vertical line-passes directly into ${creativeMid.name} on the half-turn.`
    },

    // 3. Attacking last third
    {
      phaseNumber: 3,
      phaseKey: 'attacking-last-third',
      phaseName: '3. Attacking last third',
      subtitle: 'Creating in the final third / 3/4 zone',
      geminiPerspective: {
        channelOccupation: `Saturate all 5 attacking channels (Left Flank, Left Half-Space, Central Corridor, Right Half-Space, Right Flank) in a 2-3-5 / 3-2-5 attacking structure. ${primaryWinger.name} holds width while ${leadStriker.name} pins both of ${oppName}'s central defenders.`,
        lineHeightsAndCompactness: `Our backline pushes up to the halfway line to maintain vertical compression, squeezing the playing area into ${oppName}'s defensive 35 meters.`,
        superiorities: `Positional superiority in Zone 14 (between 18-yard box and center circle) through overload of ${creativeMid.name} and arriving inverted fullback.`
      },
      chatGptPerspective: {
        playerProfiles: `${leadStriker.name} (#${leadStriker.number}) performs pinning actions against ${rivalCB.name}, creating depth for late-arriving runners. ${primaryWinger.name} engages in isolated 1v1 take-ons on the touchline.`,
        requiredBehaviors: `Third-man combinations: Winger passes inside to ${creativeMid.name}, who immediately slides an underlapping through-ball for the running fullback.`
      },
      claudePerspective: {
        strength: `Dynamic half-space penetration and unpredictable interchanging between our wide and interior attackers.`,
        weakness: `Congestion in the central lane if both wingers cut inside simultaneously without outside overlapping support.`,
        opportunity: `${rivWeak ? `Target identified rival weakness: "${rivWeak.slice(0, 60)}..."` : `${oppName}'s fullbacks lose spatial awareness when dragged into central areas, leaving back-post space`}.`,
        threat: `Midfield giveaways in Zone 14 leading to immediate 70-meter counter-attacks by ${rivalStriker.name}.`
      },
      directTacticalRecommendation: `Create dynamic 2v1 overloads on ${oppName}'s weaker flank, using underlapping half-space runs to reach the byline before cutting back.`
    },

    // 4. Attacking the box
    {
      phaseNumber: 4,
      phaseKey: 'attacking-box',
      phaseName: '4. Attacking the box',
      subtitle: 'Box entries, cross-value, and finishing occupancy',
      geminiPerspective: {
        channelOccupation: `Box occupancy strictly divided into 4 designated scoring zones: Near Post (${leadStriker.name}), Central Penalty Spot (${primaryWinger.name} or second forward), Far Post (${oppositeFB.name} or opposite winger), and Edge-of-Box Cutback Fall Zone (${creativeMid.name}).`,
        lineHeightsAndCompactness: `${leadPivot.name} and ${leadFB.name} lock the 18-yard semi-circle at a height of 22-25 meters to sweep up defensive clearances.`,
        superiorities: `Qualitative superiority: ${leadStriker.name} timing blindside darts across the face of ${rivalCB.name} into the 6-yard corridor.`
      },
      chatGptPerspective: {
        playerProfiles: `${leadStriker.name} operates as the primary box presence with physical duels against ${rivalCB.name}. Midfield runners must arrive from deep with blindside timing rather than static positioning.`,
        requiredBehaviors: `Cross delivery profiles: Avoid floating crosses into ${oppName}'s tall central defenders; deliver aggressive waist-height driven balls between goalkeeper and backline or pull-backs to penalty spot.`
      },
      claudePerspective: {
        strength: `Multi-wave arrivals into the penalty area ensuring second-ball finishing opportunities at the top of the box.`,
        weakness: `Under-resourcing the edge of the box leaves us vulnerable if the cross is intercepted and cleared cleanly.`,
        opportunity: `${oppName}'s defenders instinctively drop too deep onto their 6-yard line, leaving acres of vacant space around the penalty spot for cutbacks.`,
        threat: `${rivalStriker.name} cheating on the halfway line ready to chase long clearance balls if our rest-defense is lax.`
      },
      directTacticalRecommendation: `Ban low-percentage aerial floaters; mandate low driven deliveries across the corridor of uncertainty and cutbacks to ${creativeMid.name} on the penalty spot.`
    },

    // 5. Attacking transitions
    {
      phaseNumber: 5,
      phaseKey: 'attacking-transitions',
      phaseName: '5. Attacking transitions',
      subtitle: 'Counter-attacks and transition forward',
      geminiPerspective: {
        channelOccupation: `Upon turnover, immediately expand into 3 vertical break lanes: central carrying corridor (${creativeMid.name}) and two explosive diagonal boundary channels (${primaryWinger.name} and ${leadStriker.name}).`,
        lineHeightsAndCompactness: `First progressive pass must be delivered within 1.5 seconds of ball recovery before ${oppName} can organize their defensive counter-press.`,
        superiorities: `Numerical superiority in forward space: 3v2 or 4v3 counter-attack breaks before ${oppName}'s retreating midfielders recover.`
      },
      chatGptPerspective: {
        playerProfiles: `${primaryWinger.name} exhibits elite sprint speed to exploit wide spaces. ${creativeMid.name} provides vision and weighted release passes into the stride of runners.`,
        requiredBehaviors: `${leadStriker.name} must run diagonally across ${rivalCB.name}'s line of sight, either dragging defenders away or receiving directly in behind.`
      },
      claudePerspective: {
        strength: `Direct vertical acceleration exploiting high defensive lines deployed by ${oppName}.`,
        weakness: `Rushing passes prematurely into congested zones rather than taking the stabilizing first touch to commit the rival center-back.`,
        opportunity: `${oppName}'s fullbacks leave immense space vacated in behind when their attack breaks down.`,
        threat: `Getting fouled tactically before crossing the halfway line, allowing ${oppName} to regroup into their compact shape.`
      },
      directTacticalRecommendation: `Execute the 3-pass vertical transition rule: Win ball -> find ${creativeMid.name} facing forward -> release ${primaryWinger.name} or ${leadStriker.name} behind ${rivalCB.name}.`
    },

    // 6. Defending from the front
    {
      phaseNumber: 6,
      phaseKey: 'defending-front',
      phaseName: '6. Defending from the front',
      subtitle: 'High press / High block triggers and orientations',
      geminiPerspective: {
        channelOccupation: `High pressing block stationed in ${oppName}'s defensive third. ${leadStriker.name} curves run to split their two center-backs, funneling circulation toward their weaker side touchline.`,
        lineHeightsAndCompactness: `Defensive backline pushed up to within 35 meters of our front line. Tight vertical compactness (no gaps larger than 12m between units).`,
        superiorities: `Positional superiority at the touchline: Touchline acts as an extra defender, closing ${oppName}'s passing angles to 180 degrees.`
      },
      chatGptPerspective: {
        playerProfiles: `${leadStriker.name} and ${primaryWinger.name} lead aggressive coordinated hunting. ${creativeMid.name} marks ${rivalMid.name} tightly to eliminate short escape routes.`,
        requiredBehaviors: `Specific pressing triggers: (1) Backward pass to rival goalkeeper; (2) Rival defender receives facing their own goal; (3) Bouncing or slow pass onto their fullback.`
      },
      claudePerspective: {
        strength: `High turnovers won in the attacking third leading to direct, high-xG scoring attempts within 8 seconds.`,
        weakness: `High defensive line exposes vast green space behind ${leadCB.name} if ${oppName} breaks the press with a clipped diagonal ball.`,
        opportunity: `${oppName}'s defenders panic under sustained 3-man pressure, frequently conceding throw-ins or loose clearances.`,
        threat: `${rivalStriker.name} timing runs off our last defender's shoulder into the space vacated by our advancing backline.`
      },
      directTacticalRecommendation: `Trigger 3-man synchronized press the split-second the ball travels toward ${oppName}'s fullback; lock the touchline and cut off inside passing options.`
    },

    // 7. Defending in mid block
    {
      phaseNumber: 7,
      phaseKey: 'defending-mid-block',
      phaseName: '7. Defending in mid block',
      subtitle: 'Mid-block compactness and central funneling',
      geminiPerspective: {
        channelOccupation: `Rigid 4-4-2 / 4-1-4-1 mid-block stationed between the halfway line and our 30-meter mark. Central corridor completely congested, forcing ${oppName} into slow sideways U-shaped circulation.`,
        lineHeightsAndCompactness: `Compact 25m x 35m tactical block. Midfield and defensive lines shift horizontally in tandem with the ball's movement.`,
        superiorities: `Numerical parity or superiority in central midfield (3v2 or 3v3) denying ${rivalMid.name} penetrative vertical passing lanes.`
      },
      chatGptPerspective: {
        playerProfiles: `${leadPivot.name} acts as the defensive screen, shielding the central CB pairing (${leadCB.name} and ${secondCB.name}). Fullbacks stay tucked in tightly to prevent half-space passes.`,
        requiredBehaviors: `Body orientation: Defensive players adopt side-on stance, showing the rival ball-carrier toward the outside touchline and closing the interior angles.`
      },
      claudePerspective: {
        strength: `Central lockdown forcing ${oppName} into harmless peripheral circulation without threatening our penalty area.`,
        weakness: `Fatigue or lapses in horizontal shifting allow passes between our midfield lines into Zone 14.`,
        opportunity: `Interceptions in the mid-block catch ${oppName}'s fullbacks out of defensive balance, creating counter-attacking runways.`,
        threat: `${rivStr ? `Neutralize rival strength: "${rivStr.slice(0, 60)}..."` : `Rival attacking midfielder slipping into the seam between our center-back and fullback`}.`
      },
      directTacticalRecommendation: `Hold the defensive mid-block line at 35 meters; do not engage rival center-backs until they step past the halfway line, then aggressively compress the space.`
    },

    // 8. Defending in low block
    {
      phaseNumber: 8,
      phaseKey: 'defending-low-block',
      phaseName: '8. Defending in low block',
      subtitle: 'Low-block protection and backline density',
      geminiPerspective: {
        channelOccupation: `Compact 5-man or 4+1 defensive line defending the 18-yard box. Width between fullbacks compressed to maximum 32 meters to prevent interior gaps between CB and FB.`,
        lineHeightsAndCompactness: `Defensive line anchored at the penalty spot (11m from goal line). Midfield unit compressed 8-10m in front to extinguish shooting pockets.`,
        superiorities: `Numerical superiority inside the penalty box: 6 defenders against 3-4 attacking runners, denying direct shooting lanes.`
      },
      chatGptPerspective: {
        playerProfiles: `${leadCB.name} and ${secondCB.name} demonstrate commanding aerial clearance capabilities. ${goalkeeper.name} dominates the 6-yard box on crosses.`,
        requiredBehaviors: `Strict discipline: Center-backs must not be dragged out of the width of the 18-yard box; wide channel defending is managed by fullbacks and tracking wingers.`
      },
      claudePerspective: {
        strength: `Resilient defensive density denying quality chances in high-danger central finishing zones.`,
        weakness: `Conceding dangerous free kicks or corner kicks around our penalty box if tackles are mistimed.`,
        opportunity: `When clearing the ball, ${leadStriker.name} holds up play to draw fouls and relieve defensive pressure.`,
        threat: `Reflected shots, deflected efforts, and second-ball rebounds falling to unscreened rival players on the edge of the box.`
      },
      directTacticalRecommendation: `Keep the backline compact across the width of the penalty box; assign ${leadPivot.name} to sweep the D and forbid any uncontested shots from 20 meters.`
    },

    // 9. Defending the box
    {
      phaseNumber: 9,
      phaseKey: 'defending-box',
      phaseName: '9. Defending the box',
      subtitle: 'Box defense, body profiling, and second-ball coverage',
      geminiPerspective: {
        channelOccupation: `Zonal box coverage: First post protected by ${leadCB.name}, center goal mouth by ${secondCB.name}, back post by ${oppositeFB.name}. ${leadPivot.name} seals the penalty spot.`,
        lineHeightsAndCompactness: `Backline drops to 6-8 meters upon cross delivery; goalkeeper commands the aerial corridor between penalty spot and goal line.`,
        superiorities: `Zonal and physical superiority against ${rivalStriker.name} through aggressive body positioning and front-post cut-offs.`
      },
      chatGptPerspective: {
        playerProfiles: `${leadCB.name} (#${leadCB.number}) utilizes physical strength and aerial timing to win first contacts. Defenders maintain open-chest profiling to track both the ball and runner.`,
        requiredBehaviors: `Touch-tight marking inside the 6-yard area; never turn back to the play; block shooting angles with active slide-tackles.`
      },
      claudePerspective: {
        strength: `Dominant first-contact clearances from our central defenders (${leadCB.name} and ${secondCB.name}).`,
        weakness: `Vulnerability to cutback deliveries if midfield runners fail to track opposite midfield runners into the box.`,
        opportunity: `Quick launch transitions: ${goalkeeper.name} claims cross cleanly and immediately throws long to release ${primaryWinger.name}.`,
        threat: `Second-ball scramble following incomplete clearances inside our 18-yard box.`
      },
      directTacticalRecommendation: `Adopt front-man marking on the near post; ensure ${creativeMid.name} and ${leadPivot.name} sprint back to seal the penalty spot and edge-of-box fall zone.`
    },

    // 10. Defending transitions
    {
      phaseNumber: 10,
      phaseKey: 'defending-transitions',
      phaseName: '10. Defending transitions',
      subtitle: 'Defensive transition / Counterpress vs. Drop off',
      geminiPerspective: {
        channelOccupation: `Immediate execution of Rest-Defense structure: 3+2 rest-defense structure (${leadCB.name}, ${secondCB.name}, and holding fullback + ${leadPivot.name} and defensive midfielder) stationed behind the ball.`,
        lineHeightsAndCompactness: `First 5 seconds rule: Players within 5 meters of the ball swarm the rival ball-carrier in a 3-man counter-pressing triangle, while the back 3 drop 5 meters to control depth.`,
        superiorities: `Numerical control: 5 defensive players locked behind the ball to neutralize ${oppName}'s 2-3 transition runners.`
      },
      chatGptPerspective: {
        playerProfiles: `${leadPivot.name} provides disruptive tactical fouls if counter-press is breached. ${leadCB.name} uses recovery pace and body positioning to delay the rival counter.`,
        requiredBehaviors: `Decision-making trigger: "Press or Drop" — If immediate pressure cannot be applied on the ball, the entire unit must drop 10 meters and delay rather than diving in.`
      },
      claudePerspective: {
        strength: `High-intensity counter-press regaining possession immediately in the attacking third to restart attack against an unorganized opponent.`,
        weakness: `Fullbacks caught ahead of the ball without midfield covering coverage leaving isolated 2v2 counter-attacks against our CBs.`,
        opportunity: `Turnovers won during rival transition lead to their defense being completely disjointed and out of shape.`,
        threat: `${rivalStriker.name} and ${rivalWinger.name} exploiting wide green spaces behind our advancing fullbacks.`
      },
      directTacticalRecommendation: `Enforce the non-negotiable 3+2 rest defense rule: Never allow both fullbacks to cross the final third simultaneously without ${leadPivot.name} tucking into the backline.`
    }
  ];

  return {
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    engine: 'Triple-Synthetic AI Framework (Gemini + ChatGPT + Claude)',
    summary: `Tactical clash evaluation between Hougang United FC (${hName}) and ${oppName} (${rName}) synthesizing on-pitch personnel, footedness profiles, and coach SWOT observations across all 10 mandatory phases of play.`,
    phases
  };
}

/**
 * Intelligent Tactical Engine: Generates Actionable Directives for Opportunities & Threats
 * Dynamically driven by:
 * 1. Current Active Players (HGUFC roster & on-pitch lineup, custom names, roles, footedness)
 * 2. Rival Active Players & Customizations (edited names, positions, numbers)
 * 3. User SWOT qualitative text (dynamic multi-language semantic parsing: Spanish & English)
 * 4. Formation vs Formation geometry & numerical superiorities
 * 5. Opponent identity & play style
 */
export function generateTacticalInsights(
  hgufcFormation: Formation,
  rivalFormation: Formation,
  opponent: OpponentTeam,
  swot: SwotData,
  players?: Player[]
): GeneratedInsight[] {
  const insights: GeneratedInsight[] = [];
  let idCounter = 1;

  const clusters = extractPlayerClusters(players);
  const { goalkeeper, centralDefenders, fullbacks, midfieldPivots, wingers, strikers, invertedPlayers } = clusters;

  const leadCB = centralDefenders[0] || { name: 'Central Defender', number: 4 };
  const leadFB = fullbacks[0] || { name: 'Fullback', number: 2 };
  const starPlaymaker = clusters.attackingMidfielders[0] || midfieldPivots[0] || { name: 'Central Playmaker', number: 10 };
  const starForward = strikers[0] || { name: 'Leading Striker', number: 9 };
  const primaryWinger = wingers[0] || { name: 'Winger', number: 11 };

  // Rival active players
  const rivalSquad = opponent.players || [];
  const rivalKeyAttacker = rivalSquad.find(p => p.position === 'FWD') || rivalSquad[10] || { name: `${opponent.shortName} Striker`, number: 9 };
  const rivalMidfielder = rivalSquad.find(p => p.position === 'MID') || rivalSquad[7] || { name: `${opponent.shortName} Playmaker`, number: 10 };
  const rivalDefender = rivalSquad.find(p => p.position === 'DEF') || rivalSquad[3] || { name: `${opponent.shortName} Defender`, number: 4 };

  const hName = hgufcFormation.name;
  const rName = rivalFormation.name;

  // Multi-language text normalization for SWOT analysis (supports Spanish and English keywords)
  const norm = (str: string) => (str || '').toLowerCase();
  const ourStr = norm(swot.ourStrengths);
  const ourWeak = norm(swot.ourWeaknesses);
  const rivStr = norm(swot.rivalStrengths);
  const rivWeak = norm(swot.rivalWeaknesses);

  // Helper to split text into distinct user observations/sentences
  const extractUserSentences = (text: string): string[] => {
    if (!text) return [];
    return text
      .split(/[.\n;•,\r]+/)
      .map(s => s.trim())
      .filter(s => s.length >= 3);
  };

  const ourStrengthItems = extractUserSentences(swot.ourStrengths);
  const ourWeaknessItems = extractUserSentences(swot.ourWeaknesses);
  const rivalStrengthItems = extractUserSentences(swot.rivalStrengths);
  const rivalWeaknessItems = extractUserSentences(swot.rivalWeaknesses);

  // =========================================================================
  // 1. INVERTED PLAYER / PROFILE BASED DIRECTIVES (ChatGPT Perspective)
  // =========================================================================
  if (invertedPlayers.length > 0) {
    invertedPlayers.forEach((invPlayer, idx) => {
      insights.push({
        id: `inv-profile-${idx}-${idCounter++}`,
        type: 'opportunity',
        category: 'Spatial / Half-Spaces',
        title: `Inverted Profile Dynamics: ${invPlayer.name} (#${invPlayer.number})`,
        description: `${invPlayer.name} is playing with inverted profile (${invPlayer.preferredFoot || 'opposite'} foot on flank). Drives inside to create interior midfield overloads.`,
        actionableDirective: `Instruct ${invPlayer.name} (#${invPlayer.number}) to underlap into the half-space, vacating the touchline for the winger and combining with ${starPlaymaker.name} on the edge of the box.`,
        phaseRef: 'Attacking last third'
      });
    });
  }

  // =========================================================================
  // 2. DYNAMIC DIRECTIVES DERIVED FROM USER'S CUSTOM SWOT INPUTS
  // =========================================================================

  // A. EXPLOITING IDENTIFIED RIVAL WEAKNESSES (User input in DAFO "Rival Weaknesses")
  if (rivalWeaknessItems.length > 0) {
    rivalWeaknessItems.forEach((weaknessText, idx) => {
      const lower = weaknessText.toLowerCase();
      let category: GeneratedInsight['category'] = 'Spatial / Half-Spaces';
      let title = `Exploit Rival Vulnerability: "${weaknessText.slice(0, 38)}${weaknessText.length > 38 ? '...' : ''}"`;
      let directive = `Instruct ${starPlaymaker.name} and ${starForward.name} to systematically target this rival flaw during active attacking phases.`;
      let phaseRef = 'Attacking last third';

      if (lower.includes('lento') || lower.includes('slow') || lower.includes('velocidad') || lower.includes('speed') || lower.includes('espalda') || lower.includes('behind') || lower.includes('despiste')) {
        category = 'Tactical Phase';
        title = `Direct In-Behind Balls vs Slow Rival Defenders`;
        directive = `${starPlaymaker.name} (#${starPlaymaker.number}) must release early direct diagonal balls behind ${rivalDefender.name} into space for ${starForward.name}.`;
        phaseRef = 'Attacking transitions';
      } else if (lower.includes('banda') || lower.includes('lateral') || lower.includes('wing') || lower.includes('flanco') || lower.includes('flank') || lower.includes('centro') || lower.includes('cross') || lower.includes('carril')) {
        category = 'Numerical Overload';
        title = `Wide Channel Isolation & Overloads`;
        directive = `Generate 2v1 overloads on the wings against ${opponent.shortName} with ${primaryWinger.name} and deliver rapid cutbacks across the penalty spot.`;
        phaseRef = 'Attacking the box';
      } else if (lower.includes('presion') || lower.includes('press') || lower.includes('salida') || lower.includes('build') || lower.includes('error') || lower.includes('fallo') || lower.includes('portero') || lower.includes('keeper')) {
        category = 'Pressing Traps';
        title = `Aggressive High-Block Pressing Trap`;
        directive = `Trigger synchronized 3-man forward press with ${starForward.name} and ${primaryWinger.name} when ${opponent.shortName}'s backline attempts to circulate, forcing immediate turnovers in their defensive third.`;
        phaseRef = 'Defending from the front';
      } else if (lower.includes('balon parado') || lower.includes('set piece') || lower.includes('corner') || lower.includes('falta') || lower.includes('aereo') || lower.includes('aerial')) {
        category = 'Set Pieces';
        title = `Target Rival Set-Piece Defensive Disorganization`;
        directive = `Deliver inswinging dead balls into the 6-yard box targeting ${leadCB.name} at the near post.`;
        phaseRef = 'Set Pieces';
      } else if (lower.includes('medio') || lower.includes('midfield') || lower.includes('espacio') || lower.includes('space') || lower.includes('lineas') || lower.includes('zone 14') || lower.includes('zona 14')) {
        category = 'Spatial / Half-Spaces';
        title = `Occupy Between-the-Lines Pocket (Zone 14)`;
        directive = `${starPlaymaker.name} must operate in the seams between ${opponent.shortName}'s midfield and defensive lines to receive on the half-turn.`;
        phaseRef = 'Build Up from open play';
      } else {
        directive = `Direct coaching instruction for "${weaknessText}": ${starPlaymaker.name} and ${starForward.name} must systematically concentrate attacking possession down this specific tactical flaw.`;
      }

      insights.push({
        id: `opp-swot-rw-${idx}-${idCounter++}`,
        type: 'opportunity',
        category,
        title,
        description: `Directly derived from your DAFO assessment of ${opponent.name}: "${weaknessText}".`,
        actionableDirective: directive,
        phaseRef
      });
    });
  }

  // B. NEUTRALIZING IDENTIFIED RIVAL STRENGTHS (User input in DAFO "Rival Strengths")
  if (rivalStrengthItems.length > 0) {
    rivalStrengthItems.forEach((strengthText, idx) => {
      const lower = strengthText.toLowerCase();
      let category: GeneratedInsight['category'] = 'Defensive Transition';
      let title = `Neutralize Threat: "${strengthText.slice(0, 38)}${strengthText.length > 38 ? '...' : ''}"`;
      let directive = `Designate ${leadCB.name} and our defensive midfield pivot to double-team and restrict time and space for ${rivalKeyAttacker.name}.`;
      let phaseRef = 'Defending in mid block';

      if (lower.includes('contra') || lower.includes('counter') || lower.includes('transicion') || lower.includes('transition') || lower.includes('rapido') || lower.includes('fast') || lower.includes('velocidad')) {
        category = 'Defensive Transition';
        title = `Rest-Defense Safeguard against Rival Counter-Attack`;
        directive = `Enforce a strict 3+2 rest-defense structure behind the ball. Never allow ${rivalKeyAttacker.name} (#${rivalKeyAttacker.number}) isolated 1v1 situations in open field.`;
        phaseRef = 'Defending transitions';
      } else if (lower.includes('remate') || lower.includes('tiro') || lower.includes('shoot') || lower.includes('gol') || lower.includes('delantero') || lower.includes('striker')) {
        category = 'Defensive Transition';
        title = `Tight Marking on Primary Finisher ${rivalKeyAttacker.name}`;
        directive = `${leadCB.name} (#${leadCB.number}) must maintain touch-tight marking inside the 18-yard box, denying ${rivalKeyAttacker.name} cleanly turning toward goal.`;
        phaseRef = 'Defending the box';
      } else if (lower.includes('pase') || lower.includes('creador') || lower.includes('playmaker') || lower.includes('10') || lower.includes('asistencia') || lower.includes('vision')) {
        category = 'Spatial / Half-Spaces';
        title = `Screen Passing Channels to ${rivalMidfielder.name}`;
        directive = `Position our defensive midfielder directly in the central passing lane to cut off supply lines to ${rivalMidfielder.name} (#${rivalMidfielder.number}).`;
        phaseRef = 'Defending in mid block';
      } else if (lower.includes('balon parado') || lower.includes('corner') || lower.includes('set piece') || lower.includes('cabeza') || lower.includes('header') || lower.includes('falta')) {
        category = 'Set Pieces';
        title = `Hybrid Set-Piece Defense vs Rival Aerial Threat`;
        directive = `Deploy a 4-man zonal line along the 6-yard box with man-to-man tight marking on their tallest target ${rivalDefender.name}.`;
        phaseRef = 'Set Pieces';
      }

      insights.push({
        id: `opp-swot-rs-${idx}-${idCounter++}`,
        type: 'threat',
        category,
        title,
        description: `Identified from your DAFO rival threat assessment of ${opponent.name}: "${strengthText}".`,
        actionableDirective: directive,
        phaseRef
      });
    });
  }

  // C. SAFEGUARDING IDENTIFIED INTERNAL WEAKNESSES (User input in DAFO "Our Weaknesses")
  if (ourWeaknessItems.length > 0) {
    ourWeaknessItems.forEach((weaknessText, idx) => {
      const lower = weaknessText.toLowerCase();
      let category: GeneratedInsight['category'] = 'Defensive Transition';
      let title = `Tactical Safeguard: "${weaknessText.slice(0, 38)}${weaknessText.length > 38 ? '...' : ''}"`;
      let directive = `Reinforce collective covering distances and ensure ${goalkeeper.name} communicates actively to prevent defensive breakdowns.`;
      let phaseRef = 'Defending in low block';

      if (lower.includes('espalda') || lower.includes('behind') || lower.includes('lateral') || lower.includes('fullback') || lower.includes('subida')) {
        title = `Fullback Rest-Defense Cover`;
        directive = `When ${leadFB.name} advances into the attacking third, the holding midfielder must drop into the vacated flank channel to prevent quick breaks by ${rivalKeyAttacker.name}.`;
        phaseRef = 'Defending transitions';
      } else if (lower.includes('perdida') || lower.includes('turnover') || lower.includes('error') || lower.includes('pase') || lower.includes('salida')) {
        category = 'Defensive Transition';
        title = `First Phase Build-Up Safety Rule`;
        directive = `Eliminate risky square passes across our penalty box. ${leadCB.name} must choose secure vertical line-passes or clip into the channels.`;
        phaseRef = 'Goal-kick';
      } else if (lower.includes('aereo') || lower.includes('segunda') || lower.includes('second ball') || lower.includes('despeje')) {
        category = 'Set Pieces';
        title = `Edge-of-Box Second Ball Seal`;
        directive = `Assign two central players exclusively to vacuum up clearances on the 18-yard semi-circle on both defensive and offensive set pieces.`;
        phaseRef = 'Defending the box';
      }

      insights.push({
        id: `opp-swot-ow-${idx}-${idCounter++}`,
        type: 'threat',
        category,
        title,
        description: `Protective directive addressing our reported squad weakness: "${weaknessText}".`,
        actionableDirective: directive,
        phaseRef
      });
    });
  }

  // D. CAPITALIZING ON IDENTIFIED INTERNAL STRENGTHS (User input in DAFO "Our Strengths")
  if (ourStrengthItems.length > 0) {
    ourStrengthItems.forEach((strengthText, idx) => {
      const lower = strengthText.toLowerCase();
      let category: GeneratedInsight['category'] = 'Spatial / Half-Spaces';
      let title = `Maximize Strength: "${strengthText.slice(0, 38)}${strengthText.length > 38 ? '...' : ''}"`;
      let directive = `Design the game plan to channel 60%+ of possession through this strength to dictate tempo over ${opponent.name}.`;
      let phaseRef = 'Build Up from open play';

      if (lower.includes('regate') || lower.includes('1v1') || lower.includes('dribble') || lower.includes('extremo') || lower.includes('winger') || lower.includes('banda')) {
        category = 'Numerical Overload';
        title = `Isolate Wingers for Direct 1v1 Take-Ons`;
        directive = `Switch play rapidly to clear out the flank and give ${primaryWinger.name} direct 1v1 isolation against ${rivalDefender.name}.`;
        phaseRef = 'Attacking last third';
      } else if (lower.includes('pase') || lower.includes('posesion') || lower.includes('control') || lower.includes('ritmo') || lower.includes('midfield')) {
        category = 'Spatial / Half-Spaces';
        title = `Midfield Tempo Control & Triangle Combinations`;
        directive = `Establish 3-man passing triangles around ${starPlaymaker.name} (#${starPlaymaker.number}) to manipulate ${opponent.shortName}'s central block.`;
        phaseRef = 'Build Up from open play';
      } else if (lower.includes('presion') || lower.includes('recuperacion') || lower.includes('intensidad') || lower.includes('press')) {
        category = 'Pressing Traps';
        title = `High-Intensity Counter-Press (5-Second Rule)`;
        directive = `On possession loss, execute an immediate 5-second counter-press to win the ball back within 35 meters of ${opponent.shortName}'s goal.`;
        phaseRef = 'Defending from the front';
      }

      insights.push({
        id: `opp-swot-os-${idx}-${idCounter++}`,
        type: 'opportunity',
        category,
        title,
        description: `Leveraging our core tactical weapon: "${strengthText}".`,
        actionableDirective: directive,
        phaseRef
      });
    });
  }

  // =========================================================================
  // 3. FORMATION VS FORMATION STRUCTURAL MISMATCH ANALYSIS (Gemini Perspective)
  // =========================================================================

  // Wing Overload vs 3-at-the-back / 5-at-the-back
  if ((rivalFormation.category === '3-at-back' || rivalFormation.category === '5-at-back') && 
      (hName.includes('4-3-3') || hName.includes('3-4-3') || hName.includes('4-2-3-1'))) {
    insights.push({
      id: `opp-form-${idCounter++}`,
      type: 'opportunity',
      category: 'Numerical Overload',
      title: 'Flank Overload Against Isolated Wingbacks',
      description: `${opponent.name}'s ${rivalFormation.name} relies on lone wingbacks to cover the touchline. Our wide forwards and advanced fullbacks create instant 2v1 overloads before their wide center-backs can shift across.`,
      actionableDirective: `Instruct our wingers to pin their wide center-backs inside while ${leadFB.name} executes dynamic underlapping/overlapping runs toward ${starForward.name}.`,
      phaseRef: 'Attacking last third'
    });
  }

  // Central Midfield Clashes (3-man midfield vs Flat 2-man midfield)
  if ((hName.includes('Diamond') || hName.includes('4-3-3') || hName.includes('3-5-2')) && 
      (rName.includes('4-4-2 Flat') || rName.includes('3-4-3 Flat'))) {
    insights.push({
      id: `opp-form-${idCounter++}`,
      type: 'opportunity',
      category: 'Spatial / Half-Spaces',
      title: 'Central Midfield Overload (3v2 Dominance)',
      description: `Our three central midfielders possess a natural 3v2 numerical advantage against ${opponent.name}'s flat two-man midfield line, dominating Zone 14 and the central channel.`,
      actionableDirective: `${starPlaymaker.name} must play on staggered vertical lines to continuously receive the ball facing forward in the half-spaces.`,
      phaseRef: 'Build Up from open play'
    });
  }

  // Double Pivot Shield against Rival Playmaker
  if (hName.includes('4-2-3-1') && (rName.includes('4-2-3-1') || rName.includes('Diamond'))) {
    insights.push({
      id: `opp-form-${idCounter++}`,
      type: 'threat',
      category: 'Defensive Transition',
      title: 'Zone 14 Dual Playmaker Congestion',
      description: `Both teams deploy a central attacking midfielder. ${opponent.name} will attempt to feed ${rivalMidfielder.name} between our midfield and defensive lines.`,
      actionableDirective: 'Our defensive pivot must maintain tight horizontal spacing (no wider than 12 meters apart) to deny vertical line-breaking passing lanes.',
      phaseRef: 'Defending in mid block'
    });
  }

  // 3 CBs vs Single Striker Build-up Superiority
  if (hgufcFormation.category === '3-at-back' && (rName.includes('4-2-3-1') || rName.includes('5-4-1') || rName.includes('4-3-3'))) {
    insights.push({
      id: `opp-form-${idCounter++}`,
      type: 'opportunity',
      category: 'Tactical Phase',
      title: '3v1 First Phase Build-Up Circulation',
      description: `In the first build-up phase, our 3 central defenders have numerical superiority over ${opponent.name}'s single forward (${rivalKeyAttacker.name}), allowing outside CBs to step forward unchecked.`,
      actionableDirective: `Encourage ${leadCB.name} to drive into ${opponent.shortName}'s half until a midfielder commits, opening an unmarked teammate.`,
      phaseRef: 'Goal-kick'
    });
  }

  // Threat: 2 Striker Pinning our CBs
  if (hgufcFormation.category === '4-at-back' && (rName.includes('4-4-2') || rName.includes('3-5-2') || rName.includes('5-3-2'))) {
    insights.push({
      id: `opp-form-${idCounter++}`,
      type: 'threat',
      category: 'Defensive Transition',
      title: `2v2 Strikers Pinning Central Defenders`,
      description: `${opponent.name}'s dual striker partnership will pin both of our center-backs in direct 1v1 physical duels with ${rivalKeyAttacker.name}.`,
      actionableDirective: `Our holding midfielder must drop between ${leadCB.name} and partner (La Salida Lavolpiana) to create a protective 3v2 defensive superiority.`,
      phaseRef: 'Defending the box'
    });
  }

  // Low Block Exploitation (Rival plays 5-at-back)
  if (rivalFormation.category === '5-at-back') {
    insights.push({
      id: `opp-form-${idCounter++}`,
      type: 'opportunity',
      category: 'Spatial / Half-Spaces',
      title: 'Half-Space Cutbacks and Edge-of-Box Shooting',
      description: `${opponent.name} will defend in a deep low block inside their 18-yard box. High crosses will be cleared by their 3 central defenders; therefore, low cutbacks to the penalty spot and edge-of-box shots are mathematically superior.`,
      actionableDirective: `Work the ball into the half-space byline before delivering low driven cutbacks backward to ${starPlaymaker.name} arriving on the edge of the box.`,
      phaseRef: 'Attacking the box'
    });
  }

  return insights;
}
