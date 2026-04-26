export const CATEGORIES = [
  'Neural Haptics',
  'Kinetic Logic',
  'Fluid Dynamics',
  'Autonomous Flight',
  'Bio-Cybernetics',
  'Soft Robotics',
];

export const STATUSES = ['Not Started', 'In Progress', 'Completed'];

// Short prefix codes displayed on cards
export const CATEGORY_CODE = {
  'Neural Haptics':   'NH',
  'Kinetic Logic':    'KL',
  'Fluid Dynamics':   'FD',
  'Autonomous Flight':'AF',
  'Bio-Cybernetics':  'BC',
  'Soft Robotics':    'SR',
};

// Visual data for the OverviewPage department cards
export const CATEGORY_META = {
  'Neural Haptics':    { index: 'NH-03', img: '/img/lab-neural-haptics.png',   desc: '人工的な触感と人間の直感が融合。触覚システムとバイオフィードバックの研究。' },
  'Kinetic Logic':     { index: 'KL-04', img: '/img/lab-kinetic-logic.png',    desc: '自律の建築。古代幾何学と量子フローの垂直統合。運動制御アルゴリズム。' },
  'Fluid Dynamics':    { index: 'FD-05', img: '/img/lab-fluid-dynamics.png',   desc: '動きを再定義。伝統的な墨絵の流れと空気力学的な精密さが融合。' },
  'Autonomous Flight': { index: 'AF-06', img: '/img/dept-flight.png',          desc: '自律飛行ドローンシステムの開発。経路計画と障害物回避の最適化。' },
  'Bio-Cybernetics':   { index: 'BC-07', img: '/img/dept-bio-cybernetics.png', desc: 'バイオメカニカルな統合。生物学的神経系とデジタル制御の融合点。' },
  'Soft Robotics':     { index: 'SR-08', img: '/img/dept-soft-robotics.png',   desc: '柔軟な素材で作られたロボット。人間との安全なインタラクション設計。' },
};
