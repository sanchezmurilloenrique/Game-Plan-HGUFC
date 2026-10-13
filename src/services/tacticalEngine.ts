import { Formation, OpponentTeam, SwotData, GeneratedInsight, Player } from '../types';

/**
 * Intelligent Tactical Engine
 * Synthesizes:
 * 1. Current Active Players (HGUFC roster & on-pitch lineup, custom names, roles)
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

  // Active HGUFC on-pitch starters or top players
  const onPitchPlayers = players ? players.filter(p => p.pitchX !== undefined && p.pitchY !== undefined) : [];
  const startersOrSquad = onPitchPlayers.length > 0 ? onPitchPlayers : (players || []);

  const starPlaymaker = startersOrSquad.find(p => p.position === 'MID') || { name: 'Central Playmaker', number: 10 };
  const starForward = startersOrSquad.find(p => p.position === 'FWD') || { name: 'Leading Striker', number: 9 };
  const leadDefender = startersOrSquad.find(p => p.position === 'DEF') || { name: 'Center Back', number: 4 };
  const goalkeeper = startersOrSquad.find(p => p.position === 'GK') || { name: 'Goalkeeper', number: 1 };

  // Rival active players
  const rivalSquad = opponent.players || [];
  const rivalKeyAttacker = rivalSquad.find(p => p.position === 'FWD') || rivalSquad[10] || { name: `${opponent.shortName} #9`, number: 9 };
  const rivalMidfielder = rivalSquad.find(p => p.position === 'MID') || rivalSquad[7] || { name: `${opponent.shortName} #10`, number: 10 };
  const rivalDefender = rivalSquad.find(p => p.position === 'DEF') || rivalSquad[3] || { name: `${opponent.shortName} Defender`, number: 4 };

  const hName = hgufcFormation.name;
  const rName = rivalFormation.name;

  // Multi-language text normalization for SWOT analysis (supports Spanish and English keywords)
  const norm = (str: string) => (str || '').toLowerCase();
  const ourStr = norm(swot.ourStrengths);
  const ourWeak = norm(swot.ourWeaknesses);
  const rivStr = norm(swot.rivalStrengths);
  const rivWeak = norm(swot.rivalWeaknesses);
  const swotCombined = `${ourStr} ${ourWeak} ${rivStr} ${rivWeak}`;

  // Helper to split text into distinct user observations/sentences
  const extractUserSentences = (text: string): string[] => {
    if (!text) return [];
    return text
      .split(/[.\n;•-]+/)
      .map(s => s.trim())
      .filter(s => s.length > 3);
  };

  const ourStrengthItems = extractUserSentences(swot.ourStrengths);
  const ourWeaknessItems = extractUserSentences(swot.ourWeaknesses);
  const rivalStrengthItems = extractUserSentences(swot.rivalStrengths);
  const rivalWeaknessItems = extractUserSentences(swot.rivalWeaknesses);

  // =========================================================================
  // 1. DYNAMIC DIRECTIVES DERIVED FROM USER'S CUSTOM SWOT INPUTS
  // =========================================================================

  // A. EXPLOITING IDENTIFIED RIVAL WEAKNESSES (User input in DAFO "Rival Weaknesses")
  if (rivalWeaknessItems.length > 0) {
    rivalWeaknessItems.forEach((weaknessText, idx) => {
      const lower = weaknessText.toLowerCase();
      let category: GeneratedInsight['category'] = 'Spatial / Half-Spaces';
      let title = `Exploit Rival Vulnerability: "${weaknessText.slice(0, 38)}${weaknessText.length > 38 ? '...' : ''}"`;
      let directive = `Instruct ${starPlaymaker.name} and ${starForward.name} to systematically target this rival flaw during active attacking phases.`;

      if (lower.includes('lento') || lower.includes('slow') || lower.includes('velocidad') || lower.includes('speed') || lower.includes('espalda') || lower.includes('behind')) {
        category = 'Tactical Phase';
        title = `Direct In-Behind Balls vs Slow Rival Defenders`;
        directive = `${starPlaymaker.name} (#${starPlaymaker.number}) must release early direct diagonal balls behind ${rivalDefender.name} into space for ${starForward.name}.`;
      } else if (lower.includes('banda') || lower.includes('lateral') || lower.includes('wing') || lower.includes('flanco') || lower.includes('flank') || lower.includes('centro') || lower.includes('cross')) {
        category = 'Numerical Overload';
        title = `Wide Channel Isolation & Overloads`;
        directive = `Generate 2v1 overloads on the wings against ${opponent.shortName} and deliver rapid cutbacks across the penalty spot.`;
      } else if (lower.includes('presion') || lower.includes('press') || lower.includes('salida') || lower.includes('build') || lower.includes('error') || lower.includes('fallo') || lower.includes('portero') || lower.includes('keeper')) {
        category = 'Pressing Traps';
        title = `Aggressive High-Block Pressing Trap`;
        directive = `Trigger synchronized 3-man forward press when ${opponent.shortName}'s backline attempts to circulate, forcing immediate turnovers in their defensive third.`;
      } else if (lower.includes('balon parado') || lower.includes('set piece') || lower.includes('corner') || lower.includes('falta') || lower.includes('aereo') || lower.includes('aerial')) {
        category = 'Set Pieces';
        title = `Target Rival Set-Piece Defensive Disorganization`;
        directive = `Deliver inswinging dead balls into the 6-yard box targeting ${leadDefender.name} at the near post.`;
      } else if (lower.includes('medio') || lower.includes('midfield') || lower.includes('espacio') || lower.includes('space') || lower.includes('lineas') || lower.includes('zone 14')) {
        category = 'Spatial / Half-Spaces';
        title = `Occupy Between-the-Lines Pocket (Zone 14)`;
        directive = `${starPlaymaker.name} must operate in the seams between ${opponent.shortName}'s midfield and defensive lines to receive on the half-turn.`;
      } else {
        directive = `Tactical instruction based on SWOT input "${weaknessText}": exploit this specific gap by concentrating attacking phases down this channel.`;
      }

      insights.push({
        id: `opp-swot-rw-${idx}-${idCounter++}`,
        type: 'opportunity',
        category,
        title,
        description: `Directly derived from your DAFO assessment of ${opponent.name}: "${weaknessText}".`,
        actionableDirective: directive
      });
    });
  }

  // B. NEUTRALIZING IDENTIFIED RIVAL STRENGTHS (User input in DAFO "Rival Strengths")
  if (rivalStrengthItems.length > 0) {
    rivalStrengthItems.forEach((strengthText, idx) => {
      const lower = strengthText.toLowerCase();
      let category: GeneratedInsight['category'] = 'Defensive Transition';
      let title = `Neutralize Threat: "${strengthText.slice(0, 38)}${strengthText.length > 38 ? '...' : ''}"`;
      let directive = `Designate ${leadDefender.name} and our defensive midfield pivot to double-team and restrict time and space for ${rivalKeyAttacker.name}.`;

      if (lower.includes('contra') || lower.includes('counter') || lower.includes('transicion') || lower.includes('transition') || lower.includes('rapido') || lower.includes('fast') || lower.includes('velocidad')) {
        category = 'Defensive Transition';
        title = `Rest-Defense Safeguard against Rival Counter-Attack`;
        directive = `Enforce a strict 3+1 rest-defense structure behind the ball. Never allow ${rivalKeyAttacker.name} (#${rivalKeyAttacker.number}) isolated 1v1 situations in open field.`;
      } else if (lower.includes('remate') || lower.includes('tiro') || lower.includes('shoot') || lower.includes('gol') || lower.includes('delantero') || lower.includes('striker')) {
        category = 'Defensive Transition';
        title = `Tight Marking on Primary Finisher ${rivalKeyAttacker.name}`;
        directive = `${leadDefender.name} (#${leadDefender.number}) must maintain touch-tight marking inside the 18-yard box, denying ${rivalKeyAttacker.name} cleanly turning toward goal.`;
      } else if (lower.includes('pase') || lower.includes('creador') || lower.includes('playmaker') || lower.includes('10') || lower.includes('asistencia') || lower.includes('vision')) {
        category = 'Spatial / Half-Spaces';
        title = `Screen Passing Channels to ${rivalMidfielder.name}`;
        directive = `Position our defensive midfielder directly in the central passing lane to cut off supply lines to ${rivalMidfielder.name} (#${rivalMidfielder.number}).`;
      } else if (lower.includes('balon parado') || lower.includes('corner') || lower.includes('set piece') || lower.includes('cabeza') || lower.includes('header') || lower.includes('falta')) {
        category = 'Set Pieces';
        title = `Hybrid Set-Piece Defense vs Rival Aerial Threat`;
        directive = `Deploy a 4-man zonal line along the 6-yard box with man-to-man tight marking on their tallest target ${rivalDefender.name}.`;
      }

      insights.push({
        id: `opp-swot-rs-${idx}-${idCounter++}`,
        type: 'threat',
        category,
        title,
        description: `Identified from your DAFO rival threat assessment of ${opponent.name}: "${strengthText}".`,
        actionableDirective: directive
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

      if (lower.includes('espalda') || lower.includes('behind') || lower.includes('lateral') || lower.includes('fullback') || lower.includes('subida')) {
        title = `Fullback Rest-Defense Cover`;
        directive = `When our fullback advances into the attacking third, the holding midfielder must drop into the vacated flank channel to prevent quick breaks by ${rivalKeyAttacker.name}.`;
      } else if (lower.includes('perdida') || lower.includes('turnover') || lower.includes('error') || lower.includes('pase') || lower.includes('salida')) {
        category = 'Defensive Transition';
        title = `First Phase Build-Up Safety Rule`;
        directive = `Eliminate risky square passes across our penalty box. ${leadDefender.name} must choose secure vertical line-passes or clip into the channels.`;
      } else if (lower.includes('aereo') || lower.includes('segunda') || lower.includes('second ball') || lower.includes('despeje')) {
        category = 'Set Pieces';
        title = `Edge-of-Box Second Ball Seal`;
        directive = `Assign two central players exclusively to vacuum up clearances on the 18-yard semi-circle on both defensive and offensive set pieces.`;
      }

      insights.push({
        id: `opp-swot-ow-${idx}-${idCounter++}`,
        type: 'threat',
        category,
        title,
        description: `Protective directive addressing our reported squad weakness: "${weaknessText}".`,
        actionableDirective: directive
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

      if (lower.includes('regate') || lower.includes('1v1') || lower.includes('dribble') || lower.includes('extremo') || lower.includes('winger') || lower.includes('banda')) {
        category = 'Numerical Overload';
        title = `Isolate Wingers for Direct 1v1 Take-Ons`;
        directive = `Switch play rapidly to clear out the flank and give our wide attacker direct 1v1 isolation against ${rivalDefender.name}.`;
      } else if (lower.includes('pase') || lower.includes('posesion') || lower.includes('control') || lower.includes('ritmo') || lower.includes('midfield')) {
        category = 'Spatial / Half-Spaces';
        title = `Midfield Tempo Control & Triangle Combinations`;
        directive = `Establish 3-man passing triangles around ${starPlaymaker.name} (#${starPlaymaker.number}) to manipulate ${opponent.shortName}'s central block.`;
      } else if (lower.includes('presion') || lower.includes('recuperacion') || lower.includes('intensidad') || lower.includes('press')) {
        category = 'Pressing Traps';
        title = `High-Intensity Counter-Press (5-Second Rule)`;
        directive = `On possession loss, execute an immediate 5-second counter-press to win the ball back within 35 meters of ${opponent.shortName}'s goal.`;
      }

      insights.push({
        id: `opp-swot-os-${idx}-${idCounter++}`,
        type: 'opportunity',
        category,
        title,
        description: `Leveraging our core tactical weapon: "${strengthText}".`,
        actionableDirective: directive
      });
    });
  }

  // =========================================================================
  // 2. FORMATION VS FORMATION STRUCTURAL MISMATCH ANALYSIS
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
      actionableDirective: `Instruct our wingers to pin their wide center-backs inside while fullbacks execute dynamic underlapping/overlapping runs toward ${starForward.name}.`
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
      actionableDirective: `${starPlaymaker.name} must play on staggered vertical lines to continuously receive the ball facing forward in the half-spaces.`
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
      actionableDirective: 'Our defensive pivot must maintain tight horizontal spacing (no wider than 12 meters apart) to deny vertical line-breaking passing lanes.'
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
      actionableDirective: `Encourage ${leadDefender.name} to drive into ${opponent.shortName}'s half until a midfielder commits, opening an unmarked teammate.`
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
      actionableDirective: `Our holding midfielder must drop between the two center-backs (La Salida Lavolpiana) to create a protective 3v2 defensive superiority.`
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
      actionableDirective: `Work the ball into the half-space byline before delivering low driven cutbacks backward to ${starPlaymaker.name} arriving on the edge of the box.`
    });
  }

  // =========================================================================
  // 3. OPPONENT-SPECIFIC INTELLIGENCE (Dynamic with Custom Names & Roles)
  // =========================================================================
  if (opponent.name.includes('Lion City Sailors')) {
    insights.push({
      id: `opp-team-${idCounter++}`,
      type: 'opportunity',
      category: 'Pressing Traps',
      title: 'Exploit Sailors High Defensive Line with Direct Diagonals',
      description: `${opponent.name} pushes their backline up to the halfway line to strangle possession. Their center-backs are vulnerable to diagonal passes behind their fullbacks.`,
      actionableDirective: `Launch early direct balls into the attacking channel behind their advancing fullback for ${starForward.name} to chase.`
    });
  } else if (opponent.name.includes('Tampines Rovers')) {
    insights.push({
      id: `opp-team-${idCounter++}`,
      type: 'opportunity',
      category: 'Pressing Traps',
      title: 'Mid-Block Pressing Trap at Our Tampines Hub',
      description: `${opponent.name} plays intricate short-passing triangles out from their goalkeeper. Setting a mid-block trap when their pivot (${rivalMidfielder.name}) receives turned will generate turnovers.`,
      actionableDirective: 'Allow the first CB pass, then trigger aggressive 3-man synchronized press once the ball travels into their #6.'
    });
  } else if (opponent.name.includes('Balestier Khalsa')) {
    insights.push({
      id: `opp-team-${idCounter++}`,
      type: 'threat',
      category: 'Set Pieces',
      title: `Aerial Chaos on Long Deliveries to ${rivalKeyAttacker.name}`,
      description: `${opponent.name} employs direct aerial deliveries into our penalty area, aiming for knockdowns.`,
      actionableDirective: `Designate ${leadDefender.name} to contest the primary header; assign our central midfielders to aggressively seal the second ball fall zone.`
    });
  } else if (opponent.name.includes('Geylang International')) {
    insights.push({
      id: `opp-team-${idCounter++}`,
      type: 'opportunity',
      category: 'Spatial / Half-Spaces',
      title: 'Midfield Seams Between Geylang Flat Banks',
      description: `${opponent.name} leaves vertical gaps between their midfield and defensive lines when chasing games.`,
      actionableDirective: `Position ${starPlaymaker.name} in the seams between their lines to turn and shoot or slide through-balls.`
    });
  } else if (opponent.name.includes('Young Lions')) {
    insights.push({
      id: `opp-team-${idCounter++}`,
      type: 'opportunity',
      category: 'Tactical Phase',
      title: 'Set-Piece Disorganization & High-Press Traps',
      description: `${opponent.name} displays high enthusiasm but struggles under organized pressing traps during defensive transitions.`,
      actionableDirective: 'Target near-post inswinging corners and maintain aggressive high pressing for the opening 20 minutes.'
    });
  } else if (opponent.name.includes('Jurong') || opponent.name.includes('Tanjong Pagar')) {
    insights.push({
      id: `opp-team-${idCounter++}`,
      type: 'opportunity',
      category: 'Numerical Overload',
      title: 'Overload Weak Side through Rapid Cross-Field Switches',
      description: `${opponent.name} compresses into a narrow defensive block. Rapid cross-field switches catch their opposite wingback disconnected.`,
      actionableDirective: `${starPlaymaker.name} must execute quick diagonal switches to switch the point of attack from congested flank to isolated weak side.`
    });
  } else {
    // Custom / edited rival team generic dynamic directive
    insights.push({
      id: `opp-custom-${idCounter++}`,
      type: 'threat',
      category: 'Defensive Transition',
      title: `Neutralize ${opponent.name} In-Possession Structure`,
      description: `Analysis for ${opponent.name} (${opponent.shortName}) indicates key tactical danger from ${rivalKeyAttacker.name} (#${rivalKeyAttacker.number}).`,
      actionableDirective: `Maintain structured rest-defense and deny ${rivalKeyAttacker.name} turning unchecked in central zones.`
    });
  }

  return insights;
}
