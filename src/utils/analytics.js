export const trackGoal = (goal, params = {}) => {
  if (typeof ym !== 'undefined') {
    ym(109849947, 'reachGoal', goal, params);
  }
};
