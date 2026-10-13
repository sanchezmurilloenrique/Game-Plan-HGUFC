import { Formation, OpponentTeam, SwotData, GeneratedInsight } from '../types';

export function generateTacticalInsights(
  hgufcFormation: Formation,
  rivalFormation: Formation,
  opponent: OpponentTeam,
  swot: SwotData
): GeneratedInsight[] {
  const insights: GeneratedInsight[] = [];
  let idCounter = 1;

  const hName = hgufcFormation.name;
  const rName = rivalFormation.name;
  const swotCombined = `${swot.ourStrengths} ${swot.ourWeaknesses} ${swot.rivalStrengths} ${swot.rivalWeaknesses}`.toLowerCase();

  // 1. FORMATION VS FORMATION TACTICAL MISMATCH ANALYSIS
  // Wing Overload vs 3-at-the-back / 5-at-the-back
  if ((rivalFormation.category === '3-at-back' || rivalFormation.category === '5-at-back') && 
      (hName.includes('4-3-3') || hName.includes('3-4-3') || hName.includes('4-2-3-1'))) {
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'opportunity',
      category: 'Numerical Overload',
      title: 'Flank Overload Against Isolated Wingbacks',
      description: `Rival's ${rivalFormation.name} relies on lone wingbacks to cover the entire touchline. Our wide wingers and advanced fullbacks create instant 2v1 overloads on both flanks before their wide center-backs can shift across.`,
      actionableDirective: 'Instruct our wingers to pin their wide center-backs inside while our fullbacks execute dynamic underlapping/overlapping runs into the final third.'
    });
  }

  // Central Midfield Clashes (e.g. Diamond or 3-man midfield vs Flat 2-man midfield)
  if ((hName.includes('Diamond') || hName.includes('4-3-3') || hName.includes('3-5-2')) && 
      (rName.includes('4-4-2 Flat') || rName.includes('3-4-3 Flat'))) {
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'opportunity',
      category: 'Spatial / Half-Spaces',
      title: 'Central Midfield Overload (3v2 Dominance)',
      description: `Our three central midfielders possess a natural 3v1 or 3v2 numerical advantage against ${opponent.name}'s flat two-man midfield line, dominating Zone 14 and the central channel.`,
      actionableDirective: 'Shahdan Sulaiman & Kristijan Krajcek must play on staggered vertical lines to continuously receive the ball facing forward in the half-spaces.'
    });
  }

  // Double Pivot Shield against #10
  if (hName.includes('4-2-3-1') && (rName.includes('4-2-3-1') || rName.includes('Diamond'))) {
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'threat',
      category: 'Defensive Transition',
      title: 'Zone 14 Dual Playmaker Congestion',
      description: `Both teams deploy a classic central attacking midfielder (#10). ${opponent.name} will attempt to feed their primary creator between our midfield and defensive lines.`,
      actionableDirective: 'Our defensive pivot must maintain tight horizontal spacing (no wider than 12 meters apart) to deny vertical line-breaking passing lanes.'
    });
  }

  // 3 CBs vs Single Striker (Build-up Superiority)
  if (hgufcFormation.category === '3-at-back' && (rName.includes('4-2-3-1') || rName.includes('5-4-1') || rName.includes('4-3-3'))) {
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'opportunity',
      category: 'Tactical Phase',
      title: '3v1 First Phase Build-Up Circulation',
      description: `In the first build-up phase, our 3 central defenders have effortless numerical superiority over ${opponent.name}'s single center forward, allowing our outside CBs to step forward into midfield unchecked.`,
      actionableDirective: 'Encourage Kazuma Takayama and Anders Aplin to drive into the rival half with the ball until a rival midfielder commits, opening an unmarked teammate.'
    });
  }

  // Threat: Counter-attack in wide channels when HGUFC plays 3-5-2 or high wingbacks
  if (hgufcFormation.category === '3-at-back' && (rName.includes('4-3-3') || rName.includes('4-2-3-1'))) {
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'threat',
      category: 'Defensive Transition',
      title: 'Rest-Defense Exposure Behind Advanced Wingbacks',
      description: `When our wingbacks press forward into the final third, ${opponent.name}'s pacey wide forwards will lurk in the transition channels between our outside CBs and the touchline.`,
      actionableDirective: 'The opposite wingback must tuck inward as a third defender when attacking down the flank, preserving a rigid 3+1 rest-defense structure.'
    });
  }

  // Threat: 2 Striker Pinning our CBs (4-4-2 or 3-5-2 Rival vs 4-at-back HGUFC)
  if (hgufcFormation.category === '4-at-back' && (rName.includes('4-4-2') || rName.includes('3-5-2') || rName.includes('5-3-2'))) {
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'threat',
      category: 'Defensive Transition',
      title: '2v2 Strikers Pinning Central Defenders',
      description: `${opponent.name}'s dual center forward partnership will pin both of our center-backs in direct 1v1 physical duels, preventing them from stepping out to assist our fullbacks.`,
      actionableDirective: 'Our holding defensive midfielder must drop between the two center-backs (La Salida Lavolpiana) to create a protective 3v2 defensive superiority.'
    });
  }

  // Low Block Exploitation (Rival plays 5-4-1 or 5-3-2)
  if (rivalFormation.category === '5-at-back') {
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'opportunity',
      category: 'Spatial / Half-Spaces',
      title: 'Half-Space Cutbacks and Edge-of-Box Shooting',
      description: `${opponent.name} will defend in a deep low block inside their 18-yard box. High crosses will be cleared by their 3 central defenders; therefore, low cutbacks to the penalty spot and edge-of-box shots are mathematically superior.`,
      actionableDirective: 'Work the ball into the half-space byline before delivering low driven cutbacks backward into the arriving second-line runners.'
    });
  }

  // 2. OPPONENT-SPECIFIC INTELLIGENCE
  if (opponent.name.includes('Lion City Sailors')) {
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'opportunity',
      category: 'Pressing Traps',
      title: 'Exploit Sailors High Defensive Line with Direct Diagonals',
      description: 'Lion City Sailors consistently push their backline up to the halfway line to strangle possession. Their center-backs are vulnerable to diagonal lofted passes in behind the left fullback.',
      actionableDirective: 'Launch early direct balls into the right attacking channel behind their advancing fullback for Gabriel Quak / Dejan Racic to chase.'
    });
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'threat',
      category: 'Spatial / Half-Spaces',
      title: 'Inverted Winger Penetration in Inner Channels',
      description: 'Sailors wingers cut inside on their stronger foot into Zone 14 shooting territory with exceptional velocity.',
      actionableDirective: 'Double-team their wingers on the inside shoulder; show them to the outside touchline and force crosses on their weaker foot.'
    });
  } else if (opponent.name.includes('Tampines Rovers')) {
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'opportunity',
      category: 'Pressing Traps',
      title: 'Mid-Block Pressing Trap at Our Tampines Hub',
      description: 'Tampines play intricate short-passing triangles out from their goalkeeper. Setting a mid-block trap when their defensive pivot receives with his back turned will generate immediate turnovers 30 meters from goal.',
      actionableDirective: 'Allow the first CB pass, then trigger aggressive 3-man synchronized press once the ball travels into their #6.'
    });
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'threat',
      category: 'Defensive Transition',
      title: 'Rapid Combination Play & Central Cutbacks',
      description: 'Tampines Rovers are lethal when penetrating via rapid give-and-go wall passes into the penalty area.',
      actionableDirective: 'Center-backs must not dive into ground tackles; jockey and maintain compact 6-yard box coverage to intercept low cutback passes.'
    });
  } else if (opponent.name.includes('Balestier Khalsa')) {
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'threat',
      category: 'Set Pieces',
      title: 'Aerial Chaos on Second Balls & Long Deliveries',
      description: 'Balestier Khalsa employs an aggressive physical game with direct aerial deliveries into our penalty area, aiming for knockdowns.',
      actionableDirective: 'Designate Anders Aplin to contest the primary header; assign our two central midfielders to aggressively seal the "second ball fall zone" at the 18-yard arc.'
    });
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'opportunity',
      category: 'Numerical Overload',
      title: 'Transition Counter Against Overcommitted Wingbacks',
      description: 'Balestier pushes their wingbacks high early in possession, leaving cavernous open grass on the turnover.',
      actionableDirective: 'Instant forward passing upon ball recovery; release wide forwards within 3 seconds of winning possession.'
    });
  } else if (opponent.name.includes('Geylang International')) {
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'opportunity',
      category: 'Spatial / Half-Spaces',
      title: 'Midfield Seams Between Geylang Flat Banks',
      description: 'Geylang International can leave substantial vertical gaps between their midfield 4 and defensive 4 when chasing games.',
      actionableDirective: 'Position our attacking midfielders in the seams between their lines to turn and shoot or slide through-balls to our strikers.'
    });
  } else if (opponent.name.includes('Young Lions')) {
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'opportunity',
      category: 'Tactical Phase',
      title: 'Set-Piece Disorganization & High-Press Traps',
      description: 'Young Lions display high enthusiasm but struggle under organized pressing traps during defensive transition and set pieces.',
      actionableDirective: 'Target near-post inswinging corners and maintain aggressive high pressing for the opening 20 minutes to force defensive errors.'
    });
  } else if (opponent.name.includes('Jurong') || opponent.name.includes('Tanjong Pagar')) {
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'opportunity',
      category: 'Numerical Overload',
      title: 'Overload Weak Side through Rapid Cross-Field Switches',
      description: `${opponent.name} compresses all 10 outfield players into a narrow defensive block. Rapid cross-field switches will catch their opposite wingback disconnected.`,
      actionableDirective: 'Shahdan Sulaiman must execute quick diagonal switches to switch the point of attack from congested right flank to isolated left wing.'
    });
  }

  // 3. SWOT TEXT-PARSED DYNAMIC DIRECTIVES
  if (swotCombined.includes('turnover') || swotCombined.includes('transition') || swotCombined.includes('counter')) {
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'threat',
      category: 'Defensive Transition',
      title: 'Defensive Rest-Defense Stabilization',
      description: `Identified from SWOT analysis: High transition vulnerability on possession loss requires proactive rest-defense safeguarding.`,
      actionableDirective: 'Implement strict "Rule of 5" — at least five HGUFC outfield players must remain behind the ball line at all moments during active possession.'
    });
  }

  if (swotCombined.includes('cross') || swotCombined.includes('wide') || swotCombined.includes('wing')) {
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'opportunity',
      category: 'Spatial / Half-Spaces',
      title: 'Exploit Flank Deliveries with Staggered Box Runs',
      description: `SWOT intelligence indicates prominent wide progression superiority against ${opponent.name}.`,
      actionableDirective: 'When wide delivery is initiated, attack the box with 3 runners: near post dart, penalty spot check-run, and back-post blindside crash.'
    });
  }

  if (swotCombined.includes('press') || swotCombined.includes('high block') || swotCombined.includes('traps')) {
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'opportunity',
      category: 'Pressing Traps',
      title: 'Coordinated High-Press Trapping Sequence',
      description: `Opponent exhibits difficulty circulating under direct forward line pressure.`,
      actionableDirective: 'Curve the striker pressing angle to block the pass back to the keeper, funneling their center-back toward the sideline trap.'
    });
  }

  if (swotCombined.includes('aerial') || swotCombined.includes('set piece') || swotCombined.includes('corner')) {
    insights.push({
      id: `opp-${idCounter++}`,
      type: 'threat',
      category: 'Set Pieces',
      title: 'Zonal-Man Hybrid Set-Piece Defense',
      description: 'Identified aerial threats from opponent dead-ball situations.',
      actionableDirective: 'Deploy 3 dominant headers in a zonal line along the 6-yard box with man-to-man marking on their 3 tallest aerial threats.'
    });
  }

  return insights;
}
