export const LIBERAL = 'liberal';
export const CONSERVATIVE = 'conservative';

export function constFromParty(party) {
  if (party === 'liberal') {
    return LIBERAL;
  } else if (party === 'conservative') {
    return CONSERVATIVE;
  } else {
    throw 'invalid party';
  }
}

const oppositeParties = {
  CONSERVATIVE: LIBERAL,
  LIBERAL: CONSERVATIVE,
};

export function getOppositeParty(party) {
  if (party in oppositeParties) {
    return oppositeParties[party];
  }
  throw "couldn't find opposite party";
}
