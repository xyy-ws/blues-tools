export type BluesSubstyle = {
  id: string
  nameZh: string
  nameEn: string
  regionOriginEra: string
  grooveRhythmTraits: string[]
  commonProgressionBackingIdeas: string[]
  recommendedBpmRange: string
  keyPracticeTips: string[]
  representativeSongsArtists: string[]
  tags: string[]
}

export const BLUES_SUBSTYLE_LIBRARY: BluesSubstyle[] = [
  {
    id: 'mississippi-hill-country',
    nameZh: '密西西比山地乡村布鲁斯',
    nameEn: 'Mississippi Hill Country Blues',
    regionOriginEra: '美国密西西比北部山地，20世纪上半叶到现代传承',
    grooveRhythmTraits: [
      '强调单和弦催眠式循环（持续低音）',
      '重拍感强，律动靠右手切分和低音重复推动',
      '常见“前冲但不加速”的粗粝律动感',
    ],
    commonProgressionBackingIdeas: [
      '单和弦反复（如 E5 持续）配合低音固定型',
      '以 I 和弦为主，偶尔短暂转向 bVII 或 IV 后回 I',
      '吉他/贝斯保持固定动机，鼓组用通鼓与军鼓反复塑形',
    ],
    recommendedBpmRange: '80-110 BPM',
    keyPracticeTips: [
      '先练 2-4 小节循环的稳定度，优先“稳”和“重”',
      '用闷音与开放弦对比做层次，不要过多换和弦',
      '即兴围绕主音和小三度做小幅变化，保持催眠感',
    ],
    representativeSongsArtists: [
      'R.L. Burnside - “Poor Black Mattie”',
      'Junior Kimbrough - “All Night Long”',
      'Cedell Davis / Otha Turner（代表艺人）',
    ],
    tags: ['重复动机', '持续低音', '单和弦', '乡土'],
  },
  {
    id: 'delta-blues',
    nameZh: '三角洲布鲁斯',
    nameEn: 'Delta Blues',
    regionOriginEra: '美国密西西比三角洲，约 1910s-1940s',
    grooveRhythmTraits: [
      '独奏叙事感强，节奏自由度高',
      '滑棒与人声呼应常见',
      '摇摆八分与直八都能出现，但核心是“说话式”律动',
    ],
    commonProgressionBackingIdeas: [
      '12 小节蓝调基础（I-IV-V）',
      '早期常见 8 小节/变体结构，句尾收尾灵活',
      '开放调弦（Open G/Open D）配合滑棒营造持续张力',
    ],
    recommendedBpmRange: '70-120 BPM',
    keyPracticeTips: [
      '先用人声哼唱句子，再在吉他上模仿，训练“唱弹一致”',
      '滑棒音准比速度重要，练慢速滑入与收尾颤音',
      '每 4 小节设计一个回答句，形成问答感',
    ],
    representativeSongsArtists: [
      'Robert Johnson - “Cross Road Blues”',
      'Son House - “Death Letter Blues”',
      'Charley Patton / Skip James（代表艺人）',
    ],
    tags: ['滑棒', '原声', '根源', '传统'],
  },
  {
    id: 'chicago-blues',
    nameZh: '芝加哥布鲁斯',
    nameEn: 'Chicago Blues',
    regionOriginEra: '美国芝加哥，1940s-1960s 城市电声化高峰',
    grooveRhythmTraits: [
      '电声编制（电吉他、口琴、贝斯、鼓）',
      '中速摇摆与强后拍常见',
      '乐句更偏“乐队对话”，强调问答句式',
    ],
    commonProgressionBackingIdeas: [
      '经典 12 小节 I-IV-V + 强收尾',
      '钢琴/吉他布吉低音线与摇摆节奏并行',
      '主歌留空间给人声，间奏用短句反复强化记忆点',
    ],
    recommendedBpmRange: '90-130 BPM',
    keyPracticeTips: [
      '先锁定摇摆八分比例，再加花',
      '练“留白”：每句后故意空半拍到一拍',
      '和口琴/人声互答时，句子长度尽量短而明确',
    ],
    representativeSongsArtists: [
      'Muddy Waters - “Hoochie Coochie Man”',
      'Howlin’ Wolf - “Smokestack Lightnin’”',
      'Little Walter / Willie Dixon（代表艺人）',
    ],
    tags: ['电声', '摇摆', '乐队', '都市'],
  },
  {
    id: 'texas-blues',
    nameZh: '德州布鲁斯',
    nameEn: 'Texas Blues',
    regionOriginEra: '美国德州，1930s 起发展，1980s 电吉他风格再兴盛',
    grooveRhythmTraits: [
      '更强调吉他音色、动态和单音线条',
      '可从轻摇摆到偏直八的强劲推进',
      '常融合摇摆、跳跃蓝调与早期摇滚气质',
    ],
    commonProgressionBackingIdeas: [
      '12 小节为核心，但常加入快速换和弦与经过和弦',
      '主音动机 + 双音/六度和声填充',
      '慢蓝调里常用扩展和弦（9、13）制造厚度',
    ],
    recommendedBpmRange: '85-135 BPM',
    keyPracticeTips: [
      '重点练推弦音准与颤音宽度，塑造“会说话”的长音',
      '节奏句和旋律句交替，避免全程密集独奏',
      '同一句乐句在不同力度重复，练动态控制',
    ],
    representativeSongsArtists: [
      'Stevie Ray Vaughan - “Pride and Joy”',
      'Freddie King - “Hide Away”',
      'T-Bone Walker / Lightnin’ Hopkins（代表艺人）',
    ],
    tags: ['吉他主导', '表现力', '电声', '现代'],
  },
  {
    id: 'piedmont-blues',
    nameZh: '皮德蒙特布鲁斯',
    nameEn: 'Piedmont Blues',
    regionOriginEra: '美国东南部皮德蒙特地区，约 1920s-1940s',
    grooveRhythmTraits: [
      '拇指低音 + 手指旋律的拉格泰姆式分工',
      '节奏轻快、跳跃，常带舞曲气质',
      '指弹纹理清晰，复音进行比滑棒更常见',
    ],
    commonProgressionBackingIdeas: [
      '12 小节与 8 小节结构都常见',
      '交替低音 + 上声部分解和弦',
      'I-VI-II-V 或次属过渡在歌曲里较常见',
    ],
    recommendedBpmRange: '95-145 BPM',
    keyPracticeTips: [
      '先让拇指低音“自动驾驶”，再加入旋律',
      '从两声部开始（低音+单旋律），稳定后再加和声音',
      '节奏要像钟摆，宁可慢也不要乱',
    ],
    representativeSongsArtists: [
      'Blind Blake - “West Coast Blues”',
      'Rev. Gary Davis - “Cincinnati Flow Rag”',
      'Mississippi John Hurt / Brownie McGhee（代表艺人）',
    ],
    tags: ['指弹', '原声', '拉格泰姆', '切分'],
  },
]
